---
title: Twisted之各种callback
date: 2020-11-13 23:43:52
tags: Twisted
categories: Twisted
---
```python
from twisted.internet.defer import Deferred
from twisted.python.failure import Failure


def got_poem(res):
    print('Your poem is served:')
    print(res)


def get_result(res):
    print(res)
    print("hah")


def poem_failed(err):
    print('No poetry for you.')


d = Deferred()
d.addBoth(get_result)
# d.callback(get_result)
# add a callback/errback pair to the chain
d.addCallbacks(got_poem, poem_failed)

# fire the chain with an error result
d.errback(Failure(Exception('I have failed.')))

print("Finished")
```