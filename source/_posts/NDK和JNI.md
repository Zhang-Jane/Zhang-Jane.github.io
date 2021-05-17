---
title: NDK和JNI
tags: andorid逆向
categories: andorid逆向
abbrlink: 4db545c4
date: 2021-05-15 23:19:25
---
# NDK与JNI基础

1.由来：

​	 Android 平台从一开就已经支持了C/C++了。我们知道Android的SDK（ Software Development Kit ）主要是基于Java的，所以导致了在用Android SDK进行开发的工程师们都必须使用Java语言。不过，Google从一开始就说明Android也支持JNI编程方式，也就是第三方应用完成可以通过JNI调用自己的C动态度。于是NDK就应运而生了。

2.NDK是什么：

​	NDK全拼是：Native Develop Kit。官方定义： Android NDK 是一套允许您使用原生代码语言(例如C和C++) 实现部分应用的工具集。在开发某些类型应用时，这有助于您重复使用以这些语言编写的代码库 。

3.

​	so文件，其本质就是一堆C、C++的头文件和实现文件打包成一个库。目前Android系统支持以下七种不用的CPU架构，每一种对应着各自的应用程序二进制接口ABI：(Application Binary Interface)定义了二进制文件(尤其是.so文件)如何运行在相应的系统平台上，从使用的指令集，内存对齐到可用的系统函数库。对应关系如下：

> - ARMv5——armeabi
> - ARMv7 ——armeabi-v7a
> - ARMv8——arm64- v8a
> - x86——x86
> - MIPS ——mips
> - MIPS64——mips64
> - x86_64——x86_64

4.什么是JNI:

​	JNI，全称为Java Native Interface，即Java本地接口，JNI是Java调用Native 语言的一种特性。通过JNI可以使得Java与C/C++机型交互。即可以在Java代码中调用C/C++等语言的代码或者在C/C++代码中调用Java代码。由于JNI是JVM规范的一部分，因此可以将我们写的JNI的程序在任何实现了JNI规范的Java虚拟机中运行。同时，这个特性使我们可以复用以前用C/C++写的大量代码JNI是一种在Java虚拟机机制下的执行代码的标准机制。代码被编写成汇编程序或者C/C++程序，并组装为动态库。也就允许非静态绑定用法。这提供了一个在Java平台上调用C/C++的一种途径，反之亦然