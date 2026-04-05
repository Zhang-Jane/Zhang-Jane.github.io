---
name: blog-tech-writing-seo
description: >-
  Hexo（Butterfly）技术博客 Skill：主文件仅含硬性规则与最小模板；详细写作语气、技术事实/通俗与术语注解、1–3 个实战案例、文末简要总结（核心要点）、Frontmatter 字段、AI 协作与自检见 references/writing.md；配图见
  references/images.md；E-E-A-T、On-Page、站点与专题 SEO 见 references/seo.md。适用于撰写/编辑 source/_posts/*.md、技术笔记与 SEO 相关任务。
---

# 技术博客写作与 SEO 规范（Zhang-Jane.github.io）

本 Skill 面向本仓库 **Hexo + Butterfly**（`permalink: post/:abbrlink.html`，`language: zh-CN`）。

**核心顺序**：先为真实读者解决问题、分享可验证的一手经验，再落实 SEO 与结构规范。

**延伸阅读（避免与主文件重复）**

| 主题                                                                  | 文档                                           |
| --------------------------------------------------------------------- | ---------------------------------------------- |
| 语气、事实/通俗/术语/案例/结尾总结、Frontmatter 字段、abbrlink、AI 协作、成文自检 | [references/writing.md](references/writing.md) |
| E-E-A-T、On-Page、站点 SEO、专题集群、搜索意图、Meta、结构化数据      | [references/seo.md](references/seo.md)         |
| 配图路径、`alt`、张数、实拍/授权（不含 AI 生图流程）                  | [references/images.md](references/images.md)   |

## 何时触发本 Skill

- 新建或修改 `source/_posts/*.md` 中的技术文章、笔记总结
- 用户要求符合 SEO、标签、标题层级或与 Google 质量方向一致的内容
- 需要 AI 辅助起草、扩写、优化或自检时

## 一、Markdown 标题层级（硬性规则）

| 层级          | 用法                            | 说明                                                         |
| ------------- | ------------------------------- | ------------------------------------------------------------ |
| 文章主标题    | 仅通过 Frontmatter **`title:`** | 主题将页面主标题渲染为 H1；**正文不得再出现第二个全文级 H1** |
| `#`（H1）     | 正文中**禁止使用**              | 避免双 H1，利于 SEO 与可访问性                               |
| `##`（H2）    | 正文一级章节                    | 原理、安装、配置、实战、排错等大块                           |
| `###`（H3）   | 小节                            | 嵌套时保持连续，**勿跳级**（如 `##` 后直接 `####`）          |
| `####` 及以下 | 步骤内标题等                    | 少用即可                                                     |

## 二、Frontmatter（最小可用示例）

复制后替换占位符；注释可按需删。**字段说明与 abbrlink 规则**见 [references/writing.md](references/writing.md) 中的「Frontmatter 字段说明」。

```yaml
---
title: "主关键词 + 价值点 + 年份或场景（宜短、可读）"
date: YYYY-MM-DD HH:mm:ss
# updated: YYYY-MM-DD
tags:
  - 细粒度标签1
  - 细粒度标签2
categories: 较宽分类名
# description: "约 150–160 字的 Meta 描述，含主关键词与读者收益"
---
```

## 三、SEO 与配图（详见 references）

- **SEO 原则、每篇 On-Page 清单、站点级提醒、Topic Cluster、站外维护**：[references/seo.md](references/seo.md)
- **配图**：外链或截图须**下载到本地**，放入 **`source/images/`**（可分子目录）；**文件名英文 + 连字符**；类型、张数、`alt`、与 BND-1 思路对照见 [references/images.md](references/images.md)

## 延伸资源（Skill 维护参考；勿整段粘贴为博文结尾）

**本 Skill 拆分文档**（均以本文件为入口，按需打开子页）：

- [references/writing.md](references/writing.md)
- [references/images.md](references/images.md)（思路来源 [wechat_article_skills · image-guidelines](https://github.com/BND-1/wechat_article_skills/blob/main/wechat-tech-writer/references/image-guidelines.md)）
- [references/seo.md](references/seo.md)

**站外权威**

- [Google Search · Ranking 历史（官方事件时间线）](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history?hl=zh-cn)
- [Google Search Central — 创建实用、可靠、以用户为中心的内容](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)（People-first / 有用内容）
- [Hexo 文档](https://hexo.io/docs/) · [Butterfly](https://butterfly.js.org/)
