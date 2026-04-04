---
title: Agent Skills：AI 时代的可复用能力封装
tags:
  - Agent Skills
  - Anthropic
  - GitHub Copilot
  - Cursor
  - Claude
  - 知识管理
categories: AI
description: >-
  用通俗说法讲清 Agent Skills：它是什么、能帮你省什么心，和 GitHub 上另一套也叫「Skills」的免费课有什么不同。顺带聊聊怎么在仓库里放
  SKILL.md、哪些工具能用，以及社区里把工作经验做成「可带走技能包」的例子。不要求你已是大厂架构师，只要对 AI 辅助写代码、整理流程有点兴趣。
abbrlink: cd4fa45f
date: 2026-04-04 10:00:00
updated: 2026-04-04 17:00:00
---

> - Agent Skills 可以理解成「给 AI 的项目说明书 + 工具包」：核心是一个 `SKILL.md`，可按需配 `scripts/`、`templates/`、`references/`。
> - 它解决的不是“AI 会不会写代码”，而是“AI 能不能稳定按你的规则做事”。
> - **GitHub Skills** 是面向人的免费互动课程；**Agent Skills** 是面向智能体的能力封装，名字像，但不是一回事。
> - 想马上试：先写一个 30 分钟能做完的最小 Skill，把你最常重复的流程放进去，再迭代。

如果你也有这种体验：同一个需求，昨天 AI 回答很稳，今天又“失忆”了，那你遇到的通常不是模型能力问题，而是**上下文没有被沉淀**。

Agent Skills 的价值就在这里。你把“这件事该怎么做”写成可复用模块，放进仓库，之后让智能体按规则读取。这样做的结果很实际：重复解释更少、输出风格更稳、团队协作也更容易对齐。

## Agent Skills 到底是什么

先用一句人话定义：**Agent Skills 是把经验、流程和约束打包成目录，让 AI 在需要时再加载的做法。**

它通常至少包含一个 `SKILL.md`：

```text
my-skill/
├─ SKILL.md            # 必选：技能说明与执行规则
├─ scripts/            # 可选：自动化脚本
├─ templates/          # 可选：输出模板
└─ references/         # 可选：参考资料
```

为什么它在 2025–2026 年迅速流行？因为它刚好击中三个高频痛点：

- **可复用**：一次写好，后续反复调用，不用每次重贴长 Prompt。
- **可版本化**：跟代码一起进 Git，谁改了什么、为什么改，一目了然。
- **可渐进加载**：默认只看摘要，必要时再展开细节，减少上下文浪费。

你可以把它看成团队里的“操作手册代码化”。相比“在聊天窗口临场发挥”，Skill 更适合长期协作。

## 里程碑与生态现状

为了避免“概念听起来很新，但不知道从哪冒出来”的感觉，这里补一个简版时间线：

| 时间         | 事件                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 2025-10 左右 | Anthropic 在 Claude / Claude Code 场景推动 Skills 用法，强调按需加载                                                            |
| 2025-12 左右 | [agentskills.io](https://agentskills.io/) 与 [agentskills/agentskills](https://github.com/agentskills/agentskills) 发布开放标准 |
| 2026 年      | 更多工具和团队开始采用目录化 Skill 方式做长期协作                                                                               |

常见使用生态（以各工具最新文档为准）：

- Anthropic 体系（可参考 [anthropics/skills](https://github.com/anthropics/skills)）
- GitHub Copilot / VS Code 智能体相关工作流
- Cursor、Codex 及其他支持目录化约定的工具

常见目录位置包括 `.claude/skills/`、`.github/skills/`、`.agents/skills/`。  
你可以把它理解成“接口不同，但心智模型越来越一致”。

## 为什么它比“只写 Prompt”更稳

Prompt 当然有用，但它更像一次性口头指令；Skill 更像长期维护的 SOP。

两者最关键的差别在于：

- **Prompt**：快，但易漂移；会话结束后很难复盘。
- **Skill**：初期多花一点时间，后面可复用、可审查、可迭代。

如果你的任务涉及固定规范（比如代码评审口径、发布检查单、博客写作模板），Skill 的收益会很明显。你会感觉到：AI 不是“更聪明了”，而是“更像你团队的一员了”。

## 别混淆：Agent Skills vs GitHub Skills

这两个词最容易把人绕晕，直接看结论：

- **Agent Skills**：给智能体用的能力封装（`SKILL.md` 这套）。
- **[GitHub Skills](https://skills.github.com/)**：给开发者学习 GitHub 的互动课程。

一个是“让 AI 按规范做事”，一个是“让人学会平台操作”。  
如果你想先补 GitHub 基础，再回来做 Agent Skills，也很顺。比如我之前写过 [GitHub Actions + Hexo 博客自动部署](/post/6a366505.html) 和 [Hexo 博客搭建](/post/3e57632f.html)，两条路径可以互相补位。

## 一个好 Skill，至少要写清这 4 件事

很多 Skill 用起来不稳，不是工具问题，而是 `SKILL.md` 信息不完整。实践里最关键的是：

### 1) 触发边界

什么场景该调用，什么场景不该调用，要写明白。  
比如“仅在用户要求代码评审时触发”，而不是“和代码有关就触发”。

### 2) 输出标准

你要它产出什么格式、什么结构、什么优先级。  
越具体，越不容易跑偏。

### 3) 可执行动作

如果需要跑脚本，必须说明前置条件、输入输出、失败处理。  
凡是可能改文件或执行命令的步骤，都要写清安全边界。

### 4) 证据与复盘

告诉智能体：结论要附依据，关键判断要可追踪。  
这样后续你才能判断“它是猜的，还是有证据的”。

## 有趣的案例：离职同事和反蒸馏skills

[同事 Skill](https://github.com/titanwings/colleague-skill) 的核心目标是：输入离职同事的原材料（飞书/钉钉/Slack 记录、文档、邮件、截图等），生成一个可调用的“同事 Skill”。README 写得很直白——它不只想复刻技术规范，还想复刻表达风格与决策习惯。实现上也不是单文件玩具，而是 `SKILL.md + prompts + tools` 的组合，并区分 **Work Skill** 与 **Persona** 两部分，支持增量合并、对话纠正、版本回滚。

[反蒸馏 Skill](https://github.com/leilei926524-tech/anti-distill) 的立场更激进：它明确把“公司要求写 Skill”描述成“蒸馏个人能力”，然后给出一套反制流程——把原始 Skill 清洗成“看起来完整但核心被抽空”的交差稿，同时输出一份私人备份，保留被抽走的关键经验。README 里连强度档位（轻/中/重）和清洗示例都写得很直接，本质是一个“交付外观”和“知识保留”分离的对抗式工具。

这两者放在一起看，会更接近现实：一边是把隐性经验最大化结构化复用，另一边是担心“被完全替代”而主动做反蒸馏。无论你赞同哪边，落地前都要先确认法律、合同和数据授权边界，尤其是聊天记录、邮件和内部文档的处理权限。

## 在 GitHub 上怎么找、怎么用、怎么分享

如果你想快速观察社区实践，这几个入口最省时间：

- 合集：[awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)、[github/awesome-copilot](https://github.com/github/awesome-copilot)
- 官方/示例：[anthropics/skills](https://github.com/anthropics/skills)

安装方式通常有两类：

- 直接把仓库克隆到本地 Skill 目录（例如 `.claude/skills/<name>`）
- 用工具提供的命令式安装（不同工具命令不同，以官方文档为准）

对团队来说，更重要的是“持续维护”而不是“一次安装”：

- Skill 跟项目版本一起演进
- PR 审查 Skill 变更（不仅审代码）
- 为每个 Skill 记录适用范围和禁用边界

## 30 分钟上手：先做一个最小 Skill

如果你想今天就开始，可以按这个最小路径走：

1. 选一个你每周都会重复 3 次以上的小任务。
2. 新建目录（如 `.claude/skills/markdown-cleanup/` 或工具支持的等价目录）。
3. 写 `SKILL.md`：触发条件、步骤、输出格式、禁止项。
4. 用 2-3 个真实任务测试，记录失败点。
5. 只修一件事再重试，连续迭代。

第一版不用追求“全能”，先追求“稳定可用”。  
你也可以参考 [agentskills.io](https://agentskills.io/) 和 [agentskills/agentskills](https://github.com/agentskills/agentskills) 的规范，再对照 [anthropics/skills](https://github.com/anthropics/skills) 的示例目录。

如果你想系统化一点，可以按这个学习顺序：

1. 先读一份真实 `SKILL.md`（看“触发 + 输出 + 禁止项”怎么写）。
2. 再看一个带 `scripts/` 的 Skill（理解“会说”到“会做”的差别）。
3. 最后把你自己的高频流程拆成 2-3 个小 Skill，而不是一个大而全 Skill。

## 常见坑位清单

- `description` 写得太泛，导致误触发。
- 把所有细节一次性塞满，反而增加上下文噪音。
- 脚本可执行但无安全约束，埋下风险。
- 只写“应该做什么”，没写“如何判定做对了”。
- 只顾自动化，不做人工抽检和回归测试。

## 结语

Agent Skills 本质上不是“新名词”，而是一个很务实的工程动作：**把可复用的经验写进仓库，让 AI 有规可循。**

当你把流程、标准和边界沉淀下来，AI 的稳定性会显著提高；而且这些沉淀本身也是你的长期资产。  
如果你正准备开始，不妨从一个最小 Skill 做起，先让一个高频流程跑稳，再逐步扩展到整套工作流。

**额外推荐Skills**

- [热门Skills库](https://skills.sh/)
- [Agent Skills Marketplace](https://skillsmp.com/)
- [Skills Store](https://skillstore.io/)
- [minimax开源Skills地址](https://github.com/MiniMax-AI/skills/blob/main/README_zh.md)
