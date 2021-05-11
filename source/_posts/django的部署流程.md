---
title: django的部署流程
date: 2021-05-11 17:17:33
tags: django
categories: django
---

# django部署流程

## 1. 配置生产环境配置(settings):DEBUG&Secret相关信息

必须调整的关键配置:

- DEBUG -- 在生产环境中设置为False(DEBUG=False)。避免在web页面上显示敏感的调试跟踪和变量信息
- SECRET_KEY -- 这是用于CSRF保护的随机值
  - 生成SECRETKEY
    - python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
- ALLOWED_HOSTS -- 生产环境必须设置允许访问的域名

## 2. 配置生产环境配置:密钥的存储和管理

1. 外部引用密钥
2. 保存在系统环境变量中
3. 利用KMS系统保存
   1. vault https://github.com/hashicorp/vault
      1. https://www.ruoguedu.cn/post/deploy-vault-on-production-environment/
      2. https://hvac.readthedocs.io/en/stable/overview.html#getting-started
   2. keywhiz https://github.com/square/keywhiz
   3. knox https://github.com/pinterest/knox

## 3. 部署前的安全检查

python manage.py check --deploy

## 4. 静态文件的托管

1. web服务器
2. CDN服务器

## 5. 应用服务器

- 同步应用
  - uWSGI:C实现的PythonWeb应用服务器;Web服务器Apache/Nginx与django-uwsgi进程通信来提供动态的内容;
  - gunicorn:纯Python实现的高性能Python应用服务器，无外部依赖，简单容易配置;还没有遇到性能问题的时候，推荐使用 gunicorn。
  - http://xiaorui.cc/archives/4264
- 异步应用
  - Daphne:twisted实现
  - Hypercorn:基于sans-iohyper,h11,h2,wsproto实现 
  - Uvicorn:基于uvloopandhttptools实现

- 同步应用服务器，以 gunicorn 为例

```shell
$ python -m pip install gunicorn
$ export DJANGO_SETTINGS_MODULE=settings.local
$ gunicorn -w 3 -b 127.0.0.1:8000 <project_name>.wsgi:application
```

- 异步应用服务器，以uvcorn 为例

```shell
$ python -m pip install uvicorn
$ export DJANGO_SETTINGS_MODULE=settings.local 
$ uvicorn <project_name>.asgi:application --workers 3
```

## 6. 代理服务器

### Engine

nginx在启动后，会有一个master进程和多个worker进程。master进程主要用来管理worker进程，包含：接收来自外界的信号，向各worker进程发送信号，监控worker进程的运行状态，当worker进程退出后(异常情况下)，会自动重新启动新的worker进程。而基本的网络事件，则是放在worker进程中来处理了。多个worker进程之间是对等的，他们同等竞争来自客户端的请求，各进程互相之间是独立的。一个请求，只可能在一个worker进程中处理，一个worker进程，不可能处理其它进程的请求。worker进程的个数是可以设置的，一般我们会设置与机器cpu核数一致。

Nginx 里使用的 epoll，它把多个 HTTP 请求处理打散成碎片，都“复用”到一个单线程里，不按照先来后到的顺序处理，而是只当连接上真正可读、可写的时候才处理，如果可能发生阻塞就立刻切换出去，处理其他的请求。通过这种方式，Nginx 就完全消除了 I/O 阻塞，把 CPU 利用得“满满当当”，又因为网络收发并不会消耗太多 CPU 计算能力，也不需要切换进程、线程，所以整体的 CPU 负载是相当低的。

当从一个任务切换到另一个任务，当前任务的上下文，如堆栈，指令指针等都要保存起来，以便下次任务时恢复，然后再把另一个任务的堆栈加载进来，如果有大量的上下文切换，就会影响性能。

epoll 还有一个特点，大量的连接管理工作都是在操作系统内核里做的，这就减轻了应用程序的负担，所以 Nginx 可以为每个连接只分配很小的内存维护状态，即使有几万、几十万的并发连接也只会消耗几百 M 内存

### Tengine

https://tengine.taobao.org/

- Tengine完全兼容Nginx,同时提供了额外的强大功能
- 增强相关运维、监控能力,比如异步打印日志及回滚,本地DNS缓存,内存监控等;
- 动态脚本语言Lua支持。扩展功能简单高效;
- 更加强大的负载均衡能力，包括一致性hash模块、会话保持模块
- 主动健康检查，根据服务器状态自动上线下线，以及动态解析upstream中出现的域名; • 输入
- 过滤器机制支持，更强大的防攻击(访问速度限制)模块;方便实现应用防火墙;
- .....

### openresty

https://openresty.org/cn/getting-started.html

### 负载分流策略

round-robin—平均分配流量:轮询模式

least-connected—最少连接优先，下一个请求分到活跃连接最少的服务器 

ip-hash—按照客户端IP哈希来分配服务器IP

带权重流量分配

一致性哈希(Tengine)

会话保持(Tengine特性)

## 7. 进程管理

- supervisor
  - http://supervisord.org/installing.html
- pm2
  - https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/

## 补充说明

### 区分uWSGI和WSGI

在python web开发中，我们经常使用uwsgi配合nginx部署一个web框架，如Django或flask。同时我们又会说，框架和web服务器之间要符合WSGI协议。那就来厘清一下这几个概念。

#### web服务器和web框架

- 在讲uWSGI和WSGI之前，先要弄清楚web开发的两大块，web服务器和web框架。
  web服务器即用来接受客户端请求，建立连接，转发响应的程序。至于转发的内容是什么，交由web框架来处理，即处理这些业务逻辑。如查询数据库、生成实时信息等。Nginx就是一个web服务器，Django或flask就是web框架。

#### 回到uWSGI和WSGI。

- 那么如何实现uWSGI和WSGI的配合呢？如何做到任意一个web服务器，都能搭配任意一个框架呢？这就产生了WSGI协议。只要web服务器和web框架满足WSGI协议，它们就能相互搭配。所以WSGI只是一个协议，一个约定。而不是python的模块、框架等具体的功能。

  而uWSGI，则是实现了WSGI协议的一个web服务器。即用来接受客户端请求，转发响应的程序。实际上，一个uWSGI的web服务器，再加上Django这样的web框架，就已经可以实现网站的功能了。那为什么还需要Nginx呢？

- WSGI是什么

  ```
  WSGI是 Web Server Gateway Interface 的缩写。
  它是python应用程序或者框架和web服务器之间的一种接口。是一种协议，一种规范，它是用来解决众多web框架和web server软件的兼容问题。有了它，不用管web server软件的兼容问题。
  	
  ```

- python中的wsgi的实现
  - 在python中有一个库，叫wsgiref，它是一个WSGI的参考实现库，它是web服务器实现的一个参考，不能直接应用于开发。
    - WSGI服务器作用
      - 监听HTTP服务端口（TCPServer，默认端口80）
      - 接受浏览器端的HTTP请求并解析封装成environ环境数据
      - 负责调用应用程序，将environ和start_response方法传入

  - 关于WSGI的application端的实现
    - 1.它是一个可调用的对象，在python中应该是是类，或者实现了__call__方法的类的实例
    - 2.这个可调用的对象应该接受，environ(包含了http请求信息的dict对象)和start_response(可调用对象，三个参数，status-状态码，response_headers-包含信息的二元组列表，exc_info-异常信息)

#### 为什么需要Nginx

一个普通的个人网站，访问量不大的话，当然可以由uWSGI和Django构成。但是一旦访问量过大，客户端请求连接就要进行长时间的等待。这个时候就出来了分布式服务器，我们可以多来几台web服务器，都能处理请求。但是谁来分配客户端的请求连接和web服务器呢？Nginx就是这样一个管家的存在，由它来分配。这也就是由Nginx实现反向代理，即代理服务器。

#### nginx配置

- **全局块**：配置影响nginx全局的指令。一般有运行nginx服务器的用户组，nginx进程pid存放路径，日志存放路径，配置文件引入，允许生成worker process数等。
- **events块**：配置影响nginx服务器或与用户的网络连接。有每个进程的最大连接数，选取哪种事件驱动模型处理连接请求，是否允许同时接受多个网路连接，开启多个网络连接序列化等。
- **http块**：可以嵌套多个server，配置代理，缓存，日志定义等绝大多数功能和第三方模块的配置。如文件引入，mime-type定义，日志自定义，是否使用sendfile传输文件，连接超时时间，单连接请求数等。
- **server块**：配置虚拟主机的相关参数，一个http中可以有多个server。
- **location块**：配置请求的路由，以及各种页面的处理情况。
- **upstream：**主要用于负载均衡，设置一系列的后端服务器；

