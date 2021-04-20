---
title: Twisted之各种callback
tags: Twisted
categories: Twisted
abbrlink: cd11064
date: 2020-11-13 23:43:52
---
## callLater（延迟执行，多少秒后执行某任务）

```python
from twisted.internet import reactor

def f(s):
    print('this will run 3.5 seconds after it was scheduled: %s' % s)
    reactor.stop()

reactor.callLater(3.5, f, 'hello, world')

# f() will only be called if the event loop is started.

reactor.run()


```

## LoopingCall间隔时间执行某任务

```python
from twisted.internet import reactor, task

def f(s):
    print(s)

loop = task.LoopingCall(f, 'hello, world')
# Start looping every 1 second.
loop.start(1)

reactor.run()
```

## 各种callback

### ErrorBack

```python
from twisted.internet import reactor, defer

def get_dummpy_data(input_data):
    print('get_dummpy_data called')
    deferred = defer.Deferred()
    if input_data % 2 == 0:
        reactor.callLater(2, deferred.callback, input_data * 3)
    else:
        reactor.callLater(2, deferred.errback, ValueError('You used an odd number!'))
    return deferred

def cb_print_data(result):
    print('Result received: {}'.format(result))

def eb_print_error(failure):
    print(failure)

deferred = get_dummpy_data(2)
deferred.addCallback(cb_print_data)
deferred.addErrback(eb_print_error)

reactor.callLater(4, reactor.stop)
reactor.run()
```

### 多个callback之间的关系

```python
from twisted.internet import reactor, defer


def getDeferredFromSomewhere(num):
    deferred = defer.Deferred()
    if num >= 5:
        reactor.callLater(0, deferred.callback, num / 3)

    return deferred


def eb1(res):
    print("eb1", res)
    raise Exception("error1")


def eb2(res):
    print("eb2", res)
    raise Exception("error2")


def cb1(res):
    print("cb1", res)
    raise Exception("error3")



def cb2(res):
    print("cb2", res)
    raise Exception("error4")


d = getDeferredFromSomewhere(10)
d.addCallback(cb1)
d.addErrback(eb1)
d.addCallback(cb2)
d.addErrback(eb2)

reactor.callLater(4, reactor.stop)

reactor.run()

result:
cb1 3.3333333333333335 # 先打印cb1，正常的结果从callLater传入，再抛出一个异常
eb1 [Failure instance: Traceback: <class 'Exception'>: error3 # eb1接收异常回调
eb2 [Failure instance: Traceback: <class 'Exception'>: error1 # eb2接收异常回调

```

## DeferredList

当碰到需要等待多个 deferred 执行完毕的时候，我们可以使用 DeferredList

```text
dl = defer.DeferredList([deferred1, deferred2, deferred3])
```

看个例子

```text
from twisted.internet import defer

def print_result(result):
    for (success, value) in result:
        if success:
            print('Success:', value)
        else:
            print('Failure:', value.getErrorMessage())

deferred1 = defer.Deferred()
deferred2 = defer.Deferred()
deferred3 = defer.Deferred()

dl = defer.DeferredList([deferred1, deferred2, deferred3], consumeErrors=True)

dl.addCallback(print_result)

deferred1.callback('one')
deferred2.errback(Exception('bang!'))
deferred3.callback('three')
```

