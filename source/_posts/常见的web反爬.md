---
title: 常见的web反爬措施
tags: 反爬虫
categories: 反爬虫
abbrlink: 462f787a
date: 2020-10-27 08:25:33
---
### 1.window.navigator.webdriver

这个只能检测webdriver驱动浏览器的渲染工具，splash就不行（基于webkit）

#### step1：打开淘宝网

```python
from selenium.webdriver import Chrome
url = "https://www.taobao.com/"
driver =Chrome()
driver.get(url)
```

#### step2：打开console，输入window.navigator.webdriver发现等于true

#### step3：解决的思路是，让这个值变成undefined，js代码操作如下：

```js
Object.defineProperties(
navigator,{
webdriver:{get:()=>undefined}
}
);
```

**注意：**

**`driver.get(网址)`的时候，浏览器会打开网站，加载页面并运行网站自带的js代码。所以在你重设 `window.navigator.webdriver`之前，实际上网站早就已经知道你是模拟浏览器了**

#### step4：解决

注意，更新版本最新

````python
from selenium.webdriver import Chrome
url = "https://www.taobao.com/"
driver =Chrome()
driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
  "source": """
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    })
  """
})
driver.get(url)


````

或者用mitmproxy代理来过检测

#### 番外：

Xvfb  + selenium https://gist.github.com/amberj/6695353

### 2. headers请求参数反爬

#### 1.User-Agent身份信息验证

你是java，python，c++，还是浏览器

#### 2.cookie认证

#### 3.headers请求的顺序

顺序不一样，请求结果不一样

### 3.url中参数验证

什么sign，cp，as，x-sign

### 4.websocket

参考：https://juejin.im/post/5c80b768f265da2dae514d4f#comment

WebSocket是一种在单个TCP连接上进行全双工通信的协议。它使得客户端和服务器之间的数据交换变得更加简单，允许服务端主动向客户端推送数据。在WebSocket API中，浏览器和服务器只需要完成一次握手，两者之间就直接可以创建持久性的连接，并进行双向数据传输。

```python
import asyncio
import logging
from datetime import datetime
from aiowebsocket.converses import AioWebSocket


async def startup(uri):
    async with AioWebSocket(uri) as aws:
        converse = aws.manipulator
        # 客户端给服务端发送消息
        await converse.send('{"action":"subscribe","args":["QuoteBin5m:14"]}')
        while True:
            mes = await converse.receive()
            print('{time}-Client receive: {rec}'
                  .format(time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'), rec=mes))


if __name__ == '__main__':
    remote = 'wss://api.bbxapp.vip/v1/ifcontract/realTime'
    try:
        asyncio.get_event_loop().run_until_complete(startup(remote))
    except KeyboardInterrupt as exc:
        logging.info('Quit.')
```

### 5.图片伪装反爬

通过图片的形式把数据显示。

解决的办法就是识别图片里面的信息

### 6.css偏移反爬

通过css样式的设置，导致显示位移的偏移覆盖。

解决的方法：

1.找到原本显示的标签的属性值，关键的属性，width（所占的位置大小），left（偏移位置）

2.覆盖原本位置的标签的属性，看left位置和之前的对比，如果在范围内重合就是覆盖了

### 7.svg映射反爬

SVG 意为可缩放矢量图形（Scalable Vector Graphics）

反爬额策略是在标签中映射字体

##### 第一步：找到css样式地址，以及svg地址

##### 第二步：找到对应的符号对应的css的background属性的x，y值

##### 第三步：找到css样式属性中对应的svg的y的的位置，只要css中y的值大于等于svg的值，就可以了

##### 第四步：找svg中x的值，通过svg中font-size的值（为什么是这个值，因为这个值就是排版的距离），然后取x的值除以font-size的值，向上取整数

##### 第五步：找到的位置在x值中找

### 7.WOFF字体反爬

woff是一种网页所采用的字体格式的标准。与此类似的还有tff格式的字体。

反爬的套路：

用woff或者tff字体，你看不懂就行了。

小知识：

TTGlyph 节点下，name为所绘制的文字，contour节点为字型信息。pt 中的 x, y 为关键点的坐标，on的值 1表示直线，0表示弧形。name 为文字名，一个表识。标准字体的name即为所绘文字的unicode16进制编码。

转换：

```
result = hex(ord("你"))
```

一个文字张什么样子是由x、y、on来决定的。拿到一个非标准字体中某个文字的x、y、on后，在对应的标准字体文件中寻找最相近的x、y、on以及其表达的文字，这样所找到的文字即为解密后的文字

第一步：找到字体之间的映射关系

```python
from fontTools.ttLib import TTFont
font = TTFont('movie.woff')  # 打开当前目录的movie.woff文件
font.saveXML('movie.xml')  # 另存为movie.xml
```

第二步：用字体解析器，查看字体 https://font.qqe2.com/

第三步：手写映射关系

这个映射的关系，分俩种：

1.这个字体完整的就能对应

直接把映射的关系写入，然后直接解析

2.这个字体形很相似，但是坐标信息不完全一样

解析加密的字体文件，将每个文字、on、及xy对应关系取出来。然后用on值在上面的字典中快速取出一组on值相同的字型（大多数只有一个），然后再在这组字型中匹配一个最相近的字型，得出对应的文字即可

匹配最相近的字型方法：遍历候选字型，计算每个字型xy的特征与源word xy特征相除后的方差（相除是因为 同一字体xy是成比例缩放的），然后取方差最小的字型。

案例：

https://book.qidian.com/info/1020263803

### 8.浏览器的特征

浏览的特征除了navigator还有很多的特征，比如serAgent，cookieEnable，platform，plugins等。window.navigator.userAgent和window.navigator.platform结合判断。

### 9.浏览器指纹

他是把很多浏览器的特征，其中包括硬件的特征信息（mac地址，cpu核心类型等），浏览器的特征信息，以及uuid，cookie，token，ip地址等等。还有像canvas，webgl技术获取指纹

https://docs.fingerprintjs.com/pro/

### 10.隐藏链接反爬

在需要爬取的数据标签中穿插地雷

### 11.验证码`

#### 1.基础的字符验证码（数字+字符）

pytesseract识别一般的可还好些，噪点多不行。其他方式

#### 2.计算型验证码

一张图里面有一些四则运算，输入结果即可验证。

#### 3.滑动验证

腾讯滑动，网易易盾滑动，极验滑动，顶象滑动

#### 4.拼图验证码

#### 5.文字点选验证码

#### 6.物体识别点选验证

### 12.css伪类元素反爬

通过js操作css的伪类插入内容，无法直接获取数据















