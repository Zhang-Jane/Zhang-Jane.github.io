---
title: hexo 入门
abbrlink: 3e57632f
date: 2020-10-10 12:44:04
tags: hexo
categories: hexo
---
# 查看官方的文档

https://hexo.io/zh-cn/docs/index.html

# win10系统

## 1.安装环境

- [Node.js](http://nodejs.org/) (Node.js 版本需不低于 10.13，建议使用 Node.js 12.0 及以上版本)
- [Git](http://git-scm.com/)

## 2.安装所需的模块

 ```bash
    npm install -g hexo-cli
    ```
```
    安装以后，可以使用以下两种方式执行 Hexo：
    
    npx hexo <command>
    
    将 Hexo 所在的目录下的 node_modules 添加到环境变量之中即可直接使用 hexo <command>：
    
    echo 'PATH="$PATH:./node_modules/.bin"' >> ~/.profile
    ```

## 3.构建

```bash
    hexo init <folder>
    ```

```
    cd <folder>
    npm install
    ```

_config.yml

    网站的 [配置](https://hexo.io/zh-cn/docs/configuration) 信息，您可以在此配置大部分的参数。

## 4.生成about页面

```
1. hexo new page "about"
2. 在_config.yml中的menu:中配置About: about  # 关于
3. 在根目录的source会生成一个md文件，在这个md文件中写入相关的信息
```
## 5.hexo-server
`npm install hexo-server --save`

安装完成后，输入以下命令以启动服务器，您的网站会在 http://localhost:4000 下启动。在服务器启动期间，Hexo 会监视文件变动并自动更新，您无须重启服务器。

## hexo的升级
升级 Hexo:
使用淘宝源的 cnpm 替换 npm（可选，我用的还是npm）
npm install -g cnpm --registry=https://registry.npm.taobao.org

npm install -g cnpm                 # 升级 npm
npm cache clean -f                 # 清除 npm 缓存


### 更新 package.json 中的 hexo 及个插件版本（更新 hexo: 进入blog的根目录，执行如下命令）
npm install -g npm-check           # 检查之前安装的插件，都有哪些是可以升级的 
npm install -g npm-upgrade         # 升级系统中的插件
npm-check  # 这一步会让你选择那些更新那些不更新
npm-upgrade # 更新上一步你所选择的

### 更新 hexo 及所有插件
npm update

### 确认 hexo 已经更新
hexo -v

## 更新主题
https://butterfly.js.org/