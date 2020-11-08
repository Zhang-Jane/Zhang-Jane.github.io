---
title: scrapy的运行方式
tags: scrapy
categories: scrapy
abbrlink: bf2ca3c2
date: 2020-11-08 12:41:57
---

## scrapy不同的运行方式
### CrawlerProcess
```python
custom_settings = {}  # 项目的配置文件
project_settings = get_project_settings()
settings = dict(project_settings.copy())
settings.update(custom_settings.get('settings'))
process = CrawlerProcess(settings)
process.crawl(Example2Spider)
process.start()
```
### CrawlerRunner
```python
configure_logging()
runner = CrawlerRunner()
@defer.inlineCallbacks
def crawl():
    yield runner.crawl(Example2Spider)
    # yield runner.crawl()
    reactor.stop()
# 调用crawl()
crawl()
reactor.run()
```
### cmd
```python
custom_settings = {}
project_settings = get_project_settings()
settings = dict(project_settings.copy())
settings.update(custom_settings)
execute(["scrapy", "crawl", "{}".format(name)], settings)
```
### custom_settings设置

### 多个spider自动运行
```python
process = CrawlerProcess(settings=get_project_settings())
for module_string in find_modules('demo_project.spiders'):
    # 通过模块名找到py文件
    module = import_string(module_string)
    # 拼接spider中的类名，比如demo
    class_string = module_string.split('.')[-1].capitalize() + 'Spider'
    print(f"正在处理的spider：-> {class_string}")
    # 通过反射拿到对应的类
    spider_class = getattr(module, class_string)
    # 开始运行所有的spider
    process.crawl(spider_class)
process.start()
```
### 多进程运行spider
```python
subpros = []
s = 'scrapy crawl {} >/dev/null 2>&1'.format(spider_name)
for _ in range(pools):
    subpro = subprocess.Popen(s, shell=True, stdout=None)
    subpros.append(subpro)
    time.sleep(2)
for por in subpros:
    por.wait()
```
具体可以参考:https://github.com/SummerWorm-Bullfrog/ScrapyTemplate