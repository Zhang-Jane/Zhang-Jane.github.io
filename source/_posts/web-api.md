---
title: web-api
tags: JavaScript
categories: JavaScript
abbrlink: f74fde1
date: 2022-12-16 19:58:39
---
# 什么是Web Api

API（Application Programming Interface，应用程序编程接口）是一些预先定义的函数，目的是提供应用程序与开发人员基于某软件或硬件得以访问一组例程的能力，而又无需访问源码，无需理解其内部工作机制细节，只需直接调用使用即可。
**Web API 是浏览器提供的一套操作浏览器功能和页面元素的 API ( BOM 和 DOM )。**
参考：https://developer.mozilla.org/zh-CN/docs/Web/API

# DOM

文档对象模型（Document Object Model，简称DOM）
DOM树 又称为文档树模型，把文档映射成树形结构，通过节点对象对其处理，处理的结果可以加入到当前的页面。
DOM把文档当作对象，它的顶级对象是document

- 文档：一个页面就是一个文档，DOM中使用document表示
- 节点：网页中的所有内容，在文档树中都是节点（标签、属性、文本、注释等），使用node表示
- 标签节点：网页中的所有标签，通常称为元素节点，又简称为“元素”，使用element表示

## 节点操作

- 创建
  - document.createElement('要创建的标签名')
  - document.createTextNode('文本内容');
- 添加
  - 父元素.appendChild(要追加的元素)
  - 父元素.insertBefore(要追加的元素,已经存在的子元素)
- 删除
  - 元素.remove()
  - 元素.removeChild(要删除的子元素)
- 替换
  - 元素.removeChild(要删除的子元素)
- 复制
  - 元素.cloneNode(true/false);
    - 传入true:表示将元素内容都克隆下来
    - 传入false或不传:表示克隆该元素，不克隆内容

## 获取元素

- document.getElementById（根据ID获取元素对象）
- document.getElementsByTagName('标签名') 或者 element.getElementsByTagName('标签名') 
- document.getElementsByClassName('类名')
- document.querySelector('选择器')
- document.querySelectorAll('选择器')
- document.body(返回body)
- document.documentElement(返回html元素)

## 事件

- 事件源（谁）：触发事件的元素
- 事件类型（什么事件）： 例如 click 点击事件
- 事件处理程序（做啥）：事件触发后要执行的代码(函数形式)，事件处理函数

```js
<body>
    <div>123</div>
    <script>
        // 执行事件步骤
        // 点击div 控制台输出 我被选中了
        // 1. 获取事件源
        var div = document.querySelector('div');
        // 2.绑定事件 注册事件
        // div.onclick 
        // 3.添加事件处理程序 
        div.onclick = function() {
            console.log('我被选中了');
        }
    </script>
</body>
```

### 注册事件

1. 给元素添加事件，称为绑定事件
2. 监听注册时间

**addEventListener()事件监听**
eventTarget.addEventListener()方法将指定的监听器注册到 eventTarget（目标对象）上，当该对象触发指定的事件时，就会执行事件处理函数。

- type(事件的类似，click，mouseover，这里没有on)
- listener(事件处理函数，事件发生时，或调用该监听函数)
- useCapture(传入布尔值，默认时false，如果时true表示在事件捕获阶段调用事件处理程序，false就是冒泡阶段调用)

**DOM的事件流**
DOM 事件流会经历3个阶段： 

1. 捕获阶段(从上到下)
2. 当前目标阶段
3. 冒泡阶段(从下到上)

**attacheEvent()**
eventTarget.attachEvent()方法将指定的监听器注册到 eventTarget（目标对象） 上，当该对象触发指定的事件时，指定的回调函数就会被执行。

- evenNameWithOn(事件类型字符串，onclick，onmouseover，这里要带on)
- callback(事件处理函数，当目标触发事件时回调函数被调用)

```js
<button>传统注册事件</button>
<button>方法监听注册事件</button>
<button>ie9 attachEvent</button>
<script>
    var btns = document.querySelectorAll('button');
    // 1. 传统方式注册事件
    btns[0].onclick = function() {
        alert('hi');
    }
    btns[0].onclick = function() {
            alert('hao a u');
        }
   // 2. 事件侦听注册事件 addEventListener 
   // (1) 里面的事件类型是字符串 必定加引号 而且不带on
   // (2) 同一个元素 同一个事件可以添加多个侦听器（事件处理程序）
    btns[1].addEventListener('click', function() {
        alert(22);
    })
    btns[1].addEventListener('click', function() {
            alert(33);
    })
    // 3. attachEvent ie9以前的版本支持
    btns[2].attachEvent('onclick', function() {
        alert(11);
    })
</script>
```

**removeEventListener(移除事件)**
element.removeEventListener(event, function, useCapture)

### 事件对象

**什么是事件对象**

事件发生后，跟事件相关的一系列信息数据的集合都放到这个对象里面，这个对象就是事件对象。

比如：  

1. 谁绑定了这个事件。
2. 鼠标触发事件的话，会得到鼠标的相关信息，如鼠标位置。
3. 键盘触发事件的话，会得到键盘的相关信息，如按了哪个键。

**事件对象的属性和方法**

- e.targe
- e.type
- e.preventDefault() 阻止默认事件标准，比如不让链接跳转
- e.stopPropagation() 阻止事件冒泡

**e.target 和 this 的区别**

- this 是事件绑定的元素（绑定这个事件处理函数的元素） 。
- e.target 是事件触发的元素。
  常情况下terget 和 this是一致的，
  但有一种情况不同，那就是在事件冒泡时（父子元素有相同事件，单击子元素，父元素的事件处理函数也会被触发执行），
  这时候this指向的是父元素，因为它是绑定事件的元素对象，
  而target指向的是子元素，因为他是触发事件的那个具体元素对象。

### 事件委托

把事情委托给别人，代为处理。说白了就是，不给子元素注册事件，给父元素注册事件，把处理代码在父元素的事件中执行。

> 给父元素注册事件，利用事件冒泡，当子元素的事件触发，会冒泡到父元素，然后去控制相应的子元素。

## 操作元素的内容

- 改变元素内容（获取或设置）

  - element.innerText
  - element.innerHTML
    **innerText和innerHTML的区别**

- 获取内容时的区别：

  innerText会去除空格和换行，而innerHTML会保留空格和换行	

- 设置内容时的区别：

  innerText不会识别html，而innerHTML会识别

```js
<body>
    <div></div>
    <p>
        我是文字
        <span>123</span>
    </p>
    <script>
        // innerText 和 innerHTML的区别 
        // 1. innerText 不识别html标签 非标准  去除空格和换行
        var div = document.querySelector('div');
        // div.innerText = '<strong>今天是：</strong> 2019';
        // 2. innerHTML 识别html标签 W3C标准 保留空格和换行的
        div.innerHTML = '<strong>今天是：</strong> 2019';
        // 这两个属性是可读写的  可以获取元素里面的内容
        var p = document.querySelector('p');
        console.log(p.innerText);
        console.log(p.innerHTML);
    </script>
</body>
```

**innerHTML字符串拼接方式（效率低）**

```js
<script>
    function fn() {
        var d1 = +new Date();
        var str = '';
        for (var i = 0; i < 1000; i++) {
            document.body.innerHTML += '<div style="width:100px; height:2px; border:1px solid blue;"></div>';
        }
        var d2 = +new Date();
        console.log(d2 - d1);
    }
    fn();
</script>
```

**createElement方式（效率一般）**

```js
<script>
    function fn() {
        var d1 = +new Date();

        for (var i = 0; i < 1000; i++) {
            var div = document.createElement('div');
            div.style.width = '100px';
            div.style.height = '2px';
            div.style.border = '1px solid red';
            document.body.appendChild(div);
        }
        var d2 = +new Date();
        console.log(d2 - d1);
    }
    fn();
</script>
```

**innerHTML数组方式（效率高）**

```js
<script>
    function fn() {
        var d1 = +new Date();
        var array = [];
        for (var i = 0; i < 1000; i++) {
            array.push('<div style="width:100px; height:2px; border:1px solid blue;"></div>');
        }
        document.body.innerHTML = array.join('');
        var d2 = +new Date();
        console.log(d2 - d1);
    }
    fn();
</script>
```

## 元素的属性操作

**获取属性的值**

- 元素对象.属性名(获取内置的属性值，就是元素本身自带的属性)
- element.getAttribute('属性'),(主要获得自定义的属性 )

**设置属性的值**

- 元素对象.属性名 = 值(获取内置的属性值)
- element.setAttribute('属性','值')(自定义)

**移除属性**

- element.removeAttribute('index')

比如修改：

- img.src,img.title
- a.href
- input标签中的type,value,checked,selected,disable 
- element.style 行内样式操作（权重比较高，参考css的优先级；比如：div.style里面的属性采取驼峰命名法）
- element.className 类名样式操作

## 节点概述

​网页中的所有内容都是节点（标签、属性、文本、注释等），在DOM 中，节点使用 node 来表示。

​HTML DOM 树中的所有节点均可通过 JavaScript 进行访问，所有 HTML 元素（节点）均可被修改，也可以创建或删除。

# BOM

BOM（Browser Object Model）即浏览器对象模型，它提供了独立于内容而与浏览器窗口进行交互的对象，其核心对象是 window。
BOM比DOM更大，它包含DOM。它的顶级对象是window。BOM是浏览器厂商在各种浏览器上定义的，兼容性差。
**window对象双重角色：**

1. 它是js访问浏览器窗口的一个接口
2. 它是一个全局对象，定义在全局作用域中的变量、函数都会变成window对象的属性和方法，在调用的时候可以省略，比如alert，prompt。

**属性：**

- window.onload 是窗口 (页面）加载事件，**当文档内容完全加载完成**会触发该事件(包括图像、脚本文件、CSS 文件等), 就调用的处理函数。
  - 如果页面的图片很多的话, 从用户访问到onload触发可能需要较长的时间, 交互效果就不能实现，必然影响用户的体验，此时用 DOMContentLoaded 事件比较合适。参考：https://blog.csdn.net/qq_32682137/article/details/86649209
  - ![比较](https://img-blog.csdnimg.cn/20190128102028682.gif)
- window.onresize 是调整窗口大小加载事件,  当触发时就调用的处理函数。
  - window.innerWidth 当前屏幕的宽度
- window 对象给我们提供了 2 个非常好用的方法-定时器。
  - setTimeout(调用函数, [延迟的毫秒数, 默认是0]) 
    - 简单理解： 回调，就是回头调用的意思。上一件事干完，再回头再调用这个函数。 
    - clearTimeout(timeoutId)取消定时器
  - setInterval(调用函数, [间隔的毫秒数, 默认是0]) 
    - clearInterval 
- location对象，获取或者设置URL
  - location.assign() 重定向页面
  - location.replace() 替换当前页面，不记录历史
  - location.reload() 重新加载页面，相当于刷新
- navigator对象，navigator 对象包含有关浏览器的信息，它有很多属性，我们最常用的是 userAgent，该属性可以返回由客户机发送服务器的user-agent头部的值。
- history对象，window对象给我们提供了一个 history对象，与浏览器历史记录进行交互。该对象包含用户（在浏览器窗口中）访问过的URL。

## 元素偏移量

### offset 概述

offset 翻译过来就是偏移量， 我们使用 offset系列相关属性可以动态的得到该元素的位置（偏移）、大小等。

1. 获得元素距离带有定位父元素的位置
2. 获得元素自身的大小（宽度高度）
3. 注意：返回的数值都不带单位

### offset 与 style 区别

#### offset

- offset 可以得到任意样式表中的样式值

- offset 系列获得的数值是没有单位的

- offsetWidth 包含padding+border+width

- offsetWidth 等属性是只读属性，只能获取不能赋值

- > 所以，我们想要获取元素大小位置，用offset更合适

#### style

- style 只能得到行内样式表中的样式值

- style.width 获得的是带有单位的字符串

- style.width 获得不包含padding和border 的值

- style.width 是可读写属性，可以获取也可以赋值

- > 所以，我们想要给元素更改值，则需要用style改变

> **因为平时我们都是给元素注册触摸事件，所以重点记住 targetTocuhes**

## client概述

client 翻译过来就是客户端，我们使用 client 系列的相关属性来获取元素可视区的相关信息。通过 client
系列的相关属性可以动态的得到该元素的边框大小、元素大小等。
比如：

- clientTop
- clientLeft
- ...

## scroll 概述

scroll 翻译过来就是滚动的，我们使用 scroll 系列的相关属性可以动态的得到该元素的大小、滚动距离等。

- scrollTop
- scrollLeft
- ...

## offset,client,scroll

1.offset系列 经常用于获得元素位置    offsetLeft  offsetTop

2.client经常用于获取元素大小  clientWidth clientHeight

3.scroll 经常用于获取滚动距离 scrollTop  scrollLeft  

4.注意页面滚动的距离通过 window.pageXOffset  获得

## mouseenter 和mouseover的区别

- 当鼠标移动到元素上时就会触发mouseenter 事件
- 类似 mouseover，它们两者之间的差别是
- mouseover 鼠标经过自身盒子会触发，经过子盒子还会触发。mouseenter  只会经过自身盒子触发
- 之所以这样，就是因为**mouseenter不会冒泡**
- 跟mouseenter搭配鼠标离开 mouseleave  同样不会冒泡

## 本地存储

随着互联网的快速发展，基于网页的应用越来越普遍，同时也变的越来越复杂，为了满足各种各样的需求，会经常性在本地存储大量的数据，HTML5规范提出了相关解决方案。

### 本地存储特性

1、数据存储在用户浏览器中

2、设置、读取方便、甚至页面刷新不丢失数据

3、容量较大，sessionStorage约5M、localStorage约20M

4、只能存储字符串，可以将对象JSON.stringify() 编码后存储

### window.sessionStorage

1、生命周期为关闭浏览器窗口

2、在同一个窗口(页面)下数据可以共享

3、以键值对的形式存储使用
存储数据：

```javascript
sessionStorage.setItem(key, value)
```

获取数据：

```javascript
sessionStorage.getItem(key)
```

删除数据：

```javascript
sessionStorage.removeItem(key)
```

清空数据：(所有都清除掉)

```javascript
sessionStorage.clear()
```

### window.localStorage

1. 声明周期永久生效，除非手动删除 否则关闭页面也会存在
2. 可以多窗口（页面）共享（同一浏览器可以共享）
3. 以键值对的形式存储使用

存储数据：

```javascript
localStorage.setItem(key, value)
```

获取数据：

```javascript
localStorage.getItem(key)
```

删除数据：

```javascript
localStorage.removeItem(key)
```

清空数据：(所有都清除掉)

```javascript
localStorage.clear()
```