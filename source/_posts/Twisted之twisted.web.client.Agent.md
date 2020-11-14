---
title: Twisted之twisted.web.client.Agent
date: 2020-11-12 22:18:22
tags: Twisted
categories: Twisted
---
## 文档
https://twistedmatrix.com/documents/current/api/twisted.web.client.html
## Agent的用法
`Agent is a very basic HTTP client. It supports HTTP and HTTPS scheme URIs.`
### demo01
```python
from scrapy.core.downloader.contextfactory import ScrapyClientContextFactory
from twisted.internet import reactor
from twisted.web.client import Agent
from twisted.web.http_headers import Headers
from twisted.internet.ssl import ClientContextFactory

class WebClientContextFactory(ClientContextFactory):
    def getContext(self, hostname, port):
        print( "getting context for {}:{}".format( hostname, port ) )
        # FIXME: no attempt to verify certificates!
        return ClientContextFactory.getContext(self)

# 成功回调函数
def success_callback(response):
    print(response.__dict__)
    print('Response version:', response.version)
    print('Response code:', response.code)
    print('Response phrase:', response.phrase)
    print('Response headers:')
    print('Response received', response)

# 失败回调函数
def fail_callback(err):
    print('Something error', err)


def to_bytes(text, encoding=None, errors='strict'):
    """Return the binary representation of ``text``. If ``text``
    is already a bytes object, return it as-is."""
    if isinstance(text, bytes):
        return text
    if not isinstance(text, str):
        raise TypeError('to_bytes must receive a str or bytes '
                        'object, got %s' % type(text).__name__)
    if encoding is None:
        encoding = 'utf-8'
    return text.encode(encoding, errors)


def get_request(url, method="GET", timeout=10):
    # 创建agent对象
    agent = Agent(reactor, contextFactory=ScrapyClientContextFactory())
    d = agent.request(
        to_bytes(method, encoding='ascii'),
        to_bytes(url),
        Headers({b'accept': [b'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'],
                 b'accept-language': [b'en'], b'user-agent': [b'Scrapy/2.2.1 (+https://scrapy.org)'],
                 b'accept-encoding': [b'gzip, deflate']}),
        None)
    d.addCallback(success_callback)
    d.addErrback(fail_callback)
    timeout_cl = reactor.callLater(timeout, d.cancel)
    print(timeout_cl.active())
    d.addBoth(lambda _: reactor.stop())


if __name__ == '__main__':
    url = "https://blog.csdn.net"
    get_request(url=url)
    reactor.run()

```
### demo02
```python
from scrapy.core.downloader.contextfactory import ScrapyClientContextFactory, BrowserLikeContextFactory
from twisted.internet import reactor
from twisted.web.client import Agent
from twisted.web.http_headers import Headers


# 成功回调函数
def success_callback(response):
    print('Response version:', response.version)
    print('Response code:', response.code)
    print('Response phrase:', response.phrase)
    print('Response headers:')
    print('Response received', response)


# 失败回调函数
def fail_callback(err):
    print('Something error', err)


def do_something(response, request):
    print(request.__dict__)


def to_bytes(text, encoding=None, errors='strict'):
    """Return the binary representation of ``text``. If ``text``
    is already a bytes object, return it as-is."""
    if isinstance(text, bytes):
        return text
    if not isinstance(text, str):
        raise TypeError('to_bytes must receive a str or bytes '
                        'object, got %s' % type(text).__name__)
    if encoding is None:
        encoding = 'utf-8'
    return text.encode(encoding, errors)


def get_request(url, method="GET", timeout=10):
    # 创建agent对象
    # agent = Agent(reactor)
    agent = Agent(reactor, contextFactory=ScrapyClientContextFactory())
    agent = Agent(reactor, contextFactory=BrowserLikeContextFactory())
    d = agent.request(
        to_bytes(method, encoding='ascii'),
        to_bytes(url),
        Headers({b'accept': [b'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'],
                 b'accept-language': [b'en'], b'user-agent': [b'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36'],
                 b'accept-encoding': [b'gzip, deflate']}),
        None)
    d.addCallback(success_callback)
    d.addCallback(do_something, Headers)
    d.addErrback(fail_callback)
    timeout_cl = reactor.callLater(timeout, d.cancel)
    print(timeout_cl.active())
    d.addBoth(lambda _: reactor.stop())


if __name__ == '__main__':
    url = "https://blog.csdn.net"
    get_request(url=url)
    reactor.run()
```
### demo03
```python
# *_*coding:utf-8 *_*
from pprint import pformat

from scrapy.core.downloader.contextfactory import ScrapyClientContextFactory
from twisted.internet import reactor
from twisted.internet.defer import Deferred, DeferredList
from twisted.web.client import Agent
from twisted.web.http_headers import Headers
from twisted.internet.protocol import Protocol


# 创建一个协议Protocol类，用来收集数据
class BodyCollector(Protocol):
    def __init__(self, finished, uri):
        self.finished = finished  # 共外部定义的defered对象，用于数据接收完毕后，触发相应回调函数
        self.uri = uri
        self.body = bytes()

    def dataReceived(self, data):
        '''每接收到一次数据，该方法就会被调用一次'''
        print("data bytes: ", self.uri, data)
        self.body += data
    # 收集所有的的响应数据

    def connectionLost(self, reason):
        '''
        当socket连接关闭后，该方法会被调用
        '''
        print('已完成数据的收集:', reason.getErrorMessage())
        # 触发对应的回调函数
        self.finished.callback(self.body)


def succes_callback(response):
    # print('Response version:', response.version)
    # print('Response code:', response.code)
    # print('Response phrase:', response.phrase)
    # print('Response headers:')
    finished = Deferred()
    collector = BodyCollector(finished, response.request.absoluteURI)
    response.deliverBody(collector)

    def handle_body(body):
        print("body size ", len(body))
    finished.addCallback(handle_body)

    def error_callback(error):
        print("error back ", pformat(error))

    finished.addErrback(error_callback)
    return finished


# 创建agent对象
agent = Agent(reactor, contextFactory=ScrapyClientContextFactory())

d_list = []

url_list = [
    b"https://www.baidu.com/",
    # b"http://www.qq.com/",
    # b"http://www.163.com/",
    # b"http://www.sina.com/",
    # b"http://www.sougou.com/",
]
for url in url_list:
    d = agent.request(
        b'GET',
        url,
        Headers(
            {'User-Agent': ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36']}),
        None  # post请求的body
    )
    # 设置回调：如果任务成功执行，那么将会调用该回调函数
    d.addCallback(succes_callback)
    d_list.append(d)


# # 设置失败回调：如果任务执行出现异常或者成功回调函数出现异常， 那么将会调用
# defered.addErrback(error_callback)


def callback_shutdown(ignored):
    reactor.stop()


dl = DeferredList(d_list)

# 设置最终的回调：无论成功与否。都会调用
dl.addBoth(callback_shutdown)

# 启动事件循环
reactor.run()

```


