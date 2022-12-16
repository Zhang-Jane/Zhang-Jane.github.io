---
title: chrome-console调试
abbrlink: 9fa69692
date: 2022-12-16 19:56:40
tags: chrome
---

## console

- console.log()打印内容的通用方法console.error()打印一条错误信息console.warn()打印一个警告信息 - console.info()打印资讯类说明信息console.time()启动一个以入参作为特定名称的计时器长

- console.timeEnd()结束特定的 计时器 并以豪秒打印其从开始到结束所用的时间

- 复制

  - 先在代码里console.log

    然后在控制台上右键点击输出的对象 选择 store as global variable

    控制台会输出temp1 或者temp2 temp3

    然后在控制台输入copy(temp1) 或者copy(temp2) 回车 会输出undefined 这时已经被复制到粘贴板上了,直接去别的地方粘贴就好了

### 选择器

- `$` -简单理解就是 document.querySelector 而已
- `$$` 简单理解就是 document.querySelectorAll 而已。
  - `$$('span')[1].getAttribute('name')`
  - `$$('span')[1].setAttribute('oncontextmenu', "return true")`
- `keys` 取对象的键名, 返回键名组成的数组
- `values` 去对象的值, 返回值组成的数组

### 监听事件

- getEventListeners(document)
- getEventListeners(document).contextmenu
- element.removeEventListener('click', handleClick);
- monitorEvents(object [, events])
  - monitorEvents(document.body, 'mouse')
  - monitorEvents(document, 'contextmenu')
- document.removeEventListener("contextmenu",getEventListeners(document).contextmenu[0].listener)
- (function () {
    var createElement = document.createElement;
    document.createElement = function (tag) {
        switch (tag) {
            case 'script':
                console.log('禁用动态添加脚本，防止广告加载');
                break;
            default:
                return createElement.apply(this, arguments);
        }
    }
    })();

这里我们可以查询MDN文档https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
发现addEventListener来自eventtarget这个对象下的原型中，通常来说我们的dom元素等也都是继承自这个对象的原型链
关于这点我们可以测试一下
EventTarget.prototype.addEventListener=function (){console.log('我被劫持了')}
document.querySelector('body').addEventListener('123')
目前很多网页以及组件都会使用addEventListener

其原因在于onxxxx系列的函数相对性能较差，并且addEventListener支持添加多个函数

这时候我们就可以构造一个简单的劫持函数做一个小过滤，来完成addeventlistener的hook操作

```js
let oldadd=EventTarget.prototype.addEventListener
EventTarget.prototype.addEventListener=function (...args){
    console.log('addEventListener',...args)
    oldadd.call(this,...args)
    //不传this相当于window.addeventlistener,window也是个EventTarget
}
```

addEventListener有四个参数，分别为type，listener，options，useCapture

options以及useCapture为可选选项

type为事件监听类型

关于事件我们可以在https://www.runoob.com/jsref/dom-obj-event.html查询到

注意是不带on的

listener是触发函数，当我们传入的事件监听类型被捕获到，我们就会调用这个函数

options以及useCapture为一些选项的参数

options和useCapture都是第三个参数

useCapture为真是捕捉监听器

## Sources

Sources面板几乎是Chrome最重要的功能面板之一，debugger断点调试是解决问题的最佳法宝。
首先在代码中加入debugger，打开F12开发工具切换到Sources面板中点击button按钮如图所示:

```js
let btn = document.getElementById("btn");
btn.onclick = function () {
  debugger
  alert('button被点击了')
}
```

## Application

记录网站加载的所有资源信息，包括存储数据（Local Storage、Session Storage、IndexedDB、Web SQL、Cookies）、缓存数据、字体、图片、脚本、样式表等。

### Local Storage

只读的 localStorage 属性允许你访问一个 Document 源（origin）的对象 Storage；存储的数据将保存在浏览器会话中。 localStorage 类似 sessionStorage ，但其区别在于：存储在 localStorage 的数据可以长期保留；而当页面会话结束——也就是说，当页面被关闭时，存储在 sessionStorage 的数据会被清除 。
新增
localStorage.setItem('id', '999');
复制代码
读取
let id = localStorage.getItem('id');
console.log(id);// 999
复制代码
移除
// 移除指定项
localStorage.removeItem('id');
// 移除所有
localStorage.clear();

https://juejin.cn/post/7063020485071601672#heading-18