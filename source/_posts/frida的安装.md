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
mi 6  Anroid 8.1
Frida官网：https://www.frida.re/
Frida源码：https://github.com/frida
```

# 3.运作模式

Frida通过其强大的仪器核心Gum提供动态检测，Gum是用C语言编写的。因为这种检测逻辑很容易发生变化，所以通常需要用脚本语言编写，这样在开发和维护它时会得到一个简短的反馈循环。这就是GumJS发挥作用的地方。只需几行C就可以在运行时内运行一段JavaScript，它可以完全访问Gum的API，允许您挂钩函数，枚举加载的库，导入和导出的函数，读写内存，扫描模式的内存等

# 4. Frida安装

Frida的安装很简单，需要在windows安装frida客户端和在安卓安装frida服务端。
- python工具包安装
```
pip install frida==12.8.0
pip install frida-tools==5.3.0
pip install objection==1.8.4
```
## 1、windows安装客户端


- 查看frida版本`frida --version`


## 2、手机中安装Frida服务端
frida-server：
https://github.com/frida/frida/releases/download/12.8.0/frida-inject-12.8.0-android-arm.xz


- 查看Android手机设备设置`getprop ro.product.cpu.abi`

- 根据cpu版本去下载相应版本,手机是arm64-v8a的，找到相应的服务器server

- 将frida-server下载下来，加压出来，为了简单，重命名为fs-12.8.0，将放到手机，并进行端口转发，运行frida
    ```
    adb shell
    su root 
    adb push fs-12.8.0 /data/local/tmp
    chmod 755 fs-12.8.0
    ./fs-12.8.0 &
    ```

如果运行不了，关闭liunx的SELinux： `echo 0 > /sys/fs/selinux/enforce`。

另打开一个cmd，查看frida-server是否运行成功。
`frida-ps -U`

# Frida工具

工具总体概述
Frida提供了四个工具，frida-trace，frida-ps，frida，frida-discover，这些工具都位于python的Scripts路径下

## 注意端口转发

```bash
adb forward tcp:27042 tcp:27042
```

# frida命令
```
Usage: frida [options] target

Options:
  --version             show program's version number and exit
  -h, --help            show this help message and exit
  -D ID, --device=ID    connect to device with the given ID
  -U, --usb             connect to USB device
  -R, --remote          connect to remote frida-server
  -H HOST, --host=HOST  connect to remote frida-server on HOST
  -f FILE, --file=FILE  spawn FILE
  -F, --attach-frontmost
                        attach to frontmost application
  -n NAME, --attach-name=NAME
                        attach to NAME
  -p PID, --attach-pid=PID
                        attach to PID
  --stdio=inherit|pipe  stdio behavior when spawning (defaults to “inherit”)
  --runtime=duk|v8      script runtime to use (defaults to “duk”)
  --debug               enable the Node.js compatible script debugger
  -l SCRIPT, --load=SCRIPT
                        load SCRIPT
  -P PARAMETERS_JSON, --parameters=PARAMETERS_JSON
                        Parameters as JSON, same as Gadget
  -C CMODULE, --cmodule=CMODULE
                        load CMODULE
  -c CODESHARE_URI, --codeshare=CODESHARE_URI
                        load CODESHARE_URI
  -e CODE, --eval=CODE  evaluate CODE
  -q                    quiet mode (no prompt) and quit after -l and -e
  --no-pause            automatically start main thread after startup
  -o LOGFILE, --output=LOGFILE
                        output to log file
  --exit-on-error       exit with code 1 after encountering any exception in
                        the SCRIPT
```
"-U" 参数代表我们连接的是远程USB server，同理你也可以使用其他参数来连接，"-f "参数则表示在手机端启动一个你指定的android程序，那个FILE则表示应用的包名，通常"-f"这个参数配合"--no-pause"参数来使用，因为可能不让进程恢复的话可能会有奇怪的问题，"-p" 与"-n"命令分别表示attach到进程的名字或者pid，"-l"参数则是代表需要注入的javascript脚本，而这个javascript的脚本就是我们所写的hook代码，完成函数的hook，内存的dump等一系列功能
