---
title: scrapy的download中间件
tags: scrapy中间件
categories: scrapy
abbrlink: 86d1693
date: 2021-02-16 13:14:35
---
## 下载中间件

DOWNLOADER_MIDDLEWARES

**注意：关于scrapy下载中间件执行顺序的问题**

- scrapy本身有默认的一些中间件**DOWNLOADER_MIDDLEWARES_BASE**，可以通过scrapy settings --get DOWNLOADER_MIDDLEWARES_BASE命令查看

    ```
    {
    "scrapy.downloadermiddlewares.robotstxt.RobotsTxtMiddleware": 100,
    "scrapy.downloadermiddlewares.httpauth.HttpAuthMiddleware": 300,
    "scrapy.downloadermiddlewares.downloadtimeout.DownloadTimeoutMiddleware": 350,
    "scrapy.downloadermiddlewares.defaultheaders.DefaultHeadersMiddleware": 400, 
    "scrapy.downloadermiddlewares.useragent.UserAgentMiddleware": 500,
    "scrapy.downloadermiddlewares.retry.RetryMiddleware": 550,
    "scrapy.downloadermiddlewares.ajaxcrawl.AjaxCrawlMiddleware": 560,
    "scrapy.downloadermiddlewares.redirect.MetaRefreshMiddleware": 580, 
    "scrapy.downloadermiddlewares.httpcompression.HttpCompressionMiddleware": 590,
    "scrapy.downloadermiddlewares.redirect.RedirectMiddleware": 600, 
    "scrapy.downloadermiddlewares.cookies.CookiesMiddleware": 700, 
    "scrapy.downloadermiddlewares.httpproxy.HttpProxyMiddleware": 750, 
    "scrapy.downloadermiddlewares.stats.DownloaderStats": 850, 
    "scrapy.downloadermiddlewares.httpcache.HttpCacheMiddleware": 900
    }
    ```

- DOWNLOADER_MIDDLEWARES设置会与Scrapy定义的DOWNLOADER_MIDDLEWARES_BASE 设置合并(但不是覆盖)， 而后根据顺序(order)进行排序，最后得到启用中间件的有序列表: 第一个中间件是最靠近引擎的，最后一个中间件是最靠近下载器的。

- 理解就是，数字越小的中间件越先执行，例如Scrapy自带的第1个中间件**RobotsTxtMiddleware**，它的作用是首先查看settings.py中**ROBOTSTXT_OBEY**这一项的配置是**True**还是**False**。如果是**True**，表示要遵守**Robots.txt**协议，它就会检查将要访问的网址能不能被运行访问，如果不被允许访问，那么直接就取消这一次请求，接下来的和这次请求有关的各种操作全部都不需要继续了。**因此注意，这个中间件的数值不能随意的去设定**。

- 如果想禁止内置的(在 **[DOWNLOADER_MIDDLEWARES_BASE](https://scrapy-chs.readthedocs.io/zh_CN/latest/topics/settings.html#std:setting-DOWNLOADER_MIDDLEWARES_BASE)** 中设置并默认启用的)中间件， 您必须在项目的 **[DOWNLOADER_MIDDLEWARES](https://scrapy-chs.readthedocs.io/zh_CN/latest/topics/settings.html#std:setting-DOWNLOADER_MIDDLEWARES)** 设置中定义该中间件，并将其值赋为 None

## 需要重点关注的几个默认中间件

像我们平常爬虫最常使用的HttpProxyMiddleware，RedirectMiddleware，CookiesMiddleware，UserAgentMiddleware中间件，scrapy都有内置好的。那么在自定义编写相同功能的中间件的时候，最好先禁止掉内置的中间件

## from scrapy.downloadermiddlewares.useragent import UserAgentMiddleware

当爬虫启动的时候会去读setting.py中的**USER_AGENT**

## from scrapy.downloadermiddlewares.httpproxy import HttpProxyMiddleware

先读setting.py中的**HTTPPROXY_ENABLED**是否开启，默认是TRUE，初始化还会读取**HTTPPROXY_AUTH_ENCODING**参数，它会忽略已经设置的代理。

## from scrapy.downloadermiddlewares.cookies import CookiesMiddleware

默认：

COOKIES_ENABLED = True
COOKIES_DEBUG = False

特别注意：如果要使用dont_merge_cookies=true，那么需要我们自己将cookie加入到header中，通过request.cookies = cookie方式添加的cookie，scrapy也不再会帮我们合并到header 中了。

在request的meta中加入**dont_merge_cookies**属性，并设置为true，在CookieMiddleware中，我们将cookie添加在header中，而不是赋值给request.cookies

关于多个response返回set_cookie

cookie_list = response.headers.getlist("Set-Cookie")
然后拼接一下就可以了
headers["Cookie"] = ";".join(cookie)



## from scrapy.downloadermiddlewares.stats import DownloaderStats

统计请求，响应以及异常的信息。

最后在爬虫结束的时候会显示[scrapy.statscollectors] INFO: Dumping Scrapy stats（E:\python3.7.6\Lib\site-packages\scrapy\statscollectors.py StatsCollector），结束打印的流程如下：

```
step:1
E:\python3.7.6\Lib\site-packages\scrapy\crawler.py
STATS_CLASS = 'scrapy.statscollectors.MemoryStatsCollector'
STATS_DUMP = True
self.stats = load_object(self.settings['STATS_CLASS'])(self)
step:2
E:\python3.7.6\Lib\site-packages\scrapy\core\engine.py
d.addBoth(lambda _: self.crawler.stats.close_spider(spider, reason=reason))
```

## scrapy.downloadermiddlewares.retry import RetryMiddleware（默认）

```python
# 默认
RETRY_ENABLED = True
RETRY_TIMES = 2  # initial response + 2 retries = 3 requests
RETRY_HTTP_CODES = [500, 502, 503, 504, 522, 524, 408, 429]
RETRY_PRIORITY_ADJUST = -1

class RetryMiddleware:

    # IOError is raised by the HttpCompression middleware when trying to
    # decompress an empty response
    EXCEPTIONS_TO_RETRY = (defer.TimeoutError, TimeoutError, DNSLookupError,
                           ConnectionRefusedError, ConnectionDone, ConnectError,
                           ConnectionLost, TCPTimedOutError, ResponseFailed,
                           IOError, TunnelError)

    def __init__(self, settings):
        if not settings.getbool('RETRY_ENABLED'):
            raise NotConfigured
        self.max_retry_times = settings.getint('RETRY_TIMES')
        self.retry_http_codes = set(int(x) for x in settings.getlist('RETRY_HTTP_CODES'))
        self.priority_adjust = settings.getint('RETRY_PRIORITY_ADJUST')

    @classmethod
    def from_crawler(cls, crawler):
        return cls(crawler.settings)

    def process_response(self, request, response, spider):
        if request.meta.get('dont_retry', False):
            return response
        if response.status in self.retry_http_codes:
            reason = response_status_message(response.status)
            return self._retry(request, reason, spider) or response
        return response

    def process_exception(self, request, exception, spider):
        if (
            isinstance(exception, self.EXCEPTIONS_TO_RETRY)
            and not request.meta.get('dont_retry', False)
        ):
            return self._retry(request, exception, spider)

    def _retry(self, request, reason, spider):
        retries = request.meta.get('retry_times', 0) + 1

        retry_times = self.max_retry_times

        if 'max_retry_times' in request.meta:
            retry_times = request.meta['max_retry_times']

        stats = spider.crawler.stats
        if retries <= retry_times:
            logger.debug("Retrying %(request)s (failed %(retries)d times): %(reason)s",
                         {'request': request, 'retries': retries, 'reason': reason},
                         extra={'spider': spider})
            retryreq = request.copy()
            retryreq.meta['retry_times'] = retries
            retryreq.dont_filter = True
            retryreq.priority = request.priority + self.priority_adjust

            if isinstance(reason, Exception):
                reason = global_object_name(reason.__class__)

            stats.inc_value('retry/count')
            stats.inc_value(f'retry/reason_count/{reason}')
            return retryreq
        else:
            stats.inc_value('retry/max_reached')
            logger.error("Gave up retrying %(request)s (failed %(retries)d times): %(reason)s",
                         {'request': request, 'retries': retries, 'reason': reason},
                         extra={'spider': spider})
```



## from scrapy.downloadermiddlewares.redirect import RedirectMiddleware

RedirectMiddleware继承自BaseRedirectMiddleware

```python
# 来自于BaseRedirectMiddleware
REDIRECT_ENABLED = True
REDIRECT_MAX_TIMES = 20  # uses Firefox default setting
REDIRECT_PRIORITY_ADJUST = +2


class BaseRedirectMiddleware:

    enabled_setting = 'REDIRECT_ENABLED'

    def __init__(self, settings):
        if not settings.getbool(self.enabled_setting):
            raise NotConfigured

        self.max_redirect_times = settings.getint('REDIRECT_MAX_TIMES')
        self.priority_adjust = settings.getint('REDIRECT_PRIORITY_ADJUST')

    @classmethod
    def from_crawler(cls, crawler):
        return cls(crawler.settings)

    def _redirect(self, redirected, request, spider, reason):
        ttl = request.meta.setdefault('redirect_ttl', self.max_redirect_times)
        redirects = request.meta.get('redirect_times', 0) + 1

        if ttl and redirects <= self.max_redirect_times:
            redirected.meta['redirect_times'] = redirects
            redirected.meta['redirect_ttl'] = ttl - 1
            redirected.meta['redirect_urls'] = request.meta.get('redirect_urls', []) + [request.url]
            redirected.meta['redirect_reasons'] = request.meta.get('redirect_reasons', []) + [reason]
            redirected.dont_filter = request.dont_filter
            redirected.priority = request.priority + self.priority_adjust
            logger.debug("Redirecting (%(reason)s) to %(redirected)s from %(request)s",
                         {'reason': reason, 'redirected': redirected, 'request': request},
                         extra={'spider': spider})
            return redirected
        else:
            logger.debug("Discarding %(request)s: max redirections reached",
                         {'request': request}, extra={'spider': spider})
            raise IgnoreRequest("max redirections reached")

    def _redirect_request_using_get(self, request, redirect_url):
        redirected = request.replace(url=redirect_url, method='GET', body='')
        redirected.headers.pop('Content-Type', None)
        redirected.headers.pop('Content-Length', None)
        return redirected

def process_response(self, request, response, spider):
    if (
        request.meta.get('dont_redirect', False)
        or response.status in getattr(spider, 'handle_httpstatus_list', [])
        or response.status in request.meta.get('handle_httpstatus_list', [])
        or request.meta.get('handle_httpstatus_all', False)
    ):
        return response

    allowed_status = (301, 302, 303, 307, 308)
    if 'Location' not in response.headers or response.status not in allowed_status:
        return response

    location = safe_url_string(response.headers['Location'])
    if response.headers['Location'].startswith(b'//'):
        request_scheme = urlparse(request.url).scheme
        location = request_scheme + '://' + location.lstrip('/')

    redirected_url = urljoin(request.url, location)
	# 注意这里，301,307,308状态码重定向的时候不改变原来的请求的方式
    if response.status in (301, 307, 308) or request.method == 'HEAD':
        redirected = request.replace(url=redirected_url)
        return self._redirect(redirected, request, spider, response.status)
	#  302, 303使用GET方式进行重定向
    redirected = self._redirect_request_using_get(request, redirected_url)
    return self._redirect(redirected, request, spider, response.status)
```

补充说明

- 301 Moved Permanently 的定义
301 状态码表明目标资源被永久的移动到了一个新的 URI，任何未来对这个资源的引用都应该使用新的 URI。

- 302 Found 的定义
302 状态码表示目标资源临时移动到了另一个 URI 上。由于重定向是临时发生的，所以客户端在之后的请求中还应该使用原本的 URI。
服务器会在响应 Header 的 Location 字段中放上这个不同的 URI。浏览器可以使用 Location 中的 URI 进行自动重定向。

- 303 See Other 的定义
303 状态码表示服务器要将浏览器重定向到另一个资源，这个资源的 URI 会被写在响应 Header 的 Location 字段。从语义上讲，重定向到的资源并不是你所请求的资源，而是对你所请求资源的一些描述。
303 常用于将 POST 请求重定向到 GET 请求，比如你上传了一份个人信息，服务器发回一个 303 响应，将你导向一个上传成功页面。

- 307 Temporary Redirect 的定义
307 的定义实际上和 302 是一致的，唯一的区别在于，307 状态码不允许浏览器将原本为 POST 的请求重定向到 GET 请求上

- 308 Permanent Redirect 的定义
308 的定义实际上和 301 是一致的，唯一的区别在于，308 状态码不允许浏览器将原本为 POST 的请求重定向到 GET 请求上

1×× Informational
100 Continue
101 Switching Protocols
102 Processing
2×× Success
200 OK
201 Created
202 Accepted
203 Non-authoritative Information
204 No Content
205 Reset Content
206 Partial Content
207 Multi-Status
208 Already Reported
226 IM Used
3×× Redirection
300 Multiple Choices
301 Moved Permanently
302 Found
303 See Other
304 Not Modified
305 Use Proxy
307 Temporary Redirect
308 Permanent Redirect
4×× Client Error
400 Bad Request
401 Unauthorized
402 Payment Required
403 Forbidden
404 Not Found
405 Method Not Allowed
406 Not Acceptable
407 Proxy Authentication Required
408 Request Timeout
409 Conflict
410 Gone
411 Length Required
412 Precondition Failed
413 Payload Too Large
414 Request-URI Too Long
415 Unsupported Media Type
416 Requested Range Not Satisfiable
417 Expectation Failed
418 I'm a teapot
421 Misdirected Request
422 Unprocessable Entity
423 Locked
424 Failed Dependency
426 Upgrade Required
428 Precondition Required
429 Too Many Requests
431 Request Header Fields Too Large
444 Connection Closed Without Response
451 Unavailable For Legal Reasons
499 Client Closed Request
5×× Server Error
500 Internal Server Error
501 Not Implemented
502 Bad Gateway
503 Service Unavailable
504 Gateway Timeout
505 HTTP Version Not Supported
506 Variant Also Negotiates
507 Insufficient Storage
508 Loop Detected
510 Not Extended
511 Network Authentication Required
599 Network Connect Timeout Error

## from scrapy.downloadermiddlewares.downloadtimeout import DownloadTimeoutMiddleware

