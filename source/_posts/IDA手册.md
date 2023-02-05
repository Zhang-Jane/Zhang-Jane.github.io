---
title: IDA手册
abbrlink: bbdeeae3
date: 2023-01-24 22:51:47
tags:
---
## IDA使用说明

### 1.常用快捷键

IDA中的快捷键都是和菜单栏的各个功能选项一一对应的，基本上你只要能在菜单栏上找到某个功能，也就能看到相应的快捷键，这里记录几个常用的：

a：将数据转换为字符串

f5：一键反汇编

esc：回退键，能够倒回上一部操作的视图（只有在反汇编窗口才是这个作用，如果是在其他窗口按下esc，会关闭该窗口）

shift+f12：可以打开string窗口，一键找出所有的字符串，右击setup，还能对窗口的属性进行设置

ctrl+w：保存ida数据库

ctrl+s：选择某个数据段，直接进行跳转

ctrl+鼠标滚轮：能够调节流程视图的大小

x：对着某个函数、变量按该快捷键，可以查看它的交叉引用

g：直接跳转到某个地址

n：更改变量的名称

y：更改变量的类型

/ ：在反编译后伪代码的界面中写下注释

\：在反编译后伪代码的界面中隐藏/显示变量和函数的类型描述，有时候变量特别多的时候隐藏掉类型描述看起来会轻松很多

；：在反汇编后的界面中写下注释

ctrl+shift+w：拍摄IDA快照

u：undefine，取消定义函数、代码、数据的定义

### 2.IDA动态调试：

**IDA动态调试有俩种:**

​	**2.1.一种是直接动态调试app应用**

​		1.首先把ida目录中的dbgsrv文件夹中的android_server文件push 到手机中

​			adb push <文件>  /data/local/tmp

​		2.adb shell , cd /data/local/tmp

​		3.chmod 777 <文件>

​		4. 运行./<文件名>

​		5.adb forward tcp:23946 tcp:23946

​		6.打开IDA选择Go

​		7.点击Debugger 中的Attach，有俩个选择①Remote ARM(一般真机调试)②Remote Linux(一般模拟器调式)

​		8.输入信息Hostname:127.0.0.1,点击ok

​		9.点击ok之后会弹出Choose process to attach to的界面，然后选择需要调试的进程。可能报错，原因没有打开app。

​		缺点，可能运行的时候，so已经加载，无法断点调试。

​		**2.2.二是以DEBUG的方式调式运行的类**

​			前面操作和上面1-5步骤一样

​			1.adb  shell  am start -D -n 包名/.类名（入口主mainactivity）

​			2.需要的话打开DDMS,查看app进程，或者adb shell 命令ps -ef | grep 应用包名，为了第六步。

​			3.重新打开IDA,点击Debugger 中的Attach，有俩个选择①Remote ARM(一般真机调试)②Remote 			Linux(一般模拟器调式)，选择Debug options,选择三项，然后输入信息Hostname:127.0.0.1,点击ok

​			4.选择需要调式的进程，进入调式界面，注意这里还需要设置一次Debug options的三项

​			5.按F9开始运行，app应用还会处于debug调式

​			6.使用jdb命名让app开始恢复运行:

​				jdb  -connect  com.sun.jdi.SocketAttach:hostname=127.0.0.1,port=<端口>

​			7.F9开始运行，让他加载响应的so库文件

​			8.打开debuuger中的module_list进入需要调式的so,下断点

### 注意事项：

​如果app 的AndroidManifest.xml如果没有debug权限，需要手动修改，重新打包签名安装。

查看flags里面时候允许debug选项,adb shell dumpsys package 包名，搜索flags，或者查看 cat /default.prop，查看debuggable=1(1，是允许设备中所有应用可以调试，0则检测AndroidManifest.xml中是否android:debuggabel=true)，因此修改/default.prop是最方便的。具体修改方法参见工具mprop：./mprop ro.debuggable 1（它的原理是注入init进程修改它的值）

------



下面介绍一些常用的快捷键

`F7` 单步步入，遇到函数，将进入函数代码内部
`F8` 单步步过，执行下一条指令，不进入函数代码内部
`F4` 运行到光标处（断点处）
`F9` 继续运行
`CTRL+F2` 终止一个正在运行的调试进程
`CTRL+F7` 运行至返回,直到遇到RETN（或断点）时才停止.