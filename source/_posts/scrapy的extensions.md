---
title: scrapy的extensions
tags: scrapy的extensions
categories: scrapy
abbrlink: cd590e67
date: 2021-02-16 13:29:48
---
## EXTENSIONS

EXTENSIONS_BASE

**注意：关于scrapy爬虫extensions 执行顺序的问题**

- 查看默认的爬虫中间件scrapy settings --get EXTENSIONS_BASE

    ```
    {"scrapy.extensions.corestats.CoreStats": 0,
    "scrapy.extensions.telnet.TelnetConsole": 0, 
    "scrapy.extensions.memusage.MemoryUsage": 0, 
    "scrapy.extensions.memdebug.MemoryDebugger": 0,
    "scrapy.extensions.closespider.CloseSpider": 0, 
    "scrapy.extensions.feedexport.FeedExporter": 0, 
    "scrapy.extensions.logstats.LogStats": 0, 
    "scrapy.extensions.spiderstate.SpiderState": 0, 
    "scrapy.extensions.throttle.AutoThrottle": 0
    }
    ```

    - EXTENSIONS 设置是一个 dict，其中键是扩展路径，它们的值是定义扩展加载顺序的顺序。EXTENSIONS 设置与 Scrapy 中定义的 **EXTENSIONS_BASE** 设置合并(无意被重写) ，然后按顺序排序，以获得最终的已启用扩展的排序列表。

    - 由于扩展通常不相互依赖，因此它们的加载顺序在大多数情况下是不相关的。这就是 **EXTENSIONS_BASE** 设置以相同顺序(0)定义所有扩展的原因。但是，如果您需要添加一个依赖于已经加载的其他扩展的扩展，则可以利用这个特性

- 需要重点关注的几个默认extensions
    - from scrapy.extensions.corestats import CoreStats
    - from scrapy.extensions.logstats import LogStats
    - from scrapy.extensions.throttle import AutoThrottle

## 关于signal

- scrapy.crawler.signals中定义了scrapy的各种状态

- E:\python3.7.6\Lib\site-packages\scrapy\crawler.py，中初始化self.signals = SignalManager(self)

- E:\python3.7.6\Lib\site-packages\scrapy\signalmanager.py（SignalManager），基于from pydispatch import dispatcher这个模块

    ```PYTHON
    import logging
    
    from twisted.internet.defer import DeferredList, Deferred
    from twisted.python.failure import Failure
    
    from pydispatch.dispatcher import Anonymous, Any, disconnect, getAllReceivers, liveReceivers
    from pydispatch.robustapply import robustApply
    
    from scrapy.exceptions import StopDownload
    from scrapy.utils.defer import maybeDeferred_coro
    from scrapy.utils.log import failure_to_exc_info
    
    def send_catch_log(signal=Any, sender=Anonymous, *arguments, **named):
        """Like pydispatcher.robust.sendRobust but it also logs errors and returns
        Failures instead of exceptions.
        """
        dont_log = (named.pop('dont_log', _IgnoredException), StopDownload)
        spider = named.get('spider', None)
        responses = []
        # getAllReceivers给定sender和signal，获取所有的receiver
        for receiver in liveReceivers(getAllReceivers(sender, signal)):
            try:
                # 调用receiver
                response = robustApply(receiver, signal=signal, sender=sender, *arguments, **named)
                if isinstance(response, Deferred):
                    logger.error("Cannot return deferreds from signal handler: %(receiver)s",
                                    {'receiver': receiver}, extra={'spider': spider})
            except dont_log:
                result = Failure()
            except Exception:
                result = Failure()
                logger.error("Error caught on signal handler: %(receiver)s",
                                {'receiver': receiver},
                                exc_info=True, extra={'spider': spider})
            else:
                result = response
            responses.append((receiver, result))
        return responses
    
    
    
    from pydispatch import dispatcher
    from scrapy.utils import signal as _signal
    
    
    class SignalManager:
    
        def __init__(self, sender=dispatcher.Anonymous):
            self.sender = sender
    
        def connect(self, receiver, signal, **kwargs):
            """
            Connect a receiver function to a signal.
    
            The signal can be any object, although Scrapy comes with some
            predefined signals that are documented in the :ref:`topics-signals`
            section.
    
            :param receiver: the function to be connected
            :type receiver: collections.abc.Callable
    
            :param signal: the signal to connect to
            :type signal: object
            """
            kwargs.setdefault('sender', self.sender)
            return dispatcher.connect(receiver, signal, **kwargs)
    
        def disconnect(self, receiver, signal, **kwargs):
            """
            Disconnect a receiver function from a signal. This has the
            opposite effect of the :meth:`connect` method, and the arguments
            are the same.
            """
            kwargs.setdefault('sender', self.sender)
            return dispatcher.disconnect(receiver, signal, **kwargs)
    
        def send_catch_log(self, signal, **kwargs):
            """
            Send a signal, catch exceptions and log them.
    
            The keyword arguments are passed to the signal handlers (connected
            through the :meth:`connect` method).
            """
            kwargs.setdefault('sender', self.sender)
            return _signal.send_catch_log(signal, **kwargs)
    
        def send_catch_log_deferred(self, signal, **kwargs):
            """
            Like :meth:`send_catch_log` but supports returning
            :class:`~twisted.internet.defer.Deferred` objects from signal handlers.
    
            Returns a Deferred that gets fired once all signal handlers
            deferreds were fired. Send a signal, catch exceptions and log them.
    
            The keyword arguments are passed to the signal handlers (connected
            through the :meth:`connect` method).
            """
            kwargs.setdefault('sender', self.sender)
            return _signal.send_catch_log_deferred(signal, **kwargs)
    
        def disconnect_all(self, signal, **kwargs):
            """
            Disconnect all receivers from the given signal.
    
            :param signal: the signal to disconnect from
            :type signal: object
            """
            kwargs.setdefault('sender', self.sender)
            return _signal.disconnect_all(signal, **kwargs)
    
    ```


- 例子：

    ```python
    from pydispatch import dispatcher
    from settings import TASK_END_SIGNAL, TASK_START_SIGNAL
    
    
    class TaskSignal(object):
        def task_start(self, app_task):
            dispatcher.send(
                signal=TASK_START_SIGNAL, sender=app_task
            )
            return app_task
    
        def task_close(self, app_task):
            dispatcher.send(
                signal=TASK_END_SIGNAL, sender=app_task
            )
            return app_task
    
    
    def _start_spider(sender, **kwargs):
        print(sender, kwargs)
        print("任务开始")
    
    
    def _finish_spider(sender, **kwargs):
        print(sender, kwargs)
        print("任务结束")
    
    
    dispatcher.connect(
        receiver=_start_spider,
        signal=TASK_START_SIGNAL,
        sender=dispatcher.Any
    )
    
    
    dispatcher.connect(
        receiver=_finish_spider,
        signal=TASK_END_SIGNAL,
        sender=dispatcher.Any
    )
    
    if __name__ == '__main__':
        s = {"task": "demo", "name": "xx"},
        ts = TaskSignal()
        ts.task_start(s)
    ```

        

## 关于scrapy的爬虫状态统计CoreStats

```python
class CoreStats:

    def __init__(self, stats):
        self.stats = stats
        self.start_time = None

    @classmethod
    def from_crawler(cls, crawler):
        # 默认的STATS_CLASS = 'scrapy.statscollectors.MemoryStatsCollector'(继承自StatsCollector)
        # self.stats = load_object(self.settings['STATS_CLASS'])(self)
        o = cls(crawler.stats)
         # 注册方法，当爬虫启动的时候
        crawler.signals.connect(o.spider_opened, signal=signals.spider_opened)
        # 注册方法，当爬虫关闭的时候
        crawler.signals.connect(o.spider_closed, signal=signals.spider_closed)
        # 注册方法，当pipieline处理完item完毕的时候
        crawler.signals.connect(o.item_scraped, signal=signals.item_scraped)
        crawler.signals.connect(o.item_dropped, signal=signals.item_dropped)
        crawler.signals.connect(o.response_received, signal=signals.response_received)
        return o

    def spider_opened(self, spider):
        self.start_time = datetime.utcnow()
        self.stats.set_value('start_time', self.start_time, spider=spider)

    def spider_closed(self, spider, reason):
        finish_time = datetime.utcnow()
        elapsed_time = finish_time - self.start_time
        elapsed_time_seconds = elapsed_time.total_seconds()
        self.stats.set_value('elapsed_time_seconds', elapsed_time_seconds, spider=spider)
        self.stats.set_value('finish_time', finish_time, spider=spider)
        self.stats.set_value('finish_reason', reason, spider=spider)

    def item_scraped(self, item, spider):
        self.stats.inc_value('item_scraped_count', spider=spider)

    def response_received(self, spider):
        """
		E:\python3.7.6\Lib\site-packages\scrapy\core\engine.py
    def _download(self, request, spider):
        slot = self.slot
        slot.add_request(request)

        def _on_success(response):
            if not isinstance(response, (Response, Request)):
                raise TypeError(
                    "Incorrect type: expected Response or Request, got "
                    f"{type(response)}: {response!r}"
                )
            if isinstance(response, Response):
                if response.request is None:
                    response.request = request
                logkws = self.logformatter.crawled(response.request, response, spider)
                if logkws is not None:
                    logger.log(*logformatter_adapter(logkws), extra={'spider': spider})
                self.signals.send_catch_log(
                    signal=signals.response_received, # 这里
                    response=response,
                    request=response.request,
                    spider=spider,
                )
            return response

        def _on_complete(_):
            slot.nextcall.schedule()
            return _

        dwld = self.downloader.fetch(request, spider)
        dwld.addCallbacks(_on_success)
        dwld.addBoth(_on_complete)
        return dwld
        """
        self.stats.inc_value('response_received_count', spider=spider)

    def item_dropped(self, item, spider, exception):
        reason = exception.__class__.__name__
        self.stats.inc_value('item_dropped_count', spider=spider)
        self.stats.inc_value(f'item_dropped_reasons_count/{reason}', spider=spider)
```

## 关于scrapy的爬虫状态统计LogStats

```PYTHON
class LogStats:
    """Log basic scraping stats periodically"""

    def __init__(self, stats, interval=60.0):
        self.stats = stats
        self.interval = interval # 爬虫状态间隔时间，一般日志INFO会输出
        self.multiplier = 60.0 / self.interval
        self.task = None

    @classmethod
    def from_crawler(cls, crawler):
        interval = crawler.settings.getfloat('LOGSTATS_INTERVAL')
        if not interval:
            raise NotConfigured
        o = cls(crawler.stats, interval)
        crawler.signals.connect(o.spider_opened, signal=signals.spider_opened)
        crawler.signals.connect(o.spider_closed, signal=signals.spider_closed)
        return o

    def spider_opened(self, spider):
        self.pagesprev = 0
        self.itemsprev = 0

        self.task = task.LoopingCall(self.log, spider)
        self.task.start(self.interval)

    def log(self, spider):
        items = self.stats.get_value('item_scraped_count', 0)
        pages = self.stats.get_value('response_received_count', 0)
        irate = (items - self.itemsprev) * self.multiplier
        prate = (pages - self.pagesprev) * self.multiplier
        self.pagesprev, self.itemsprev = pages, items
        """
        日志里面的经常出现Crawled pages多少，这里page指的是response_received_count，
        response_received_count看源码指的是请求成功的个数，这个成功不是http状态码的200，
        而是程序成功调用的成功，有异常就不是成功
        """
        
        msg = ("Crawled %(pages)d pages (at %(pagerate)d pages/min), "
               "scraped %(items)d items (at %(itemrate)d items/min)")
        log_args = {'pages': pages, 'pagerate': prate,
                    'items': items, 'itemrate': irate}
        logger.info(msg, log_args, extra={'spider': spider})

    def spider_closed(self, spider, reason):
        if self.task and self.task.running:
            self.task.stop()
```



