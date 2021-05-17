---
title: android逆向分析思路
tags: andorid逆向
categories: andorid逆向
abbrlink: 4c73b60a
date: 2021-05-15 23:02:38
---
# 静态分析android程序

## 从AndroidManifest.xml找到程序的入口分析

每个android程序都有一个主的activity，它是程序启动的第一个activity，然后每个activity都需要在

AndroidManifest.xml文件中声明，看下面得例子：

```
<activity android:theme="@style/DrugTheme.Launcher" android:name="cn.dxy.medicinehelper.activity.DrugLaunchActivity" android:exported="true" android:screenOrientation="portrait">
<intent-filter>
<action android:name="android.intent.action.MAIN"/>
<category android:name="android.intent.category.LAUNCHER"/>
</intent-filter>
</activity>
```

<action android:name="android.intent.action.MAIN"/> 
<category android:name="android.intent.category.LAUNCHER"/> 

android:name="cn.dxy.medicinehelper.activity表示这个activity的包名.DrugLaunchActivity 表示这个类

找到主activity后，找到onCreat()，对于大多数而言这个就是程序的入口。

## android中的application类有什么用，和activity什么关系?

Application和Activity,Service一样是Android框架的一个系统组件，当Android程序启动时系统会创建一个Application对象，用来存储系统的一些信息。

Android系统自动会为每个程序运行时创建一个Application类的对象且只创建一个，所以Application可以说是单例（singleton）模式的一个类。

通常我们是不需要指定一个Application的，系统会自动帮我们创建，如果需要创建自己的Application，那也很简单！创建一个类继承Application并在AndroidManifest.xml文件中的application标签中进行注册（只需要给application标签增加name属性，并添加自己的 Application的名字即可）。

启动Application时，系统会创建一个PID，即进程ID，所有的Activity都会在此进程上运行。那么我们在Application创建的时候初始化全局变量，同一个应用的所有Activity都可以取到这些全局变量的值，换句话说，我们在某一个Activity中改变了这些全局变量的值，那么在同一个应用的其他Activity中值就会改变。

## 通过程序反馈给你的直接的信息去分析

就是程序运行时候回有一些很直接的提示，或者一些特征，可以根据这些特征去快速找到关键代码

## 找到特征函数

通过特征函数定位关键代码。熟悉android的sdk中api函数，然后根据程序一些行为判断，某些是由函数触发的行为

## 插桩日志打印

通过静态分析代码的关键位置，插入log代码分析参数的调用参数，返回值的信息

# 动态分析

## DDMS

## 使用Xposed/Frida Hook App中某个函数

## 利用分析工具ida，jeb等分析

# 逆向so技巧

## 没有搜Java_xxx这样的函数

说明他可能用了动态注册，所以就去搜JNI_OnLoad函数，所以这里注意大家以后如果打开so之后发现没有Java_xxx这样的函数开头一般都是在JNI_OnLoad中采用了动态注册方式，所以只需要找到JNI_OnLoad函数，然后找到RegisterNatives函数就可以了

## 反汇编

看到类似于vXX+YY这样的，选中vXX变量，然后按Y按键，然后替换成JNIEnv*即可，Force call type

## 防止调试

ptrace

怎么修改成NOP指令呢？有一个牛逼的网站在线转换arm为hex值：http://armconverter.com

## 签名校验

想知道so中有没有签名校验的话，可以直接Shift+F12查找字符串内容"signatures

# 反调试
## 1.一种进程最多只能被一个进程ptrace

我们知道在调试状态下，Linux会向/proc/pid/status写入一些进程状态信息，比如最大的变化是TracePid字段会写入调试进程的pid.
当我们看到android_server附加时，可以根据Linux下一个进程最多只能被另一个进程跟踪，因此可以自己ptrace自己，然后让android_server不能够调试。

## 2.检测TracePid的值

当我们可以检测Tracepid的值，如果不为0，只能说明一点：当前进程正在被调试，那我们就可kill掉退出。同时，我们还可以加一个线程机制进行循环检测，来增大攻击者破解的难度，这也是很多加固厂商采用的办法。
解决办法：一是可以用debug模式启动，在JNI_Onload处下断点，找到那个调用方法NOP掉，二是直接静态分析JNI_Onload，直接去掉方法调用。

## 3.检测android_server端口号

我们知道android_server的默认监听端口是23946，所以可以通过检测这个端口号来起到一定的反调试作用。在linux系统中在/proc/net/tcp会记录这些连接信息。
我们可以看到在底层多了个5D8A的端口，这个正对应16进制的23946，因此我们可以检查这个文件下面的这个端口号来进行达到反调试的作用。同时我们也可以通过执行 
netstat -apn命令进行查看。
解决办法：换另外一个端口

## 4.通过检测android_server这些关键字以及文件目录

我们知道在调试进程的过程中，这个进程会被IDA中的android_server ptrace,并且这个进程名字存在于 “/proc/pid/cmdline”中，当然这里的pid指的是android_server的进程号，这个可以通过TracePid来获得，通过下面的图可以看出来：

## 5.检测在调试状态下的软件断点

要对在调试时下断点有一定的了解，发现下断点还是利用ptrace系统函数，在调试器设置断点的时候，首先完成件事：
1》保存目标地址上的数据
2》将目标地址上的头几个字节替换为break point指令，命中断点触发breakpoint,这时程序向操作系统发送SIGTRAP信号，调试器收到SIGTRAP信号后，调试器会回退被跟踪进程的当前pc值，当控制权回到原进程时，pc就恰好指向了点所在位置，这就是调试器设置断点的基本原理。
也就是说软件断点通过改写目标地址的头几个字节为breakpoint指令，所以我们可以直接进行检测文件，遍历so中的在可执行segment查找是否出现breakpoint指令即可，即根据其对应的偏移地址进行检测有没有ARM、Thumb、Thumb2的断点指令，如果有的话，就kill掉。
解决办法：这般函数可以在JNI_Onload、com_java_XX这类函数进行调用，找出问题的原因，然后对关键函数进行NOP掉。

## 6.使用inotify对文件进行监控

我们知道在动态调试的过程中，一般会查看调试进程的虚拟空间或者是dump内存，这时候就会汲步到对于文件的读写以及打开的权限，
然而偏巧的是在Linux下inotify就可以实现对文件系统事件的打开，读写的监管。如果通过inotify监管这些，收到事件变化，那我们就可以kill掉进程。
下面主要会用到的几个常用的api:
1.inotify_init:用于创建一个inotify实例的系统调用，并返回一个指向该实例的文件描述符。
2.inotify_add_watch:增加对文件或者目录的监控，并指定需要监控哪些事件。
3.read:读取包含一个或者多个事件信息的缓存。
4.select

## 7.调试时代码执行时间差异检测

计算前后的差异，如果超出一般正常情况下的设定值，我们就认为此时的代码下在在被调试，这时就可以选择退出。

## 8.Dalvik虚拟内检测调试器函数

由于Dalvik自带这些内部检测调试器的代码，大致上是在被调试以后，改变那个调试器的状态字段。

## 9.apk进程fd文件检测

原理：根据/proc/pid/fd/路径下文件的个数差异，判断进程的判态

## 10.函数hash值检测

原理：so文件中函数的指令是固定的，但是如果被下了软件断点，指令就会发生改变，可以计算内存中一段指令的hash值进行校验，检测是否被修改或被下断点

## 11.断点指令检测

原理，如果函数被下软件断点，则断点地址会被改写为bkpt指令，可以在函数体中牛搜索bkpt指令来检测软件断电。

## 12.利用IDA先截获信号特性的检测

原理：IDA会首先截获信号，导致进程无法接收到信号，因而不会执行信号处理函数。将关键函数流程放在信号处理函数中，如果没有执行，就是被调试状态。

## 13.利用IDA解析缺陷反调试

原理：IDA采用递归下降算法来反汇编指令，而该算法最大的缺点在于它无法处理间接代码路径，无法识别动态算出来的跳转。
而arm架构下由于存在arm和thumb指令集，就涉及到指令集切换，IDA在革某些情况下无法智能识别arm和thumb指令，
进一步导致无法进行伪代码还原。

## 14.三种进程信息结构检测

原理：一些进程文件中存储了进程信息，可以读取这些信息得知是否为调试方法
1》/proc/pid/status、/proc/pid/task/pid/status/  TracePid非0
2》/proc/pid/stat、/proc/pid/task/pid/stat 第二个字段是t
3》/proc/pid/wchan、/proc/pid/task/pid/wchan  ptrace_stop