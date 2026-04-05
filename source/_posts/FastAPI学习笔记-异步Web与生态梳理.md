---
title: FastAPI 学习笔记：从 ASGI 到异步 API 的生态梳理
tags:
  - FastAPI
  - Python
  - Starlette
  - Pydantic
  - ASGI
  - Tortoise ORM
  - Web开发
categories: Python
description: >-
  从 ASGI 到 FastAPI：串起 Starlette、Pydantic、OpenAPI 与 JSON Schema；ORM 与 Tortoise+lifespan、路由与依赖注入；附单文件案例与 Uvicorn/Gunicorn 部署。可与本站认证长文、Python 依赖笔记、Actions 部署对照。
abbrlink: 5057eef4
date: 2026-04-04 18:30:00
updated: 2026-04-05
---

如果你打算用 Python 写现代 HTTP API，多半会碰到 [FastAPI](https://fastapi.tiangolo.com/zh/)：类型注解驱动、自动生成交互式文档、性能口碑也不错。但文档里常出现 Starlette、Pydantic、ASGI 等名词——**它们各自解决什么问题、和 FastAPI 怎么叠在一起**，初学者容易晕。这篇笔记按「协议 → 服务器 → 框架 → 业务层」的顺序，把主线捋直，并记下我整理时的常用结论与链接，方便以后回看。

认证、登录与 JWT 见站内 [FastAPI 登录与认证：OAuth2、SSO 与常见方式](https://zhang-jane.github.io/post/283c0af4.html)。若你还关心 **Python 侧锁文件与 uv**、**CI 装依赖再构建**、**全栈接口层怎么拆**，可交叉阅读 [2026 年 Python 包管理与依赖选择](https://zhang-jane.github.io/post/6da79668.html)、[GitHub Actions + Hexo 博客自动部署](https://zhang-jane.github.io/post/6a366505.html)、[全栈开发技术选型](https://zhang-jane.github.io/post/64818318.html)。

**读完你能带走：**

- **ASGI** 在请求链里处在哪一层，为什么需要 **Uvicorn** 这类进程。
- **Starlette / Pydantic / FastAPI** 各自负责的边界，以及 **OpenAPI** 与校验怎么对齐。
- **lifespan** 里接数据库、**async** 路由里 `await` 的落点，以及单文件案例里 **Router、Depends、中间件** 怎么拼起来。

## 学习路径：先读谁、再读谁

官方文档是最稳的入口：[FastAPI 中文文档](https://fastapi.tiangolo.com/zh/)。往下挖实现细节时，建议并行翻阅：

- [Starlette](https://www.starlette.io/)：FastAPI 的 ASGI 与路由、请求/响应抽象多来自这里。
- [Pydantic](https://docs.pydantic.dev/latest/)：请求体验证、序列化与 OpenAPI 模式生成的核心。
- [ASGI 规范](https://asgi.readthedocs.io/en/latest/introduction.html)：理解 `scope` / `receive` / `send` 与 lifespan，后面读 Starlette 会轻松很多。

ORM 与数据库层不属于 FastAPI 内置能力，需要单独选型；下文会点到常见选项与参考基准。

## FastAPI、Starlette、Pydantic 各自是什么关系

一句话：**FastAPI 在 Starlette 上提供路由与 HTTP 语义封装，用 Pydantic 做数据模型与校验**；高性能宣传里常提 Starlette（异步 I/O）与 Pydantic（高效校验）。

- **Starlette**：轻量 ASGI 框架/工具集，适合构建异步 Web 服务。
- **Pydantic**：用类型提示定义模型，做校验、转换、默认值与文档元数据；v2 性能更好。
- **FastAPI**：把「声明式路由 + 自动参数绑定 + OpenAPI 文档」拼成开发者体验。

要理解「为什么是 ASGI」，需要先分清 **WSGI 与 ASGI**。

### WSGI 与 ASGI

- **WSGI**：同步接口，约定 Web 服务器如何把请求交给 Python 应用、如何返回响应。常见服务器如 Gunicorn、uWSGI，适合传统同步框架。
- **ASGI**：可视为 WSGI 在异步世界的延伸，除 HTTP 外还可承载 WebSocket、HTTP/2 等；应用是一个异步可调用对象，协议细节见 [ASGI 文档](https://asgi.readthedocs.io/en/stable/specs/index.html)。

常见 **ASGI 服务器**包括 Uvicorn、Daphne、Hypercorn 等，用于跑 FastAPI / Starlette 应用。

## OpenAPI 与 JSON Schema：文档从哪来

FastAPI 强调兼容开放标准：**OpenAPI**（原 Swagger 生态）描述 API 结构与元数据；字段层面的约束常与 **JSON Schema** 对齐。规范正文可查 [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)。

**JSON Schema** 用一套关键字描述「JSON 长什么样、有哪些字段、类型与约束」；光有模式还不够，实际校验要靠符合规范的验证器（Pydantic 在模型层承担了很大一部分工作）。入门说明见 [What is JSON Schema?](https://json-schema.org/overview/what-is-jsonschema)。

## ORM：为什么需要、Python 里怎么选

手写 SQL 每个接口重复一遍，既容易写出不一致的业务规则，也更容易在拼接字符串时踩 **SQL 注入**。**ORM（对象关系映射）**把表结构、关系与约束收敛到模型层，查询多用参数化，安全与可维护性都会好一截。

性能对比可参考社区基准仓库 [tortoise/orm-benchmarks](https://github.com/tortoise/orm-benchmarks)（注意基准与业务场景强相关，当作粗筛即可）。

简要印象（细节以各项目文档为准）：

| 方向             | 代表                                             | 备注                                                              |
| ---------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| 功能全面、生态大 | [SQLAlchemy](https://www.sqlalchemy.org/)        | Core（表达式）与 ORM 分层；异步路径依赖 greenlet 等，需看平台支持 |
| 轻量小项目       | [Peewee](https://docs.peewee-orm.com/en/latest/) | 简单直观；迁移可配合第三方工具                                    |
| asyncio 优先     | [Tortoise ORM](https://tortoise.github.io/)      | 与 FastAPI 同异步心智；支持多种异步驱动                           |
| 查询写法特别     | [Pony ORM](https://docs.ponyorm.com/)            | 生成器/lambda 转 SQL 等特性，上手曲线因人而异                     |

与 FastAPI 搭配时，若全链路 async，可优先考虑原生异步友好的 ORM 或异步封装；若大量同步库，则要评估阻塞与线程池策略（见下文「同步与异步」）。

## 从 ASGI 应用函数到 Starlette

最简 ASGI 应用是一个 `async def app(scope, receive, send)`：`scope` 描述连接上下文，`receive` 读事件，`send` 写响应。HTTP 响应至少要发 `http.response.start` 再发 `http.response.body`。

再往上，可用 Starlette 的 `Response` 子类把细节包起来，或用 `Starlette` 应用注册 `Route`，不必手写裸 `send`。

### Lifespan：启动与关闭时做什么

ASGI 的 **lifespan** 让你在应用启动、关闭时执行初始化与清理（例如建数据库连接池）。`scope["type"] == "lifespan"` 时循环读消息，对 `lifespan.startup` / `lifespan.shutdown` 做处理；若在 `scope["type"] == "http"` 分支里什么都不做就返回，会导致「未启动响应」类错误——**HTTP 与 lifespan 要分开处理**。

FastAPI 推荐用 **`lifespan` 上下文管理器**（`@asynccontextmanager`）在 `yield` 前初始化、`yield` 后清理；若指定了 `lifespan`，旧的 `on_event("startup")` 等不再混用。说明见 [FastAPI Lifespan Events](https://fastapi.tiangolo.com/advanced/events/)。

## Tortoise ORM：和 FastAPI 同一条异步线

[Tortoise ORM](https://tortoise.github.io/) 是 asyncio 友好的 ORM：**建连、迁移、增删改查都走异步接口**，在路由里用 `await` 完成数据库 I/O，不会把整条事件循环堵在同步驱动上。适合挂在 FastAPI 的 **`lifespan`** 里做初始化与收尾：启动时 `Tortoise.init`、按需 `generate_schemas`（开发期），关闭时 `Tortoise.close_connections()`。这与上文「Lifespan」一节是同一把钥匙——只是把文末完整案例里的内存 `dict` 换成真实表与异步会话。

下面用与业务无关的极简模型，突出「异步库 + 异步路由」这一条线（字段按需扩展）：

```python
from tortoise import fields
from tortoise.models import Model


class Article(Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=200, index=True)
    body = fields.TextField()

    class Meta:
        table = "articles"
```

**异步到底写在哪**：路由处理函数是 `async def` 时，对模型的读写一律 `await`，例如 `await Article.create(...)`、`await Article.get_or_none(id=...)`、`await Article.filter(...).all()`——这才是「与 FastAPI 同一条异步线」的落点；若某段仍是同步阻塞调用，应显式丢进线程池或换异步驱动，避免在 ASGI 里长时间占住事件循环。

**lifespan 里接数据库**（连接串与 `modules` 路径按项目调整）：

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI
from tortoise import Tortoise


@asynccontextmanager
async def lifespan(app: FastAPI):
    await Tortoise.init(
        db_url="sqlite://db.sqlite3",
        # modules：填写定义了 Article 等 Model 子类的模块路径，例如 "myapp.models"
        modules={"models": ["myapp.models"]},
    )
    await Tortoise.generate_schemas()
    yield
    await Tortoise.close_connections()


app = FastAPI(lifespan=lifespan)
```

开发期可先用 SQLite；上生产再换 PostgreSQL/MySQL 等异步驱动，**改 `db_url` 与连接池参数即可**，路由层的 `await` 写法不变。

注册登录、密码哈希、JWT、OAuth2 等与**认证**相关的一条龙，属于另一条话题；把「假用户列表」换成 Tortoise 查询即可，对照 [FastAPI JWT 教程](https://fastapi.tiangolo.com/zh/tutorial/security/oauth2-jwt/) 与站内 [FastAPI 登录与认证：OAuth2、SSO 与常见方式](https://zhang-jane.github.io/post/283c0af4.html) 即可，本节不再展开。

## FastAPI 日常开发：我最常记的几条

### 自动文档与上线

开发时 `/docs`（Swagger UI）、`/redoc`、`/openapi.json` 很方便；**生产环境**常关闭或限制暴露，例如：

```python
app = FastAPI(docs_url=None, redoc_url=None)
```

部分接口不想进 schema，可在路由上加 `include_in_schema=False`。

### 路径操作与顺序

- 路径参数用类型注解做校验；**固定路径要写在动态路径之前**（例如 `/users/me` 须在 `/users/{user_id}` 前）。
- 路径中含 `/` 的片段用 `{var:path}`。
- 枚举路径参数用 `Enum` 比在函数里手写 `if` 更利于文档与校验。

查询参数：非路径、非 Pydantic 模型的简单类型，会解析为 Query；可用 `Query` 做长度、正则等约束。需要区分「可选」与「带默认值」时，习惯用 `| None` 与默认值表达清楚。

### 请求体、表单与文件

- **Pydantic 模型**默认视为 JSON 请求体。
- 多个字段要包一层键、或与其它标量混在 body 里时，用 `Body(embed=True)` 等参数控制结构。
- `application/x-www-form-urlencoded` / `multipart/form-data` 用 `Form()`；上传文件用 `File()` / `UploadFile`，大文件优先 `UploadFile` 避免一次性读入内存。

POST 的 `Content-Type` 与浏览器表单行为可参考 [MDN：POST](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST)。

### Cookie、Header、依赖注入

- `Cookie()`、`Header()` 从请求取对应数据；也可用 `Request` 直接读 headers。
- **`Depends`** 用于注入可复用的校验逻辑、共享资源、认证步骤；依赖可以链式组合。认证（你是谁）与授权（你能做什么）别混为一谈；HTTP 状态码上，**401** 与 **403** 的语义别记反。

### 中间件与路由分组

- `@app.middleware("http")` 里对 `call_next` 前后做日志、鉴权等；多个中间件时，请求按注册顺序进入、响应逆序返回（洋葱模型）。
- 跨域常用 `CORSMiddleware`；预检 OPTIONS 与 `allow_origins` 等配置需与前端一致。
- 大项目用 **`APIRouter`** 分模块，再用 `include_router` 挂前缀与 tags。

### Pydantic `Field`

字段级约束与文档元数据用 `Field`，例如 `gt`、`max_length`、`description`，与 OpenAPI 展示一致。见 [Pydantic Fields](https://docs.pydantic.dev/latest/concepts/fields/)。

## 完整案例：单文件「迷你商品」API

下面是一个**可直接运行**的完整示例：内存字典模拟存储，不依赖数据库；覆盖 **`lifespan` 初始化**、**`APIRouter` 分组**、**Header API Key 依赖**、**HTTP 中间件**（请求 ID 与耗时）以及 **CORS**。复制为项目根目录的 `main.py` 即可。

环境要求：Python 3.10+，安装依赖：

```bash
pip install fastapi "uvicorn[standard]"
```

启动：

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

浏览器打开 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)，在 Authorize 或请求头里加上 `X-API-Key: demo-secret` 再调用 `/api/v1/items` 下的接口。健康检查 `GET /health` 无需密钥。

```python
"""FastAPI 完整示例：lifespan、APIRouter、依赖、中间件、CORS、Pydantic v2。"""

from __future__ import annotations

import logging
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------- 内存存储（进程内，重启即清空） ----------
class _Store:
    """线程内协程共享同一进程内存；生产环境请换真实数据库或缓存。"""

    def __init__(self) -> None:
        self._items: dict[int, dict[str, Any]] = {}
        self._next_id: int = 1

    def reset(self) -> None:
        self._items.clear()
        self._next_id = 1

    def add(self, payload: dict[str, Any]) -> dict[str, Any]:
        item_id = self._next_id
        self._next_id += 1
        row = {"id": item_id, **payload}
        self._items[item_id] = row
        return row

    def get(self, item_id: int) -> dict[str, Any] | None:
        return self._items.get(item_id)

    def all(self) -> list[dict[str, Any]]:
        return list(self._items.values())


STORE = _Store()


# ---------- Pydantic 模型 ----------
class ItemCreate(BaseModel):
    """创建商品：请求体。"""

    name: str = Field(min_length=1, max_length=200, description="名称")
    description: str | None = Field(
        default=None,
        max_length=2000,
        description="可选描述",
    )
    price: float = Field(gt=0, description="单价，须大于 0")


class ItemOut(BaseModel):
    """商品对外展示：响应体。"""

    id: int
    name: str
    description: str | None
    price: float
    created_at: str


# ---------- 依赖：API Key（演示用，生产请换 JWT/OAuth2 等） ----------
_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(
    api_key: Annotated[str | None, Depends(_api_key_header)],
) -> str:
    if api_key != "demo-secret":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-Key",
        )
    return api_key


# ---------- 路由分组 ----------
router = APIRouter(
    prefix="/api/v1",
    tags=["items"],
    dependencies=[Depends(verify_api_key)],
)


@router.get("/items", response_model=list[ItemOut])
async def list_items() -> list[dict[str, Any]]:
    return STORE.all()


@router.post("/items", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
async def create_item(body: ItemCreate) -> dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    payload = {
        "name": body.name,
        "description": body.description,
        "price": body.price,
        "created_at": now,
    }
    return STORE.add(payload)


@router.get("/items/{item_id}", response_model=ItemOut)
async def get_item(item_id: int) -> dict[str, Any]:
    row = STORE.get(item_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return row


# ---------- 应用与 lifespan ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    STORE.reset()
    logger.info("Lifespan: store reset, ready to accept requests.")
    yield
    logger.info("Lifespan: shutdown, %s items in memory.", len(STORE.all()))


app = FastAPI(
    title="FastAPI Demo",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
    request.state.request_id = request_id
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time-ms"] = f"{elapsed_ms:.2f}"
    logger.info(
        "%s %s -> %s %s",
        request.method,
        request.url.path,
        response.status_code,
        f"{elapsed_ms:.2f}ms",
    )
    return response


@app.get("/health", tags=["meta"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(router)


if __name__ == "__main__":
    import uvicorn

    # 直接 python main.py 时传入 app 对象；命令行 uvicorn main:app --reload 仍可用
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

**说明摘要**：

- **`lifespan`**：启动时重置内存表，关闭时打日志；真实项目里可在此建立/关闭连接池。
- **`APIRouter`**：`/api/v1` 前缀 + `dependencies=[Depends(verify_api_key)]`，该组路由统一校验密钥。
- **中间件**：为每个响应加上 `X-Request-ID` 与 `X-Process-Time-ms`，便于联调与排错。
- **交互式文档**：使用 `APIKeyHeader` 后，在 Swagger UI 中点击「Authorize」，把 `demo-secret` 填进 `X-API-Key` 即可调用受保护路由。

若你希望把路由拆到 `routers/items.py`，只需把 `router` 与相关模型、依赖挪到子模块，在 `main.py` 里 `from routers.items import router` 再 `include_router`，结构更大时更清晰。

## 部署：Uvicorn 与 Gunicorn

单进程开发常用：

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

生产上常见 **`gunicorn` + `uvicorn.workers.UvicornWorker`**：由 Gunicorn 管理多进程，每个 worker 内跑 Uvicorn 处理 ASGI。worker 数可结合 CPU 与 IO 调整，例如：

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app -b 0.0.0.0:8000
```

`-w` 为 worker 数量（常按 CPU 核心数与 IO 特征调，无万能公式）；`-k uvicorn.workers.UvicornWorker` 指定用 Uvicorn 跑 ASGI 应用。细节见 [Uvicorn](https://www.uvicorn.org/) 与 [Gunicorn](https://docs.gunicorn.org/en/stable/)。

## 日志

应用内用标准库 `logging` 即可；中间件里打请求 ID、耗时、状态码是常见模式。Uvicorn 自带 access/error 日志，也可通过 `--log-config` 用 yaml/json/ini 统一配置（具体键名以当前版本文档为准）。

## 同步与异步：别在 async 路由里随便阻塞

FastAPI 同时支持 `async def` 与 `def` 路由；**若在 async 函数里调用长时间 CPU 密集或阻塞 I/O**，会卡住事件循环。阻塞型库要么放到线程池，要么换异步驱动，或改用同步 `def` 让框架走线程池（行为以当前 Starlette/FastAPI 文档为准）。官方说明见 [FastAPI 异步](https://fastapi.tiangolo.com/zh/async/)。

## 核心要点

- **栈关系**：ASGI 约定服务器如何驱动应用；Starlette 提供路由与 HTTP/WebSocket 抽象；Pydantic v2 负责模型与校验；FastAPI 把声明式路由与 OpenAPI 串起来。  
- **数据与持久化**：ORM 不是 FastAPI 内置能力；全链路 async 时优先选异步友好 ORM（如 Tortoise），并在 **lifespan** 里建连与收尾。  
- **日常开发**：固定路径排在动态路径前；生产可关文档端点；`Depends` 组合认证与业务依赖；中间件注意洋葱顺序与 CORS 与前端一致。  
- **部署**：开发用 `uvicorn main:app --reload`；生产常见 **Gunicorn + UvicornWorker** 多进程；阻塞 I/O 勿长时间占满 async 路由所在的事件循环。  
- **案例定位**：文末单文件「迷你商品」API 把 **lifespan、`APIRouter`、API Key、`CORSMiddleware`、请求日志中间件** 收成可运行对照，与 `/docs` 里的 schema 一一对应。  
- **延伸阅读**：认证与令牌管线见 [OAuth2 与常见登录方式](https://zhang-jane.github.io/post/283c0af4.html)；依赖可复现性与 CI 可与 [Python 依赖笔记](https://zhang-jane.github.io/post/6da79668.html)、[Actions 部署](https://zhang-jane.github.io/post/6a366505.html) 对照。
