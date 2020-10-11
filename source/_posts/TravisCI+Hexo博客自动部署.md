---
title: TravisCI+Hexo博客自动部署.md
tags: TravisCI
categories: hexo
top_img: >-
  http://static.simpledesktops.com/uploads/desktops/2020/07/18/Artboard_1.png
cover: >-
  https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1340301466,160012850&fm=26&gp=0.jpg
abbrlink: 6a366505
date: 2020-10-11 16:44:04
---
##  Travis CI简介

Travis CI是在软件开发领域中的一个在线的，分布式的持续集成服务（免费开源）。

### 持续集成

持续集成（Continuous integration，缩写 CI）是一种软件工程流程，即团队开发成员经常集成他们的工作，通常每个成员每天至少集成一次，也就意味着每天可能会发生多次集成。每次集成都通过自动化的构建（包括编译，发布，自动化测试）来验证，从而尽早地发现集成错误

### 基本配置和使用

1.  打开[Travis](https://travis-ci.org/)官网，然后登陆你的github账号
2.  打开你的github，点击你的头像，找到settings，再点击左侧的Developer settings，点击Personal access tokens，点击右上角的Generate new token，填入Note（取个名称），下面一些权限，该设置的设置。然后生成，会出现一个token值，**注意：第一次生成记得保存一下，因为你下次打开它不会显示。如果忘记，打开设置，可以看到提示：如果您丢失或忘记了此令牌，可以重新生成它，但是请注意，使用此令牌的所有脚本或应用程序都需要更新。**
3.  打开travis你配置好的github项目中的setting，找到Environment Variables选项，然后添加。
    1.  第一个参数：github_token（就是一个名称好关联到github，后面配置中会用到这个变量来授权操作github的权限）。
    2.  第二个参数：github产生的token。
    3.  里面有几个配置，看[配置](https://docs.travis-ci.com/user/web-ui/#build-pushed-branches)。
4.  在你仓库怎增加 `.travis.yml` 文件，这个文件定义了构建的步骤，例如[安装依赖](https://docs.travis-ci.com/user/job-lifecycle/#customizing-the-installation-phase)等等。
5.  将 `.travis.yml` 文件推送到你的远端仓库，然后就会触发 Travis CI 构建；
6.  登录 [Travis CI](https://travis-ci.com/)然后选择你的仓库查看构建任务的执行详情；



## Hexo + Travis CI

## 创建分支

建立一个分支，名字随意。把之前写的博客源文件拷贝到该分支下，并删除`node_modules`、`public`文件夹。

### 注意：

**这个分支就是你以后提交代码更新博客的分支，在提交的时候注意不能有.git文件。不然会出现该文件夹不会推送到远端。因为我是引用的别主题，里面默认有.git导致推送之后显示不了页面。**

我的.travis.yml配置：

下面有写没有的可以直接注释了，仅供参考。

```yaml
# 指定构建环境是Node.js，当前版本是稳定版
language: node_js
node_js: stable

# 设置全局的变量，${GH_REF}引用
env:
 global:
   - URL_REPO: <github仓库地址，去掉前面的https://>

# 设置只检测blog-source分支的push变动
branches:
  only:
    - blog-source

设置缓存文件
cache:
  directories:
    - node_modules

# #在构建之前安装hexo环境
# before_install:
#   - npm install -g hexo-cli

# #安装git插件和搜索功能插件
# install:
#   - npm install

# 设置git提交名，邮箱；替换真实token到_config.yml文件
before_script:
  - git config user.name "名称"
  - git config user.email "邮箱"
  # 替换同目录下的_config.yml文件中github_token字符串为travis后台刚才配置的变量(Environment Variables中的${github_token})，注>意此处sed命令用了双引号。单引号无效！
  - sed -i "s/github_token/${github_token}/g" _config.yml || exit 1

# 执行清缓存，生成网页操作
script:
  - hexo clean
  - hexo generate
  - hexo deploy

# configure notifications (email, IRC, campfire etc)
# please update this section to your needs!
# https://docs.travis-ci.com/user/notifications/
# notifications:
#   email:
#     - 2855512028@qq.com
#   on_success: change
#   on_failure: always
```

我的_config配置：

```yaml
# Deployment
## Docs: https://hexo.io/docs/one-command-deployment
deploy:
    type: git
    repo: https://github_token@<github仓库地址，去掉前面的https://> # 这里的github_token就是前面脚本替换的位置，在.travis.yml 文件中，会使用环境变量 GH_TOKEN 替换掉它的。因为构建机器上没有配置 ssh 免密，所以需要使用这种 token+http 的方式实现代码的推送
    branch: master
```

## 提交分支

每次更新把你的md写好之后，直接push，Travis CI会自动帮你集成。



