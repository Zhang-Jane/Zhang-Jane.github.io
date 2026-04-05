---
title: Flask的请求上下文和钩子：请求钩子
description: Flask的请求上下文和钩子：请求钩子。请求钩子 - beforefirstrequest - 在处理第一个请求前执行 - before request - 在每次请求前执行 - 如果在某修饰的函数中返回了一个响应，视图函数将不…适合日常查阅、复习对照与工程检索。含命令、参数与常见踩坑提示。
date: 2020-10-19T13:00:12.000Z
tags: flask
categories: flask
abbrlink: 734466bf

---


## 请求钩子

- before_first_request
    - 在处理第一个请求前执行 
- before_request
    - 在每次请求前执行
    - 如果在某修饰的函数中返回了一个响应，视图函数将不再被调用.
- after_request
    - 如果没有抛出错误，在每次请求后执行
    - 接受一个参数︰视图函数作出的响应
    - 在此函数中可以对响应值在返回之前做最后一步修改处理。
    - 需要将参数中的响应在此参数中进行返回
- teardown_request :
    - 在每次请求后执行
    - 接受一个参数:错误信息，如果有相关错误抛出

## 上下文

- current_app 程序上下文，当前激活程序的程序的实例
- g 程序上下文，处理请求时用作临时存储的对象。每次请求会重设这个对象
- request 请求上下文，请求对象，封装了客户端发出的http请求的内容
- session 请求上下文，用户会话

