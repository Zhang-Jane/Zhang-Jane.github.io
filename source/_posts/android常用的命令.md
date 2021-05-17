---
title: android常用的命令
abbrlink: 5974b575
date: 2021-05-15 22:55:46
tags:
---
## 命令分类

把在adb shell中的执行的命令成为shell命令，在外面执行的叫非shell命令

## 非shell命令

### 查看当前正在运行app的activity信息

```bash
adb shell dumpsys activity top
adb shell dumpsys > infos.txt
```

### 查看包名应用详细的信息

```bash
adb shell dumpsys package(包名)
```

### 查看指定包app的数据组存储信息

```bash
adb shell dumpsys dbinfo 包名
```

### 转发设备端口

```bash
adb forward 协议:端口 ...
```

### 查看设备中可以被调试的应用进程号

```bash
adb jdwp
```

### 查看当前日志信息

```
adb logcat -v time  > E://log.txt
-v 显示日志格式  -v time 时间格式
```

adb logcat 命令格式：adb logcat [选项] [过滤项]，其中 选项 和 过滤项 在 中括号 [] 中, 说明这是可选的；

(1) 选项解析

-- "-s"选项 : 设置输出日志的标签, 只显示该标签的日志;

--"-f"选项 : 将日志输出到文件, 默认输出到标准输出流中, -f 参数执行不成功;

--"-r"选项 : 按照每千字节输出日志, 需要 -f 参数, 不过这个命令没有执行成功;

--"-n"选项 : 设置日志输出的最大数目, 需要 -r 参数, 这个执行 感觉 跟 adb logcat 效果一样;

--"-v"选项 : 设置日志的输出格式, 注意只能设置一项;

--"-c"选项 : 清空所有的日志缓存信息;

--"-d"选项 : 将缓存的日志输出到屏幕上, 并且不会阻塞;

--"-t"选项 : 输出最近的几行日志, 输出完退出, 不阻塞;

--"-g"选项 : 查看日志缓冲区信息;

--"-b"选项 : 加载一个日志缓冲区, 默认是 main, 下面详解;

--"-B"选项 : 以二进制形式输出日志;

(2) 过滤项解析

过滤项格式 : <tag>[:priority] , 标签:日志等级, 默认的日志过滤项是 " *:I " ;

-- V : Verbose (明细);

-- D : Debug (调试);

-- I : Info (信息);

-- W : Warn (警告);

-- E : Error (错误);

-- F: Fatal (严重错误);

-- S : Silent(Super all output) (最高的优先级, 可能不会记载东西);

## shell命令

### run-as

以root身份运行命令，可以在未root的情况下查看某个(debug模式的)应用的内部信息（沙盒文件夹）。

执行run-as + 包名，就可以直接以root权限进入该应用的沙盒中查看包括数据库、xml、各种信息文件

### ps

查看设备进程信息

```bash
ps | grep 过滤内容
ps -t[pid] 查看pid对应的线程信息
```

### pm

```
pm install apk包
pm uninstall 包名
pm clear 指定包名应用信息 # 清除应用数据
```

### am

```
am start -n 
am start -D -n  # dubug方式启动
```

| 命令                      | 功能                      | 实现方法                   |
| ------------------------- | ------------------------- | -------------------------- |
| am start `[options`] `>   | 启动Activity              | startActivityAsUser        |
| am startservice `>        | 启动Service               | startService               |
| am stopservice `>         | 停止Service               | stopService                |
| am broadcast `>           | 发送广播                  | broadcastIntent            |
| am kill `>                | 杀指定后台进程            | killBackgroundProcesses    |
| am kill-all               | 杀所有后台进程            | killAllBackgroundProcesses |
| am force-stop `>          | 强杀进程                  | forceStopPackage           |
| am hang                   | 系统卡住                  | hang                       |
| am restart                | 重启                      | restart                    |
| am bug-report             | 创建bugreport             | requestBugReport           |
| am dumpheap `> `>         | 进程pid的堆信息输出到file | dumpheap                   |
| am send-trim-memory `> `> | 收紧进程的内存            | setProcessMemoryTrimLevel  |
| am monitor                | 监控                      | MyActivityController.run   |

### netcfg

查看设备的ip

### netstat

查看设备的端口号信息

### top

查看cpu消耗信息

### getprop

查看系统的属性值

```bash
getprop ro.debuggable
```

## android属性配置文件

**Android 属性系统初始化**

init 进程(源码位于/system/core/init/init.c)主要完成：解析 init.rc 文件并执行相应动作和服
务；生成设备驱动节点；处理子进程终止；提供属性服务。因为分析 Android 属性系统，因
此只关注属性服务

如果属性名称以“ro.”开头，那么这个属性被视为只读属性

### 系统配置文件

设备系统，版本号，cpu型号等

/system/build.prop

### default.prop

调式信息

## 命令的补全
busybox
https://github.com/meefik/busybox



