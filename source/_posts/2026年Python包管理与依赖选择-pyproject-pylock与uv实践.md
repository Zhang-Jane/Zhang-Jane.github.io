---
title: 2026 年 Python 包管理与依赖选择：从「依赖乱象」到 pyproject、pylock 与 uv
description: 2026 年 Python 包管理与依赖选择：从「依赖乱象」到 pyp…。2024 年前后，英文技术圈里常把 Python 依赖生态戏称为 dumpster fire（垃圾桶大火）。Niels Cautaerts 在 [Python dependency man…适合日常查阅、复习对照与工程检索。
date: 2026-04-04T20:00:00.000Z
tags:
  - Python
  - uv
  - pyproject.toml
  - PEP 751
  - 依赖管理
  - 软件供应链
categories: Python
abbrlink: 6da79668

---


2024 年前后，英文技术圈里常把 Python 依赖生态戏称为 **dumpster fire**（垃圾桶大火）。Niels Cautaerts 在 [Python dependency management is a dumpster fire](https://nielscautaerts.xyz/python-dependency-management-is-a-dumpster-fire.html) 里用「露营篝火失控」的叙事把问题讲透：脚本长成项目、别人机器上复现不了、一次 innocuous 的升级整锅端掉——默认工作流容易「随手 `pip install`」、锁文件与构建元数据各说各话，**传递依赖**又像开盲盒。到了 2026 年，**规范面**（`pyproject.toml`、依赖分组、标准化锁文件）和 **工具面**（以 Rust 实现的高性能解析/安装器）已经能把「可重现」从口号变成日常操作。我按「原则 → 工具地图 → 工作流 → 选型」整理这篇笔记，并穿插两篇写得极好的英文原文里的**分层与分类图**（已下载到本站、保留署名），方便和站内其它 Python 与工程化文章对照：[全栈开发技术选型](https://zhang-jane.github.io/post/64818318.html)、[FastAPI 学习笔记](https://zhang-jane.github.io/post/5057eef4.html)、[GitHub Actions 部署](https://zhang-jane.github.io/post/6a366505.html)。

读完你可以带走这些结论：

- **可重现** = 声明（direct deps）+ **锁定**（全依赖图）+ **同一份锁文件进版本库** + 固定解释器范围（如 `.python-version` / `requires-python`）。
- **PEP 735** 把 dev/test 等依赖分组写进标准位置；**PEP 751** 给锁文件一个共同方言 **pylock.toml**，便于「解析器产出、安装器消费」。
- **uv** 很适合新项目与 CI；**Poetry / PDM** 仍有各自受众；**Pixi** 面向 Conda-forge 式系统依赖与科学栈。
- 安全上把 **Trusted Publishing**、锁文件哈希与 **`uv audit` / pip-audit** 放进常规节奏，而不是上线前突击。

## 依赖栈：不止「pip 装的那几个包」

日常说的「依赖」常被简化成 PyPI 上的包，但 Cautaerts 强调：**依赖是「代码之外、运行结果所依赖的一切」**，至少可以分成项目级 Python 包、系统库、操作系统与 ABI、硬件（CPU/GPU）、以及网络与环境等外层条件。下面这张图是他文中的分层示意，用来提醒自己：排障时别只盯着 `import`，系统层与平台标记同样会杀人。

![依赖分层：从项目包到操作系统、硬件与环境](/images/python-package-management-2026/dependency-layers-niels-cautaerts.png)

*图源：Niels Cautaerts，[Python dependency management is a dumpster fire](https://nielscautaerts.xyz/python-dependency-management-is-a-dumpster-fire.html)（[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)），转载保留署名。*

同一篇文章还点出一个硬核事实：**Python 常作为胶水语言**，离不开别人写的 C/Fortran/Rust 扩展；标准工具又长期偏「命令式安装」，初学者友好≠依赖管理友好。要灭火，先得承认栈很深，再谈锁文件与 CI。

## 定义文件、锁文件与「时间」变量

光有 `requirements.txt` 或 `[project]` 里的**版本范围**还不够：传递依赖会随上游发布悄悄变。Cautaerts 用 Bob / Alice / Dave 式的故事说明：**同一份定义文件在不同时间点解析，可能得到不同传递版本**——他称之为某种程度上的「俄罗斯轮盘」。锁文件的意义，正是把「某一时刻解析出的全依赖图」固化下来，再配合哈希，让团队不再靠运气对齐环境。

![定义文件与传递依赖：解析结果可随时间漂移](/images/python-package-management-2026/transitive-deps-illustration-niels-cautaerts.png)

*图源与授权同上（Niels Cautaerts，CC BY-NC-SA 4.0）。* 这与今天我们说的 **pylock.toml / uv.lock** 是同一思想：先锁再装，**把时间从变量里抠出去**。

## 工具地图：五类能力与文氏图

Anna-Lena Popkes 在 [An unbiased evaluation of environment management and packaging tools](https://alpopkes.com/posts/python/packaging_tools/)（2024 年 8 月更新）里，把工具按 **环境管理、包管理、Python 版本管理、构建、发布** 五类能力拆开，再用文氏图展示「单用途 vs 多用途」。这张图非常适合入门扫盲：**先想清楚你的痛点落在哪一类**，再选工具，而不是被营销话术带着跑。

![Python 环境与打包相关工具文氏图（2024 年 8 月更新版）](/images/python-package-management-2026/venn-tools-alpopkes-2024.png)

*图源：Anna-Lena Popkes，[An unbiased evaluation of environment management and packaging tools](https://alpopkes.com/posts/python/packaging_tools/)（个人博客，转载注明出处）。* 同文还链到演讲 [PyCon DE 2023](https://www.youtube.com/watch?v=MsJjzVIVs6M)、[EuroPython 2023](https://www.youtube.com/watch?v=3-drZY3u5vo)，适合用视频把「分类框架」听一遍。读图时请结合**时间**：文中关于 **Poetry 与 PEP 621** 的表格以当时版本为界——**Poetry 2** 已推动与 `[project]` 对齐，见 [Poetry 官方讨论与发布说明](https://github.com/orgs/python-poetry/discussions/5833)；**uv** 在文内曾标注「尚未覆盖构建/发布」，而 2025–2026 年 [uv 文档](https://docs.astral.sh/uv/) 已包含 `uv build`、`uv publish` 等能力，**以当前文档为准**。文氏图里没单独画 **Pixi**，但 Cautaerts 所说的 **PyPI+pip 与 conda 两条生态**张力、以及「工具碎片化」问题，在今天依然要在选型会上正面回答。

## 规范地基：从 PEP 518 到 PEP 751

先把「标准答案」摆清楚，避免各工具自定义一套黑话。

- **[PEP 518](https://peps.python.org/pep-0518/)**：在 `pyproject.toml` 里声明构建系统（`[build-system]`），是现代 Python 项目的共同入口。
- **[PEP 621](https://peps.python.org/pep-0621/)**：`[project]` 里写项目元数据与运行时依赖（`dependencies`），和「怎么打包」解耦。
- **[PEP 735](https://peps.python.org/pep-0735/)**：`[dependency-groups]` 定义 **dev、test、lint** 等命名分组，**不会**打进发布制品的元数据里，适合替代「只靠 extras 或散落的 requirements-dev.txt」。
- **[PEP 751](https://peps.python.org/pep-0751/)**：**pylock.toml** 锁文件格式，2025 年 3 月正式接受（见 PEP 文头），目标是在不同工具之间复现同一安装结果；细则亦见 [PyPA《pylock.toml》规范](https://packaging.python.org/en/latest/specifications/pylock-toml/)。

社区采纳讨论可参考 [discuss.python.org 上关于 pylock.toml 的帖子](https://discuss.python.org/t/community-adoption-of-pylock-toml-pep-751/89778)。工具侧：例如 **uv** 在较新版本已支持 pylock 的导出与安装；**PDM** 也在推进与 PEP 751 对齐；**pip** 则从 25.1 起引入 **`pip lock`**（实验性）等能力，并与 **dependency groups** 一起写进变更说明（第三方博文如 [Richard Si：What’s new in pip 25.1](https://ichard26.github.io/blog/2025/04/whats-new-in-pip-25.1/) 便于速览）。

使用 **`pip lock`** 或任何锁文件导出时，务必阅读发行说明：**pylock.toml 不会保留 requirements.txt 里的环境变量占位**，敏感信息可能被写进锁文件，相关讨论见 [pypa/pip#13376](https://github.com/pypa/pip/issues/13376)。这是「标准化」带来的新功课，不是小事。

## PyPA 怎么说：别误读成「官方只推荐某一个」

[《Python Packaging User Guide》里的 Tool recommendations](https://packaging.python.org/en/latest/guides/tool-recommendations/) 写得很直白：PyPA **有意不对所有任务做一刀切**，例如构建后端多样是为了服务不同人群；文档列举 **virtualenv / venv、pip、pip-tools、build、twine**，在 **Workflow tools** 里按字母列出 **Hatch、PDM、Poetry、Pipenv** 等，并说明它们常扮演「环境管理 + 任务运行 + 可选锁文件」的角色。

因此更准确的说法是：**规范与指南定义「共同语言」**（`pyproject.toml`、dependency groups、pylock、Trusted Publishing），**具体选 uv 还是 Poetry** 仍取决于应用/库、团队与 CI 约束——而不是把某一款工具当成「唯一正统」。**uv** 由 [Astral](https://docs.astral.sh/uv/) 维护，定位是极快的包与项目管理器；文档中自称可替代多种零散命令，属于 **产品级承诺**，与 PyPA「不点名默认工作流」并存，不矛盾。

## 2026 年仍成立的四条原则

### 声明式直接依赖 + 全图锁定

`pyproject.toml` 写清直接依赖与分组；锁文件记录 **解析结果**（含传递依赖）、版本、环境标记，必要时带哈希。避免「只锁顶层、不锁传递」或「每人本地现解析」。

### 环境隔离

每个项目独立虚拟环境（或容器内等价物）。uv 习惯用项目下 `.venv`，并用 `uv run` 减少「忘了激活环境」的人类错误。

### 版本控制里有什么

至少：**pyproject.toml**、**锁文件**（`uv.lock` / `poetry.lock` / `pylock.toml` 等）、**解释器约束**（`.python-version` 或 `requires-python`）。这与「把 Skill 与版本写进仓库」是同一类工程习惯——可复现的智能体环境亦然，参见 [Agent Skills：可复用能力封装](https://zhang-jane.github.io/post/cd4fa45f.html)。

### 安全与发布

- **Trusted Publishing**：从受信 CI 发布到 PyPI，减少长期 API token 泄露面，指南见 [Packaging User Guide：Trusted Publishing](https://packaging.python.org/en/latest/publishing-package-distribution-releases-using-github-actions-ci-cd-workflows/#trusted-publishing) 与 [PyPI 文档](https://docs.pypi.org/trusted-publishers/)。
- **审计**：对锁定的环境做漏洞扫描，例如 **`uv audit`**（见 [uv CLI 文档](https://docs.astral.sh/uv/reference/cli/)）或 **pip-audit**。

## 工具怎么选：多维度对比与迁移路径

选型别只看「谁热门」，建议同时看：**锁与可重现**、**解析/安装速度**、**日常命令心智负担**、**与 PEP 的贴合度**、**从旧仓库迁出的成本**、**CI 是否好缓存**。下表均为 **定性** 归纳（版本迭代快，以各工具当前文档为准）；若团队已有既定工具，**优先统一** 胜过频繁换栈。

### 总览：锁文件与主战场

| 工具 | 锁文件 / 清单 | 典型主战场 | 一句话 |
|------|----------------|------------|--------|
| **uv** | `uv.lock`；可对接 **[PEP 751](https://peps.python.org/pep-0751/) `pylock.toml`** | 应用、单体仓、要快的 CI | 项目模式 + `uv run`，解释器可用 `uv python` 管 |
| **Poetry** | `poetry.lock` | 库、长期 Poetry 栈 | 依赖与发布流程成熟；**Poetry 2** 强化 `[project]` |
| **PDM** | `pdm.lock`，可导出 pylock | 偏标准、要插件与脚本 | PEP 621 / 735 友好，锁格式与工具链在演进 |
| **pip + pip-tools** | `requirements.in` → 编译出 `requirements.txt` | 遗留、只认 pip 的交付 | 无官方「项目对象」，靠编译链锁版本 |
| **Pixi** | `pixi.lock` | 科学计算、系统/CUDA 依赖 | Conda-forge 与 PyPI 混合，任务可在 `pixi.toml` 声明 |
| **Pipenv** | `Pipfile.lock` | 老项目维护 | 生态热度不如当年；新项一般不优先 |

### 速度、解析器与「装包体感」

**同一台机器、同一缓存状态下**，Rust 实现的安装器通常明显快于纯 Python 链路；**冷缓存**与**是否编译扩展**会拉开差距。下面用 **高 / 中 / 低** 表示「同类工具里的大致档位」，不是精确基准。

| 工具 | 解析 + 安装体感 | 说明 |
|------|-----------------|------|
| **uv** | **高** | 官方文档给出相对 pip 的数量级加速；适合频繁 `sync` 的 CI |
| **Pixi** | **高** | Rust 实现，面向 conda-forge 与二进制包场景 |
| **PDM** | **中高** | 解析与锁文件机制成熟；实际耗时会随依赖树、缓存与索引策略变化（见 [PDM 文档](https://pdm-project.org/latest/)） |
| **Poetry** | **中** | 解析与安装普遍够用；大仓 + 深依赖树时更易感到等待 |
| **pip + pip-tools** | **中** | `pip-compile` 耗时与依赖规模强相关；安装即普通 pip |
| **Pipenv** | **中偏低** | 维护模式与性能不是强项 |

若要 **压 CI 时间**：优先 **固定锁文件**、`--locked` / `--frozen` 类语义，并对 **全局缓存**（如 `setup-uv` 的 cache、或 `UV_CACHE_DIR`）做复用；否则再快的 CLI 也会输在反复下载上。

### 日常管理：加依赖、环境、多包仓库

| 维度 | uv | Poetry | PDM | pip-tools | Pixi |
|------|-----|--------|-----|-----------|------|
| **加/删依赖** | `uv add` / `uv remove` | `poetry add` 等 | `pdm add` 等 | 编辑 `.in` 再 `pip-compile` | `pixi add` |
| **对齐环境** | `uv sync` | `poetry install` | `pdm sync` | `pip install -r` | `pixi install` |
| **跑命令** | `uv run` | `poetry run` | `pdm run` | 先激活 venv | `pixi run` |
| **Python 版本** | `uv python install` / pin | 常外接 pyenv 等 | `pdm python`（见文档） | 自备解释器 | 随 conda-forge / 工具链 |
| **单体多包（workspace）** | 支持 workspace | 插件/多项目各有做法 | 有工程化实践 | 通常多份 requirements | 多环境 task |

**库作者**往往更在意 **可编辑安装（PEP 660）** 与 **构建后端**；**应用团队**更在意 **一条命令还原环境** 与 **CI 复制成本**——上表可以对照你们痛点逐行打分。

### 标准与互操作（PEP、pylock）

| 工具 | `[project]` / PEP 621 | dependency-groups（PEP 735） | pylock.toml（PEP 751） | 备注 |
|------|----------------------|-----------------------------|-------------------------|------|
| **uv** | 原生项目模板 | `--group` 与 pyproject 分组 | 支持导出/安装（版本见 [讨论帖](https://discuss.python.org/t/community-adoption-of-pylock-toml-pep-751/89778)） | 与标准对齐积极 |
| **Poetry** | **Poetry 2** 推进中；历史项目多见 `[tool.poetry]` | 可用依赖组；与 PEP 735 并存时需看清表写在哪 | 以工具演进为准 | 迁移时留意双表并存期 |
| **PDM** | 友好 | 友好 | 导出与锁格式演进快 | 适合「规范控」 |
| **pip-tools** | 不强制；常配合手写 `pyproject` 或仅 `requirements.in` | 依赖 pip 侧 groups（[pip 25.1+](https://pip.pypa.io/en/stable/news/)） | `pip lock` 实验能力 | 偏「Unix 哲学」组合 |
| **Pixi** | 与 conda 元数据模型并行 | 自有分组/特性 | 以 Pixi 与 PyPA 互通文档为准 | 和纯 PyPI 项目模型不完全同一套 |

### 迁移：从旧栈迁出的大致路线

| 起点 | 常见策略 | 风险与注意 |
|------|----------|------------|
| **只有 requirements.txt** | 用 `uv init` / 手写 `pyproject` → `uv add` 重锁；或继续 pip-tools 只加锁 | 传递版本会重解，需全量测试 |
| **Poetry** | 社区有 **migrate-to-uv** 等助手；或并行维护、分支切换 | 解析器不同可能导致版本漂移；锁文件勿混用 |
| **Pipenv** | 导出依赖再导入 uv/PDM；或维持 Pipenv 至退役 | `Pipfile` 与 `[project]` 模型不同，建议一次性迁 |
| **Conda / Mamba** | 系统依赖仍走 Pixi/Conda；PyPI 层单独用 uv | 切忌同一环境两套工具互相覆盖 |
| **pip + setup.py** | 先 [现代化 pyproject](https://packaging.python.org/en/latest/guides/modernize-setup-py-project/)，再谈锁文件 | `setup.py` 直调已不推荐 |

uv 官方 [Migration guides](https://docs.astral.sh/uv/guides/migration/) 目前对 **pip → uv 项目** 写得最实；Poetry/Pipenv 的「一键迁移」仍在生态里迭代，可跟 [astral-sh/uv#5200](https://github.com/astral-sh/uv/issues/5200)。**实务建议**：新分支、锁文件进 PR、用同一套测试矩阵跑过再切主分支。

### CI / 运维：缓存、冻结与审计

| 维度 | 建议 |
|------|------|
| **可重现** | 生产与 CI 使用 **锁文件 + frozen/locked** 语义，避免现场 `upgrade` |
| **缓存键** | uv 常用 `uv.lock` 哈希；纯 pip 可用 `requirements.txt` 哈希（[uv GitHub 指南](https://docs.astral.sh/uv/guides/integration/github/)） |
| **审计** | `uv audit`、**pip-audit**、或 SBOM 流程；与 Dependabot/Renovate 对 **pylock** 的支持进度见各自 issue |
| **发布** | **Trusted Publishing** 替代长期 token；`uv publish` / `twine` 二选一即可，别混多套凭证 |

### 补充：Hatch、Rye 与 uv 的关系

- **Hatch**：强项在**多环境、任务脚本、构建**；历史上**锁与「包管理」**能力曾滞后于 Poetry/PDM，选型前请翻 [Hatch 最新文档](https://hatch.pypa.io/latest/) 是否已满足你们对锁的要求。  
- **Rye**：Astral 已表态由 **uv** 承接统一方向；新立项一般直接看 **uv**，不必再押 Rye 新特性。  
- **pipx**：适合装 **CLI 应用**（与项目虚拟环境分离），和「项目依赖管理」是互补关系，不是替代关系。

## 可复制的工作流片段

### 用 uv 开新项目

下面与 [uv 文档](https://docs.astral.sh/uv/) 一致，按需要改 Python 版本与包名。

```bash
uv init myproject --python 3.12
cd myproject
uv add "requests>=2.32"
uv add --group dev pytest ruff
uv sync
uv run pytest
```

依赖分组写在 `[dependency-groups]`（PEP 735）；同步时按需带上 `--group`。

### CI：GitHub Actions

官方示例推荐使用 [**astral-sh/setup-uv**](https://github.com/astral-sh/setup-uv)（文档当前示例为 `@v7`，请以仓库 README 为准），并建议 **固定 uv 版本**。安装依赖常用 `uv sync --locked`；示例亦出现 `--all-extras --dev`。完整片段见 [Using uv in GitHub Actions](https://docs.astral.sh/uv/guides/integration/github/)。

```yaml
- uses: actions/checkout@v6
- name: Install uv
  uses: astral-sh/setup-uv@v7
  with:
    version: "0.11.3"
- run: uv sync --locked
- run: uv run pytest
```

若发布到 PyPI，可配合 **Trusted Publishing** 与 **`uv build` / `uv publish`**，示例见同页 [Publishing to PyPI](https://docs.astral.sh/uv/guides/integration/github/)。

### 从旧栈迁到 uv

与上文「迁移」表一致：先看 [uv 的 Migration guides](https://docs.astral.sh/uv/guides/migration/) 里的 **pip → uv 项目**；Poetry/Pipenv 等路线跟 [astral-sh/uv#5200](https://github.com/astral-sh/uv/issues/5200) 与社区工具 README。分支上重锁、测试通过再合并，避免「半套 uv、半套旧锁」并行。

### 科学计算与 GPU

需要 **非 PyPI 系统层依赖** 时，**Pixi** 或 **Conda/Mamba** 仍有优势；纯 PyPI 部分仍可用 uv 管理，形成混合工作流，但要把「谁负责哪一层」写进团队规范，避免同一环境被两套工具同时改写。

## 趋势与行动建议

- **pylock.toml 普及**：锁文件方言统一后，CI 与审计工具可以少适配几种私有格式；但仍要关注各工具对 PEP 751 的完整度与边界情况。
- **供应链**：Trusted Publishing、索引侧 **attestation**、以及锁文件中的哈希，会一起进入「默认安全基线」。
- **性能**：Rust 实现的解析与安装仍会是增量创新高发区；pip 作为广泛部署的基座不会消失，但**项目级工作流**越来越多地向专用 CLI 收敛。Cautaerts 曾调侃「用 Python 写的工具要先有 Python 才能装」，容易与项目依赖打架；**uv、Pixi** 这类单文件/静态链接分发，正是在减这层 bootstrap 成本。

若你只想选一条「明天就能做」的行动：在新仓库里用 **`uv init`** 起盘，把 **`uv sync --locked`** 写进 CI，并把 **`uv audit`** 或 **pip-audit** 接进定时任务。Python 依赖管理仍然复杂，但**可重现**已经不再是奢侈品，而是和类型检查、格式化一样的基础设施。
