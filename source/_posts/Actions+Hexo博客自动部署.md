---
title: GitHub Actions + Hexo 博客自动部署
tags:
  - GitHub Actions
  - Hexo
categories: hexo
top_img: >-
  http://static.simpledesktops.com/uploads/desktops/2020/07/18/Artboard_1.png
cover: >-
  https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1340301466,160012850&fm=26&gp=0.jpg
abbrlink: 6a366505
date: 2020-10-11 16:44:04
updated: 2026-04-04
---

> 本文初稿写于 2020 年，当时使用 Travis CI。Travis 免费策略与使用方式已有较大变化，现改为 **GitHub Actions** 与仓库同源集成，无需单独注册第三方 CI，也无需在 Travis 后台配置 `github_token`（部署时使用仓库内置的 `GITHUB_TOKEN` 即可）。

## GitHub Actions 简介

[GitHub Actions](https://docs.github.com/zh/actions) 是 GitHub 提供的持续集成与持续交付（CI/CD）能力：在推送代码、发起 PR 或定时等事件时，在云端虚拟机里执行你定义的步骤（检出代码、安装依赖、测试、部署等）。

### 持续集成

持续集成（Continuous integration，CI）指团队成员频繁把改动合并进主干，每次合并都通过自动化构建（安装依赖、生成站点、可选测试）尽早发现问题。博客场景下即：**在源分支推送后自动生成静态文件并发布到 GitHub Pages**。

### 基本思路

1. 博客**源码**放在一个分支（例如 `blog-source`），**生成后的网页**推到用于 Pages 的分支（用户页仓库常见为 `master`）。
2. 在仓库 `.github/workflows/` 下增加工作流 YAML：声明触发条件、Node 版本、`npm ci`、`hexo clean && hexo generate && hexo deploy`。
3. `hexo-deployer-git` 通过 HTTPS 把 `public` 推送到远端；认证使用 Actions 自带的 `secrets.GITHUB_TOKEN`，在步骤里用 `sed` 把 `_config.yml` 里的占位符替换成该令牌即可（无需再申请 Personal Access Token，除非你对 `master` 开了分支保护等特殊情况）。

## Hexo + GitHub Actions

### 创建分支

建立一个分支（例如 `blog-source`），把 Hexo 源文件放在该分支下，并删除本地的 `node_modules`、`public`（不要提交进 Git；依赖以 `package.json` / `package-lock.json` 为准在 CI 里 `npm ci`）。

### 注意

**以后日常写博客请只往该源分支推送。** 提交前注意子目录里不要误带嵌套的 `.git`（例如以前手动克隆主题时），否则可能导致部分文件无法随仓库上传，页面异常。

### 工作流示例

仓库中实际文件为 `.github/workflows/deploy.yml`，核心如下（与线上一致时可对照修改）：

{% raw %}

```yaml
# blog-source 推送时：安装依赖、生成站点、推送到 master（GitHub Pages）

name: Deploy Hexo

on:
  push:
    branches:
      - blog-source
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: hexo-deploy-${{ github.ref }}
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Configure Git for hexo-deployer-git
        run: |
          git config --global user.name "你的 Git 用户名"
          git config --global user.email "你的邮箱"

      - name: Inject token into _config.yml
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: sed -i "s/github_token/${GITHUB_TOKEN}/g" _config.yml

      - name: Generate and deploy
        run: |
          npm run clean
          npm run build
          npm run deploy
```

{% endraw %}

说明：

- `permissions: contents: write`：允许工作流向本仓库推送（`hexo deploy` 需要）。
- `Inject token` 一步把 `_config.yml` 里占位字符串 `github_token` 换成运行时环境变量中的令牌，与下面 `deploy.repo` 写法配套。

首次启用：在 GitHub 仓库 **Settings → Actions → General** 中允许 Actions；**Settings → Pages** 中把站点源设为用于托管静态文件的分支（用户页 `username.github.io` 常见为 **`master` 分支根目录**）。

### `_config.yml` 中的 deploy

```yaml
# Deployment
## Docs: https://hexo.io/docs/one-command-deployment
deploy:
  type: git
  repo: https://github_token@github.com/<你的用户名>/<仓库名>.git
  branch: master
```

其中 **`github_token` 为占位符**，由上述工作流中的 `sed` 在部署前替换为 `GITHUB_TOKEN`，从而在 CI 环境里用 HTTPS 完成推送；本地不要写真实令牌。

若仓库对 `master` 启用了**分支保护**，默认 `GITHUB_TOKEN` 可能无法推送，需在分支规则中允许 GitHub Actions，或改用 [Personal Access Token](https://github.com/settings/tokens) 存为仓库 Secret（例如 `HEXO_DEPLOY_TOKEN`），并在工作流里把 `sed` 与 `env` 改为使用该 Secret。

## 提交分支

写好 Markdown 后，将改动 **push 到 `blog-source`**（或你在工作流里写的分支名），GitHub Actions 会自动执行生成与部署；可在仓库 **Actions** 页查看每次运行日志。

---

*以下为 2020 年原文档标题与 Travis CI 相关说明，已过时，仅作存档。*

<details>
<summary>旧版：Travis CI + Hexo（已弃用）</summary>

原先使用 [Travis CI](https://www.travis-ci.com/)，在后台 **Environment Variables** 中配置 `github_token`，在 `.travis.yml` 的 `before_script` 里用 `sed` 替换 `_config.yml`，再在 `script` 中执行 `hexo clean && hexo generate && hexo deploy`。现项目已删除 `.travis.yml`，请勿再按该方式配置。

</details>
