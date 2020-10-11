---
title: hexo 入门
abbrlink: 3e57632f
date: 2020-10-10 12:44:04
tags: hexo
categories: hexo
top_img: http://pic1.win4000.com/wallpaper/2020-10-09/5f801df37a7c1.jpg
cover: https://pic4.zhimg.com/v2-7bbe64c2282a997092613d004f0222f2_1440w.jpg?source=172ae18b

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

