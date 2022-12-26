---
title: 'cookie,token,session,jwt你们是不是在讨论同一件事'
abbrlink: 598151c0
date: 2022-12-21 15:49:09
tags: cookie
---
# 注意

- cookie只是一个载体，可以承载各种认证内容，这是http协议请求头携带的一种规定形式。
- token是一个很广泛的概念，他既可以做用户身份认证，也可以做安全机制的认证，简单理解他就是一段认证的字符串
- jwt是token的一种实现方式
- **JWT与OAuth的区别（https://segmentfault.com/a/1190000040920592）**
  - OAuth2是一种授权框架 ，JWT是一种认证协议
  - OAuth2用在使用第三方账号登录的情况(比如使用weibo, qq, github登录某个app)，而JWT是用在前后端分离, 需要简单的对后台API进行保护时使用。
- 浏览器发起跨域请求的时候，是不会主动带上cookie的，详细查看ajax这篇文章
- 就本质来说 JWT 没有对 “状态” 这件事任何规定和限制，其本身只是一种数据格式而已，所以在实现上甚至可以把 Session ID 放在 JWT 里，把 JWT 当 Cookie 用
# cookie实现方式
![cookie](../images/cookie/cookie%E5%A4%84%E7%90%86%E6%9C%BA%E5%88%B6.png)
- http协议是无状态的协议，相同的请求请求多次，他不会记录，他也不认识。因此引入cookie技术，客户端请求服务器，如果服务器需要记录该用户状态，就使用response向客户端浏览器颁发一个Cookie。客户端会把Cookie保存起来。当浏览器再请求该网站时，浏览器把请求的网址连同该Cookie一同提交给服务器。服务器检查该Cookie，以此来辨认用户状态。
- cookie问题
  - 数据保存在在客户端，信息容易被泄露

# cookie+session实现方式
![cookie+session](../images/cookie/cookie%E5%8A%A0session%E7%9A%84%E6%9C%BA%E5%88%B6.png)
- Session是另一种记录客户状态的机制，不同的是Cookie保存在客户端浏览器中，而Session保存在服务器上。客户端浏览器访问服务器的时候，服务器把客户端信息以某种形式记录在服务器上。这就是Session。客户端浏览器再次访问时只需要从该Session中查找该客户的状态就可以了。每个用户访问服务器都会建立一个session，那服务器是怎么标识用户的唯一身份呢？事实上，用户与服务器建立连接的同时，服务器会自动为其分配一个SessionId，把sessionId添加在cookie中请求。
- session问题
  - 服务器保存大量的session信息，很消耗服务器性能，如果考虑多台服务器部署，还要考虑session共享的问题

# 第三方案

- 服务器通过加密算法对信息加密，然后返回给客户端，客户端再发送的时候携带此信息。增加了加密解密验证的环节，由于加密的密码在服务器，导致人为很难伪造，再加上过期时间。
- token是无状态的，token字符串里就保存了所有的用户信息。客户端登陆传递信息给服务端，服务端收到后把用户信息加密（token）传给客户端，客户端将token存放于localStroage等容器中。客户端每次访问都传递token，服务端解密token，就知道这个用户是谁了。通过cpu加解密，服务端就不需要存储session占用存储空间，就很好的解决负载均衡多服务器的问题了。这个方法叫做JWT(Json Web Token)

# jwt
![jwt](../images/cookie/jwt.png)
## python3安装

```
pip3 install pyjwt

pip3 install djangorestframework-jwt
djangoresframework-jwt本质是调用pyjwt实现

```

## 基于传统的token认证

用户登录,服务端给返回token,并将token保存在服务端. 以后用户再来访问时,需要携带token,服务端获取token后,再去数据库中获取token进行校验.

## jwt

http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html

用户登录,服务端给用户返回一个token(服务端不保存). 以后用户再来访问,需要携带token,服务端获取token后,再做token的校验.

优势:相较于传统的token相比,它无需在服务端保存token

## jwt实现过程

https://jwt.io/#debugger-io，可以查看jwt的组成部分。

无论何时用户想要访问受保护的路由或者资源的时候，用户代理（通常是浏览器）都应该带上JWT，典型的，通常放在Authorization header中，用Bearer schema。

header应该看起来是这样的：

> Authorization: Bearer

服务器上的受保护的路由将会检查Authorization header中的JWT是否有效，如果有效，则用户可以访问受保护的资源。如果JWT包含足够多的必需的数据，那么就可以减少对某些操作的数据库查询的需要，尽管可能并不总是如此。

- 用户提交用户名和密码给服务端,如果登录成功,使用jwt创建一个token,并给用户返回. 

  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
  ```

  注意:jwt生成的token是由三段字符串组成,并且用.连接起来. 

  - 第一段字符串,HEADER, 内部包含算法/token类型.
    json转化成字符串,然后做 base64url 加密(base64加密 ; + _ ).

    ```
    {
      "alg": "HS256",
      "typ": "JWT"
    }
    ```

  - 第二段字符串,payload,自定义值. 
    json转化成字符串,然后做 base64url 加密(base64加密 ; + _ ).

    ```
    {
      "id": "123123",
      "name": "chenggen",
      "exp": 1516239022 # 超时时间
    }
    ```

  - 第三段字符串:  

    ```
    第一步: 第1,2部分密文拼接起来
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ
    第二步:对前2部分密文进行HS256加密 + 加盐
    第三步:对HS256加密后的密文再做base64url加密
    ```

- 以后用户再来访问时候,需要携带token,后端需要对token进行校验

  - 获取token

  - 第一步: 对token进行切割

    ```
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
    ```

  - 第二步: 对第二段进行base64url解密,并获取payload信息,检测token是否已经超时?

    ```
    {
      "id": "123123",
      "name": "chenggen",
      "exp": 1516239022 # 超时时间
    }
    ```

  - 第三步: 把第1,2端拼接,再次执行sha256加密

    ```
    HMACSHA256(
      base64UrlEncode(header) + "." +
      base64UrlEncode(payload),
      secret)
    第一步: 第1,2部分密文拼接起来
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ
    第二步:对前2部分密文进行HS256加密 + 加盐（secret这个密钥只有服务器才知道，避免泄露）

    密文 = base64解密(SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c)
    如果相等,表示token未被修改过.(认证通过)
    ```
# 为什么要抛弃session，使用token
现代架构之所以用 token ，是因为后端普遍采用分布式，各服务器之间同步状态（比如 session ）的开销很大，所以干脆不用状态，而是给个 token ，后端各自验证 token 的有效性而无需与其他服务器沟通，这就是所谓的 stateless 。

stateless 在绝大多数时候都没问题，但我们却不太可能实现彻底的无状态。比如用户修改了密码，服务端想强制他重新登录，这就得通知各个服务器不要再接受之前的 token 了。

要解决这个问题，常见的有 3 种方法：
1 、找个地方（内存、数据库等）记录合法的 token ，每次验证 token 都查一下这个 token 是否还在。
2 、找个地方（内存、数据库等）记录 token 的黑名单，每次验证 token 都查一下这个 token 是否在黑名单里。
3 、让 token 自己失效。

前两种都是有状态的方法，仍然避免不了状态同步的瓶颈，所以我们一般采用第三种方法。

那怎么让 token 自己失效呢？ token 里一般都有时间信息，所以只需把有效期设得短一点，不再更新它，它就过期失效了。

这就引出了更新的问题，怎么更新 token 呢？我们一般用另一个 token ，这就是所谓的 refresh token 。服务端收到 refresh token 以后，是要检查黑名单或者白名单的，所以更新 token 这一步是有状态的。只有 refresh token 有效，才会下发 access token ，这样就把对状态同步的需求限制到了一个很小的范围内，从而降低状态同步成本。

# 其他：

- refreshToken 获取新 token 即可（对用户来说是无感知的替换了 accessToken ）。jwt 和 redis 选择一种方案即可，jwt 本身有附带信息解密即可，如果用 redis 关联 token-用户信息查询也很快。（https://blog.csdn.net/NSPOKS/article/details/101771817/）　
- JWT 可以有 JTI 唯一 ID ，需要支持注销的话广播一下 JTI 到各个访问控制点作为黑名单就行了。平时不用每次访问都去 redis 或者数据库验证，使用 JWT 自带的签名校验。
