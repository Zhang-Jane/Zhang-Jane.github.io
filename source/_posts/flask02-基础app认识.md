---
title: 认识flask的app
tags: flask
categories: flask
abbrlink: 11aed9bf
date: 2020-10-18 12:00:12
---
## flask简介

Flask是使用Python编写的Web微框架。Web框架可以让我们不用关心底层的请求响应处理，更方便高效地编写Web程序。因为Flask核心简单且易于扩展，所以被称作微框架（micro framework）。Flask有两个主要依赖，一个是WSGI（Web Server Gateway Interface，Web服务器网关接口）工具集——Werkzeug（http://werkzeug.pocoo.org/），另一个是Jinja2模板引擎（http://jinja.pocoo.org/）。Flask只保留了Web开发的核心功能，其他的功能都由外部扩展来实现，比如数据库集成、表单认证、文件上传等。如果没有合适的扩展，你甚至可以自己动手开发。Flask不会替你做决定，也不会限制你的选择。总之，Flask可以变成任何你想要的东西，一切都由你做主。

官方文档：https://dormousehole.readthedocs.io/en/latest/

##  简单的demo

```python
from flask import Flask

"""
传入Flask类构造方法的第一个参数是模块或包的名称，我们应该使用特殊变量__name__。
Python会根据所处的模块来赋予__name__变量相应的值，对于我们的程序来说（app.py），这个值为app。
除此之外，这也会帮助Flask在相应的文件夹里找到需要的资源，比如模板和静态文件。
static_url_path：静态文件访问路劲，可以不传，默认：/ + static
static_folder：静态文件存储的文件夹，可以不传，默认为：static
template_folder：模板文件存储的文件夹，可以不传，默认：templates
"""
app = Flask(__name__, static_url_path="", static_folder="", template_folder="")


"""
app.route（）装饰器把根地址/和index（）函数绑定起来，当用户访问这个URL时就会触发index（）函数。
这个视图函数可以像其他普通函数一样执行任意操作，比如从数据库中获取信息，获取请求信息，对用户输入的数据进行计算和处理等。
最后，视图函数返回的值将作为响应的主体，一般来说，响应的主体就是呈现在浏览器窗口的HTML页面
"""
@app.route('/')
def hello_world():
    return 'Hello World!'


if __name__ == '__main__':
    app.run()

```

- `flask run` 启动服务
- `flask run--host=0.0.0.0` 指定运行的host
- `flask run--port=8000` 指定运行的端口
- `flask shell` Python Shell可以执行exit（）或quit（）退出，在Windows系统上可以使用Ctrl+Z并按Enter退出；在Linux和macOS则可以使用Ctrl+D退出。

## 创建管理环境变量的文件

`Tip: There are .env or .flaskenv files present. Do "pip install python-dotenv" to use them.` 

项目根目录下分别创建两个文件：.env和.flaskenv。.flaskenv用来存储和Flask相关的公开环境变量，比如FLASK_APP；而.env用来存储包含敏感信息的环境变量，比如后面我们会用来配置Email服务器的账户名与密码。在.flaskenv或.env文件中，环境变量使用键值对的形式定义，每行一个，以#开头的为注释

```text
# 开发环境
FLASK_ENV=development
```

**注意：**.env包含敏感信息，除非是私有项目，否则绝对不能提交到Git仓库中。当你开发一个新项目时，记得把它的名称添加到.gitignore文件中

## 安装检测文件变化的模块

`pip install watchdog`

## 引入orm的包

`install flask-sqlalchemy`

## 配置信息

Flask将配置信息保存到了`app.config`属性中，该属性如下所示：

```text
<Config {'ENV': 'development', 'DEBUG': True, 'TESTING': False, 'PROPAGATE_EXCEPTIONS': None, 'PRESERVE_CONTEXT_ON_EXCEPTION': None, 'SECRET_KEY': None,
'PERMANENT_SESSION_LIFETIME': datetime.timedelta(days=31), 'USE_X_SENDFILE': False, 'SERVER_NAME': None, 'APPLICATION_ROOT': '/', 'SESSION_COOKIE_NAME':
'session', 'SESSION_COOKIE_DOMAIN': None, 'SESSION_COOKIE_PATH': None, 'SESSION_COOKIE_HTTPONLY': True, 'SESSION_COOKIE_SECURE': False, 'SESSION_COOKIE_S
AMESITE': None, 'SESSION_REFRESH_EACH_REQUEST': True, 'MAX_CONTENT_LENGTH': None, 'SEND_FILE_MAX_AGE_DEFAULT': datetime.timedelta(seconds=43200), 'TRAP_B
AD_REQUEST_ERRORS': None, 'TRAP_HTTP_EXCEPTIONS': False, 'EXPLAIN_TEMPLATE_LOADING': False, 'PREFERRED_URL_SCHEME': 'http', 'JSON_AS_ASCII': True, 'JSON_
SORT_KEYS': True, 'JSONIFY_PRETTYPRINT_REGULAR': False, 'JSONIFY_MIMETYPE': 'application/json', 'TEMPLATES_AUTO_RELOAD': None, 'MAX_COOKIE_SIZE': 4093}>
```

### 获取配置信息的方式

- app.config.get(name)
- app.config[name]

### 设置配置信息

**app.config.from_obj(配置的对象)**

```python
class Config(object):
	KEY = "2312312WEDQDQWD"
app = Flask(__name__)
app.config.from_object(Config)
```

继承配置：

```python
class BaseConfig(object):
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev key')
    
class DevelopmentConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = prefix + os.path.join(basedir, 'data-dev.db')
```

**app.config.from_pyfile(配置文件)**

```python
app = Flask(__name__)
app.config.from_pyfile('setting.py')
```

**app.config.from_envvar(环境变量名)**

工厂模式加载flask对象：

```python
def create_flask_app(config):
	app = Flask(__name__)
	app.config.配置
	return app
```













