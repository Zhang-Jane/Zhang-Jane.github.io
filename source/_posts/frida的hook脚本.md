---
title: frida的hook脚本
tags: frida
categories: frida
abbrlink: '93535598'
date: 2020-12-05 15:55:55
---

## Hook RegisterNatives
### 命令
`frida -U --no-pause -f package_name -l xx.js`
```javascript
var ishook_libart = false;

function hook_libart() {
    if (ishook_libart === true) {
        return;
    }
    var symbols = Module.enumerateSymbolsSync("libart.so");
    var addrGetStringUTFChars = null;
    var addrNewStringUTF = null;
    var addrFindClass = null;
    var addrGetMethodID = null;
    var addrGetStaticMethodID = null;
    var addrGetFieldID = null;
    var addrGetStaticFieldID = null;
    var addrRegisterNatives = null;
    var addrAllocObject = null;
    var addrCallObjectMethod = null;
    var addrGetObjectClass = null;
    var addrReleaseStringUTFChars = null;
    for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i];
        if (symbol.name == "_ZN3art3JNI17GetStringUTFCharsEP7_JNIEnvP8_jstringPh") {
            addrGetStringUTFChars = symbol.address;
            console.log("GetStringUTFChars is at ", symbol.address, symbol.name);
        } else if (symbol.name == "_ZN3art3JNI12NewStringUTFEP7_JNIEnvPKc") {
            addrNewStringUTF = symbol.address;
            console.log("NewStringUTF is at ", symbol.address, symbol.name);
        } else if (symbol.name == "_ZN3art3JNI9FindClassEP7_JNIEnvPKc") {
            addrFindClass = symbol.address;
            console.log("FindClass is at ", symbol.address, symbol.name);
        } else if (symbol.name == "_ZN3art3JNI11GetMethodIDEP7_JNIEnvP7_jclassPKcS6_") {
            addrGetMethodID = symbol.address;
            console.log("GetMethodID is at ", symbol.address, symbol.name);
        } else if (symbol.name == "_ZN3art3JNI17GetStaticMethodIDEP7_JNIEnvP7_jclassPKcS6_") {
            addrGetStaticMethodID = symbol.address;
            console.log("GetStaticMethodID is at ", symbol.address, symbol.name);
        } else if (symbol.name == "_ZN3art3JNI10GetFieldIDEP7_JNIEnvP7_jclassPKcS6_") {
            addrGetFieldID = symbol.address;
            console.log("GetFieldID is at ", symbol.address, symbol.name);
        } else if (symbol.name == "_ZN3art3JNI16GetStaticFieldIDEP7_JNIEnvP7_jclassPKcS6_") {
            addrGetStaticFieldID = symbol.address;
            console.log("GetStaticFieldID is at ", symbol.address, symbol.name);
        } else if (symbol.name == "_ZN3art3JNI15RegisterNativesEP7_JNIEnvP7_jclassPK15JNINativeMethodi") {
            addrRegisterNatives = symbol.address;
            console.log("RegisterNatives is at ", symbol.address, symbol.name);
        } else if (symbol.name.indexOf("_ZN3art3JNI11AllocObjectEP7_JNIEnvP7_jclass") >= 0) {
            addrAllocObject = symbol.address;
            console.log("AllocObject is at ", symbol.address, symbol.name);
        }  else if (symbol.name.indexOf("_ZN3art3JNI16CallObjectMethodEP7_JNIEnvP8_jobjectP10_jmethodIDz") >= 0) {
            addrCallObjectMethod = symbol.address;
            console.log("CallObjectMethod is at ", symbol.address, symbol.name);
        } else if (symbol.name.indexOf("_ZN3art3JNI14GetObjectClassEP7_JNIEnvP8_jobject") >= 0) {
            addrGetObjectClass = symbol.address;
            console.log("GetObjectClass is at ", symbol.address, symbol.name);
        } else if (symbol.name.indexOf("_ZN3art3JNI21ReleaseStringUTFCharsEP7_JNIEnvP8_jstringPKc") >= 0) {
            addrReleaseStringUTFChars = symbol.address;
            console.log("ReleaseStringUTFChars is at ", symbol.address, symbol.name);
        }
    }

    if (addrRegisterNatives != null) {
        Interceptor.attach(addrRegisterNatives, {
            onEnter: function (args) {
                console.log("[RegisterNatives] method_count:", args[3]);
                var env = args[0];
                var java_class = args[1];
                
                var funcAllocObject = new NativeFunction(addrAllocObject, "pointer", ["pointer", "pointer"]);
                var funcGetMethodID = new NativeFunction(addrGetMethodID, "pointer", ["pointer", "pointer", "pointer", "pointer"]);
                var funcCallObjectMethod = new NativeFunction(addrCallObjectMethod, "pointer", ["pointer", "pointer", "pointer"]);
                var funcGetObjectClass = new NativeFunction(addrGetObjectClass, "pointer", ["pointer", "pointer"]);
                var funcGetStringUTFChars = new NativeFunction(addrGetStringUTFChars, "pointer", ["pointer", "pointer", "pointer"]);
                var funcReleaseStringUTFChars = new NativeFunction(addrReleaseStringUTFChars, "void", ["pointer", "pointer", "pointer"]);

                var clz_obj = funcAllocObject(env, java_class);
                var mid_getClass = funcGetMethodID(env, java_class, Memory.allocUtf8String("getClass"), Memory.allocUtf8String("()Ljava/lang/Class;"));
                var clz_obj2 = funcCallObjectMethod(env, clz_obj, mid_getClass);
                var cls = funcGetObjectClass(env, clz_obj2);
                var mid_getName = funcGetMethodID(env, cls, Memory.allocUtf8String("getName"), Memory.allocUtf8String("()Ljava/lang/String;"));
                var name_jstring = funcCallObjectMethod(env, clz_obj2, mid_getName);
                var name_pchar = funcGetStringUTFChars(env, name_jstring, ptr(0));
                var class_name = ptr(name_pchar).readCString();
                funcReleaseStringUTFChars(env, name_jstring, name_pchar);

                //console.log(class_name);

                var methods_ptr = ptr(args[2]);

                var method_count = parseInt(args[3]);
                for (var i = 0; i < method_count; i++) {
                    var name_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3));
                    var sig_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize));
                    var fnPtr_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize * 2));

                    var name = Memory.readCString(name_ptr);
                    var sig = Memory.readCString(sig_ptr);
                    var find_module = Process.findModuleByAddress(fnPtr_ptr);
                    console.log("[RegisterNatives] java_class:", class_name, "name:", name, "sig:", sig, "fnPtr:", fnPtr_ptr, "module_name:", find_module.name, "module_base:", find_module.base, "offset:", ptr(fnPtr_ptr).sub(find_module.base));

                }
            },
            onLeave: function (retval) { }
        });
    }

    ishook_libart = true;
}

hook_libart();
```
## Hook Java 类中的方法：

1.调用源码中的java类

```js
var demo = Java.use(所要hook的类：com.jsbc.lznews.util.net.AntiTheftUtils);
```

2.调用类中的方法

```javascript
demo.所需hook的方法名.implementation = function(url, params, timeStampExtra)构造java方法所需的参数，无需声明参数类型
{
	打印日志
}
```

3.遇到重载的方法：

查看出错的日志信息，将需要重载的方法一一实现：

```javascript
para_func.transform.overload('java.lang.String','int').implementation = function(url, timeStampExtra){
                send("第一个函数");
                send("url："+url);
                send("timeStampExtra："+timeStampExtra);
                return this.transform(url, timeStampExtra);
      
      };
```
注意重载的方法参数个数，需要一一对应
4.hook java层 参数打印信息
```
//hook java层 参数打印信息
jscode = """
Java.perform(function () {
    
    var HttpRequestEntity = Java.use('cn.thecover.www.covermedia.data.entity.HttpRequestEntity');//要hook的类名完整路径

    HttpRequestEntity.getSign.implementation = function (arg1,arg2,arg3) { // 重写要hook的方法getSign，当有多个重名函数时需要重载，function括号为函数的参数个数
       
        var Sign=this.getSign(arg1,arg2,arg3); //调用原始的函数实现并且获得返回值，如果不写的话我们下面的代码会全部替换原函数
       
        send("arg1:"+arg1);  //打印参数值
        send("arg2:"+arg2);
        send("arg3:"+arg3);
        send(this.timestamp);       //{u'fieldReturnType': {u'className': u'java.lang.String', u'type': u'pointer', u'name': u'Ljava/lang/String;', u'size': 1}, u'fieldType': 2, u'value': u'1529071177437'}
        send(this.timestamp.value); //1529071177437
        send(Sign);   //打印返回值
        return Sign;  //函数有返回值时需要返回
    };
    
});
```
5.修改值
```
  //call public method
    var money = coin.getMoney();//直接调用方法没问题
    send("getCoinMoney money:" +money);
    
    //get public field
    var money1 = coin.money;//直接调用字段就有问题了，不管字段是private还是，public
    send("money field:" money1);
    
    //如何去做,我们的做法就是用反射进行操作，先用java.cast获取对应类的class类型，然后就和java中类似了，基本类型修改值都是setXXX方法，对象类型都是set方法即可
    //reflect field to get value
    var money_field_name = Java.cast(coin.getClass(),clazz).getDeclaredField("money");
     var money_field_name.setAccessible(true);
    send("reflect money field :"+ money_field_name.get(coin));
    
    //reflect field to set value
    money_field_name.setInt(coin,101);
```


