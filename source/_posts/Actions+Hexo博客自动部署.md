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

> 本文初稿写于 2020 年，当时使用 Travis CI。现改为在 **GitHub Actions** 中完成构建与部署；与 Travis 相比，令牌与仓库设置都在 GitHub 内完成即可。

## GitHub Actions 简介

[GitHub Actions](https://docs.github.com/zh/actions) 是 GitHub 提供的持续集成与持续交付（CI/CD）能力：在推送代码、发起 PR 或定时等事件时，在云端虚拟机里执行你定义的步骤（检出代码、安装依赖、测试、部署等）。

### 持续集成

持续集成（Continuous integration，CI）指团队成员频繁把改动合并进主干，每次合并都通过自动化构建尽早发现问题。博客场景下即：**在源分支推送后自动生成静态文件并发布到 GitHub Pages**。

### 创建分支与通用注意

建立一个分支（例如 `blog-source`），把 Hexo 源文件放在该分支下；不要提交 `node_modules`、`public`（依赖以 `package.json` / `package-lock.json` 为准在 CI 里 `npm ci`）。**日常写博客请只往该源分支推送。** 子目录里不要误带嵌套的 `.git`（例如以前手动克隆主题时），否则可能导致部分文件无法随仓库上传。

---

## 两种部署方式概览

在 **GitHub Actions** 里把 Hexo 发布到 Pages，常见有两种做法，**仓库 Settings → Pages 里只能二选一作为发布源**，不要混用。

| 对比项                        | 方式一：Pages 官方 Actions 部署                                                              | 方式二：`hexo-deployer-git` 推送到分支                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **原理**                      | `hexo generate` 生成 `public`，用 `upload-pages-artifact` + `deploy-pages` 交给 GitHub Pages | CI 里执行 `hexo deploy`，把静态文件 **git push**（常为 **force-push**）到指定分支（如 `master`）                                                |
| **Pages 设置**                | **Source → GitHub Actions**                                                                  | **Source → Deploy from a branch**（选择该分支，多为 `/ (root)`）                                                                                |
| **`_config.yml` 的 `deploy`** | CI **不依赖**；可仅保留给本机手动 `hexo deploy`                                              | **必须**配置 `type: git` 与 `repo`、`branch`                                                                                                    |
| **令牌**                      | 使用 `pages: write` + `id-token: write`，**无需**把 token 写进 `_config.yml`                 | 需在 CI 中用 `sed` 把占位符换成 `GITHUB_TOKEN` 或 [PAT](https://github.com/settings/tokens)，URL 须为 `https://x-access-token:…@github.com/...` |
| **分支保护**                  | **不推**业务分支，一般**不受**「禁止 force-push」影响                                        | `master` 等若禁止强制推送，易报 `GH006` / `Cannot force-push`                                                                                   |
| **适用场景**                  | **推荐**：含受保护 `master`、希望与官方 Pages 流程一致                                       | 习惯「静态站就是一个分支目录」、且分支规则允许部署账号 force-push                                                                               |

下面分别说明配置要点与示例工作流。

---

## 方式一：GitHub Pages 官方 Actions 部署（推荐）

**思路**：只在工作流里执行 `hexo generate`（例如 `npm run build`），将 **`public`** 作为产物上传，再用 **`actions/deploy-pages`** 发布。**不要**在 CI 里执行 `hexo deploy`（git 部署器）。

### Pages 与权限

1. **Settings → Actions → General**：允许 Actions。
2. **Settings → Pages → Build and deployment → Source**：选 **GitHub Actions**（不要选「从分支部署」的 `master`，除非你真的改用方式二）。
3. 工作流需声明：

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### 工作流示例（与本仓库 `.github/workflows/deploy.yml` 一致）

{% raw %}

```yaml
name: Deploy Hexo

on:
  push:
    branches:
      - blog-source
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
      - run: npm ci
      - run: npm run clean && npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: public

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

{% endraw %}

---

## 方式二：`hexo-deployer-git` 推送到分支（如 `master`）

**思路**：在 CI 中安装依赖后，用 **`sed`** 把 `_config.yml` 里仓库地址的占位符换成令牌，再执行 **`hexo deploy`**，由 `hexo-deployer-git` 将生成结果推送到 **`deploy.branch`**（常见为 **`master`**）。  
**Pages** 侧应选择 **Deploy from a branch**，并选中该分支。

### 必要条件与常见坑

- **`deploy.repo`** 请使用 **`https://x-access-token:占位符@github.com/用户名/仓库.git`**，在步骤里把占位符替换为 `GITHUB_TOKEN` 或 PAT；不要用 `https://令牌@github.com/...` 仅把令牌当用户名，否则 CI 无 TTY 时可能出现 `could not read Password`。
- 工作流需 **`permissions: contents: write`**，以便向仓库推送。
- 部署器往往 **force-push** 目标分支：若该分支 **受保护且禁止强制推送**，会失败（`GH006`），需放宽规则或改回 **方式一**。
- 可在 `hexo deploy` 步骤设置 **`GIT_TERMINAL_PROMPT: "0"`**，避免 Git 卡住等待密码输入。

### `_config.yml` 中 `deploy` 示例

```yaml
deploy:
  type: git
  repo: https://x-access-token:github_token@github.com/<你的用户名>/<仓库名>.git
  branch: master
```

其中 **`github_token` 为占位符**，由下面工作流中的 `sed` 在运行时替换为真实令牌（勿把真实令牌提交进仓库）。

### 工作流示例（单 Job，与方式一勿同时作为唯一发布源）

{% raw %}

```yaml
name: Deploy Hexo (git push)

on:
  push:
    branches:
      - blog-source
  workflow_dispatch:

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
      - run: npm ci
      - run: |
          git config --global user.name "你的 Git 用户名"
          git config --global user.email "你的邮箱"
      - name: Inject token into _config.yml
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: sed -i "s/github_token/${GITHUB_TOKEN}/g" _config.yml
      - name: Generate and deploy
        env:
          GIT_TERMINAL_PROMPT: "0"
        run: |
          npm run clean
          npm run build
          npm run deploy
```

{% endraw %}

若使用 **PAT**，在仓库 **Settings → Secrets and variables → Actions** 中新增 secret（例如 `HEXO_DEPLOY_TOKEN`），将 `env` 与 `sed` 改为使用该 secret，并确保令牌具备 **repo** 等推送权限。

---

## 提交分支与查看日志

写好 Markdown 后，将改动 **push 到 `blog-source`**（或你在工作流里写的分支名），在仓库 **Actions** 页查看每次运行日志。

---

_以下为 2020 年原文档与 Travis CI 相关说明，仅作存档。_

<details>
<summary>旧版：Travis CI + Hexo（已弃用）</summary>

原先使用 [Travis CI](https://www.travis-ci.com/)，在后台 **Environment Variables** 中配置 `github_token`，在 `.travis.yml` 的 `before_script` 里用 `sed` 替换 `_config.yml`，再在 `script` 中执行 `hexo clean && hexo generate && hexo deploy`。现项目已删除 `.travis.yml`，请勿再按该方式配置。

</details>
