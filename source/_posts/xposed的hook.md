---
title: xposed的hook
tags: hook
categories: hook
abbrlink: ec4e79f7
date: 2020-10-28 20:31:40
---
## Xposed 的原理

Android基于Linux，第一个启动的进程自然是`init进程`，该进程会启动所有Android进程的父进程——`Zygote(孵化)进程`，该进程的启动配置在`/init.rc`脚本中，而Zygote进程对应的执行文件是`/system/bin/app_process`，该文件完成类库的加载以及一些函数的调用工作。在Zygote进程创建后，再fork出SystemServer进程和其他进程。而Xposed Framework呢，就是**用自己实现的app_process替换掉了系统原本提供的app_process**，加载一个额外的jar包，然后入口从原来的`com.android.internal.osZygoteInit.main()`被替换成了`de.robv.android.xposed.XposedBridge.main()`，然后**创建的Zygote进程就变成Hook的Zygote进程了**，而后面Fork出来的进程也是被Hook过的。这个Jar包在`/data/data/de.rbov.android.xposed.installer/bin/XposedBridge.jar`。

## Xposed代码的编写

### https://www.freebuf.com/news/189021.html

新建一个项目，请注意如果你只是hook，那么可以选择add no activity，但是如果有和自身app交互，那么就选择empty activity。我为了给大家演示，是有展示的，所以我选择empty activity。

### 1.创建成功后找到AndroidManifest.xml中的application，在文件里面添加如下代码。

```java
<meta-data
    android:name="xposedmodule"
    android:value="true" />
<meta-data
    android:name="xposeddescription"
    android:value="XposedProject" />
<meta-data
    android:name="xposedminversion"
    android:value="53" />
```

第一个xposedmodule的属性为ture，证明这是一个xposed的module；

第二个xposeddescription，这是介绍项目的话语；

第三个xposedminversion则是说明该xposedmodule所支持的最小版本，而最低版本就是30。

添加到AndroidManifest.xml中的application里面。

### 2.加入xposed的依赖包到libs目录

https://bintray.com/rovo89/de.robv.android.xposed/api

### 3.接下来找到build.gradle(module:app是你app项目下的（不是外层的）)文件，在里面添加如下代码。

```java
compileOnly 'de.robv.android.xposed:api:82'
 
compileOnly 'de.robv.android.xposed:api:82:sources'
```

添加到buile.gradle中dependencies中

### 4.建一个Java类并且继承接口IXposedHookLoadPackage和重写handleLoadPackage方法。

```java
import de.robv.android.xposed.IXposedHookLoadPackage;
import de.robv.android.xposed.callbacks.XC_LoadPackage;
 
public class HookMain implements IXposedHookLoadPackage {
 
    @Override
 
    public void handleLoadPackage(XC_LoadPackage.LoadPackageParam lpparam) throws Throwable {
 
 
    }
 
}
```

### 5.在src/mian目录下添加一个assets目录，目录下添加一个xposed_init文件，里面的代码是你的Hook类的包名+类名。
而本项目就是：com.yymjr.android.xposedproject.HookMain。

## 注意的

不管是连接真机调试还是用模拟器调试，都不要直接点 Android Stduio的那个三角按钮直接运行！！！ Build → Build APK, 要生成一个APK文件，未签名的也可以，然后放到模拟器或手机上运行再试试。

## 文档

https://api.xposed.info/reference/de/robv/android/xposed/package-summary.html

## 免重启

https://www.freebuf.com/sectool/167274.html

## example

`adb logcat命令`

在cmd窗口中输入如下命令，就可以像Studio中的Logcat窗口中显示日志信息：

```bash
//格式1：打印默认日志数据
adb logcat 

//格式2：需要打印日志详细时间的简单数据
adb logcat -v time

//格式3：需要打印级别为Error的信息
adb logcat *:E

//格式4：需要打印时间和级别是Error的信息
adb logcat -v time *:E

//格式5：将日志保存到电脑固定的位置，比如D:\log.txt
adb logcat -v time >D:\log.txt
```

```java
public class HookTemplate implements IXposedHookLoadPackage{
    @Override
    public void handleLoadPackage(XC_LoadPackage.LoadPackageParam lpparam) throws Throwable {
        String HOOK_PACKAGE_NAME = "";
        XposedBridge.log("【handleLoadPackage】" + lpparam.packageName);//任何一个app启动时都会调用
        if (lpparam.packageName.equals(HOOK_PACKAGE_NAME)) {//匹配指定的包名
            Class hook_clazz = lpparam.classLoader.loadClass(
                    ""); // 需要hook的类名
            XposedHelpers.findAndHookMethod(hook_clazz, "hook的方法名", int.class, int.class, new XC_MethodHook() {
                //int.class, int.class传入的参数类型
                protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
                    XposedBridge.log("Called beforeHookedMethod");
                    Object thisObject = param.thisObject; // 获取当钱的对象
                    XposedHelpers.getObjectField(thisObject, "") /*getObjectField(Object obj, String fieldName)
Returns the value of an object field in the given object instance.*/ 
                    param.method; // 获取方法
                    param.args; // 获取参数
                    param.setResult() // 
                    
                    XposedBridge.log("Changed args 0 to " + param.args[0]);
                }

                protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                    param.getResult(); // 获取方法返回的结果
                    
                    XposedBridge.log("Called afterHookedMethod");
                }
            });
            }
    }
}

```

```java
public class HookDemo implements IXposedHookLoadPackage{
    @Override
    public void handleLoadPackage(XC_LoadPackage.LoadPackageParam lpparam) throws Throwable {
        XposedBridge.log("【handleLoadPackage】" + lpparam.packageName);//任何一个app启动时都会调用
        if (lpparam.packageName.equals("com.tencent.mm")){//匹配指定的包名
            // 这个可以不写，如果写了下面xxxx替换成hook_clazz
            Class hook_clazz = lpparam.classLoader.loadClass(
                    "com.tencent.wcdb.database.SQLiteDatabase"); // 需要hook的类名
            XposedHelpers.findAndHookMethod("xxxx",lpparam.classLoader, "insertWithOnConflict", String.class, String.class, ContentValues.class, int.class, new XC_MethodHook() {
                //                //int.class, int.class传入的参数类型
                protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
                    XposedBridge.log("Called beforeHookedMethod");
                }

                protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                    XposedBridge.log("帮你hook");
                    Object tableName = param.args[0];
                    Object oj = param.args[1];
                    ContentValues content  = (ContentValues)param.args[2];
                    XposedBridge.log(String.format("hook tableName %s，%s", tableName, oj));
                    for (String key:content.keySet()){
                        XposedBridge.log(String.format("hook Key:%s | Value:%s",key, content.get(key)));
                    }

                }
            });
        }
    }
}

```

