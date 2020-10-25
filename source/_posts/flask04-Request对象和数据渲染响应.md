---
title: flask的request对象和数据渲染
tags: flask
categories: flask
abbrlink: 508ae6b3
date: 2020-10-23 12:30:22
---
## request对象的属性

`from flask import request`

- path：base_url
- full_path：url
- host：url_root                 
- host_url
- args：Werkzeug的ImmutableMultiDict对象。存储解析后的查询字符串，可通过字典方式获取键值。如果你想获取未解析的原生查询字符串，可以用query_string属性
- blueprint:当前蓝本的名称
- cookies：一个包含所有随请求提交的cookies的字典
- data：包含字符串形式的请求数据
- endpoint：于当前请求相匹配的端点值
- files：Werkzeug的MultiDict对象，包含所有上传文件，可以使用字典的形式获取文件。使用的键为文件input标签中的name值，对应的值为Werkzeug的FileStorage对象。可以调用save()方法并传入保存路径来保存文件
- form：Werkzeug的ImmutableMultiDict对象。于files类似，包含解析后的表单数据。表单字段值通过input标签的name属性值作为键获取
- values：Werkzeug的CombinedMultiDict对象，结合了args和form属性的值
    get_data(cache=True,as_text=False,parse_from_data=False)：获取请求中的数据，默认读取为字节字符串（bytestring），将as_text设为True则返回值将是解码后的unicode字符串
- get_json(self,force=False,silent=False,cache=True)：作为json解析并返回数据，如果MIME类型不是json，返回None（除非force设为True）；解析出错则抛出Werkzeug提供的BadRequest异常（如果未开启调试模式，则返回400错误响应），如果silent设为True则返回None；cache设置是否缓存解析后的json数据
- headers：一个Werkzeug的EnvironHeaders对象，包含首部字段，可以以字典的形式操作
- json：包含解析后的json数据，内部调用get_json()，可通过字典的方式获取键值
- method：请求的HTTP方法
- referrer：请求发起的源URL，即referer
- scheme：请求的URL模式（http或https）
- user_agent：用户代理（User Agent, UA），包含了用户的客户端类型，操作系统类型等信息

## 模板渲染和响应

### 模板渲染

`from flask import render_template`

### 返回json数据

`from flask import jsonify`

### 重定向

`from flask import redirect`，默认的状态码code=302，临时重定向。

301 redirect: 301 代表永久性转移(Permanently Moved)

302 redirect: 302 代表暂时性转移(Temporarily Moved )

### 自定义状态码响应头

1.返回一个元祖，格式：(resposne（响应的内容）, status（状态码）, headers（响应头额外的参数，字典或者列表）)的形式

2.make_response方法

### cookie使用

```python
from flask import make_response, request

def set_cookie():
	res = make_response("xxx")
	res.set_cookie("name", "cookies")
	return res
	
def get_cookie():
	res = make_response("xxx")
	request.cookies,get("name")
	return res
```

### session

设置的时候注意：

RuntimeError: The session is unavailable because no secret key was set.  Set the secret_key on the application to something unique and secret.

```python
from flask import session

app = Flask(__name__)
app.secret_key = "232gft&&*54"

@app.route("/sess")
def set_session():
    session["sess"] = "1213"
    return "ok"
    
@app.route("/gsess")
def get_session():
    s = session.get("sess")
    return s
```

