---
title: websocket
abbrlink: 42ce80b9
date: 2021-04-23 11:06:17
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

## example

### 简单例子

client：

```python
import socket
import base64
import random
import time
from urllib.parse import urlparse


def get_url_info(url: str) -> tuple:
    url = urlparse(url)
    host = url.netloc
    resource = url.path or "/"
    return host, resource


def get_key() -> str:
    bytes_key = bytes(random.getrandbits(8) for _ in range(16))
    res = base64.b64encode(bytes_key).decode()
    return res


def get_header(url: str) -> bytes:
    key = get_key()
    host, resource = get_url_info(url)
    head = {
        "Connection": "Upgrade",
        "Upgrade": "websocket",
        "Sec-Websocket-Key": key,
        "Origin": str(host)
    }
    headers = ["{}:{}".format(k, item) for k, item in head.items()]
    headers.insert(0, "GET {} HTTP/1.1".format(resource))
    headers.append("\r\n")
    headers = "\r\n".join(headers)
    return headers.encode("utf-8")


def shake_hands(client: socket, url: str):
    header = get_header(url)
    client.send(header)
    time.sleep(3)
    message = client.recv(1024).decode("utf-8")
    print(message)
    if "Status Code:101" in message:
        return True
    return False


if __name__ == '__main__':
    url = "ws://127.0.0.1:9999"
    host, resource = get_url_info(url)
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect(("127.0.0.1", 9999))
    print(shake_hands(client, url))
    client.close()
```

server：

```python
import socket
# AF_INET IPV4 AF_INET6 IPV6
# SOCK_STREAM TCP SOCK_DGRAM
import traceback

def verify(data: str):
    data = data[:-4].split("\r\n")
    method = data.pop(0)
    headers = {}
    for val in data:
        try:
            print(val.split(":"))
            name, value = val.split(":")
        except Exception as e:
            name, host, port = val.split(":")
            value = "{}:{}".format(host, port)
        headers[name] = value
    if any(["GET" not in method, "HTTP/1.1" not in method,
            headers.get("Connection") != "Upgrade",
            headers.get("Upgrade") != "websocket",
            not headers.get("Origin"),
            not headers.get("Sec-Websocket-Key"),
            ]):
        return False
    return True


def set_response(status):
    if not status:
        head = {"Status Code": 403}
        return ""

    head = {
        "Status Code": "101 Switching Protocols",
        "Connection": "Upgrade",
        "Upgrade": "websocket",
        "Sec-Websocket-Accept": "Y3nhRRZjdrBphYXwpoEouw",
    }
    headers = ["{}:{}".format(k, item) for k, item in head.items()]
    headers.append("\r\n")
    res = "\r\n".join(headers)
    return res.encode("utf-8")


def ws_main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 9999))
        s.listen(1)
        conn, addr = s.accept()
        with conn:
            data = conn.recv(1024).decode("utf-8")
            status = verify(data)
            response = set_response(status)
            conn.send(response)
            conn.close()


if __name__ == '__main__':
    ws_main()
```

### 复杂一点

client：

```python
import asyncio
import websockets

# 向服务器端认证，用户名密码通过才能退出循环
async def auth_system(websocket):
    while True:
        cred_text = input("please enter your username and password: ")
        await websocket.send(cred_text)
        response_str = await websocket.recv()
        if "congratulation" in response_str:
            return True

# 向服务器端发送认证后的消息
async def send_msg(websocket):
    while True:
        _text = input("please enter your context: ")
        if _text == "exit":
            print(f'you have enter "exit", goodbye')
            await websocket.close(reason="user exit")
            return False
        await websocket.send(_text)
        recv_text = await websocket.recv()
        print(f"{recv_text}")

# 客户端主逻辑
async def main_logic():
    async with websockets.connect('ws://127.0.0.1:5678') as websocket:
        await auth_system(websocket)

        await send_msg(websocket)

asyncio.get_event_loop().run_until_complete(main_logic())
```

server：

```python
import asyncio
import websockets

# 检测客户端权限，用户名密码通过才能退出循环
async def check_permit(websocket):
    while True:
        recv_str = await websocket.recv()
        cred_dict = recv_str.split(":")
        if cred_dict[0] == "admin" and cred_dict[1] == "123456":
            response_str = "congratulation, you have connect with server\r\nnow, you can do something else"
            await websocket.send(response_str)
            return True
        else:
            response_str = "sorry, the username or password is wrong, please submit again"
            await websocket.send(response_str)

# 接收客户端消息并处理，这里只是简单把客户端发来的返回回去
async def recv_msg(websocket):
    while True:
        recv_text = await websocket.recv()
        response_text = f"your submit context: {recv_text}"
        await websocket.send(response_text)

# 服务器端主逻辑
async def main_logic(websocket, path):
    await check_permit(websocket)

    await recv_msg(websocket)

start_server = websockets.serve(main_logic, '127.0.0.1', 5678)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
```

