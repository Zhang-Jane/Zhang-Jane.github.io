---
title: Twisted之Thread
date: 2020-11-14 01:03:25
tags: Twisted
categories: Twisted
---
## callFromThread和callInThread区别
```python
import time
from twisted.internet import reactor
from twisted.internet import defer
from twisted.internet.interfaces import IReactorThreads
import logging
from twisted.python.threadpool import ThreadPool

logging.basicConfig(
    level=logging.DEBUG,  # 定义输出到文件的log级别，
    format='%(asctime)s : %(levelname)s "%(threadName)s %(thread)d %(message)s" %(message)s',  # 定义输出log的格式
    datefmt='%Y-%m-%d %H:%M:%S',  # 时间
    # filename=logFilename,  # log文件名
    # filemode='w'
)
log = logging

# tp = reactor.getThreadPool()
# tp.adjustPoolsize(2)
# reactor.suggestThreadPoolSize(10)
# reactor.getThreadPool()


def gg(i):
    if i == 2:
        reactor.stop()
    log.info(i)
    time.sleep(2)


for i in range(3):
    reactor.callFromThread(gg,i)  # 派生自主线程，会阻塞
    # reactor.callInThread(gg, i)  # 新的线程，不会阻塞


log.info("I want to start")
reactor.run() # 启动主线程
log.info("I want to end")

```
## deferToThread
```python
from __future__ import print_function
from twisted.internet import reactor, threads

def doLongCalculation():
    # .... do long calculation here ...
    return 3

def printResult(x):
    print(x)

# run method in thread and get result as defer.Deferred
d = threads.deferToThread(doLongCalculation)
d.addCallback(printResult)
d.addBoth(lambda _: reactor.stop())
reactor.run()
```
