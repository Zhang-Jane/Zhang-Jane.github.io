---
title: scrapy的CrawlSpider类
tags: scrapy
categories: scrapy
cover: 'https://blog-1252858782.cos.ap-beijing.myqcloud.com/Scrapy.png'
abbrlink: 6ab2803d
date: 2020-10-12 22:00:00
top_img:
---

## scrapy的CrawlSpider类

CrawlSpider：scrapy.spiders.CrawlSpider，规则爬虫，提供了一个新的属性 rules，该属性是一个包含一个或多个 Rule 对象的集合，每个 Rule 对爬取网站的动作定义了特定的规则。

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
from scrapy.spiders.crawl import CrawlSpider # 或者from scrapy.spiders import CrawlSpider，因为在__init__.py文件中以及帮你初始化导入了

class TemplateSpidersSpider(CrawlSpider):
    name = 'template_spiders'
    allowed_domains = ['*']
    start_urls = ['http://*/']
    
    rules = ()

    def parse(self, response):
        pass

```

### `crawl`：CrawlSpider类

```python
def _get_method(method, spider):
    if callable(method):
        return method
    elif isinstance(method, str):
        return getattr(spider, method, None)


_default_link_extractor = LinkExtractor()


class Rule:

    def __init__(
        self,
        link_extractor=None,
        callback=None,
        cb_kwargs=None,
        follow=None,
        process_links=None,
        process_request=None,
        errback=None,
    ):
        self.link_extractor = link_extractor or _default_link_extractor
        self.callback = callback
        self.errback = errback
        self.cb_kwargs = cb_kwargs or {}
        self.process_links = process_links or _identity
        self.process_request = process_request or _identity_process_request
        self.follow = follow if follow is not None else not callback

    def _compile(self, spider):
        self.callback = _get_method(self.callback, spider)
        self.errback = _get_method(self.errback, spider)
        self.process_links = _get_method(self.process_links, spider)
        self.process_request = _get_method(self.process_request, spider)
        
class CrawlSpider(Spider):

    rules: Sequence[Rule] = ()

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self._compile_rules()

    def _parse(self, response, **kwargs):
        return self._parse_response(
            response=response,
            callback=self.parse_start_url,
            cb_kwargs=kwargs,
            follow=True,
        )

    def parse_start_url(self, response, **kwargs):
        return []

    def process_results(self, response, results):
        return results

    def _build_request(self, rule_index, link):
        return Request(
            url=link.url,
            callback=self._callback,
            errback=self._errback,
            meta=dict(rule=rule_index, link_text=link.text),
        )

    def _requests_to_follow(self, response):
        if not isinstance(response, HtmlResponse):
            return
        seen = set()
        for rule_index, rule in enumerate(self._rules):
            links = [lnk for lnk in rule.link_extractor.extract_links(response)
                     if lnk not in seen]
            for link in rule.process_links(links):
                seen.add(link)
                request = self._build_request(rule_index, link)
                yield rule.process_request(request, response)

    def _callback(self, response):
        rule = self._rules[response.meta['rule']]
        return self._parse_response(response, rule.callback, rule.cb_kwargs, rule.follow)

    def _errback(self, failure):
        rule = self._rules[failure.request.meta['rule']]
        return self._handle_failure(failure, rule.errback)

    def _parse_response(self, response, callback, cb_kwargs, follow=True):
        if callback:
            cb_res = callback(response, **cb_kwargs) or ()
            cb_res = self.process_results(response, cb_res)
            for request_or_item in iterate_spider_output(cb_res):
                yield request_or_item

        if follow and self._follow_links:
            for request_or_item in self._requests_to_follow(response):
                yield request_or_item

    def _handle_failure(self, failure, errback):
        if errback:
            results = errback(failure) or ()
            for request_or_item in iterate_spider_output(results):
                yield request_or_item

    def _compile_rules(self):
        self._rules = []
        for rule in self.rules:
            self._rules.append(copy.copy(rule))
            self._rules[-1]._compile(self)

    @classmethod
    def from_crawler(cls, crawler, *args, **kwargs):
        spider = super().from_crawler(crawler, *args, **kwargs)
        spider._follow_links = crawler.settings.getbool('CRAWLSPIDER_FOLLOW_LINKS', True)
        return spider

```

- rules: Sequence[Rule] = () # 提取规则必须是Rule类对象
- 当实例初始化的时候会自动调用self._compile_rules()，然后在Rule类中调用__compile(self)，**注意self代表的是类的实例**。最后调用各自的方法。
- 重写了父类的_parse，然后调用self._parse_response