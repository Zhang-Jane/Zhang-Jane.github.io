---
title: js的hook方法和技巧
tags: hook
categories: hook
abbrlink: cd83947e
date: 2020-10-26 21:25:33
---

# hook是什么

hook作用就是在你关键代码位置前或者后进行一些处理

# 如何定位

- 搜索
- 断点调试
    - xhr
    - dom
    - event
    - 自定义 
- 使用油猴插件脚本进行hook
    - json
    - cookie
    - window attr
    - eval/function
    - 等等

# chrome调试的方法

- 官方文档：https://developers.google.com/web/tools/chrome-devtools/javascript/
- sources中几个按钮：
    - Filesystem
        - 让devtools加载本地文件系统，并能在code editor中编辑，相当于IDE
    - Overriders
        - 将远程文件代理到本地
    - Snippets
        - 运行代码片段

# 无限debugger解决方案（操作chrome浏览器）

- 禁止所有的断点
    - 在chrome的断点调试栏点击取消所有断点
    - 这样做虽然可以取消别人断点，但是自己也无法下断点分析了
- 禁止某处的断点
    - 在sources的操作窗口点击想要取消断点的那一行号，右键点击取消断点
- 条件断点
    - 和上述操作差不多，只是选择条件设置
- 远程js映射到本地的文件
    - Windows 下可以使用 Fiddler
    - Mac 下可以使用 Charles
    - Chrome 开发工具自带的 Override
    - 需要特殊环境才能下载的Reres和 Resource Override插件
        - 有坑，使用前需要设置允许本地文件，详细查看（https://github.com/annnhan/ReRes）
        - 不要美化代码
- 中间工具替换字符串特征（fiddler，chales）
    - 使用工具把debugger这个关键字替换成字符串或者修改逻辑使得debugger不生效
    - 示例fiddler
        - 在fiddler界面点击Autoresponder选项
        - 下面rule editor选择上面选择请求的地址，下面选择替换的html，然后save
        - 重新打开
    - 示例chales
        - 抓包url，右键点击map local
- 使用reres插件替换特征字符串
    - 通过reres插件，修改原来代码的，然后映射
    - 点开添加规则之后：
        - If URL match栏，填入的是匹配 URL 的规则，这里填入的是一个正则表达式，比如我想配置github.com/login这个域名，可以使用*://github.com/login*这样的方式匹配，或者使用偷懒的方式直接匹配网站路径下的文件^https://www.xxxAAA.cn/js/jquery.min.js
        - If URL match注意事项：不要填开头的/和结束的/x，如/.*/g请写成.*
        - `Response栏，填写的是映射的响应地址，比如在 Window 下，我想要将 E 盘下的 index.js 文件映射回去，使用本地地址的方式是file:///E:/index.js，使用线上地址的方式是http://localhost:3000/xxx/index.js`
        - Response注意事项：线上地址以http://开头，本地地址以file:///开头，Mac 推荐使用超级右键可以直接复制文件路径，同时上一点中提到的线上地址需要启动一个可以访问静态文件的服务，可以使用 Flask 快速搭建一个。
        - 添加完成，点击保存，重新加载页面即可。
- 利用油猴插件删除debugger特征
- 重写关键函数
    - 分析代码的逻辑，把关键的debugger函数在console重写为空。
- https://qqe2.com/Video/default.html，出现debugger后，在console输入：Function.prototype.constructor = function(){},然后点击切换回sources，点击继续运行。前提是(function(){}).constructor === Function为True才可以。
- 思路
    - 分过debugger的代码流程，重写逻辑

# 举个比方，打个例子

我们通过 JSON.stringify 的 hook 来了解具体的操作方式。JSON.stringify 的作用是将一个对象转换为字符串，常用于与服务端交换数据时。假设请求时需要将 {"name": "sfhfpc", "pwd": "39ik-0ake-2jz3", "client": 1, "_sign": "298zudju27zyeh58zmgj293ozl48zjr829zmg92="} 这样一个对象发送给服务端，那么很有可能需要在 JavaScript 代码里构造这样一个对象并将其转换为字符串的形式，最后发给服务端。既然知道有这样的过程，那么我们就编写一个 hook 函数，对 JSON.stringify 进行 hook。也就是比 JSON.stringify 先一步获得消息，在为所欲为后将原函数（JSON.stringify）返回。具体的 hook 代码如下：

```js
// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
	var stringifg = JSON.stringify;
	JSON.stringify = function(input){
	
	console.log("stringify - > ", input);
	debugger;
	return stringify(input)
	}
})();
```



这里用了 (function(){})(); 来确保函数自动执行，TamperMonkey 还允许我们设置执行的时间（run-at 参数正是这个作用）。也就是说系统在调用 JSON.stringify 之前，这个函数就被hook函数劫下了，调用 JSON.stringify 的时候调用的其实是我们设定的hook函数。

# 油猴脚本编写

官方文档：https://www.tampermonkey.net/documentation.php

```js
// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
})();
```



1. 首先来看看脚本的内容，上面是一大排注释，这些注释可以非常有用的，它表明了脚本的各个属性。下面来简单介绍一下。
    - 属性名	作用
    - name	油猴脚本的名字
    - namespace	命名空间，类似于Java的包名，用来区分相同名称的脚本，一般写成作者名字或者网址就可以了
    - version	脚本版本，油猴脚本的更新会读取这个版本号
    - description	描述，用来告诉用户这个脚本是干什么用的
    - author 	作者名字
    - match	只有匹配的网址才会执行对应的脚本，例如*、http://*、http://www.baidu.com/*等，参见谷歌开发者文档
    - grant	指定脚本运行所需权限，如果脚本拥有相应的权限，就可以调用油猴扩展提供的API与浏览器进行交互。如果设置为none的话，则不使用沙箱环境，脚本会直接运行在网页的环境中，这时候无法使用大部分油猴扩展的API。如果不指定的话，油猴会默认添加几个最常用的API
    - require	如果脚本依赖其他js库的话，可以使用require指令，在运行脚本之前先加载其他库，常见用法是加载jquery
    - connect	当用户使用GM_xmlhttpRequest请求远程数据的时候，需要使用connect指定允许访问的域名，支持域名、子域名、IP地址以及*通配符
    - updateURL	脚本更新网址，当油猴扩展检查更新的时候，会尝试从这个网址下载脚本，然后比对版本号确认是否更新

# 收集常用的js的hook脚本

## document下的createElement()方法的hook,查看创建了什么元素

```js
(function() {
    'use strict'
   var _createElement = document.createElement.bind(document);
   document.createElement = function(elm){
   // 这里做判断 是否创建了script这个元素    
   if(elm == 'body'){
        debugger;
   }
    return _createElement(elm);
}
})();
```

## **headers hook**  当header中包含Authorization时，则插入断点

```js
var code = function(){
var org = window.XMLHttpRequest.prototype.setRequestHeader;
window.XMLHttpRequest.prototype.setRequestHeader = function(key,value){
    if(key=='Authorization'){
        debugger;
    }
    return org.apply(this,arguments);
}
}
var script = document.createElement('script');
script.textContent = '(' + code + ')()';
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

```

## **请求hook**  当请求的url里包含MmEwMD时，则插入断点

```js
var code = function(){
var open = window.XMLHttpRequest.prototype.open;
window.XMLHttpRequest.prototype.open = function (method, url, async){
    if (url.indexOf("MmEwMD")>-1){
        debugger;
    }
    return open.apply(this, arguments);
};
}
var script = document.createElement('script');
script.textContent = '(' + code + ')()';
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);
```

## **docuemnt.getElementById 以及value属性的hook**

```js
// docuemnt.getElementById 以及value属性的hook,可以参考完成innerHTML的hook
document.getElementById = function(id) {
    var value = document.querySelector('#' + id).value;
    console.log('DOM操作 id: ', id)
    try {

        Object.defineProperty(document.querySelector('#'+ id), 'value', {
            get: function() {
                console.log('getting -', id, 'value -', value);
                return value;
            },
            set: function(val) {
                console.log('setting -', id, 'value -', val)
                value = val;
            }
        })
    } catch (e) {
        console.log('---------华丽的分割线--------')
    }
    return document.querySelector('#' + id);
}
```

## 检测函数是否被hook

```js
if (window.eval == 'native code'){
    console.log('发现eval函数被hook了');
}

function encry(){
    return "ox0oo"
    
}
native_code = encry.toString();
hook_encry = encry;
var hook_encry = function(){
    return "hook"
};

function detect(){
    // console.log(encry.toString());
    if (encry.toString() != native_code){
        console.log(22131);
        return "detect"
    }
}
if (detect() == "detect"){
    console.log(encry());
}else{
    // console.log(encry())
    console.log("11")
}

```

## 过debugger

```js
function Closure(injectFunction) {
            return function () {
                if (!arguments.length)
                    return injectFunction.apply(this, arguments)
                    arguments[arguments.length - 1] = arguments[arguments.length - 1].replace(/debugger/g, "");
                return injectFunction.apply(this, arguments)
            }
        }

        var oldFunctionConstructor = window.Function.prototype.constructor;
        window.Function.prototype.constructor = Closure(oldFunctionConstructor)
            //fix native function
            window.Function.prototype.constructor.toString = oldFunctionConstructor.toString.bind(oldFunctionConstructor);

        var oldFunction = Function;
        window.Function = Closure(oldFunction)
            //fix native function
            window.Function.toString = oldFunction.toString.bind(oldFunction);

        var oldEval = eval;
        window.eval = Closure(oldEval)
            //fix native function
            window.eval.toString = oldEval.toString.bind(oldEval);

        // hook GeneratorFunction
        var oldGeneratorFunctionConstructor = Object.getPrototypeOf(function  * () {}).constructor
            var newGeneratorFunctionConstructor = Closure(oldGeneratorFunctionConstructor)
            newGeneratorFunctionConstructor.toString = oldGeneratorFunctionConstructor.toString.bind(oldGeneratorFunctionConstructor);
        Object.defineProperty(oldGeneratorFunctionConstructor.prototype, "constructor", {
            value: newGeneratorFunctionConstructor,
            writable: false,
            configurable: true
        })

        // hook Async Function
        var oldAsyncFunctionConstructor = Object.getPrototypeOf(async function () {}).constructor
            var newAsyncFunctionConstructor = Closure(oldAsyncFunctionConstructor)
            newAsyncFunctionConstructor.toString = oldAsyncFunctionConstructor.toString.bind(oldAsyncFunctionConstructor);
        Object.defineProperty(oldAsyncFunctionConstructor.prototype, "constructor", {
            value: newAsyncFunctionConstructor,
            writable: false,
            configurable: true
        })

        // hook dom
        var oldSetAttribute = window.Element.prototype.setAttribute;
        window.Element.prototype.setAttribute = function (name, value) {
            if (typeof value == "string")
                value = value.replace(/debugger/g, "")
                    // 向上调用
                    oldSetAttribute.call(this, name, value)
        };
        var oldContentWindow = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "contentWindow").get
            Object.defineProperty(window.HTMLIFrameElement.prototype, "contentWindow", {
            get() {
                var newV = oldContentWindow.call(this)
                    if (!newV.inject) {
                        newV.inject = true;
                        core.call(newV, globalConfig, newV);
                    }
                    return newV
            }
        })
```

## **过debugger—1**   **constructor** 构造器构造出来的

```js
var _constructor = constructor;
Function.prototype.constructor = function(s) {
                if (s == "debugger"){
                    console.log(s);
                    return null;
                }
                return _constructor(s);
}
```

## 过debugger—2  eval

```js
(function() { 
    'use strict';
    var eval_ = window.eval;
    window.eval = function(x){
    	eval_(x.replace("debugger;","  ; "));
    };
    window.eval.toString = eval_.toString;
})();
```

## json hook

```js
var my_stringify = JSON.stringify;
JSON.stringify = function (params) {
    //这里可以添加其他逻辑比如 debugger
    console.log("json_stringify params:",params);
    return my_stringify(params);
};

var my_parse = JSON.parse;
JSON.parse = function (params) {
    //这里可以添加其他逻辑比如 debugger
    console.log("json_parse params:",params);
    return my_parse(params);
};
```

## 对象属性hook 属性自定义

```js
(function(){
    // 严格模式，检查所有错误
    'use strict'
    // document 为要hook的对象 ,属性是cookie
    Object.defineProperty(document,'cookie',{
        // hook set方法也就是赋值的方法，get就是获取的方法
        set: function(val){
            // 这样就可以快速给下面这个代码行下断点，从而快速定位设置cookie的代码
            debugger;  // 在此处自动断下
            console.log('Hook捕获到set-cookie ->',val);
            return val;
        }
    })
})();
```

## cookies hook（不是万能的 有些时候hook不到）

```js
var cookie_cache = document.cookie;

Object.defineProperty(document, 'cookie', {
    get: function() {
        console.log('Getting cookie');
        return cookie_cache;
    },
    set: function(val) {
        console.log("Seting cookie",val);
        var cookie = val.split(";")[0];
        var ncookie = cookie.split("=");
        var flag = false;
        var cache = cookie_cache.split("; ");
        cache = cache.map(function(a){
            if (a.split("=")[0] === ncookie[0]){
                flag = true;
                return cookie;
            }
            return a;
        })
    }
})
```

## cookie

```js
var code = function(){
    var org = document.cookie.__lookupSetter__('cookie');
    document.__defineSetter__("cookie",function(cookie){
        if(cookie.indexOf('TSdc75a61a')>-1){
            debugger;
        }
        org = cookie;
    });
    document.__defineGetter__("cookie",function(){return org;});
}
var script = document.createElement('script');
script.textContent = '(' + code + ')()';
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

// 当cookie中匹配到了 TSdc75a61a， 则插入断点。
```

## window attr

```js
// 定义hook属性
var window_flag_1 = "_t";
var window_flag_2 = "ccc";

var key_value_map = {};
var window_value = window[window_flag_1];

// hook
Object.defineProperty(window, window_flag_1, {
    get: function(){
        console.log("Getting",window,window_flag_1,"=",window_value);
        //debugger
        return window_value
    },
    set: function(val) {
        console.log("Setting",window, window_flag_1, "=",val);
        //debugger
        window_value = val;
        key_value_map[window[window_flag_1]] = window_flag_1;
        set_obj_attr(window[window_flag_1],window_flag_2);
    },

});

function set_obj_attr(obj,attr){
    var obj_attr_value = obj[attr];
    Object.defineProperty(obj,attr, {
        get: function() {
            console.log("Getting", key_value_map[obj],attr, "=", obj_attr_value);
            //debugger
            return obj_attr_value;
        },
        set: function(val){
            console.log("Setting", key_value_map[obj], attr, "=", val);
            //debugger
            obj_attr_value = val;
        },
    });
}
```

## eval/Function

```js
window.__cr_eval = window.eval;
var myeval = function(src) {
    console.log(src);
    console.log("========= eval end ===========");
    return window.__cr_eval;
}

var _myeval = myeval.bind(null);
_myeval.toString = window.__cr_eval.toString;
Object.defineProperty(window, 'eval',{value: _myeval});

window._cr_fun = window.Function
var myfun = function(){
    var args = Array.prototype.slice.call(arguments, 0, -1).join(","), src = arguments[arguments.lenght -1];
    console.log(src);
    console.log("======== Function end =============");
    return window._cr_fun.apply(this, arguments)
}

myfun.toString = function() {return window._cr_fun + ""} //小花招，这里防止代码里检测原生函数
Object.defineProperty(window, "Function",{value: myfun})
```

## websocket hook

```js
 // 1、webcoket 一般都是json数据格式传输，那么发生之前需要JSON.stringify  
var my_stringify = JSON.stringify;
JSON.stringify = function (params) {
    //这里可以添加其他逻辑比如 debugger
    console.log("json_stringify params:",params);
    return my_stringify(params);
};

var my_parse = JSON.parse;
JSON.parse = function (params) {
    //这里可以添加其他逻辑比如 debugger
    console.log("json_parse params:",params);
    return my_parse(params);
};

// 2  webScoket 绑定在windows对象，上，根据浏览器的不同，websokcet名字可能不一样 
//chrome window.WebSocket  firfox window.MozWebSocket;
window._WebSocket = window.WebSocket;

// hook send
window._WebSocket.prototype.send = function (data) {
    console.info("Hook WebSocket", data);
    return this.send(data)
}

Object.defineProperty(window, "WebSocket",{value: WebSocket})
```

## hook 正则 —— 1

```js
(function () {
    var _RegExp = RegExp;
    RegExp = function (pattern, modifiers) {
        console.log("Some codes are setting regexp");
        debugger;
        if (modifiers) {
            return _RegExp(pattern, modifiers);
        } else {
            return _RegExp(pattern);
        }
    };
    RegExp.toString = function () {
        return "function setInterval() { [native code] }"
    };
})();
```

## hook 正则 2 加在sojson头部过字符串格式化检测 

```js
(function () {
            var _RegExp = RegExp;
            RegExp = function (pattern, modifiers) {
                if (pattern == decodeURIComponent("%5Cw%2B%20*%5C(%5C)%20*%7B%5Cw%2B%20*%5B'%7C%22%5D.%2B%5B'%7C%22%5D%3B%3F%20*%7D") || pattern == decodeURIComponent("function%20*%5C(%20*%5C)")
                     || pattern == decodeURIComponent("%5C%2B%5C%2B%20*(%3F%3A_0x(%3F%3A%5Ba-f0-9%5D)%7B4%2C6%7D%7C(%3F%3A%5Cb%7C%5Cd)%5Ba-z0-9%5D%7B1%2C4%7D(%3F%3A%5Cb%7C%5Cd))") || pattern == decodeURIComponent("(%5C%5C%5Bx%7Cu%5D(%5Cw)%7B2%2C4%7D)%2B")) {
                    pattern = '.*?';
                    console.log("发现sojson检测特征，已帮您处理。")
                }
                if (modifiers) {
                    console.log("疑似最后一个检测...已帮您处理。")
                    console.log("已通过全部检测，请手动处理debugger后尽情调试吧！")
                    return _RegExp(pattern, modifiers);
                } else {
                    return _RegExp(pattern);
                }
            };
            RegExp.toString = function () {
                return _RegExp.toString();
            };
        })();
```

## hook canvas (定位图片生成的地方)

```js
(function() {
    'use strict';
    let create_element = document.createElement.bind(doument);

    document.createElement = function (_element) {
        console.log("create_element:",_element);
        if (_element === "canvas") {
            debugger;
        }
        return create_element(_element);
    }
})();
```

## setInterval 定时器 

```js
(function () {
            setInterval_ = setInterval;
            console.log("原函数已被重命名为setInterval_")
            setInterval = function () {};
            setInterval.toString = function () {
                console.log("有函数正在检测setInterval是否被hook");
                return setInterval_.toString();
            };
        })();
```

## console.log 检测 （不让你输出调试）

```js
var oldConsole = ["debug", "error", "info", "log", "warn", "dir", "dirxml", "table", "trace", "group", "groupCollapsed", "groupEnd", "clear", "count", "countReset", "assert", "profile", "profileEnd", "time", "timeLog", "timeEnd", "timeStamp", "context", "memory"].map(key => {
            var old = console[key];
            console[key] = function () {};
            console[key].toString = old.toString.bind(old)
                return old;
        })
```

