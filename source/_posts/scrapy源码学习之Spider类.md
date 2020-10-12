---
title: scrapy的Spider类
tags: scrapy
categories: scrapy
cover: 'https://blog-1252858782.cos.ap-beijing.myqcloud.com/Scrapy.png'
abbrlink: f3ca6d2
date: 2020-10-12 22:00:06
top_img:
---

## scrapy的Spider类

Spider：scrapy.Spider, 是所有 Spider 的基类，它是最基础的爬虫，所有的 spider 都会继承 scrapy.Spider。它提供了 start_requests() 的默认实现，读取并请求 spider 属性中的 start_urls，并根据返回的 response 调用 spider 中的 parse 方法。

**spiders(Lib\site-packages\scrapy\spiders)**

```
├── __init__.py
├── crawl.py
├── feed.py
├── init.py
└── sitemap.py
```

### 自定义爬虫类

```python
import scrapy


class TemplateSpidersSpider(scrapy.Spider):
    name = 'template_spiders'
    allowed_domains = ['*']
    start_urls = ['http://*/']

    def parse(self, response):
        pass

```

### `__init__.py`：**Spider类**

Base class for scrapy spiders. All spiders must inherit from this
class.

```python
def start_requests(self):
    cls = self.__class__
    if not self.start_urls and hasattr(self, 'start_url'):
        raise AttributeError(
            "Crawling could not start: 'start_urls' not found "
            "or empty (but found 'start_url' attribute instead, "
            "did you miss an 's'?)")
    if method_is_overridden(cls, Spider, 'make_requests_from_url'):
        warnings.warn(
            "Spider.make_requests_from_url method is deprecated; it "
            "won't be called in future Scrapy releases. Please "
            "override Spider.start_requests method instead "
            f"(see {cls.__module__}.{cls.__name__}).",
        )
        for url in self.start_urls:
            yield self.make_requests_from_url(url) # 封装request的请求
    else:
        for url in self.start_urls:
            yield Request(url, dont_filter=True) # 封装request的请求


def make_requests_from_url(self, url):
    """ This method is deprecated. """
    warnings.warn(
        "Spider.make_requests_from_url method is deprecated: "
        "it will be removed and not be called by the default "
        "Spider.start_requests method in future Scrapy releases. "
        "Please override Spider.start_requests method instead."
    )
    return Request(url, dont_filter=True)
```

self.start_urls是你编写爬虫类时候的start_urls = ['http://*/']，作为请求的开始链接。如果想更灵活可以直接重写父类的方法start_requests。注意scrapy所有的请求和响应的对象都会被封装正Request对象和Response对象。

**在源码中我们可以看到很多attr相关的方法，下面看看他们的作用**：

关于getattr，hasattr和setattr用法和作用

```python
# 简单测试
class Demo(object):
    def __init__(self):
        self.name = "jack"


demo = Demo()
x = getattr(demo, "name", None)  # getattr() 函数用于返回一个对象属性值
y = hasattr(demo, "name")  # hasattr() 函数用于判断对象是否包含对应的属性
setattr(demo, "name", "rose")  # 函数用于设置属性值，该属性不一定是存在的
print(x)
print(y)
print(demo.name)

result：
------------------
jack
True
rose
------------------
```

### python的反射

在反射机制就是在运行时，动态的确定对象的类型，并可以通过字符串调用对象属性、方法、导入模块，是一种基于字符串的事件驱动。通过字符串的形式，去模块寻找指定函数，并执行。利用字符串的形式去对象（模块）中操作（查找/获取/删除/添加）成员。

上面所用到的一切关于attr的函数其实就是是一种反射。

