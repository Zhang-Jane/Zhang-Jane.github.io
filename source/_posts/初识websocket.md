---
title: 初识websocket
abbrlink: 6846cc9a
date: 2020-10-26 14:48:49
tags:
---
## websocket的介绍

> WebSocket是一种在单个TCP连接上进行全双工通讯的协议。WebSocket通信协议于2011年被IETF定为标准RFC 6455，并由RFC7936补充规范。WebSocket API也被W3C定为标准。
>
> WebSocket使得客户端和服务器之间的数据交换变得更加简单，允许服务端主动向客户端推送数据。在WebSocket API中，浏览器和服务器只需要完成一次握手，两者之间就直接可以创建持久性的连接，并进行双向数据传输。

上面是维基百科的介绍.
简单的讲，websocket 和http一样，都是一种网络传输协议

## WebSocket 和 HTTP 的区别

http 协议是用在应用层的协议，他是基于 tcp 协议的，http 协议建立链接也必须要有三次握手才能发送信息。 http 链接分为短链接，长链接，短链接是每次请求都要三次握手才能发送自己的信息。即每一个 request 对应一个 response。长链接是在一定的期限内保持链接。保持 TCP 连接不断开。客户端与服务器通信，必须要有客户端发起然后服务器返回结果。客户端是主动的，服务器是被动的。 WebSocket 他是为了解决客户端发起多个 http 请求到服务器资源浏览器必须要经过长时间的轮训问题而生的，他实现了多路复用，他是全双工通信。在 webSocket 协议下客服端和浏览器可以同时发送信息。 建立了 WenSocket 之后服务器不必在浏览器发送 request 请求之后才能发送信息到浏览器。这时的服务器已有主动权想什么时候发就可以发送信息到服务器。而且信息当中不必在带有 head 的部分信息了与 http 的长链接通信来说，这种方式，不仅能降低服务器的压力。而且信息当中也减少了部分多余的信息。

## HTTP 的长连接与 websocket 的持久连接

HTTP1.1 的连接默认使用长连接（ persistent connection ）， 即在一定的期限内保持链接，客户端会需要在短时间内向服务端请求大量的资源，保持 TCP 连接不断开。客户端与服务器通信，必须要有客户端发起然后服务器返回结果。客户端是主动的，服务器是被动的。 在一个 TCP 连接上可以传输多个 Request/Response 消息对，所以本质上还是 Request/Response 消息对，仍然会造成资源的浪费、实时性不强等问题。 如果不是持续连接，即短连接，那么每个资源都要建立一个新的连接，HTTP 底层使用的是 TCP，那么每次都要使用三次握手建立 TCP 连接，即每一个 request 对应一个 response，将造成极大的资源浪费。 长轮询，即客户端发送一个超时时间很长的 Request，服务器 hold 住这个连接，在有新数据到达时返回 Response websocket 的持久连接 只需建立一次 Request/Response 消息对，之后都是 TCP 连接，避免了需要多次建立 Request/Response 消息对而产生的冗余头部信息。

**客户端请求**

```
GET / HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Host: example.com
Origin: http://example.com
Sec-WebSocket-Key: sN9cRrP/n9NdMgdcy2VJFQ==
Sec-WebSocket-Version: 13
```

**服务器响应**

```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: fFBooB7FAkLlXgRSz0BT3v4hq5s=
Sec-WebSocket-Location: ws://example.com/
```

**和http字段不一样的地方**

- Connection必须设置Upgrade，表示客户端希望连接升级。
- Upgrade字段必须设置Websocket，表示希望升级到Websocket协议。
- Sec-WebSocket-Key是随机的字符串，服务器端会用这些数据来构造出一个SHA-1的信息摘要。把“Sec-WebSocket-Key”加上一个特殊字符串“258EAFA5-E914-47DA-95CA-C5AB0DC85B11”，然后计算SHA-1摘要，之后进行BASE-64编码，将结果做为“Sec-WebSocket-Accept”头的值，返回给客户端。如此操作，可以尽量避免普通HTTP请求被误认为Websocket协议。
- Sec-WebSocket-Version 表示支持的Websocket版本。RFC6455要求使用的版本是13，之前草案的版本均应当弃用。
- Origin字段是可选的，通常用来表示在浏览器中发起此Websocket连接所在的页面，类似于Referer。但是，与Referer不同的是，Origin只包含了协议和主机名称。
- 其他一些定义在HTTP协议中的字段，如Cookie等，也可以在Websocket中使用。

可以看到只是在http协议上增加了几个硬性规定，http协议的user-agent,cookie都可以在websocket握手过程中使用

**抓包时候的注意事项:因为websocket只有一次握手，握手成功后就可以双方发送消息了，假如你打开网页后没有找到你要抓的数据，那么你就需要重新刷新网页，让他重新握手一次**

