---
title: scrapy的spider中间件
tags: scrapy中间件
categories: scrapy
abbrlink: 415eb720
date: 2021-02-16 13:10:54
---
## 爬虫中间件

SPIDER_MIDDLEWARES

**注意：关于scrapy爬虫中间件执行顺序的问题**

- 查看默认的爬虫中间件scrapy settings --get SPIDER_MIDDLEWARES_BASE

     ```
    {
     "scrapy.spidermiddlewares.httperror.HttpErrorMiddleware": 50,
     "scrapy.spidermiddlewares.offsite.OffsiteMiddleware": 500, 
     "scrapy.spidermiddlewares.referer.RefererMiddleware": 700,
     "scrapy.spidermiddlewares.urllength.UrlLengthMiddleware": 800,
     "scrapy.spidermiddlewares.depth.DepthMiddleware": 900
    }
    ```

- [`SPIDER_MIDDLEWARES`](https://scrapy-chs.readthedocs.io/zh_CN/stable/topics/settings.html#std:setting-SPIDER_MIDDLEWARES) 设置会与Scrapy定义的 [`SPIDER_MIDDLEWARES_BASE`](https://scrapy-chs.readthedocs.io/zh_CN/stable/topics/settings.html#std:setting-SPIDER_MIDDLEWARES_BASE) 设置合并(但不是覆盖)， 而后根据顺序(order)进行排序，最后得到启用中间件的有序列表: 第一个中间件是最靠近引擎的，最后一个中间件是最靠近spider的。关于如何分配中间件的顺序请查看 [`SPIDER_MIDDLEWARES_BASE`](https://scrapy-chs.readthedocs.io/zh_CN/stable/topics/settings.html#std:setting-SPIDER_MIDDLEWARES_BASE) 设置，而后根据您想要放置中间件的位置选择一个值。 由于每个中间件执行不同的动作，您的中间件可能会依赖于之前(或者之后)执行的中间件，因此顺序是很重要如果您想禁止内置的(在 [`SPIDER_MIDDLEWARES_BASE`](https://scrapy-chs.readthedocs.io/zh_CN/stable/topics/settings.html#std:setting-SPIDER_MIDDLEWARES_BASE) 中设置并默认启用的)中间件， 您必须在项目的 [`SPIDER_MIDDLEWARES`](https://scrapy-chs.readthedocs.io/zh_CN/stable/topics/settings.html#std:setting-SPIDER_MIDDLEWARES) 设置中定义该中间件，并将其值赋为 None 

- 需要重点关注的几个默认中间件

- from scrapy.spidermiddlewares.httperror import HttpErrorMiddleware

     ```python
     
     class HttpErrorMiddleware:
     
         @classmethod
         def from_crawler(cls, crawler):
             return cls(crawler.settings)
     
         def __init__(self, settings):
             self.handle_httpstatus_all = settings.getbool('HTTPERROR_ALLOW_ALL')
             self.handle_httpstatus_list = settings.getlist('HTTPERROR_ALLOWED_CODES')
     
         def process_spider_input(self, response, spider):
             if 200 <= response.status < 300:  # common case
                 return
             meta = response.meta
             if 'handle_httpstatus_all' in meta:
                 return
             if 'handle_httpstatus_list' in meta:
                 allowed_statuses = meta['handle_httpstatus_list']
             elif self.handle_httpstatus_all:
                 return
             else:
                 allowed_statuses = getattr(spider, 'handle_httpstatus_list', self.handle_httpstatus_list)
             if response.status in allowed_statuses:
                 return
             raise HttpError(response, 'Ignoring non-200 response')
     
         def process_spider_exception(self, response, exception, spider):
             if isinstance(exception, HttpError):
                 spider.crawler.stats.inc_value('httperror/response_ignored_count')
                 spider.crawler.stats.inc_value(
                     f'httperror/response_ignored_status_count/{response.status}'
                 )
                 logger.info(
                     "Ignoring response %(response)r: HTTP status code is not handled or not allowed",
                     {'response': response}, extra={'spider': spider},
                 )
                 return []
     
     ```

     

- 注意，如果REDIRECT_ENABLED为Fasle或者没有配置任何HTTPERROR_ALLOW_ALL等参数，那么scrapy只会处理200 <= response.status < 300的请求，