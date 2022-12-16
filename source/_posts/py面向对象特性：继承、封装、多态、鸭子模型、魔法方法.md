---
title: py面向对象特性：继承、封装、多态、鸭子模型、魔法方法
tags: python3
categories: python3
abbrlink: '10770794'
date: 2022-12-16 19:53:04
---

## 继承的重点

1、子类拥有**父类**非私有化的属性和方法。

2、子类可以拥有自己属性和方法，即子类可以对父类进行扩展。

3、子类可以用自己的方式实现父类的方法。（重写）。

## 单继承

```python
class Animal:

    def eat(self):
        print("eating...")

    def sleep(self):
        print("sleep...")

// 继承父类的方法
class Dog(Animal):
    
    def swimming(self):
        print("goupaoshi...")

class Cat(Animal):
    
    def climb_tree(self):
        print("climb_tree...")


alex = Dog()
alex.eat()

```

```python
class Animal:

    def eat(self):
        print('eating ...')

    def sleep(self):
        print('sleeping ...')

// 重写父类方法
class Dog(Animal):

    def swimming(self):
        print('狗刨式...')

    def sleep(self):
        print('趴着睡')


alex = Dog()
alex.sleep()
```

```python
class Animal:

    def eat(self):
        print('eating ...')

    def sleep(self):
        print('sleeping ...')

// 调用父类的方法
class Dog(Animal):

    def swimming(self):
        print('狗刨式...')

    def sleep(self):
        # 方式1：硬编码，不推荐.
        # 父类对象调用 父类对象.方法（self,其他参数）
        # Animal.sleep(self)    # 类对象调用方法相当于 函数化调用，注意 位置传参

        # 方式2：super关键字
        # super(子类对象，self).方法（参数）or super().方法（参数）
        # super(Dog, self).sleep()    # 不推荐，还是存在硬编码
        super().sleep()      # 推荐！！  super() 实例化对象.方法  解决硬编码
        print('趴着睡')


alex = Dog()
alex.sleep()


class Person(object):

    def __init__(self, name, age):
        self.name = name
        self.age = age

    def sleep(self):
        print("基类sleep...")


class TL(Person):

    # def __init__(self, name, age, dep):
    #     self.name = name
    #     self.age = age
    #     self.dep = dep
    
    # 注意：继承的初始化的参数务必对齐
    def __init__(self, name, age, dep):
        super().__init__(name, age)
        self.dep = dep


yuan = TL("yuan", 18, "游戏部")

yuan.sleep()
print(yuan.dep)
```

```python
class A:
    x = 100

    def __int__(self, x):

        self.x = x

    def foo(self):
        print(self.x)


class B(A):
    x = 12


b = B()
b.foo()

// 12
```

demo：

```python
import random
import datetime


print('''

     1、海尔冰箱 单价3000元；
     2、西门子洗衣机 单价5000元；
     3、芝华士沙发 单价6000元

''')

goods = {1: ("海尔冰箱", 3000), 2: ("西门子洗衣机", 5000), 3: ("芝华士沙发", 6000)}


# 结账类
class Bill(object):
    def __init__(self,name):
        self.name=name

    def get_unit(self):

        unit = int(input("请输入商品序号>>>"))

        return unit

    def get_number(self):

        number = int(input("请输入商品数量>>>"))

        return number

    def get_total_price(self):

        unit = self.get_unit()
        number = self.get_number()
        total_price = goods[unit][1] * number
        ret = self.discount(total_price)
        print("%s于%s总共花费%s元"%(self.name,datetime.datetime.today(),ret))
        return ret

    def discount(self,price):

        return price


# bill=Bill("Yuan老师")
# bill.get_total_price()


class NationalDayBill(Bill):

    def discount(self, price):
        if price > 399:
            return price-200

        return super().discount(price)


# ndb=NationalDayBill("Yuan")
# ndb.get_total_price()


class Double11Bill(Bill):
    def discount(self,price):
        if price > 200:
            free = random.randint(0, 1)
            if free == 0:
                return 0

        return super().discount(price)


# mab=Double11Bill("Yuan")
# mab.get_total_price()


# 问题：如果再加一个中秋节满五百折扣0.8
# 但是假如中秋节和国庆节是一天，所以两个优惠同时享受的话该怎样设计？

class MiddleAutumeBill(NationalDayBill):
    def discount(self, price):
        if price > 500:
            temp_price = super().discount(price)     # 国庆优惠后的价格
            return temp_price*0.8                    # 中秋再次优惠

        return super().discount(price)               # 国庆优惠后的价格


mab=MiddleAutumeBill("Yuan")
mab.get_total_price()


```

## 多继承

继承中查找方法的方法顺序是：先查子类，然后从左往右，从最左边父类找，没有的话再往右边的类找，可以使用`__mro__`查看

### 查看实例的所有属性：dir()方法和__dict__属性

dir(obj)可以获得对象的所有属性列表, 而`obj.__dict__`对象的自定义属性字典

### 判断类的继承关系：type 和isinstance方法

```python
class Animal:

    def eat(self):
        print("eating...")

    def sleep(self):
        print("sleep...")


class Dog(Animal):
    def swim(self):
        print("swimming...")


alex = Dog()
mjj = Dog()

a = Animal()

print(isinstance(alex, Dog))         # True
print(isinstance(alex, Animal))      # True
print(type(alex))              # <class '__main__.Dog'>

print(isinstance(a, Dog))      # False


# 判断 A 是否 为 B 的子类
print(issubclass(Animal, (Dog,)))     # False
print(issubclass(Dog, (Animal,)))     # True


```



## 封装好处

1. 隐藏实现细节，提供公共的访问方式
2. 提高了代码的复用性
3. 提高安全性

## 私有属性

1. 私有属性 只能在 **本类** 使用
2. 确保了外部代码不能随意修改对象内部的状态，这样通过访问限制的保护，代码更加健壮。
3. 这种机制也并没有真正意义上限制我们从外部直接访问属性，知道了**类名**和**属性名**就可以拼出名字：

`_类名__属性`， 然后就可以访问了，如 `alex._Student__score`

单下划线、双下划线、头尾双下划线说明
__foo__: 定义的是特殊方法，一般是系统定义名字 ，类似 __init__() 之类的。

_foo: 以单下划线开头的表示的是 protected 类型的变量，即保护类型只能允许其本身与子类进行访问。（约定成俗，不限语法）

__foo: 双下划线的表示的是私有类型(private)的变量, 只能是允许这个类本身进行访问了。



## 多态

多态是指一类事物有多种形态。比如动物有多种形态，人，狗，猫，等等。文件有多种形态：文本文件，可执行文件

```python
from abc import ABCMeta, abstractmethod              # (抽象方法)


class Payment(metaclass=ABCMeta):         # metaclass 元类  metaclass = ABCMeta表示Payment类是一个规范类
    def __init__(self, name, money):
        self.money = money
        self.name = name

    @abstractmethod                       # @abstractmethod表示下面一行中的pay方法是一个必须在子类中实现的方法
    def pay(self, *args, **kwargs):
        pass


class AliPay(Payment):

    def pay(self):
        # 支付宝提供了一个网络上的联系渠道
        print('%s通过支付宝消费了%s元' % (self.name, self.money))


class WeChatPay(Payment):

    def pay(self):
        # 微信提供了一个网络上的联系渠道
        print('%s通过微信消费了%s元' % (self.name, self.money))


class Order(object):

    def account(self, pay_obj):
        pay_obj.pay()


# 第一个订单
pay_obj = WeChatPay("yuan", 100)
# 第二个订单
pay_obj2 = AliPay("alex", 200)

order = Order()
order.account(pay_obj)
order.account(pay_obj2)

# yuan通过微信消费了100元
# alex通过支付宝消费了200元


```

在上面的例子中`order.account(pay_obj)`中`pay_obj`不需要类型声明，而`java`在使用时要定义好类型

（`order.account(Payment pay_obj)`），所以你传入别的类型对象一定报错

但是`python`因为是动态语言所以传入的对象只要拥有调用的方法即可视为`Payment`类型对象，这就是所谓的鸭子类型

## 鸭子模型

鸭子类型（英語：duck typing）在程序设计中是动态类型的一种风格。在这种风格中，一个对象有效的语义，不是由继承自特定的类或实现特定的接口，而是由「当前方法和属性的集合」决定

```python
class Duck:
    def quack(self):
        print("这鸭子正在嘎嘎叫")

    def feathers(self):
        print("这鸭子拥有白色和灰色的羽毛")

class Person:
    def quack(self):
        print("这人正在模仿鸭子")

    def feathers(self):
        print("这人在地上拿起1根羽毛然后给其他人看")

def in_the_forest(duck):
    duck.quack()
    duck.feathers()

def game():
    donald = Duck()
    john = Person()
    in_the_forest(donald)
    in_the_forest(john)

game()

# python中很多底层逻辑都是鸭子模型，很明显没有继承
from collections.abc import Iterable

class Company:
    def __init__(self, employee_list):
        self.employee = employee_list

    def __iter__(self):
        return iter(self.employee)

    def __getitem__(self, item):
        return self.employee[item]


if __name__ == "__main__":
    company = Company(["tom", "bob", "jane"])
    if isinstance(company, Iterable):
        print("company是iterable类型")
    for item in company:
        print (item)

a = []
if isinstance(a, Iterable):
    print("yes")
```



## 反射

指程序可以访问、检测和修改它本身状态或行为的一种能力，在python中一切皆对象（类，实例，模块等等都是对象），那么我们就可以通过反射的形式操作对象相关的属性。



## 闭包

当一个变量既不是该函数内部的局部变量，也不是该函数的参数,相对于作用域来说，就是一个自由变量(引用了外部变量)，这样就会形成一个闭包。

## 上下文管理器

```python
class Resource():
    def __enter__(self):
        print('===connect to resource===')
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        print('===close resource connection===')
        
    def operate(self):
        print('===in operation===')
        
with Resource() as res:
    res.operate()
```

异常可以在`__exit__` 进行捕获并由你自己决定如何处理，是抛出呢还是在这里就解决了。在`__exit__` 里返回 `True`（没有return 就默认为 return False），就相当于告诉 Python解释器，这个异常我们已经捕获了，不需要再往外抛了。

在 写`__exit__` 函数时，需要注意的事，它必须要有这三个参数：

- exc_type：异常类型
- exc_val：异常值
- exc_tb：异常的错误栈信息

当主逻辑代码没有报异常时，这三个参数将都为None。

```python
import contextlib

@contextlib.contextmanager
def open_func(file_name):
    # __enter__方法
    print('open file:', file_name, 'in __enter__')
    file_handler = open(file_name, 'r')

    try:
        yield file_handler
    except Exception as exc:
        # deal with exception
        print('the exception was thrown')
    finally:
        print('close file:', file_name, 'in __exit__')
        file_handler.close()

        return

with open_func('/Users/MING/mytest.txt') as file_in:
    for line in file_in:
        1/0
        print(line)
```

在被装饰函数里，必须是一个生成器（带有yield），而yield之前的代码，就相当于`__enter__`里的内容。yield 之后的代码，就相当于`__exit__` 里的内容。

## 作用域链

1. `L （Local）` 局部作用域（一般指函数，在函数内部定义的则是局部变量）
2. `E （Enclosing）` 闭包函数外的函数中
3. `G （Global）` 全局作用域
4. `B （Built-in）` 内建作用域

### 搜索作用域

1.python 先从局部作用域开始搜索，没找到则在全局域继续搜索，否则就会抛出 NameError 异常；

2.全局变量能被同名的局部变量所覆盖；

3.变量的作用域受到命名空间的影响。

### 访问规则

1. 访问规则链：L => E => G => B

   从 `局部作用域` 开始查找，如果 `局部作用域` 不存在，则往上一层（也就是指嵌套函数）开始查找，如果上一层也不存在，则继续向上，一直到（这个过程都是与 

2. 闭包函数外的函数`全局作用域`，如果全局作用于也不存在，则在 `内建作用域` 查找，如果依然不存在，则报错 `is not defined`

```python
# 全局作用域
x=10

# 第一层局部作用域
def outer(): 
  y=20;
  print(x)

  # 第二层局部作用域
  def inner():
    z=30
    print(f"x={x},y={y}")

  inner()

outer()

# 输出内容
# 10
# x=10,y=20


c = 1
def func1():
    c = 2     # 如果没有此处变量c的声明 那么就会向上一级请寻找 即 c = 1
    def func2():
        c = 3   # 如果没有此处变量c的声明 那么就会向上一级请寻找 即 c = 2
        print(c)
        func2()
        func1()
```

### 内部修改外部变量

```python
# 全局作用域
x=10

# 局部作用域
def changeNum(): 
  x=20
  print(x) # 20

changeNum()
print(x) # 10

```

```python
# 全局作用域
x=10

# 局部作用域
def changeNum(): 
  # global x # 想在函数内部对函数外的变量进行操作，就需要在函数内部声明其为global。
  print(x) # UnboundLocalError: local variable 'x' referenced before assignment
  x=20
  print(x)

changeNum()
# print(x) # UnboundLocalError: local variable 'x' referenced before assignment
```

如果，修改一下代码

```python
x=10

# 局部作用域
def changeNum():
  def changeMore():
        print(x)
  x=20
  print(x)
  changeMore()
changeNum()

'''
20
20
'''

# 上下俩段代码细微的差距，但是结果不同
x=10

# 局部作用域
def changeNum():
  def changeMore():
        print(x)
  changeMore()
  x=20 # 说明如果出现重新赋值的变量，此变量和全局的x变量没有什么关系，是一个新的变量
  print(x)
changeNum()

# NameError: free variable 'x' referenced before assignment in enclosing scope
# 在封闭范围内赋值之前引用的自由变量“x”

```

如果同样的代码换成js了

```js
var a = 10

function xx(){
    function x(){
        console.log(a)
    }
    x()
    a = 20
    console.log(a)
}
xx()
// 10
// 20
```

摘录：https://blog.csdn.net/Sunny_Future/article/details/114757132

