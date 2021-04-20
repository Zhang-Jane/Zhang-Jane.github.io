---
title: Python的Mixin概念
abbrlink: 7408a64e
date: 2021-04-20 17:06:30
tags:
---

## 什么是mixin

https://blog.hszofficial.site/TutorialForPython/%E8%AF%AD%E6%B3%95%E7%AF%87/%E9%9D%A2%E5%90%91%E5%AF%B9%E8%B1%A1%E6%83%AF%E7%94%A8%E6%B3%95/%E5%A4%9A%E9%87%8D%E7%BB%A7%E6%89%BF%E5%92%8CMixin.html

定义和使用 Mixin 类应该遵循几个原则：

1. Mixin 实现的功能需要是通用的，并且是单一的，比如上例中两个 Mixin 类都适用于大部分子类，每个 Mixin 只实现一种功能，可按需继承。
2. Mixin 只用于拓展子类的功能，不能影响子类的主要功能，子类也不能依赖 Mixin。
3. Mixin 类自身不能进行实例化，仅用于被子类继承。

## 例子

```
class Person1:
    def __init__(self, name, gender, age):
        self.name = name
        self.gender = gender
        self.age = age


class MappingMixin:
    def __getitem__(self, key):
        return self.__dict__.get(key)

    def __setitem__(self, key, value):
        return self.__dict__.setdefault(key, value)


class Person2(MappingMixin):
    def __init__(self, name, gender, age):
        self.name = name
        self.gender = gender
        self.age = age


class ReprMixin:
    def __repr__(self):
        s = self.__class__.__name__ + '('
        for k, v in self.__dict__.items():
            if not k.startswith('_'):
                s += '{}={}, '.format(k, v)
        s = s.rstrip(', ') + ')'  # 将最后一个逗号和空格换成括号
        return s


class Person(MappingMixin, ReprMixin):
    def __init__(self, name, gender, age):
        self.name = name
        self.gender = gender
        self.age = age


if __name__ == '__main__':
    p = Person("小陈", "男", 18)
    print(p.name)  # "小陈"
    p = Person("小陈", "男", 18)
    print(p['name'])  # "小陈"
    print(p['age'])  # 18
    p["gender"] = "男"
    print(p.gender)
    print(p)

```

