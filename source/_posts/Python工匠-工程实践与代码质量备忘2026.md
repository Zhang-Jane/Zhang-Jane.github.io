---
title: Python 工匠：工程实践与代码质量备忘（2026）
description: >-
  从包管理、静态检查、Makefile 与 pre-commit，到项目目录、导入规范、Code Review 要点、纯函数与面向对象取舍、异常与
  logging，再到 asyncio 常见误区与调试。适合作为日常工程清单对照。
tags:
  - Python
  - 代码规范
  - mypy
  - asyncio
  - 工程化
categories: Python
abbrlink: 94161f8f
date: 2026-04-06 10:00:00
---

把零散笔记整理成一篇「能随手翻开」的备忘：它不替代官方文档，但能在你搭新项目、加 CI、写评审意见或排查异步问题时，**少绕一圈弯路**。依赖与锁文件我单独写过一篇更细的梳理，见文末内链；这里侧重**工具链、结构、可读性与运行时习惯**。

读完你可以带走：**一条可复制的本地检查命令思路**、**导入与目录的朴素规则**、**评审 README 时的检查项**，以及 **asyncio 里 `await` 顺序与 `gather` 的真实语义**。

## 包管理与「项目长什么样」

- **工具地图**：Anna-Lena Popkes 的 [An unbiased evaluation of environment management and packaging tools](https://alpopkes.com/posts/python/packaging_tools/) 用文氏图把「环境 / 包 / Python 版本 / 构建 / 发布」拆开，适合选型时对照。
- **高性能安装器**：[`uv`](https://github.com/astral-sh/uv) 在解析与安装上很快，适合新项目和 CI。
- **目录结构**：Matt 的 [python-project-structure-2024](https://matt.sh/python-project-structure-2024) 讨论了「src 布局、测试与打包」等常见取舍。

若你希望从 **pyproject、锁文件到 uv 工作流** 系统读一遍，可先看站内这篇：[2026 年 Python 包管理与依赖选择](https://zhang-jane.github.io/post/6da79668.html)（与本文互补，不重复展开）。

## 静态检查：Makefile 串起 pylint、flake8、mypy

思路很简单：把团队约定的检查写进 `make lint`，新人克隆仓库后**一条命令**就能在本地对齐 CI。下面示例把 `PYTHON` 和检查路径换成你项目中的虚拟环境与目录即可（常见做法是把源码放在 `src/`，测试放在 `tests/`）。

```makefile
PYTHON := python3
PYLINT := pylint
FLAKE8 := flake8
MYPY := mypy

TESTS := tests
ALL := $(TESTS)

.PHONY: help lint pylint flake8 mypy check_syntax lint_file pylint_file flake8_file mypy_file check_syntax_file

help:
	@echo "Available targets:"
	@echo "  lint                - Run pylint, flake8, mypy"
	@echo "  pylint / flake8 / mypy"
	@echo "  check_syntax        - compileall"
	@echo "  *_file file=PATH    - Run on one file"

lint: pylint flake8 mypy

pylint:
	$(PYTHON) -m $(PYLINT) $(ALL)

flake8:
	$(PYTHON) -m $(FLAKE8) $(ALL)

mypy:
	$(PYTHON) -m $(MYPY) $(ALL)

check_syntax:
	@$(PYTHON) -m compileall $(ALL)

lint_file: pylint_file flake8_file mypy_file

pylint_file:
	$(PYTHON) -m $(PYLINT) $(file)

flake8_file:
	$(PYTHON) -m $(FLAKE8) $(file)

mypy_file:
	$(PYTHON) -m $(MYPY) $(file)

check_syntax_file:
	@$(PYTHON) -m compileall $(file)
```

**实战**：只改了一个文件时，用 `make lint_file file=src/foo/bar.py`，反馈周期更短。

### mypy：在 `pyproject.toml` 里收敛规则

[mypy 配置文件](https://mypy.readthedocs.io/en/stable/config_file.html) **不会**与命令行以外隐式合并多份：优先级以文档为准；团队里建议**只维护一份** `[tool.mypy]`，避免「本地与 CI 各一套」。

严格程度要**渐进**：一上来全开 `disallow_any_*` 可能拖垮遗留项目。下面是一份「偏严但可讨论」的起点，按模块用 `[[tool.mypy.overrides]]` 给第三方库关缺口（如 `django.*`、`numpy.*`）：

```toml
[tool.mypy]
python_version = "3.11"
files = ["src"]
exclude = ["^tests/", "^build/"]
strict = true
show_error_context = true
warn_unused_ignores = true
warn_redundant_casts = true
warn_return_any = true
warn_unreachable = true
ignore_missing_imports = false

[[tool.mypy.overrides]]
module = "*.tests.*"
ignore_errors = true
```

**注意**：你笔记里曾把一大段 `[tool.mypy]` 误贴在「`.pylintrc`」标题下；**pylint** 使用另一套配置（`.pylintrc` 或 `pyproject.toml` 里的 `[tool.pylint.*]`），与 mypy 不要混在同一节维护。详见 [Pylint 配置](https://pylint.readthedocs.io/en/latest/user_guide/configuration/index.html)。

### pre-commit：提交前自动跑格式化与检查

1. 安装：`pip install pre-commit`
2. 在仓库根目录写 `.pre-commit-config.yaml`，可挂载 **isort、Black、flake8** 等远程仓库；也可用 `repo: local` 调用本仓库脚本。
3. 执行 `pre-commit install`，把钩子装进 `.git/hooks/pre-commit`。

示例（版本号请按项目定期升级）：

```yaml
fail_fast: true
repos:
  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort
        additional_dependencies: [toml]
  - repo: https://github.com/psf/black
    rev: 24.10.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/flake8
    rev: 7.1.1
    hooks:
      - id: flake8
```

**实战**：第一次全仓库格式化可能产生大 diff，适合单独开分支合并，避免和业务改动揉在一起。

## Python 包、导入与目录结构

**包**：含 `__init__.py` 的目录即包（-namespace 包另说）。执行 `import pack.modu` 时会先跑 `pack/__init__.py` 再加载 `modu.py`；层次深时，**每个 `__init__.py` 里堆太多逻辑会拖慢导入**，若子模块之间无需共享初始化，保持 `__init__.py` 精简或留空是常见做法。

**导入风格**（可读性优先）：

- 避免 `from modu import *`：名字来源不清。
- 较好：`from modu import sqrt`。
- 更清晰：`import modu` 再用 `modu.sqrt`，命名空间一目了然。

**目录示意**（经典「src 布局」）：

```text
my_python_project/
├── README.md
├── pyproject.toml
├── requirements.txt
├── .gitignore
├── src/
│   ├── mypkg/
│   │   ├── __init__.py
│   │   └── main.py
├── tests/
│   └── test_main.py
└── docs/
    └── index.md
```

| 路径 | 用途 |
| --- | --- |
| `README.md` | 解决什么问题、如何安装、最小示例（给人类看的第一入口） |
| `requirements.txt` / `pyproject.toml` | 依赖声明（与锁文件配合更佳） |
| `src/` | 源码根 |
| `tests/` | 单测与集成测试 |
| `docs/` | 文档站点或说明 |
| `Makefile` | 统一 `lint`、`test` 等入口 |

若仍使用 `setup.py` 分发，它通常也在仓库根；新项目更推荐在 `pyproject.toml` 里声明 `[build-system]` 与 `[project]`。

## Code Review：先 README，再谈「抠细节」

**整体**：

1. **README**：说明**解决什么问题**、**适用场景**、**如何安装**（尽量写官方/标准步骤，少绑定私人脚本）、**最小使用示例**（足够短，让新同事能跑通）。
2. **细节**：评审的价值往往不在挑无关痛痒的格式，而在**规范是否一致**、**逻辑是否自洽**、**错误路径是否可观测**。

## 面向对象、纯函数与类成员

Python **一切皆对象**，但不必把 OOP 当唯一范式；许多脚本用函数组合就很好。**纯函数**（无副作用、相同输入相同输出）易于测试与重构；**有隐式上下文和副作用的函数**要和不碰外层的逻辑分开想，读者才跟得上。

在类里，**在类体顶部用类型注解声明实例属性**（配合 `__init__` 赋值），回读时一眼看到「这个对象有哪些字段、大致什么类型」。这与 [PEP 526](https://peps.python.org/pep-0526/) 的语义一致：注解在类体里标的是**实例属性**预期，而不是随便堆在 `__init__` 中间才猜。PyTorch 的 `nn.Module` 等代码库也常见这种写法，便于维护大型类。

## 评判代码时常用的词

不必背定义，但评审时可以**有意识选词**：可维护性、可读性、可扩展性、可测试性、模块边界（高内聚低耦合）、健壮性、安全性、性能是否在需求范围内。把「好/坏」换成**可观察的指标**（例如「单测难写是因为全局状态过多」），对方更容易改。

## PEP 8、命名与注释

- **`import this`** 对应的是 [PEP 20](https://peps.python.org/pep-0020/)（Python 之禅），日常风格落地看 [PEP 8](https://peps.python.org/pep-0008/)。
- **类型注解**：Python 3.5+ 起可注解变量与返回值；注解本身不强制运行时检查，**mypy** 负责静态维度。
- **文件名**：小写加下划线；避免与标准库同名（如 `json.py`、`logging.py`）；避免保留字。
- **变量名**：模块内风格统一；布尔常用 `is_`/`has_`；计数用 `count`/`length`/`number_of_*`，少用复数名词表示「个数」以免和「容器里一堆对象」混淆。
- **注释**：解释「为什么」和接口契约；文档字符串面向调用方；不要用注释复述每一行代码。**空行也是可读性的一部分**。

想了解字节码层面在做什么，可用标准库 [`dis`](https://docs.python.org/3/library/dis.html) 反汇编窥一眼（偏调试与学习，不必常驻业务代码）。

## 异常：精确捕获、可组合、别滥用 assert

- **不要随便吞异常**；至少要记录。
- **只包裹可能抛错的语句**；`except` 范围尽量窄，避免裸 `except Exception` 盖住 `KeyboardInterrupt` 等。
- **异常层次**可与模块抽象层级对齐：太低层的错误可在边界包装成领域错误再抛出；尽量**不要用字符串匹配**区分异常类型，而用类型本身。
- **不要用 `assert` 校验对外参数**：`python -O` 会去掉 assert；对外输入用显式校验与 `raise`。

忽略「某种可预期错误」时，可用 [`contextlib.suppress`](https://docs.python.org/3/library/contextlib.html#contextlib.suppress) 或自写上下文管理器；`with` 的 `__exit__` 若返回 `True` 会吞掉异常，**suppress** 正是封装了这一语义。项目里多处重复 `try/except` 时，优先抽成可复用工具。

## flake8 与 isort

- **flake8**：把 PEP 8 等多类检查合在一起跑（底层含 pycodestyle、pyflakes 等），适合进 pre-commit。
- **isort**：导入分块——标准库、第三方、本地包——顺序一致，减少无意义 diff。

## logging：Logger、Handler、Filter、Formatter

官方文档见 [logging.handlers](https://docs.python.org/zh-cn/3/library/logging.handlers.html)。一次打日志会经历 **Logger → Handler →（可选 Filter）→ Formatter**，最终变成字符串输出。**LogRecord** 携带模块名、行号、进程线程等信息。

**脱敏示例**（自定义 Formatter，在输出前掩码 `password=` 后的内容）：

```python
from __future__ import annotations

import logging
import logging.config
import re


class SensitiveFormatter(logging.Formatter):
    """在最终字符串中掩码 URL 里的 password 参数。"""

    _PWD_RE = re.compile(r"(?<=password=)\S+")

    @classmethod
    def _mask_password(cls, text: str) -> str:
        return cls._PWD_RE.sub("***", text)

    def format(self, record: logging.LogRecord) -> str:
        line = super().format(record)
        return self._mask_password(line)


LOGGING_CONFIG: dict[str, object] = {
    "version": 1,
    "formatters": {
        "default": {
            "()": SensitiveFormatter,
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "stream": "ext://sys.stdout",
        }
    },
    "root": {"level": "DEBUG", "handlers": ["console"]},
}

logging.config.dictConfig(LOGGING_CONFIG)
log = logging.getLogger(__name__)
log.info("password=123456")
# 输出中 password= 后为 ***
```

也可用 **Filter** 在 `record.msg` / `record.args` 上动手脚；二者选一种贯穿项目即可。

## asyncio：并发语义与常见误区

可把 asyncio 想成三层：**协程与并发模型**、**事件循环 API**、**套接字/流等 IO 抽象**。

**误区一：`await` 顺序不等于完成顺序**。

```python
async def main() -> None:
    task_1 = asyncio.create_task(some_coro("a"))
    task_2 = asyncio.create_task(some_coro("b"))
    _ = await task_1
    _ = await task_2
```

上面会**先等 `task_1` 完成**，再处理 `task_2`——即使 `task_2` 更早结束。要「并发启动、再一起等」，用 `asyncio.gather`。

**`asyncio.gather(*tasks)`**：需要**解包**列表，因为设计上也支持嵌套组合与动态追加任务的场景。`return_exceptions=True` 时单个任务失败不会拖死其它任务（返回值里会混进异常对象）。

**`asyncio.as_completed`**：适合「谁先完成谁先处理」的流水线（例如边爬边算），不必等整批结束。

**超时**：`gather` 本身不直接等价于「整批超时」；可用 `asyncio.wait_for(asyncio.gather(...), timeout=...)` 包一层。

**Python 3.11+** 引入 [**TaskGroup**](https://docs.python.org/3/library/asyncio-task.html#task-groups)（结构化并发），在作用域内统一处理子任务失败与取消，比手写 gather 更易维护。

### 调试异步

见 [asyncio 开发模式](https://docs.python.org/3/library/asyncio-dev.html)。常用手段：

- `asyncio.run(main(), debug=True)` 或在运行中的循环上 `loop.set_debug(True)`；
- 环境变量 `PYTHONASYNCIODEBUG=1` 打开额外诊断；
- 调 `loop.slow_callback_duration` 抓「慢回调」；
- 对 `ResourceWarning` 等用 `warnings.simplefilter("always", ...)` 在开发期放大信号。

## 核心要点

- **依赖与锁文件**是另一条主线，可与站内 [包管理与 uv 实践](https://zhang-jane.github.io/post/6da79668.html) 对照阅读。
- **Makefile + pyproject + pre-commit** 把「本地与 CI 同一套检查」固化成习惯，比口头约定可靠。
- **导入与包结构**服务于可读性：`import pkg` 往往最清晰；深层 `__init__.py` 别太胖。
- **评审 README** 优先于抠无关紧要的细节；用语要指向可改行为（可测试性、边界、错误路径）。
- **异常**要窄捕获、可组合、`assert` 不用于校验外部输入；**logging** 分层清晰，敏感信息进 Formatter/Filter。
- **asyncio** 里牢记：`await` 顺序、`gather` 要解包、`as_completed` 做流式处理、超时与 **TaskGroup**（3.11+）管理子任务生命周期。
