---
title: FastAPI 登录与认证：OAuth2、SSO 与常见方式
description: FastAPI 登录与认证：OAuth2、SSO 与常见方式。上一篇 [FastAPI 学习笔记：从 ASGI 到异步 API 的生态梳理](https://zhang-jane.github.io/post/5057eef4.html) 把协议栈和…适合日常查阅、复习对照与工程检索。
date: 2026-04-04T20:00:00.000Z
updated: 2026-04-05T00:00:00.000Z
tags:
  - FastAPI
  - Python
  - OAuth2
  - JWT
  - 认证授权
  - SSO
  - MFA
  - WebAuthn
categories: Python
abbrlink: 283c0af4

---


上一篇 [FastAPI 学习笔记：从 ASGI 到异步 API 的生态梳理](https://zhang-jane.github.io/post/5057eef4.html) 把协议栈和迷你案例跑通之后，很自然会遇到下一层问题：**用户是谁、能不能访问这条接口、凭证存哪**。这篇把「常见登录与认证」放在一张表里对照，再单独说清楚 **OAuth2**、**SSO（单点登录）** 在工程里各自指什么；仍以官方文档为锚，代码只写到能指导你拆模块的程度。

与 **浏览器里 Cookie、Token、Session** 的载体辨析，可配合 [cookie、token、session、JWT 你们是不是在讨论同一件事](https://zhang-jane.github.io/post/598151c0.html)。

**Python 侧依赖锁定与 CI 可复现**见 [2026 年 Python 包管理与依赖选择](https://zhang-jane.github.io/post/6da79668.html)。**全栈里接口层与身份对接**可与 [全栈开发技术选型](https://zhang-jane.github.io/post/64818318.html) 对照；**前端包管理与锁文件**可与 [前端包管理机制笔记](https://zhang-jane.github.io/post/bacdc374.html) 对照——运行时不同，**「声明依赖 + 锁文件 + CI 装包」** 仍是同一条习惯。

**读完你能带走：**

- **401 / 403**、**认证与授权** 在接口设计里怎么区分最省事。  
- **Bearer、JWT、OAuth2、OIDC、SSO** 各解决哪一段，避免把「OAuth2 密码流教程代码」直接当生产方案。  
- **fastapi-sso / fastapi-users / 企业 IdP** 三条快车道的适用边界与通用底线（HTTPS、state、密钥不进仓库）。

## 认证与授权：先分清两件事

- **认证（Authentication）**：证明「你是谁」。常见凭证是密码、令牌、证书等。
- **授权（Authorization）**：在已确认身份的前提下，判断「你有没有权做这件事」（读/写某资源、某角色）。

HTTP 状态码里，**401 Unauthorized** 多表示未认证或凭证无效；**403 Forbidden** 多表示已认证但无权访问。实际接口设计里团队口径会略有出入，但读文档时按上面这个区分最省事。

## 常见方式一览：适用场景比名字更重要

| 方式             | 凭证长什么样                                                      | 典型场景                                                 | 在 FastAPI 里的抓手                                                                                                                    |
| ---------------- | ----------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| API Key          | 请求头或查询串里的密钥                                            | 服务间调用、公开 API 配额、简单集成                      | `APIKeyHeader` / `APIKeyQuery`、[前文迷你案例](https://zhang-jane.github.io/post/5057eef4.html) 同类写法                               |
| HTTP Basic       | `Authorization: Basic base64(user:pass)`                          | 管理后台、快速挡一层、开发调试                           | `HTTPBasic`、`HTTPBasicCredentials`，配合 `secrets.compare_digest` 防时序攻击                                                          |
| Bearer / JWT     | `Authorization: Bearer <token>`                                   | 前后端分离、移动端、无状态水平扩展                       | 自己发 JWT 或接 IdP；`OAuth2PasswordBearer` 常用来**从请求里取 Bearer 令牌**（名字带 OAuth2，不等于整套授权服务器）                    |
| OAuth2 授权框架  | 多种「授权类型」换 access token                                   | 第三方登录、统一账号、委托访问                           | [FastAPI OAuth2 教程](https://fastapi.tiangolo.com/zh/tutorial/security/oauth2-jwt/) 演示密码流；生产上第三方场景多见**授权码 + PKCE** |
| SSO（单点登录）  | 由**身份提供商（IdP）**签发断言或令牌，各应用（SP）信任同一套身份 | 企业内多系统、统一账号、与 Azure AD/Okta/Keycloak 等对接 | 协议多为 **SAML 2.0** 或 **OIDC**；FastAPI 常作**依赖方应用**，用授权码换 token 后建本地会话或 JWT，见下文                             |
| Session / Cookie | 服务端会话 ID 存在 Cookie                                         | 传统 Web 同站、服务端要集中撤销会话                      | Starlette `SessionMiddleware`、响应里 `set_cookie`；注意 CSRF 与 `SameSite`；载体辨析见 [cookie/token 旧文](https://zhang-jane.github.io/post/598151c0.html) 与 [#cookie-session](#cookie-session) |
| MFA / 扫码 / Passkeys | TOTP 动态码、扫码 ticket、WebAuthn 公钥凭证                    | 二次验证、跨设备登录、无密码/通行密钥                  | 见文末 [扩展](#extended-mfa-passkeys)：[`#mfa-totp`](#mfa-totp) · [`#qr-login`](#qr-login) · [`#passkeys-webauthn`](#passkeys-webauthn) |

没有「银弹」：**对内 API** 往往 API Key 或 mTLS 就够；**对用户的 Web 应用**常见 Cookie Session 或 OIDC；**企业统一身份与多应用**常见 **SSO**；**移动端 / SPA** 常见 OAuth2/OIDC 拿到 access token（多配合 **HTTPS** 与短生命周期、刷新令牌）。

文首已链到 **Cookie / Token / Session** 辨析文；若已读过，可从 [Bearer 与 JWT](#bearer-jwt) 往下，并结合 [#cookie-session](#cookie-session)。**MFA、扫码登录、通行密钥** 的展开见 [扩展：MFA、扫码登录与 Passkeys](#extended-mfa-passkeys)。

## HTTP Basic：简单但有代价

浏览器或客户端把用户名密码用 Base64 放在 `Authorization` 头里。实现成本低，但**凭证随请求重复发送**，必须全程 HTTPS，且一般应配合防暴力、锁定策略。FastAPI 里用 `HTTPBasic`，验证时用 `secrets.compare_digest` 比较密码，避免普通字符串比较泄漏时间信息。见 [FastAPI HTTP Basic](https://fastapi.tiangolo.com/zh/advanced/security/http-basic-auth/)。

<a id="bearer-jwt"></a>

## Bearer 与 JWT：无状态里最常见的一档

**Bearer** 只是 HTTP 里的一种认证方案名字，表示「令牌放在 `Authorization: Bearer …` 里」。令牌可以是透明随机串（opaque），也可以是 **JWT**（自包含载荷、带签名）。

**JWT** 常见结构是三段：`header.payload.signature`。服务端用密钥校验签名后，从 payload 读出 `sub`（用户标识）、过期时间等。**优点**是服务间不必每次查会话存储；**代价**是撤销难（除非维护黑名单或极短过期 + 刷新令牌）。Python 侧常用 [PyJWT](https://pyjwt.readthedocs.io/) 或教程里的 [python-jose](https://python-jose.readthedocs.io/)，算法与密钥管理要按环境区分，**不要把密钥写进仓库**。

## OAuth2：规范在说什么

[OAuth 2.0](https://oauth.net/2/) 是一套**授权**框架：客户端用「授权类型」向**授权服务器**换 **access token**，再用 token 访问资源服务器。它**不规定** token 一定是 JWT，也不等于「登录协议」本身；实际产品里常与 **OpenID Connect（OIDC）** 叠在一起做统一登录与用户信息。

常见授权类型（grant）包括：

- **授权码（Authorization Code）**：适合有后端的 Web 应用；配合 **PKCE** 提升公共客户端安全性，第三方登录主流之一。
- **客户端凭证（Client Credentials）**：机器对机器，无用户在场。
- **资源所有者密码（Resource Owner Password）**：用户把账号密码交给客户端，由客户端去换 token。**RFC 中已不推荐用于第三方场景**；FastAPI 官方教程用它是为了**教学路径最短**，演示完 JWT 后你应评估是否换授权码流或 OIDC。

把这套和 FastAPI 对齐时，建议直接读 [安全概览](https://fastapi.tiangolo.com/zh/tutorial/security/) 与 [OAuth2 密码流 + JWT](https://fastapi.tiangolo.com/zh/tutorial/security/oauth2-jwt/)：里面的 `OAuth2PasswordBearer` 本质是**声明客户端应把 Bearer 令牌放在哪**；真正的用户校验仍在你写的依赖里完成。

## SSO（单点登录）：一次登录，多处互信

**SSO（Single Sign-On）** 描述的是一种体验与架构：**用户在同一套组织身份里只登录一次**，就能访问多个相互信任的应用，而不在每个应用里重复输入账号密码。它本身不是单独一套「比 OAuth2 更底层」的 RFC，而是通常落在 **SAML 2.0**、**OpenID Connect（OIDC）** 或 **CAS** 等具体协议与产品上。

可以粗略记三个角色：

- **身份提供商（IdP）**：真正验密码、发令牌或签 SAML 断言的一方（如公司 Azure AD、[Okta](https://www.okta.com/)、自建 [Keycloak](https://www.keycloak.org/)）。
- **服务提供方（SP）**：你的业务应用，只**信任 IdP 的结论**，不再长期保存用户密码。
- **用户代理**：多半是浏览器；流程里常见**重定向**：访问受保护资源 → 跳到 IdP 登录 → 带着授权码或断言回到 SP 的回调地址。

和「应用自己存用户表 + 密码哈希」相比，SSO 把**身份源**集中到 IdP：你的 FastAPI 更常做的是：**回调路由里用授权码换 token（OIDC/OAuth2）或验 SAML 断言**，再把结果映射成本地用户 ID、角色，并写入 **Session** 或签发**本应用 JWT**（取决于你是否要前后端分离、是否跨域）。

常见两条技术线：

- **OIDC**：跑在 OAuth2 之上，多了 `id_token`、用户信息端点，浏览器与移动应用里很普遍；企业 IdP 与云厂商多提供 OIDC 元数据（well-known URL）。规范见 [OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html)。
- **SAML 2.0**：传统企业、大量存量系统集成里仍常见，XML 断言、POST/Redirect Binding；Python 侧常有专用库或网关（由反向代理或专用服务终止 SAML，再把身份以请求头等形式交给后端）。入门可读 [SAML 2.0 概览](https://wiki.oasis-open.org/security/SAML_2.0)。

**CAS（Central Authentication Service）** 另一类集中式票据协议，高校等环境常见；思路仍是「登录一次、持票据访问多服务」，与 OAuth2/OIDC 生态不同，选型时看组织现有基础设施。

在 FastAPI 里落地 SSO，很少从零手写协议细节，底层仍是：**选 IdP → 按文档配 client_id、回调 URL、scope → 用成熟库完成重定向与 token 交换**。例如 [Authlib](https://authlib.org/) 对 OAuth/OIDC 客户端有较好支持；SAML 则常由 **反向代理 / API 网关** 或独立服务先处理，再让 FastAPI 只读已校验过的身份请求头（降低应用内复杂度）。

在 FastAPI 中**快速**接入 SSO，主要取决于你的**身份提供者（IdP）**是谁：Google、GitHub、微软等公有云账号，还是公司内部的 LDAP/SAML/OIDC。下面三条是工程里常见的「快车道」。

### 方案一：使用 `fastapi-sso`（轻量、常见社交平台）

若只需接入常见的第三方平台（Google、GitHub、Microsoft、Facebook 等），这是对 OAuth2 的封装，不必自己写完整的 code 交换逻辑。

安装：

```bash
pip install fastapi-sso
```

以 Google 为例的核心写法（凭据来自 Google Cloud Console）：

```python
from typing import Any

from fastapi import FastAPI, Request
from fastapi_sso.sso.google import GoogleSSO
from starlette.responses import Response

app = FastAPI()

google_sso = GoogleSSO(
    client_id="your-client-id",
    client_secret="your-client-secret",
    redirect_uri="http://localhost:8000/auth/callback",
)


@app.get("/auth/login")
async def auth_init() -> Response:
    """初始化登录：重定向到 Google。"""
    async with google_sso:
        return await google_sso.get_login_redirect()


@app.get("/auth/callback")
async def auth_callback(request: Request) -> dict[str, Any]:
    """回调：换取并校验用户信息。"""
    async with google_sso:
        user = await google_sso.verify_and_process(request)

    # user 常含 id、email、display_name、picture 等
    return {"message": f"Hello {user.display_name}!", "user": user}
```

### 方案二：使用 `fastapi-users`（用户表 + JWT + 多 OAuth）

若需要**注册 / 登录 / 数据库用户**与 **JWT**，并希望把 Google、GitLab 等 OAuth 一并纳入同套路由，这是社区里很常用的一套组合。

- **自带 JWT 与用户模型管线**：SSO 回调后可落到库表并发令牌。
- **多提供者**：可同时配置多个 OAuth 客户端。
- 安装示例：`pip install 'fastapi-users[sqlalchemy,oauth]'`，OAuth 部分依赖 **`httpx-oauth`**；用 `get_oauth_router` 等辅助函数挂载 `/login`、`/callback` 一类路由（以官方文档为准）。

复杂度高于「只接一个社交登录」，但省去大量重复胶水代码。

### 方案三：企业 IdP（Auth0 / Keycloak / WorkOS 等）

若目标是**企业内部 SSO**（SAML、复杂 OIDC、目录集成），在应用里手写协议细节通常不划算。

- **Auth0**：生态成熟，可查官方与社区里的 FastAPI 集成示例；也可用通用 OIDC 客户端库按 well-known 配置。
- **Keycloak**：开源 IdP；Python 侧可用 [python-keycloak](https://python-keycloak.readthedocs.io/) 管理资源，或在资源服务侧用 **`OAuth2PasswordBearer` / JWT 校验** 验证 Keycloak 签发的 access token（按你采用的 token 形态选型）。
- **WorkOS** 等 B2B 身份产品：适合「对接企业客户的 IdP」类产品形态，按厂商文档接入。

### 方案对比与选型

| 需求场景 | 推荐方向 | 相对复杂度 |
| :--- | :--- | :--- |
| 仅需第三方快捷登录（Google/GitHub 等） | `fastapi-sso` 或 Authlib OIDC 客户端 | 低 |
| 需要用户表 + 登录态 + 多 OAuth | `fastapi-users`（含 oauth 扩展） | 中 |
| 企业内部 SSO / SAML / 复杂 OIDC | Auth0、WorkOS、或自建 Keycloak 等 + 专用集成 | 中–高 |
| 完全自主可控的企业身份中心 | Keycloak（或同类）+ 应用侧只验 token / 会话 | 高（运维与协议面） |

### 避坑要点

1. **State / nonce**：处理 callback 时校验 `state`（及 OIDC 的 `nonce` 等）以降低 CSRF 与重放风险；成熟封装（如 `fastapi-sso`）通常会处理 state，仍建议在架构评审里显式确认。
2. **HTTPS**：生产环境 OAuth2/OIDC 普遍要求 **HTTPS**；本地 HTTP 调试若遇重定向问题，部分栈可用 `OAUTHLIB_INSECURE_TRANSPORT=1`（仅开发环境，勿用于生产）。
3. **异步**：优先选用 **async** 友好的 HTTP 客户端与库，避免在事件循环里阻塞式调用拖垮并发。
4. **通用底线**：**回调 URL 与 IdP 控制台配置完全一致**、`client_secret` 与密钥**不进仓库**、日志中对 token **脱敏**。

无论走哪条快车道，**HTTPS、回调 URL 精确匹配、state/nonce 防重放、密钥与 client_secret 不进仓库** 都仍是底线。

<a id="cookie-session"></a>

## Cookie 与 Session：别忽略浏览器安全面

同站 Web 应用里，登录成功后发 **Session ID** Cookie，服务端保存会话状态，撤销相对容易。关于 Cookie 作为**状态载体**与 JWT 的对比，可与 [cookie、token、session、JWT 你们是不是在讨论同一件事](https://zhang-jane.github.io/post/598151c0.html) 对照阅读。跨站时要考虑 **CSRF**（表单用 CSRF token、`SameSite` Cookie）、**XSS**（慎存敏感信息在 localStorage）。Starlette 提供会话中间件，详见 [SessionMiddleware](https://www.starlette.io/middleware/#sessionmiddleware) 与 FastAPI 文档中的对应用法。

## 组合思路：一条可落地的线

1. **持久化**：用你选的异步友好存储（ORM 或原生 SQL）维护用户表；密码用 **passlib** 等做哈希，禁止明文落库。
2. **注册**：校验用户名/邮箱唯一，写入哈希后的口令。
3. **登录**：校验口令成功后签发 JWT（`sub` 放用户 id 或业务主键，`exp` 放过期时间），或建立服务端 Session 并写 Cookie。
4. **保护路由**：`OAuth2PasswordBearer` 取 token → 解码校验 → 查库得当前用户 → `Depends` 注入。
5. **上线**：HTTPS、轮换签名密钥、收紧 CORS、日志脱敏；需要「立刻下线某用户」时要额外设计黑名单或缩短 token 寿命并配合刷新机制。

接 **企业 SSO** 时，常见模式是：IdP 确认身份后，在你的库里做 **外部 subject 与本地用户** 的映射（或首次登录自动开户），再发本会话或本应用 JWT，而不是在业务库里重复维护一套企业目录密码。

<a id="extended-mfa-passkeys"></a>

## 扩展：MFA、扫码登录与 Passkeys

**[多因素认证（TOTP）](#mfa-totp)**、**[扫码登录](#qr-login)** 与 **[Passkeys（WebAuthn）](#passkeys-webauthn)** 在现代应用里都很常见，但底层协议与系统架构差别很大：有的依赖**共享密钥与时间同步**，有的是**跨设备 ticket + 实时通道**，有的则是**非对称密钥与挑战–响应**。对 FastAPI 这类后端来说，共性是把 **状态管理**（会话、ticket、challenge 存哪、多久过期）和 **密码学验证**（HMAC、JWT 校验、WebAuthn 验签）收口在可测试的依赖与存储层，而不是散落在路由里。

下面按同一套路拆解原理，并给出可落地的实现思路（代码仅供结构与选型参考，生产环境需补全鉴权、限流、审计与密钥管理）。

<a id="mfa-totp"></a>

### 多因素认证（MFA / 2FA，基于 TOTP）

最常见的 2FA 基于 **TOTP（Time-Based One-Time Password）** 协议（例如 Google Authenticator 一类应用）。

#### 原理概要

TOTP 的本质是 **「共享密钥 + 时间片」**。

1. **绑定阶段**：服务器生成随机 **Secret**，编码成二维码；用户用身份验证器 App 扫码后，服务端与 App 各自保存同一份 Secret。
2. **登录阶段**：App 按当前时间（通常 30 秒一步）与 Secret 用 **HMAC-SHA1** 派生 6 位数字。
3. **验证阶段**：用户提交 6 位数字，服务器用同一 Secret 与服务器时间在同样时间窗口内复算，一致则通过（实现上通常允许前后若干时间片的漂移）。

与上文 [Bearer 与 JWT](#bearer-jwt) 的关系是：MFA 往往是在「用户名密码已通过」之后，再增加一步**持有因子**验证；通过后你再签发会话 Cookie 或 JWT，逻辑仍落在统一的登录管线里。

#### FastAPI 实现要点

常用库：**[pyotp](https://github.com/pyauth/pyotp)**（TOTP 计算）与 **qrcode**（把 `otpauth://` URI 画成二维码）。

```python
from io import BytesIO

import pyotp
import qrcode
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse

app = FastAPI()

# 示例内存结构；生产环境应持久化 Secret，并加密存放
user_db: dict[str, dict[str, object]] = {
    "user_123": {"secret": None, "is_mfa_enabled": False},
}


@app.post("/mfa/setup")
async def setup_mfa(user_id: str = "user_123") -> StreamingResponse:
    """生成密钥并返回二维码（PNG）。"""
    secret = pyotp.random_base32()
    user_db[user_id]["secret"] = secret

    uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name="user@example.com",
        issuer_name="MyFastAPIApp",
    )
    img = qrcode.make(uri)
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")


@app.post("/mfa/verify")
async def verify_mfa(code: str, user_id: str = "user_123") -> dict[str, object]:
    """校验 6 位动态码；通过后标记 MFA 已启用并可下发会话 / JWT。"""
    row = user_db.get(user_id)
    if row is None:
        raise HTTPException(status_code=404, detail="user not found")
    secret = row.get("secret")
    if not secret:
        raise HTTPException(status_code=400, detail="MFA not setup")

    totp = pyotp.TOTP(str(secret))
    if totp.verify(code):
        user_db[user_id]["is_mfa_enabled"] = True
        return {
            "message": "MFA verified successfully, login complete!",
            "token": "jwt_token_here",
        }
    raise HTTPException(status_code=401, detail="Invalid MFA code")
```

<a id="qr-login"></a>

### 扫码登录（跨设备授权）

扫码登录本质是 **跨设备授权**：用已登录设备（手机 App）为未登录设备（PC 浏览器）背书一次登录。

#### 原理概要

1. PC 向服务器申请 **ticket_id**，展示为二维码；PC 侧用 **WebSocket** 或 **轮询** 监听该 ticket 的状态。
2. 手机扫码解析出 ticket，可选步骤：状态变为「已扫码，待确认」。
3. 用户在手机上确认后，手机带**已有用户凭证**请求服务器，把 **user 与 ticket** 绑定。
4. 服务器校验手机凭证有效后，向 PC 通道下发**新会话**或 **access token**（或让 PC 用一次性 code 换 token）。

与 [Cookie 与 Session](#cookie-session) 的配合：PC 侧最终仍可能是 **Set-Cookie** 建会话，或走 **Bearer JWT**；ticket 只是短期桥接凭证，应 **短 TTL**，并放在 **Redis** 等集中存储里便于集群与撤销。

#### FastAPI 实现要点

典型组合：**Redis**（ticket 状态与过期）+ **WebSocket**（PC 实时收结果）；生产环境可用 **Redis Pub/Sub** 在多实例间转发「确认」事件。

```python
import uuid
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()
# 单机演示：ticket_id -> WebSocket；生产请用 Redis + 连接管理
active_connections: dict[str, WebSocket] = {}


@app.get("/qrcode/generate")
async def generate_qrcode() -> dict[str, str]:
    ticket_id = str(uuid.uuid4())
    # await redis.setex(f"qr:{ticket_id}", 300, "PENDING")
    return {"ticket_id": ticket_id, "qr_content": f"myapp://login?ticket={ticket_id}"}


@app.websocket("/qrcode/ws/{ticket_id}")
async def qrcode_websocket(websocket: WebSocket, ticket_id: str) -> None:
    await websocket.accept()
    active_connections[ticket_id] = websocket
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.pop(ticket_id, None)


@app.post("/qrcode/confirm")
async def confirm_qrcode(ticket_id: str, user_token: str) -> dict[str, Any]:
    # 解析并校验 user_token -> user_id（略）
    user_id = "user_789"

    # await redis.set(f"qr:{ticket_id}", f"CONFIRMED:{user_id}", ex=300)

    ws = active_connections.get(ticket_id)
    if ws is not None:
        await ws.send_json(
            {"status": "CONFIRMED", "access_token": "new_jwt_for_pc"},
        )
    return {"message": "Authorized successfully", "user_id": user_id}
```

<a id="passkeys-webauthn"></a>

### Passkeys（通行密钥 / WebAuthn）

Passkeys 基于 **WebAuthn / FIDO2**：用设备上的**生物识别或设备 PIN** 解锁本地密钥，浏览器与服务器之间走**挑战–响应**与**公钥验签**，密码不以可逆形式经网络传输。

#### 原理概要

1. **注册**：服务器下发 **challenge**；浏览器在可信执行环境里生成 **密钥对**，**私钥不出设备**；服务器只存 **公钥**、凭证 ID、签名计数等元数据。
2. **登录**：服务器再发 challenge，浏览器用私钥签名；服务器用公钥验签，并可检查 **signCount** 防克隆。

与「自己算 JWT 签名」不同，这里验证的是 **WebAuthn 断言**；务必使用成熟库，**不要手写椭圆曲线或 COSE 解析**。

#### FastAPI 实现要点

Python 侧常用 **[py_webauthn](https://github.com/duo-labs/py_webauthn)**（即文中常称的 `webauthn` 包）：后端负责 **生成选项 JSON**、**校验 registration/authentication 响应**、持久化公钥与计数；前端必须调用 **`navigator.credentials.create()` / `get()`**。

下面伪代码展示依赖关系（具体 API 以你所安装版本文档为准，Pydantic v2 下多为 `model_validate_json` 等）：

```python
from typing import Any

from fastapi import FastAPI, Request

app = FastAPI()

# from webauthn import (
#     generate_registration_options,
#     verify_registration_response,
#     generate_authentication_options,
#     verify_authentication_response,
# )
# from webauthn.helpers.structs import RegistrationCredential, AuthenticationCredential


@app.post("/passkey/register/options")
async def get_register_options(user_id: str, username: str) -> dict[str, Any]:
    """生成注册选项；challenge 存入服务端会话或 Redis，供下一步 verify。"""
    # options = generate_registration_options(...)
    # store options.challenge keyed by user_id or session
    return {"note": "return options JSON to frontend"}


@app.post("/passkey/register/verify")
async def verify_registration(request: Request) -> dict[str, str]:
    """校验 Attestation，落库 credential_public_key 等。"""
    _ = await request.json()
    return {"message": "Passkey registered (stub)"}


@app.post("/passkey/login/options")
async def get_login_options() -> dict[str, Any]:
    """生成认证选项；同样缓存 challenge。"""
    return {"note": "return options JSON to frontend"}


@app.post("/passkey/login/verify")
async def verify_login(request: Request) -> dict[str, str]:
    """用存储的公钥验签；通过后签发本应用会话或 JWT。"""
    _ = await request.json()
    return {"message": "Login successful (stub)", "token": "jwt_token"}
```

`rp_id` 必须与你的站点域名一致，生产环境仅在 **HTTPS** 下使用；本地开发可用 `localhost` 等特殊规则，以 [WebAuthn 规范与浏览器实现](https://www.w3.org/TR/webauthn-2/) 为准。

## 核心要点

- **概念分层**：OAuth2 是**授权**框架（多种 grant 换 access token）；OIDC 在 OAuth2 之上补**身份**（`id_token` 等）；SSO 是**体验与架构**（多应用信任同一 IdP）；JWT 多是 token **载体**，不是协议本身。  
- **信任边界**：服务间/API Key 与 mTLS；用户 Web 常见 Cookie Session 或 OIDC；移动端/SPA 常见 Bearer + 短寿命 token；企业场景常见 SAML/OIDC 与外部 IdP。  
- **实现抓手**：`OAuth2PasswordBearer` 常只负责**从请求里取 Bearer**；真正验用户仍在你的 `Depends`；企业 SSO 多为**授权码 + 回调**，用成熟库（如 Authlib）或网关终止 SAML 再进应用。  
- **快车道**：仅社交登录可评估 **fastapi-sso**；要用户表 + 多 OAuth 看 **fastapi-users**；复杂企业目录用 **Auth0 / Keycloak / WorkOS** 等并按文档验 token。  
- **底线**：HTTPS、`state`/`nonce`、回调 URL 与控制台一致、**密钥与 client_secret 不进仓库**、日志对 token **脱敏**；MFA / 扫码 / Passkeys 见 [扩展一节](#extended-mfa-passkeys)。  
- **与上篇衔接**：迷你 API 里的 API Key 只是演示；换成 JWT/OIDC 时仍保持 **路由 → 依赖取凭证 → 业务** 的分层，并与 [ASGI 学习笔记](https://zhang-jane.github.io/post/5057eef4.html) 中的 lifespan、中间件策略一致。
