---
title: frida的安装
tags: frida
categories: frida
abbrlink: 2e576213
date: 2020-10-25 22:31:33
---
# 1. 概述

Frida是个轻量级别的hook框架

## 是Python API，但JavaScript调试逻辑

Frida的核心是用C编写的，并将[Google的V8引擎](https://links.jianshu.com/go?to=https%3A%2F%2Fdevelopers.google.com%2Fv8%2F)注入到目标进程中，在这些进程中，JS可以完全访问内存，挂钩函数甚至调用进程内的本机函数来执行。

使用Python和JS可以使用无风险的API进行快速开发。Frida可以帮助您轻松捕获JS中的错误并为您提供异常而不是崩溃。
 。
 关于frda学习路线了，Frida的学习还是蛮简单的，只需要了解两方面的内容：
 1）主控端和目标进程的交互（message）
 2）Python接口和js接口（查文档）

frida框架分为两部分：
 1）一部分是运行在系统上的交互工具frida CLI。
 2）另一部分是运行在目标机器上的代码注入工具 frida-serve。

# 2. 资源和环境



```cpp
Windows10 X64
Python 3.7
Google pixel Anroid 7.1
Frida官网：https://www.frida.re/
Frida源码：https://github.com/frida
```

# 3.运作模式

Frida通过其强大的仪器核心Gum提供动态检测，Gum是用C语言编写的。因为这种检测逻辑很容易发生变化，所以通常需要用脚本语言编写，这样在开发和维护它时会得到一个简短的反馈循环。这就是GumJS发挥作用的地方。只需几行C就可以在运行时内运行一段JavaScript，它可以完全访问Gum的API，允许您挂钩函数，枚举加载的库，导入和导出的函数，读写内存，扫描模式的内存等

# 4. Frida安装

Frida的安装很简单，需要在windows安装frida客户端和在安卓安装frida服务端。

## 1、windows安装客户端

windows安装pyhon37[安装](https://links.jianshu.com/go?to=https%3A%2F%2Fjingyan.baidu.com%2Farticle%2Fb907e62768ef7046e7891cc6.html),打开cmd，使用命令
 `pip3.7.exe install frida`

![img](https:////upload-images.jianshu.io/upload_images/14822389-1763f76c297f9935.png?imageMogr2/auto-orient/strip|imageView2/2/w/620/format/webp)

在安装frida-tools
 `pip3.7.exe install frida-tools`

![img](https:////upload-images.jianshu.io/upload_images/14822389-3608de4efe49b9c7.png?imageMogr2/auto-orient/strip|imageView2/2/w/558/format/webp)

查看frida版本`frida --version`

![img](https:////upload-images.jianshu.io/upload_images/14822389-7409df376ec631a5.png?imageMogr2/auto-orient/strip|imageView2/2/w/185/format/webp)

## 2、手机中安装Frida服务端

查看Android手机设备设置`getprop ro.product.cpu.abi`

![img](https:////upload-images.jianshu.io/upload_images/14822389-8df79d990ad8de47.png?imageMogr2/auto-orient/strip|imageView2/2/w/355/format/webp)

根据cpu版本去下载相应[frida-server](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Ffrida%2Ffrida%2Freleases),手机是arm64-v8a的，找到相应的服务器server,如下

![img](https:////upload-images.jianshu.io/upload_images/14822389-60bb9bd5e79559ce.png?imageMogr2/auto-orient/strip|imageView2/2/w/441/format/webp)

将frida-server下载下来，加压出来，为了简单，重命名为frida-server64，将放到手机，并进行端口转发，运行frida

![img](https:////upload-images.jianshu.io/upload_images/14822389-c988a241803c798c.png?imageMogr2/auto-orient/strip|imageView2/2/w/578/format/webp)

如果运行不了，关闭liunx的SELinux： `echo 0 > /sys/fs/selinux/enforce`。

另打开一个cmd，查看frida-server64是否运行成功。

![img](https:////upload-images.jianshu.io/upload_images/14822389-1e9273aa885a9dbd.png?imageMogr2/auto-orient/strip|imageView2/2/w/438/format/webp)



# Frida工具

1、 工具总体概述
 Frida提供了四个工具，frida-trace，frida-ps，frida，frida-discover，这些工具都位于python的Scripts路径下

![img](https:////upload-images.jianshu.io/upload_images/14822389-d48a9847023172b9.png?imageMogr2/auto-orient/strip|imageView2/2/w/608/format/webp)



## 注意端口转发

```bash
adb forward tcp:27042 tcp:27042
```

