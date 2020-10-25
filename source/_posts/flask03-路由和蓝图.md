---
title: flask的路由和蓝图
tags: flask
categories: flask
abbrlink: 33812d0c
date: 2020-10-22 18:20:12
---
## 查看所有的路由的路径

1.`flask routes` 命令行

```text
Endpoint     Methods  Rule
-----------  -------  ----------------
hello_world  GET      /
static       GET      /<path:filename>
```

2.`app.url_map`代码中

```text
Map([<Rule '/static/<filename>' (GET, OPTIONS, HEAD) -> static>])
```

## url路由转换器

普通的转换器默认是str类型

```python
@app.route('/user/<id>')
def hello_world(id):
    return f'Hello {id}!'
```

带类型的转换器

```python
# # 默认转换器
# DEFAULT_CONVERTERS = {
#     'default':          UnicodeConverter,
#     'string':           UnicodeConverter,
#     'any':              AnyConverter,
#     'path':             PathConverter,
#     'int':              IntegerConverter,
#     'float':            FloatConverter,
#     'uuid':             UUIDConverter,
# }
@app.route('/user/<int:user_id>',methods=['GET'])
def hello_world(user_id):
    return f'Hello {user_id}!'
```

自定义转换器

```python
from werkzeug.routing import BaseConverter # 导入基类


# 自定义
class PhoneConverter(BaseConverter):
    """
    手机格式
    """
    regex = r'1[3-9]\d{9}'
    
# 将转换器类，添加到转换器字典中，转换器使用时的名称叫phone
app.url_map.converters['phone'] = PhoneConverter


@app.route('/phone_number/<phone:phone_id>', methods=['GET'])
def hello_world(phone_id):
    print(type(phone_id))
    return f'Phone number is {phone_id}!'
```

```python
# 1.定义类，继承自BaseConverter
class MyRegexConverter(BaseConverter):
    # 2.重写init方法,接收两个参数
    def __init__(self, map, regex):
        # 3.初始化父类成员变量，还有子类自己的规则
        super(MyRegexConverter, self).__init__(map)
        self.regex = regex

# 4.将转换器类，添加到系统默认的转换器列表中
app.url_map.converters['wdc'] = MyRegexConverter

# 三位整数
@app.route('/<wdc("\d{3}"):num>')
def hello_world(num):
    return f'这一个数是{num}'
# 四位整数
@app.route('/<wdc("\d{4}"):num>')
def hello_world_1(num):
    return f'这一个数是{num}'
# 手机号
@app.route('/<wdc("1[3-9]\d{9}"):num>')
def hello_world_2(num):
    return f'这是一个手机号{num}'

```

## 蓝图

django中一个命令`python manage.py startapp <app_name>`用于创建一个application，用于创建不同的应用，flask中也需要把不同模块的处理分离，flask的蓝图大概也是类似的功能。

flask使用Blueprint让应用实现模块化，在Flask中，Blueprint具有如下属性：

- 一个项目可以具有多个Blueprint
- 可以将一个Blueprint注册到任何一个未使用的URL下比如 “/”、“/sample”或者子域名
- 在一个应用中，一个模块可以注册多次
- Blueprint可以单独具有自己的模板、静态文件或者其它的通用操作方法，它并不是必须要实现应用的视图和函数的
- 在一个应用初始化时，就应该要注册需要使用的Blueprint

定义蓝图：

1.创建一个蓝图

```python
from flask import Blueprint
user_bp = Blueprint('user', __name___)
```

2.在这个蓝图对象进行操作，注册路由，指定静态文件夹，模板文件等

```python
# users/__init__.py，代码：
user_blu = Blueprint("users", __name__, static_folder='static_users')
from . import views
# users/views.py
from . import user_blu
@user_blu.route('/login')
def login():
    return 

```

3.在应用对象上注册这个蓝图

```python
# 启动单独文件 main.py，代码：
from users import user_blu
app.register_blueprint(user_blu, url_prefix='/users')
```



