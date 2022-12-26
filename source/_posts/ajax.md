---
title: ajax
abbrlink: c5a6a264
date: 2022-12-16 20:20:53
categories: 前端
---
## 请求数据

如果要在网页中请求服务器上的数据资源，则需要用到 XMLHttpRequest 对象。
XMLHttpRequest（简称 xhr）是浏览器提供的 js 成员，通过它，可以请求服务器上的数据资源。
最简单的用法 var xhrObj = new XMLHttpRequest()

XMLHttpRequest（简称 xhr）是浏览器提供的 Javascript 对象，通过它，可以请求服务器上的数据资源。jQuery中的Ajax函数，就是基于xhr对象封装出来的。

### 使用xhr发起GET请求

1. 创建 xhr 对象
2. 调用 xhr.open() 函数
3. 调用 xhr.send() 函数
4. 监听 xhr.onreadystatechange 事件

```js
// 1. 创建 XHR 对象
var xhr = new XMLHttpRequest()
// 2. 调用 open 函数，指定 请求方式 与 URL地址
xhr.open('GET', 'http://www.liulongbin.top:3006/api/getbooks')
// 3. 调用 send 函数，发起 Ajax 请求
xhr.send()
// 4. 监听 onreadystatechange 事件
xhr.onreadystatechange = function() {
    // 4监听 xhr 对象的请求状态 readyState ；与服务器响应的状态 status
    // XMLHttpRequest 对象的 readyState 属性，用来表示当前 Ajax 请求所处的状态，4表示请求完成，还有0，1，2，3
    if (xhr.readyState === 4 && xhr.status === 200) {
        // 打印服务器响应回来的数据
        console.log(xhr.responseText)
    }
}
$.get('url', {name: 'zs', age: 20}, function() {})
// 等价于
$.get('url?name=zs&age=20', function() {})

$.ajax({ method: 'GET', url: 'url', data: {name: 'zs', age: 20}, success: function() {} })
// 等价于
$.ajax({ method: 'GET', url: 'url?name=zs&age=20', success: function() {} })

```

### 使用xhr发起POST请求

1. 创建 xhr 对象
2. 调用 xhr.open() 函数
3. 设置 Content-Type 属性（固定写法）
4. 调用 xhr.send() 函数，同时指定要发送的数据
5. 监听 xhr.onreadystatechange 事件

```js
// 1. 创建 xhr 对象
var xhr = new XMLHttpRequest()
// 2. 调用 open()
xhr.open('POST', 'http://www.liulongbin.top:3006/api/addbook')
// 3. 设置 Content-Type 属性（固定写法）
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
// 4. 调用 send()，同时将数据以查询字符串的形式，提交给服务器
xhr.send('bookname=水浒传&author=施耐庵&publisher=天津图书出版社')
// 5. 监听 onreadystatechange 事件
xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(xhr.responseText)
    }
}
```

XML 和 HTML 虽然都是标记语言，但是，它们两者之间没有任何的关系。
HTML 被设计用来描述网页上的内容，是网页内容的载体
XML 被设计用来传输和存储数据，是数据的载体
JSON 的英文全称是 JavaScript Object Notation，即“JavaScript 对象表示法”。简单来讲，JSON 就是 Javascript 对象和数组的字符串表示法，它使用文本表示一个 JS 对象或数组的信息，因此，JSON 的本质是字符串。
作用：JSON 是一种轻量级的文本数据交换格式，在作用上类似于 XML，专门用于存储和传输数据，但是 JSON 比 XML 更小、更快、更易解析。

**JSON和JS对象的关系**

```js
//这是一个对象
var obj = {a: 'Hello', b: 'World'}

//这是一个 JSON 字符串，本质是一个字符串
var json = '{"a": "Hello", "b": "World"}' 
```

把数据对象转换为字符串的过程，叫做序列化，例如：调用 JSON.stringify() 函数的操作，叫做 JSON 序列化。
把字符串转换为数据对象的过程，叫做反序列化，例如：调用 JSON.parse() 函数的操作，叫做 JSON 反序列化

## XMLHttpRequest Level2的新特性

1.1. 旧版XMLHttpRequest的缺点
① 只支持文本数据的传输，无法用来读取和上传文件
② 传送和接收数据时，没有进度信息，只能提示有没有完成
1.2. XMLHttpRequest Level2的新功能
① 可以设置 HTTP 请求的时限
② 可以使用 FormData 对象管理表单数据
③ 可以上传文件
④ 可以获得数据传输的进度信息

## 什么是Ajax

Ajax 的全称是 Asynchronous Javascript And XML（异步 JavaScript 和 XML）。
通俗的理解：在网页中利用 XMLHttpRequest 对象和服务器进行数据交互的方式，就是Ajax。

## Jquery中的Ajax

浏览器中提供的 XMLHttpRequest 用法比较复杂，所以 jQuery 对 XMLHttpRequest 进行了封装，提供了一系列 Ajax 相关的函数，极大地降低了 Ajax 的使用难度。
jQuery 中发起 Ajax 请求最常用的三个方法如下：

- $.get()
  - $.get(url, [data], [callback]) data：请求的参数，callback: 请求成功时回调的函数
- $.post()
  - $.post(url, [data], [callback])
- $.ajax()

```js
$.ajax({
   type: '', // 请求的方式，例如 GET 或 POST
   url: '',  // 请求的 URL 地址
   data: { },// 这次请求要携带的数据
   success: function(res) { } // 请求成功之后的回调函数
})
$.ajax({
   type: 'GET', // 请求的方式
   url: 'http://www.liulongbin.top:3006/api/getbooks',  // 请求的 URL 地址
   data: { id: 1 },// 这次请求要携带的数据
   success: function(res) { // 请求成功之后的回调函数
       console.log(res)
   }
})

```

```js
$.get('http://www.liulongbin.top:3006/api/getbooks', function(res) {
    console.log(res) // 这里的 res 是服务器返回的数据
})

$.post(
   'http://www.liulongbin.top:3006/api/addbook', // 请求的URL地址
   { bookname: '水浒传', author: '施耐庵', publisher: '上海图书出版社' }, // 提交的数据
   function(res) { // 回调函数
      console.log(res)
   }
)

```

## 配合表单form使用

## art-template模板引擎

http://aui.github.io/art-template/zh-cn/index.html

## axios

### axios发起GET请求

axios.get('url', { params: { /*参数*/ } }).then(callback)

```js
// 请求的 URL 地址
 var url = 'http://www.liulongbin.top:3006/api/get'
 // 请求的参数对象
 var paramsObj = { name: 'zs', age: 20 }
 // 调用 axios.get() 发起 GET 请求
 axios.get(url, { params: paramsObj }).then(function(res) {
     // res.data 是服务器返回的数据
     var result = res.data
     console.log(res)
 })
```

### POST

axios.post('url', { /*参数*/ }).then(callback)

```js
// 请求的 URL 地址
 var url = 'http://www.liulongbin.top:3006/api/post'
 // 要提交到服务器的数据
 var dataObj = { location: '北京', address: '顺义' }
 // 调用 axios.post() 发起 POST 请求
 axios.post(url, dataObj).then(function(res) {
     // res.data 是服务器返回的数据
     var result = res.data
     console.log(result)
 })
```

### 直接写

```js
axios({
     method: '请求类型',
     url: '请求的URL地址',
     data: { /* POST数据 */ },
     params: { /* GET参数 */ }
 }) .then(callback)

 axios({
     method: 'GET',
     url: 'http://www.liulongbin.top:3006/api/get',
     params: { // GET 参数要通过 params 属性提供
         name: 'zs',
         age: 20
     }
 }).then(function(res) {
     console.log(res.data)
 })

  axios({
     method: 'POST',
     url: 'http://www.liulongbin.top:3006/api/post',
     data: { // POST 数据要通过 data 属性提供
         bookname: '程序员的自我修养',
         price: 666
     }
 }).then(function(res) {
     console.log(res.data)
 })

```

## 同源策略和跨域
### 什么是同源

如果两个页面的协议，域名和端口都相同，则两个页面具有相同的源。

### 什么是同源策略

同源策略（英文全称 Same origin policy）是浏览器提供的一个安全功能。
MDN 官方给定的概念：同源策略限制了从同一个源加载的文档或脚本如何与来自另一个源的资源进行交互。这是一个用于隔离潜在恶意文件的重要安全机制。
通俗的理解：浏览器规定，A 网站的 JavaScript，不允许和非同源的网站 C 之间，进行资源的交互，例如：
无法读取非同源网页的 Cookie、LocalStorage 和 IndexedDB
无法接触非同源网页的 DOM
无法向非同源地址发送 Ajax 请求

### 什么是跨域

同源指的是两个 URL 的协议、域名、端口一致，反之，则是跨域。
出现跨域的根本原因：浏览器的同源策略不允许非同源的 URL 之间进行资源的交互。

https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS
简单的总结：
一个请求分为简单的请求和复杂的请求
1. 简单的请求不会触发CORS预检请求(https://developer.mozilla.org/zh-CN/docs/Glossary/Preflight_request)
2. 复杂的请求会触发CORS预检请求，需预检的请求要求必须首先使用OPTIONS方法发起一个预检请求到服务器，以获知服务器是否允许该实际请求。预检请求的使用，可以避免跨域请求对服务器的用户数据产生未预期的影响。预检请求完成之后，发送实际请求。
```bash
# http OPTIONS http://example.org
HTTP/1.1 200 OK
Allow: OPTIONS, GET, HEAD, POST
Cache-Control: max-age=604800
Connection: keep-alive
Content-Length: 0
Content-Type: text/html; charset=UTF-8
Date: Wed, 21 Dec 2022 08:14:10 GMT
Expires: Wed, 28 Dec 2022 08:14:10 GMT
Keep-Alive: timeout=4
Proxy-Connection: keep-alive
Server: EOS (vny/0452)
```
### 后端处理跨域
几个重要的头部信息：
1. Access-Control-Request-Method(出现于 preflight request（预检请求）请求头，告知服务器，实际请求将使用xx方法)
2. Access-Control-Allow-Origin(响应标头,指定了该响应的资源是否被允许与给定的来源（origin）共享。)
3. Access-Control-Allow-Headers(响应首部,用于 preflight request（预检请求）中，列出了将会在正式请求的 Access-Control-Request-Headers 字段中出现的首部信息。)
4. Access-Control-Allow-Methods(响应首部字段，指定了访问资源时允许使用的请求方法，用于预检请求的响应。其指明了实际请求所允许使用的 HTTP 方法)
5. Access-Control-Allow-Credentials(响应头，用于在请求要求包含 credentials（Request.credentials 的值为 include）时，告知浏览器是否可以将对请求的响应暴露给前端 JavaScript 代码。)
6. Access-Control-Expose-Headers(响应首部,列出了哪些首部可以作为响应的一部分暴露给外部。)

注意：
一般来说，登录成功后，server会通过set-cookie，将cookie设置到浏览器中，这样，下次访问同源下的api时，cookie就会被带上。但是**浏览器发起跨域请求的时候，是不会主动带上cookie**，因为这个https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Set-Cookie/SameSite，SameSite是为了防止csrf攻击(详细查看：https://juejin.cn/post/7116055668485783589)而产生的属性，`Set-Cookie: flavor=choco; SameSite=None; Secure`（https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Set-Cookie）

### 前端如何实现跨域数据请求

现如今，实现跨域数据请求，最主要的两种解决方案，分别是 JSONP 和 CORS。
JSONP：出现的早，兼容性好（兼容低版本IE）。是前端程序员为了解决跨域问题，被迫想出来的一种临时解决方案。缺点是只支持 GET 请求，不支持 POST 请求。
CORS：出现的较晚，它是 W3C 标准，属于跨域 Ajax 请求的根本解决方案。支持 GET 和 POST 请求。缺点是不兼容某些低版本的浏览器。

#### JSONP

由于浏览器同源策略的限制，网页中无法通过 Ajax 请求非同源的接口数据。但是 `<script>` 标签不受浏览器同源策略的影响，可以通过 src 属性，请求非同源的 js 脚本。
因此，JSONP 的实现原理，就是通过 `<script>` 标签的src属性，请求跨域的数据接口，并通过函数调用的形式，接收跨域接口响应回来的数据。

缺点：
由于 JSONP 是通过`<script>`标签的src属性，来实现跨域数据获取的，所以，JSONP只支持GET数据请求，不支持POST请求。

注意：JSONP 和 Ajax 之间没有任何关系，不能把 JSONP 请求数据的方式叫做 Ajax，因为 JSONP 没有用到 XMLHttpRequest 这个对象。

#### jQuery中的JSONP

```js
 $.ajax({
    url: 'http://ajax.frontend.itheima.net:3006/api/jsonp?name=zs&age=20',
    // 如果要使用 $.ajax() 发起 JSONP 请求，必须指定 datatype 为 jsonp
    dataType: 'jsonp',
    success: function(res) {
       console.log(res)
    }
 })
 // 默认情况下，使用 jQuery 发起 JSONP 请求，会自动携带一个 callback=jQueryxxx 的参数，jQueryxxx 是随机生成的一个回调函数名称。
$.ajax({
    url: 'http://ajax.frontend.itheima.net:3006/api/jsonp?name=zs&age=20',
    dataType: 'jsonp',
    // 发送到服务端的参数名称，默认值为 callback
    jsonp: 'callback',
    // 自定义的回调函数名称，默认值为 jQueryxxx 格式
    jsonpCallback: 'abc',
    success: function(res) {
       console.log(res)
    }
 })
```

jQuery 中的 JSONP，也是通过 <script> 标签的 src 属性实现跨域数据访问的，只不过，jQuery 采用的是动态创建和移除 <script> 标签的方式，来发起 JSONP 数据请求。

- 在发起 JSONP 请求的时候，动态向 <header> 中 append 一个 <script> 标签；
- 在 JSONP 请求成功以后，动态从 <header> 中移除刚才 append 进去的 <script> 标签；