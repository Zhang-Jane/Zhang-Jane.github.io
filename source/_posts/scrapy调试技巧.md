---
title: scrapy调试技巧
tags: scrapy
categories: scrapy
abbrlink: d9d98b82
date: 2021-02-16 15:16:01
---

## scrapy fetch

```bash
scrapy fetch https://segmentfault.com/a/1190000017087999
scrapy fetch https://segmentfault.com/a/1190000017087999 --nolog --headers
```

## scrapy shell

- 带请求头

- ```bash
    scrapy shell -s USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0" https://www.zhihu.com/question/285908404
```

- ```
    $ scrapy shell
    >>> from scrapy import Request
    >>> req = Request('yoururl.com', headers={"header1":"value1"})
    >>> fetch(req)
```

- ```
    # 指定请求目标的 URL 链接
    url = ''
    # 自定义 Headers 请求头(一般建议在调试时使用自定义 UA，以绕过最基础的 User-Agent 检测)
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'}
    # 构造需要附带的 Cookies 字典
    cookies = {"key_1": "value_1", "key_2": "value_2", "key_3": "value_3"}
    # 构造 Request 请求对象
    req = scrapy.Request(url, cookies=cookies, headers=headers)
    # 发起 Request 请求
    fetch(req)
    # 在系统默认浏览器查看请求的页面（主要为了检查是否正常爬取到内页）
    view(response)
    # 网页响应正文 byte类型
    response.body
    # 网页响应正文 str类型  
    response.text  
    # xpath选择器
    repsonse.xpath()
```

- scrapy shell ./1.html 调用本地的文件

### shell内部的命令

- shelp()：打印出所有可使用的属性与命令。
- fetch(url[, redirect=True])：从给定的URL获取一个新的Response，同时更新所有相关的项目数据。当指定redirect=False时，不会获取重定向的数据。
    fetch(request)：根据给定的Request获取一个新的Response，同时更新所有相关的项目数据。
- view(response)：使用指定的Response打开浏览器，方便检查抓取数据。当使用这条命令的时候，为使外部的图像或者表格等正确显示，会自动为Response中添加一个<base>标签，指定基准URL，也就是Response对应的url


## scrapy代码中启动shell调试response

可通过 scrapy.shell.inspect_response 函数实现，当程序运行到此处时会阻塞，这时你可以尽情的调试。当调试完成后按Ctrl-D(Windows下Ctrl-Z)退出后继续运行，当下一次运行此处时又会阻塞在这里供你调试

from scrapy.shell import inspect_response
def paser(self, response):
    inspect_response(response, self)  

## 暂停和恢复爬虫

初学者最头疼的事情就是没有处理好异常，当爬虫爬到一半的时候突然因为错误而中断了，但是这时又不能从中断的地方开始继续爬，顿时感觉心里日了狗，但是这里有一个方法可以暂时的存储你爬的状态，当爬虫中断的时候继续打开后依然可以从中断的地方爬，不过虽说持久化可以有效的处理，但是要注意的是当使用cookie临时的模拟登录状态的时候要注意cookie的有效期。

**只需要在`setting.py`中`JOB_DIR=file_name` 其中填的是你的文件目录，注意这里的目录不允许共享，只能存储单独的一个spdire的运行状态，如果你不想在从中断的地方开始运行，只需要将这个文件夹删除即可**

**当然还有其他的放法：`scrapy crawl somespider -s JOBDIR=crawls/somespider-1`，这个是在终端启动爬虫的时候调用的，可以通过`ctr+c`中断，恢复还是输入上面的命令**