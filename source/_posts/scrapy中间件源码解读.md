---
title: scrapy中间件源码解读
tags: scrapy
abbrlink: 5ad14034
date: 2021-02-16 15:21:56
---
## 源码解读

### class MiddlewareManager

E:\python3.7.6\Lib\site-packages\scrapy\middleware.py

### class Spider(MiddlewareManager)

E:\python3.7.6\Lib\site-packages\scrapy\core\spidermw.py

### class Download(MiddlewareManager)

E:\python3.7.6\Lib\site-packages\scrapy\core\downloader\middleware.py

### class Extensions(MiddlewareManager)

E:\python3.7.6\Lib\site-packages\scrapy\extension.py

### ItemPipelineManager(MiddlewareManager)

E:\python3.7.6\Lib\site-packages\scrapy\pipelines\__init__.py

## 关于中间件如何调用

```python
def load_object(path):
    """Load an object given its absolute object path, and return it.

    The object can be the import path of a class, function, variable or an
    instance, e.g. 'scrapy.downloadermiddlewares.redirect.RedirectMiddleware'.

    If ``path`` is not a string, but is a callable object, such as a class or
    a function, then return it as is.
    """

    if not isinstance(path, str):
        if callable(path):
            return path
        else:
            raise TypeError("Unexpected argument type, expected string "
                            "or object, got: %s" % type(path))

    try:
        dot = path.rindex('.')
    except ValueError:
        raise ValueError(f"Error loading object '{path}': not a full path")

    module, name = path[:dot], path[dot + 1:]
    mod = import_module(module)

    try:
        obj = getattr(mod, name)
    except AttributeError:
        raise NameError(f"Module '{module}' doesn't define any object named '{name}'")

    return obj
```


```python
import importlib

# 绝对导入
a = importlib.import_module("a")
a.show()
# show A

# 相对导入
b = importlib.import_module("b", "python_demo")
b.show()
# show B
```


```python
def create_instance(objcls, settings, crawler, *args, **kwargs):
    """Construct a class instance using its ``from_crawler`` or
    ``from_settings`` constructors, if available.

    At least one of ``settings`` and ``crawler`` needs to be different from
    ``None``. If ``settings `` is ``None``, ``crawler.settings`` will be used.
    If ``crawler`` is ``None``, only the ``from_settings`` constructor will be
    tried.

    ``*args`` and ``**kwargs`` are forwarded to the constructors.

    Raises ``ValueError`` if both ``settings`` and ``crawler`` are ``None``.

    .. versionchanged:: 2.2
       Raises ``TypeError`` if the resulting instance is ``None`` (e.g. if an
       extension has not been implemented correctly).
    """
    if settings is None:
        if crawler is None:
            raise ValueError("Specify at least one of settings and crawler.")
        settings = crawler.settings
    if crawler and hasattr(objcls, 'from_crawler'):
        instance = objcls.from_crawler(crawler, *args, **kwargs)
        method_name = 'from_crawler'
    elif hasattr(objcls, 'from_settings'):
        instance = objcls.from_settings(settings, *args, **kwargs)
        method_name = 'from_settings'
    else:
        instance = objcls(*args, **kwargs)
        method_name = '__new__'
    if instance is None:
        raise TypeError(f"{objcls.__qualname__}.{method_name} returned None")
    return instance

class MiddlewareManager:
    """Base class for implementing middleware managers"""

    component_name = 'foo middleware'

    def __init__(self, *middlewares):
        self.middlewares = middlewares
        self.methods = defaultdict(deque)
        for mw in middlewares:
            self._add_middleware(mw)

    @classmethod
    def _get_mwlist_from_settings(cls, settings):
        raise NotImplementedError

    @classmethod
    def from_settings(cls, settings, crawler=None):
        mwlist = cls._get_mwlist_from_settings(settings)
        middlewares = []
        enabled = []
        for clspath in mwlist:
            try:
                mwcls = load_object(clspath)  # 加载中间件类
                mw = create_instance(mwcls, settings, crawler) # 创建中间件实例
                middlewares.append(mw)
                enabled.append(clspath)
            except NotConfigured as e:
                if e.args:
                    clsname = clspath.split('.')[-1]
                    logger.warning("Disabled %(clsname)s: %(eargs)s",
                                   {'clsname': clsname, 'eargs': e.args[0]},
                                   extra={'crawler': crawler})

        logger.info("Enabled %(componentname)ss:\n%(enabledlist)s",
                    {'componentname': cls.component_name,
                     'enabledlist': pprint.pformat(enabled)},
                    extra={'crawler': crawler})
        return cls(*middlewares)

    @classmethod
    def from_crawler(cls, crawler):
        return cls.from_settings(crawler.settings, crawler)

    def _add_middleware(self, mw):
        if hasattr(mw, 'open_spider'):
            self.methods['open_spider'].append(mw.open_spider)
        if hasattr(mw, 'close_spider'):
            self.methods['close_spider'].appendleft(mw.close_spider)

    def _process_parallel(self, methodname, obj, *args):
        return process_parallel(self.methods[methodname], obj, *args)

    def _process_chain(self, methodname, obj, *args):
        return process_chain(self.methods[methodname], obj, *args)

    def _process_chain_both(self, cb_methodname, eb_methodname, obj, *args):
        return process_chain_both(self.methods[cb_methodname],
                                  self.methods[eb_methodname], obj, *args)

    def open_spider(self, spider):
        return self._process_parallel('open_spider', spider)

    def close_spider(self, spider):
        return self._process_parallel('close_spider', spider)
    
    
class SpiderMiddlewareManager(MiddlewareManager):

    component_name = 'spider middleware'

    @classmethod
    def _get_mwlist_from_settings(cls, settings):
        return build_component_list(settings.getwithbase('SPIDER_MIDDLEWARES'))

    def _add_middleware(self, mw):
        super()._add_middleware(mw)
        if hasattr(mw, 'process_spider_input'):
            self.methods['process_spider_input'].append(mw.process_spider_input)
        if hasattr(mw, 'process_start_requests'):
            self.methods['process_start_requests'].appendleft(mw.process_start_requests)
        process_spider_output = getattr(mw, 'process_spider_output', None)
        self.methods['process_spider_output'].appendleft(process_spider_output)
        process_spider_exception = getattr(mw, 'process_spider_exception', None)
        self.methods['process_spider_exception'].appendleft(process_spider_exception)

    def scrape_response(self, scrape_func, response, request, spider):

        def process_spider_input(response):
            for method in self.methods['process_spider_input']:
                try:
                    result = method(response=response, spider=spider)
                    if result is not None:
                        msg = (f"Middleware {_fname(method)} must return None "
                               f"or raise an exception, got {type(result)}")
                        raise _InvalidOutput(msg)
                except _InvalidOutput:
                    raise
                except Exception:
                    return scrape_func(Failure(), request, spider)
            return scrape_func(response, request, spider)

        def _evaluate_iterable(iterable, exception_processor_index, recover_to):
            try:
                for r in iterable:
                    yield r
            except Exception as ex:
                exception_result = process_spider_exception(Failure(ex), exception_processor_index)
                if isinstance(exception_result, Failure):
                    raise
                recover_to.extend(exception_result)
                
class DownloaderMiddlewareManager(MiddlewareManager):

    component_name = 'downloader middleware'

    @classmethod
    def _get_mwlist_from_settings(cls, settings):
        return build_component_list(
            settings.getwithbase('DOWNLOADER_MIDDLEWARES'))

    def _add_middleware(self, mw):
        if hasattr(mw, 'process_request'):
            self.methods['process_request'].append(mw.process_request)
        if hasattr(mw, 'process_response'):
            self.methods['process_response'].appendleft(mw.process_response)
        if hasattr(mw, 'process_exception'):
            self.methods['process_exception'].appendleft(mw.process_exception)

    def download(self, download_func, request, spider):
        @defer.inlineCallbacks
        def process_request(request):
            for method in self.methods['process_request']:
                response = yield deferred_from_coro(method(request=request, spider=spider))
                if response is not None and not isinstance(response, (Response, Request)):
                    raise _InvalidOutput(
                        f"Middleware {method.__self__.__class__.__name__}"
                        ".process_request must return None, Response or "
                        f"Request, got {response.__class__.__name__}"
                    )
                if response:
                    return response
            return (yield download_func(request=request, spider=spider))

        @defer.inlineCallbacks
        def process_response(response):
            if response is None:
                raise TypeError("Received None in process_response")
            elif isinstance(response, Request):
                return response

            for method in self.methods['process_response']:
                response = yield deferred_from_coro(method(request=request, response=response, spider=spider))
                if not isinstance(response, (Response, Request)):
                    raise _InvalidOutput(
                        f"Middleware {method.__self__.__class__.__name__}"
                        ".process_response must return Response or Request, "
                        f"got {type(response)}"
                    )
                if isinstance(response, Request):
                    return response
            return response

        @defer.inlineCallbacks
        def process_exception(failure):
            exception = failure.value
            for method in self.methods['process_exception']:
                response = yield deferred_from_coro(method(request=request, exception=exception, spider=spider))
                if response is not None and not isinstance(response, (Response, Request)):
                    raise _InvalidOutput(
                        f"Middleware {method.__self__.__class__.__name__}"
                        ".process_exception must return None, Response or "
                        f"Request, got {type(response)}"
                    )
                if response:
                    return response
            return failure

        deferred = mustbe_deferred(process_request, request)
        deferred.addErrback(process_exception)
        deferred.addCallback(process_response)
        return deferred
```


## 关于中间件源码解读，转换过来差不多这个意思

```python
from operator import itemgetter


# def without_none_values(iterable):
#     """Return a copy of ``iterable`` with all ``None`` entries removed.
#
#     If ``iterable`` is a mapping, return a dictionary where all pairs that have
#     value ``None`` have been removed.
#     """
#     try:
#         return {k: v for k, v in iterable.items() if v is not None}
#     except AttributeError:
#         return type(iterable)((v for v in iterable if v is not None))
#
# def build_component_list(compdict, custom=None, convert=update_classpath):
#     """Compose a component list from a { class: order } dictionary."""
#
#     def _check_components(complist):
#         if len({convert(c) for c in complist}) != len(complist):
#             raise ValueError(f'Some paths in {complist!r} convert to the same object, '
#                              'please update your settings')
#
#     def _map_keys(compdict):
#         if isinstance(compdict, BaseSettings):
#             compbs = BaseSettings()
#             for k, v in compdict.items():
#                 prio = compdict.getpriority(k)
#                 if compbs.getpriority(convert(k)) == prio:
#                     raise ValueError(f'Some paths in {list(compdict.keys())!r} '
#                                      'convert to the same '
#                                      'object, please update your settings'
#                                      )
#                 else:
#                     compbs.set(convert(k), v, priority=prio)
#             return compbs
#         else:
#             _check_components(compdict)
#             return {convert(k): v for k, v in compdict.items()}
#
#     def _validate_values(compdict):
#         """Fail if a value in the components dict is not a real number or None."""
#         for name, value in compdict.items():
#             if value is not None and not isinstance(value, numbers.Real):
#                 raise ValueError(f'Invalid value {value} for component {name}, '
#                                  'please provide a real number or None instead')
#
#     # BEGIN Backward compatibility for old (base, custom) call signature
#     if isinstance(custom, (list, tuple)):
#         _check_components(custom)
#         return type(custom)(convert(c) for c in custom)
#
#     if custom is not None:
#         compdict.update(custom)
#     # END Backward compatibility
#
#     _validate_values(compdict)
#     compdict = without_none_values(_map_keys(compdict))
#     """
#     compdict = {"a": 1, "b": 2}
#     [k for k, v in sorted(compdict.items(), key=itemgetter(1))] # 排序从小到大
#     """
#     return [k for k, v in sorted(compdict.items(), key=itemgetter(1))]

class MiddlewareManager:
    """Base class for implementing middleware managers"""

    component_name = 'foo middleware'

    def __init__(self, middlewares):
        self.middlewares = middlewares

    @classmethod
    def _get_mwlist_from_settings(cls, settings):
        """
        读取配置文件里面的中间件
        :param settings:
        :return:
        """

        # def getwithbase(self, name):
        #     """Get a composition of a dictionary-like setting and its `_BASE`
        #     counterpart.
        #
        #     :param name: name of the dictionary-like setting
        #     :type name: str
        #     """
        #     compbs = BaseSettings()
        #     compbs.update(self[name + '_BASE'])
        #     compbs.update(self[name])
        #     return compbs

        # return build_component_list(settings.getwithbase('SPIDER_MIDDLEWARES')) # 原本的返回
        return {"a": 1, "b": 2}

    @classmethod
    def from_settings(cls, settings, crawler=None):
        middlewares = []
        mwlist = cls._get_mwlist_from_settings(settings)
        for k, v in mwlist.items():
            middlewares.append(k)
        return cls(middlewares)

    @classmethod
    def from_crawler(cls, crawler):
        """
        进行中间件的初始化
        :param crawler:
        :return:
        """
        return cls.from_settings(crawler.settings, crawler)


class Crawl(object):
    settings = {"c": 1, "d": 2}


if __name__ == '__main__':
    crawler = Crawl()
    a = MiddlewareManager.from_crawler(crawler)
    print(a.middlewares)
```

## 关于读取settings异常处理

```python
from scrapy.exceptions import NotConfigured, IgnoreRequest


class BaseRedirectMiddleware:

    enabled_setting = 'REDIRECT_ENABLED'

    def __init__(self, settings):
        if not settings.get(self.enabled_setting, False):
            raise NotConfigured


class RedirectMiddleware(BaseRedirectMiddleware):
    print(1111)


def mye(level):
    if level < 1:
        raise Exception("Invalid level!")
        # 触发异常后，后面的代码就不会再执行
try:
    mye(0)  # 触发异常
except Exception as err:
    print(1, err.args)
else:
    print(2)


if __name__ == '__main__':
    try:
        BaseRedirectMiddleware({"REDIRECT_ENABLED": False})
    except NotConfigured as e:
        print(e)
        if e.args:
            print(2222)
```




## 代码阅读

1. 所有中间件包括Extension以及ItemPipeline都是继承MiddlewareManager类

2. 所有的继承必须实现_get_mwlist_from_settings方法，这个方法调用getwithbase，合并base中间件，按照数值从小到大排序。

3. 初始化的时候会自动调用方法_add_middleware，这个方法调用了中间件几个关键的函数，就是每次默认中间给的例子中实现的几个方法，比如process_request(self, request, spider):

    ```python
    for mw in middlewares:
                self._add_middleware(mw)
    ```

4. 关于中间件方法是否必须实现，官方的提示如下，代码_add_middleware中也能看到，不是必须的。
    ```
    # Not all methods need to be defined. If a method is not defined,
    # scrapy acts as if the downloader middleware does not modify the
    # passed objects.
    ```

5. 注意到，源码里面定义了一个双向的队列，methods = defaultdict(deque)，append表示向右添加，left表示向左添加，以下载中间为例子：

    ```python
       def _add_middleware(self, mw):
                if hasattr(mw, 'process_request'):
                    self.methods['process_request'].append(mw.process_request)
                if hasattr(mw, 'process_response'):
                    self.methods['process_response'].appendleft(mw.process_response)
                if hasattr(mw, 'process_exception'):
                    self.methods['process_exception'].appendleft(mw.process_exception)
      每个中间件的process_response和process_exception方法，后来的却先调用
    ```

6. 关于下载中间件：

    1. 下载中间件位于引擎和下载器之间，官方给的提示已经够清晰了

        1. ```
                def process_request(self, request, spider):
                    # Called for each request that goes through the downloader
                    # middleware.
            
                    # Must either:
                    # - return None: continue processing this request
                    # - or return a Response object
                    # - or return a Request object
                    # - or raise IgnoreRequest: process_exception() methods of
                    #   installed downloader middleware will be called
                    return None
            
                def process_response(self, request, response, spider):
                    # Called with the response returned from the downloader.
            
                    # Must either;
                    # - return a Response object
                    # - return a Request object
                    # - or raise IgnoreRequest
                    return response
            
                def process_exception(self, request, exception, spider):
                    # Called when a download handler or a process_request()
                    # (from other downloader middleware) raises an exception.
            
                    # Must either:
                    # - return None: continue processing this exception
                    # - return a Response object: stops process_exception() chain
                    # - return a Request object: stops process_exception() chain
                    pass
            ```

7. 关于爬虫中间件，用的比较少，位于下载器和spider之间