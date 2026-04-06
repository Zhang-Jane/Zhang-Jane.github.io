---
title: 常见的 Web 反爬措施：学习笔记与要点整理
description: 从反爬本质、常用方案到信息校验、动态渲染、文本与代码混淆、验证码与 TLS 指纹等维度整理要点；附 Selenium WebDriver 规避、请求头、WebSocket 与字体解析等实操笔记，便于日常查阅与工程检索。
date: 2020-10-27T08:25:33.000Z
updated: 2026-04-06T12:00:00.000Z
tags:
  - 反爬虫
  - Web
  - 安全
categories: 反爬虫
abbrlink: 462f787a
---

## 一、反爬的本质

反爬的核心目的，是在**不显著影响真实用户与搜索引擎正常访问**的前提下，提高脚本或自动化程序获取站点内容的成本与难度。工程上往往表现为：拖慢采集、提高识别成本、在异常流量上触发验证或封禁。

## 二、常见反爬方案（基础思路）

**频率限制**  
在一段时间内限制同一 IP、账号或会话的请求次数，使粗放爬虫变慢、变贵；异常高频可进一步触发验证码或封禁。

**检测异常行为**  
短时间跨多页面、路径不符合真人浏览习惯、表单填写过快、点击坐标异常等，可结合 UA、分辨率、时区、字体等环境信息与行为数据做风控。

**要求注册与登录**  
将内容与身份绑定，便于追踪滥用；可对异常账号限流或封禁。注册阶段可用邮箱、短信等提高批量注册成本。

**文字转图片**  
服务端将敏感文字渲染为图片，阻断「直接抓 HTML 文本」的捷径，需 OCR 或视觉模型才能还原。

**依赖 Cookie 与状态**  
通过 Cookie 标识会话或串联多步操作；可与 JS 设置、混淆配合，区分「只拿 HTML」的客户端与真实浏览器路径。

**按地理位置返回不同 HTML**  
同一 URL 在不同地区或不同入口下返回结构或资源差异（常见于跨国电商站点），增加「一套规则爬全局」的难度。

**JavaScript 与 AJAX 加载**  
首屏仅骨架，数据由 XHR/fetch 在浏览器内异步拉取；不执行 JS 的静态解析器往往拿不到最终数据。

**数据与传输混淆**  
对 Ajax 返回体做 Base64、自定义编码、加密或多层混淆，抓包看到的是密文，需还原算法或在浏览器内截获明文。

**蜜罐与假数据**  
在页面中放置对用户不可见、但 naive 爬虫会请求的链接或字段，用于识别自动化访问或污染错误入库的数据。

## 三、相对更有效的手段

- 经常调整 DOM 结构与类名，增加硬编码选择器维护成本。  
- 蜜罐、假字段与行为校验结合。  
- 混淆的 JavaScript、Ajax 载荷与 Cookie / Token 链路。  
- 频率限制、异常检测与分级封禁（验证码、滑块、人机挑战）。  
- **合规前提下**：若希望第三方稳定获取数据，更可持续的做法往往是**正式开放 API** 并约定配额与用途。

## 四、反爬技术分类总览

### 1. 信息校验型

- **User-Agent、Host、Referer 等**：校验请求头是否像真实浏览器或站内正常跳转。  
- **Cookie 反爬**：动态下发与校验 Cookie；部分场景需配合 JS Hook（例如对 `document.cookie` 的行为分析）。  
- **签名与参数校验**：请求或 body 中带 `sign`、`token` 等，由服务端算法校验完整性与时效性，防篡改与重放。  

### 2. 动态渲染型

- **Ajax 动态加载**：页面主体由异步请求填充，需分析接口、参数与鉴权，或在浏览器环境中执行页面脚本。

### 3. 文本混淆型

- **字体反爬**：自定义 WOFF/TTF 将码点映射到私有字形，页面「看起来正常」、直接复制或正则往往得到乱码或空框，需解析字体与字形映射。  
- **CSS 偏移**：用 `position`/`left`/`transform` 等打乱 DOM 顺序，视觉上对齐，源码顺序与显示顺序不一致。  
- **SVG 映射**：字符来自 SVG 切片或 sprite，通过 CSS `background-position` 等与展示位置对应，DOM 文本节点中未必有明文。

### 4. 代码混淆型

常见用于保护前端逻辑或增加逆向成本，例如：**eval 包裹的动态解密**、**AA 混淆**、**SOJSON**、**JSFuck** 等。分析时通常需要调试器、AST 工具或针对特定产品的已知套路。

## 五、验证码与对抗思路

**CAPTCHA**（“Completely Automated Public Turing test to tell Computers and Humans Apart”）通过人类擅长的感知或操作任务区分脚本与真人，常用于登录、发帖、搜索等高风险入口。

常见形态包括：

- 传统字符/数字/汉字图片输入。  
- 短信验证码：绑定手机号与短时有效的一次性码。  
- 带广告或复杂背景的图形验证码（本质仍多为「看图打字」）。  
- 滑动/拖动：将滑块拖到缺口或指定位置。  
- 图标点选、文字点选、物体识别点选：依赖视觉与语义理解。  
- 语音验证码：TTS 或电话语音播报数字。  
- **智能验证码 / 无感验证**：结合行为、设备指纹与风控，正常用户少打扰，异常流量再升 challenge。

更粗的分类可概括为：**滑块、文字、图像点选、无感/智能验证码**等。

缺口类滑块往往是：背景图 + 滑块图，用图像处理或模型估缺口距离，再模拟拖动。上线产品一般还会看轨迹、加速度、环境指纹，不只是「对准缺口」。

## 六、具体手段与代码示例

### 1. `window.navigator.webdriver` 检测

用 WebDriver 驱动的浏览器里，`navigator.webdriver` 经常是 `true`，页面脚本一加载就能读到。Splash 一类基于 WebKit 的工具未必走同一套检测，要实测。常见应对还是把 `webdriver` 藏起来或改成 `undefined`。

例如：

```python
from selenium.webdriver import Chrome

url = "https://www.taobao.com/"
driver = Chrome()
driver.get(url)
```

在开发者工具 Console 中执行 `navigator.webdriver`，可见为 `true`。

可以先把 `webdriver` 伪装成不存在，例如：

```js
Object.defineProperties(navigator, {
  webdriver: { get: () => undefined },
});
```

若在 `driver.get(url)` 之后才注入，首屏脚本可能早就读过 `webdriver` 了。更稳的是在**打开页面前**用 CDP 的 `Page.addScriptToEvaluateOnNewDocument` 注入（Selenium 和浏览器版本要新一点）：

```python
from selenium.webdriver import Chrome

url = "https://www.taobao.com/"
driver = Chrome()
driver.execute_cdp_cmd(
    "Page.addScriptToEvaluateOnNewDocument",
    {
        "source": """
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    })
  """
    },
)
driver.get(url)
```

也可结合 **mitmproxy** 等在代理层改写响应或注入脚本，视站点检测点而定。

无头 Linux 上跑浏览器有时会配合 **Xvfb + Selenium**，gist 示例：<https://gist.github.com/amberj/6695353>

### 2. Headers 与请求元数据

- **User-Agent**：声明客户端类型；异常或缺失易被判为脚本。  
- **Cookie**：会话与登录态；动态 Cookie 需还原生成逻辑或真实浏览器环境。  
- **Header 顺序与完整性**：部分服务端会校验与真实浏览器是否一致（包括 HTTP/2 伪头、顺序等，依实现而异）。

### 3. URL 参数与签名

常见参数名如 `sign`、`cp`、`as`、`x-sign` 等，需结合抓包与逆向理解其输入字段、排序、盐值与时间戳规则。

### 4. WebSocket

单条 TCP 上全双工，服务端能主动推，行情、聊天里很常见。爬虫这边要按站点约定收发帧、保心跳、对上订阅格式。

掘金上有一篇讲协议与实战的：<https://juejin.cn/post/5c80b768f265da2dae514d4f>。

例如：

```python
import asyncio
import logging
from datetime import datetime

from aiowebsocket.converses import AioWebSocket


async def startup(uri: str) -> None:
    async with AioWebSocket(uri) as aws:
        converse = aws.manipulator
        await converse.send('{"action":"subscribe","args":["QuoteBin5m:14"]}')
        while True:
            mes = await converse.receive()
            print(
                "{time}-Client receive: {rec}".format(
                    time=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    rec=mes,
                )
            )


if __name__ == "__main__":
    remote = "wss://api.bbxapp.vip/v1/ifcontract/realTime"
    try:
        asyncio.run(startup(remote))
    except KeyboardInterrupt:
        logging.info("Quit.")
```

### 5. 图片伪装

将数据以图片形式展示，需 OCR、专用识别模型或从渲染层取图再识别。

### 6. CSS 偏移

样式把「眼睛看到的顺序」和 DOM 里的节点顺序拧开。

排查时可以：

1. 记录目标展示节点及其 `width`、`left` 等布局相关属性。  
2. 对比覆盖关系：相邻或重叠节点在相同坐标系下的 `left` 与范围是否解释最终肉眼所见顺序。

### 7. SVG 映射

SVG 为可缩放矢量图；反爬可将字符映射到 SVG 图集或切片，再用 CSS 对齐到页面位置。

每个站实现不一样，常见做法是：

1. 把页面用到的 CSS、SVG 地址找出来。  
2. 看某个符号在 CSS 里对应的 `background-position`（x、y）。  
3. 在 SVG 里对齐到那一行/列（常要对照 y、`font-size` 等）。  
4. 从 SVG 的 x 序列里算出下标（有的用 x ÷ `font-size` 再向上取整，按页面实际来）。  
5. 查表还原成文字。

### 8. WOFF / TTF 字体反爬

WOFF、TTF 为网页常用字体容器。站点用自定义字形替换系统字体，使「复制」或简单正则无法得到真实 Unicode 文本。

用 fontTools 看结构时：`TTGlyph` 里 `name`、`contour`、`pt` 的 x/y/on 一起决定长什么样；标准字体里 `name` 往往和 Unicode 能对上。`hex(ord("某字"))` 可以辅助对照码点。

处理顺序可以这么走：

1. 字体下下来，解析出码点或 glyph 名到字形的对应关系。  

```python
from fontTools.ttLib import TTFont

font = TTFont("movie.woff")
font.saveXML("movie.xml")
```

2. 用字体查看器对照字形（在线工具示例：<https://font.qqe2.com/>）。  
3. **手写映射**：若字形稳定，可直接维护字典。  
4. **字形对不上时**：坐标可能按比例缩放，可以把各 glyph 的轮廓特征提出来，在候选字里找距离或方差最小的；同一套字体里 x、y 常成比例，用相除再比方差有时比直接比坐标稳。

案例参考：<https://book.qidian.com/info/1020263803>

### 9. 浏览器环境特征

除 `navigator.webdriver` 外，还可组合 **User-Agent、`cookieEnabled`、`platform`、`plugins`** 等；部分站点会交叉校验 `userAgent` 与 `platform` 等是否自洽。

### 10. 浏览器指纹

Canvas、WebGL、AudioContext、字体列表、分辨率、硬件并发、时区、插件等凑在一起，能做出比较稳定的一串 ID，再叠 Cookie、Token、IP 做风控。文档示例：<https://docs.fingerprintjs.com/pro/>

### 11. 隐藏链接与蜜罐

在正文或列表 HTML 中插入对用户不可见或不应点击的链接，自动化若未过滤会请求这些 URL，从而暴露爬虫或触发封禁。

### 12. 验证码形态补充

- **字符类**：噪点少时 OCR（如 pytesseract）可能可用，复杂对抗需专门模型或服务。  
- **计算型**：图片中算术表达式，需识别运算与结果。  
- **滑动**：腾讯、网易易盾、极验、顶象等厂商方案各异，风控点不限于缺口位置。  
- **拼图、文字点选、物体点选**：对视觉与轨迹要求更高。

### 13. CSS 伪元素内容

通过 `::before` / `::after` 或配合 JS 写入的伪元素展示关键文本，**不一定出现在可遍历的 DOM 文本节点**中，需结合计算样式或截图识别。

### 14. TLS 指纹（JA3 等）

浏览器和 Python `requests`、Go `net/http` 等在 TLS 握手时带的套件、扩展顺序不完全一样，服务端能拿 JA3 一类指纹区分「像不像 Chrome」。可查：<https://tlsfingerprint.io/id/e47eae8f8c4887b6>（具体值会随浏览器版本变，以你本机抓到的为准）。

## 小结

反爬本质是在**少打扰真人、不误伤搜索引擎**的前提下，让脚本多付一点成本。线上往往是频率/行为、动态接口、签名、字体与排版、验证码、指纹几层叠在一起。排查时先抓包把接口和鉴权摸清，再分静态 HTML、XHR、WebSocket、字体 TLS 各块啃。**务必在授权与合规范围内做技术分析。**
