---
title: Twisted之@inlineCallbacks
abbrlink: 631ce788
date: 2020-11-14 01:13:21
tags:
---
## inlineCallbacks
文档：https://twistedmatrix.com/documents/current/api/twisted.internet.defer.inlineCallbacks.html

### 1.inlineCallbacks 是一个decorator，它可以把一个generator函数（使用了yield语句的函数）变成是一系列的异步callbacks的调用。

### 2.调用decoratored by inlineCallbacks 的函数的时候，我们不需要调用send、next等函数把yield的结果发送给generator，inlineCallbacks负责这一切，保证generator可以顺利跑完（前提是generator本身不抛异常）

### 3.如果yield的是defer，那么generator会暂停，直到返回的defer被fired。如果defer是success的，则返回defer的结果，否则，就抛异常（普通的Exception,而不是Failue）
```python
from twisted.internet import reactor, defer
from twisted.internet.defer import returnValue, inlineCallbacks


@inlineCallbacks
def some_func():
    res1 = yield ...
    res2 = yield ..
    defer.returnValue(res2)
    d = some_func()
    d.addCallback(func1)
    d.addBoth(func2)

```

经过inlineCallBacks的修饰，some_funct() 返回的是一个deffer，调用者只需要往这个defer添加callback/errback, 剩下的事情就由inlineCallBacks和some_func来协调完成。注意，返回的defer并不是yield 的defer，这个返回的defer仅当generator运行完或者抛一个异常的时候，才会被fired。

some_func里面有三种跟inlineCallBacks会产生互动的语句：

1、yield some_expr 

如果yield 的是common value（就是不是defer），那么会直接返回给yield左边的表达式，a = yield b 相当于 a = b; 如果yield的是defer，那么inlineCallback会保证yield 表达式的值（如res1 ）会得到defer被fired的时候的结果(res or err)

2、defer.returnVale(some_val)

实际上是带着some_val 的异常，这个异常被inlineCallbacks捕捉，然后some_val作为defer的结果用来fired 这个defer：defer.callback(some_value)

3、最后没有使用returnValue() 来返回值，到了some_func执行完

inlineCallback会捕获一个StopIteration（表示一个generator执行到了the end of function），此时对于some_func来说，是没有值返回的，所以在inlineCallbacks里面，就会调用deffer.callback(None)，然后返回defer。

### demo
demo01
```python
import time
from twisted.internet import defer


def scheduler_open():
    print('scheduler_open')


def _send_catch_log_deferred(n):
    print('_send_catch_log_deferred', n)
    return defer.DeferredList([])


def send_catch_log_deferred(n):
    return _send_catch_log_deferred(n)


@defer.inlineCallbacks
def engine_start():
    print('engine_start')
    a = yield send_catch_log_deferred(2)
    print('engine_start~', a)
    _closewait = defer.Deferred()
    yield _closewait
    print('====================')


@defer.inlineCallbacks
def engine_open_spider():
    print('engine_open_spider')
    x = yield scheduler_open()
    print('engine_open_spider~~')
    yield send_catch_log_deferred(1)
    print('engine_open_spider~~~')


@defer.inlineCallbacks
def crawl():
    print('crawl')
    yield engine_open_spider()
    print('crawl~')
    yield engine_start()
    print('crawl~~')


d = crawl()
```
demo02
```python
from twisted.internet import reactor, defer
from twisted.internet.defer import returnValue, inlineCallbacks


def succes_callback(res):
    print("res", res)

@inlineCallbacks
def demo():
    result = yield 1
    # print(result)
    # returnValue(result)
    # returnValue(1)
    # yield x
    closewait = defer.Deferred()
    yield 2
    yield closewait
    return 3


if __name__ == '__main__':
    defered = demo()
    defered.addCallback(succes_callback)
    print(type(defered))
    print(defered)
    # print(next(s))
```

demo03

```
from twisted.internet import reactor, defer


def get_dummpy_data(input_data):
    print('get_dummpy_data called')
    deferred = defer.Deferred()
    reactor.callLater(2, deferred.callback, input_data * 3)
    return deferred

def cb_print_data(result):
    print('Result received: {}'.format(result))

# @defer.inlineCallbacks
def main():
    result = get_dummpy_data(3)
    print(result)
    return result

d = main()

d.addCallback(cb_print_data)

reactor.callLater(4, reactor.stop)
reactor.run()

# ---------------------------------------------

from twisted.internet import reactor, defer


def get_dummpy_data(input_data):
    print('get_dummpy_data called')
    deferred = defer.Deferred()
    reactor.callLater(2, deferred.callback, input_data * 3)
    return deferred


def cb_print_data(result):
    print('Result received: {}'.format(result))


@defer.inlineCallbacks
def main():
    result = yield get_dummpy_data(3)
    print(result)
    return result


d = main()

d.addCallback(cb_print_data)

reactor.callLater(4, reactor.stop)
reactor.run()

```

