---
title: scrapy的执行细节
abbrlink: b9ddc6be
date: 2023-03-04 14:33:07
tags:
---
## 第一步运行命令
scrapy crawl xx:
执行到：\Lib\site-packages\scrapy\cmdline.py
调用def execute(argv=None, settings=None):
1. 初始化settings = get_project_settings()
2. 配置项目环境init_env：os.environ['SCRAPY_SETTINGS_MODULE'] = cfg.get('settings', project)
3. 初始化cmd.crawler_process = CrawlerProcess(settings)，一个进程中同时运行多个scrapy爬虫的类，获取cls_path = settings.get('SPIDER_LOADER_CLASS')，加载类site-packages\scrapy\spiderloader.py
```python
@implementer(ISpiderLoader)
class SpiderLoader:

    def __init__(self, settings):
        # 从配置文件SPIDER_MODULES获取存放爬虫类的路径
        self.spider_modules = settings.getlist('SPIDER_MODULES')
        # SPIDER_LOADER_WARN_ONLY：如果导入爬虫类失败，是否只发出警告
        self.warn_only = settings.getbool('SPIDER_LOADER_WARN_ONLY')
        self._spiders = {}
        self._found = defaultdict(list)
        # 调用_load_all_spiders加载所有爬虫类
        self._load_all_spiders()
        
    def _load_spiders(self, module):
        for spcls in iter_spider_classes(module):
            # 爬虫的模块名和类名
            self._found[spcls.name].append((module.__name__, spcls.__name__))
            # 组装成{spider_name: spider_cls}的字典
            self._spiders[spcls.name] = spcls
            
    def _load_all_spiders(self):
        for name in self.spider_modules:
            try:
                # 导入所有的爬虫
                for module in walk_modules(name):
                    self._load_spiders(module)
            except ImportError:
                # 导入失败
                if self.warn_only:
                    warnings.warn(
                        f"\n{traceback.format_exc()}Could not load spiders "
                        f"from module '{name}'. "
                        "See above traceback for details.",
                        category=RuntimeWarning,
                    )
                else:
                    raise
		# 检查是否重名
        self._check_name_duplicates()
```
4. 运行_run_print_help(parser, _run_command, cmd, args, opts)
执行\scrapy\crawler.py
```python
    @defer.inlineCallbacks
    def crawl(self, *args, **kwargs):
        if self.crawling:
            raise RuntimeError("Crawling already taking place")
        self.crawling = True

        try:
            self.spider = self._create_spider(*args, **kwargs)
            self.engine = self._create_engine()
            start_requests = iter(self.spider.start_requests())
            yield self.engine.open_spider(self.spider, start_requests)
            yield defer.maybeDeferred(self.engine.start)
        except Exception:
            self.crawling = False
            if self.engine is not None:
                yield self.engine.close()
            raise
```
twisted启动：
```python
class CrawlerProcess(CrawlerRunner):
    def start(self, stop_after_crawl=True):
        # 通过'REACTOR_THREADPOOL_MAXSIZE'调整线程池，通过`DNSCACHE_ENABLED`启用内存缓存DNS
        # 通过'DNSCACHE_SIZE'设置缓存大小
        # 在默认情况下stop_after_crawl默认为True，reactor会在所有爬虫结束后停止
        from twisted.internet import reactor
        # 这里的多线程是调用twisted实现的
        if stop_after_crawl:
            d = self.join()
            # Don't start the reactor if the deferreds are already fired
            if d.called:
                return
            d.addBoth(self._stop_reactor)

        resolver_class = load_object(self.settings["DNS_RESOLVER"])
        resolver = create_instance(resolver_class, self.settings, self, reactor=reactor)
        resolver.install_on_reactor()
        # 配置线程池
        tp = reactor.getThreadPool()
        tp.adjustPoolsize(maxthreads=self.settings.getint('REACTOR_THREADPOOL_MAXSIZE'))
        reactor.addSystemEventTrigger('before', 'shutdown', self.stop)
        # 调用reactor的run方法开始执行
        reactor.run(installSignalHandlers=False)  # 阻塞调用

```

## Scraper
控制爬虫与管道之间的数据传输
```python
class Scraper:

    def __init__(self, crawler):
        self.slot = None
        # 初始化spidermiddleware爬虫中间件
        self.spidermw = SpiderMiddlewareManager.from_crawler(crawler)
        # 从配置文件中获取ITEM_PROCESSOR处理器类
        # 默认的ITEM_PROCESSOR = 'scrapy.pipelines.ItemPipelineManager'
        itemproc_cls = load_object(crawler.settings['ITEM_PROCESSOR'])
        # 初始化ITEM_PROCESSOR对象
        self.itemproc = itemproc_cls.from_crawler(crawler)
        # 从配置文件中获取同时处理item的个数，默认为100
        self.concurrent_items = crawler.settings.getint('CONCURRENT_ITEMS')
        self.crawler = crawler
        self.signals = crawler.signals
        self.logformatter = crawler.logformatter

```