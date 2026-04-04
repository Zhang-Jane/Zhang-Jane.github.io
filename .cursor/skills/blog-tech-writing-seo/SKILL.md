---
name: blog-tech-writing-seo
description: >-
  Hexo（Butterfly 主题）技术博客的 Markdown 写作规范、Frontmatter 模板、标题层级规则、E-E-A-T 与 On-Page SEO Checklist。包含 Topic Cluster 策略与 AI 辅助写作提示词。适用于撰写/编辑 source/_posts/*.md、技术笔记总结、SEO 优化，或用户提及「博客 SEO」「E-E-A-T」「技术文章」「Hexo 格式」时使用。
---

# 技术博客写作与 SEO 规范（Zhang-Jane.github.io）

本 Skill 面向本仓库 **Hexo + Butterfly**（`permalink: post/:abbrlink.html`，`language: zh-CN`）。

**核心顺序**：先为真实读者解决问题、分享可验证的一手经验，再落实 SEO 与结构规范。

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

**可读性**

- 每段约 3–5 行；步骤与结论多用列表
- 图片放在 `source/_posts/<文章同名文件夹>/`，**文件名英文 + 连字符**；`alt` 写清画面内容，自然含相关词即可

## 二、Frontmatter 模板（推荐）

**最小可用示例**（复制后替换占位符；注释可按需删）：

```yaml
---
title: "主关键词 + 价值点 + 年份或场景（宜短、可读）"
date: YYYY-MM-DD HH:mm:ss
# updated: YYYY-MM-DD
tags:
  - 细粒度标签1
  - 细粒度标签2
categories: 较宽分类名
# abbrlink: 由 hexo-abbrlink 生成时可不写
# description: "约 150–160 字的 Meta 描述，含主关键词与读者收益"
---
```

**字段说明**

| 字段         | 建议                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| `title`      | 主关键词靠前；避免夸张、虚假时效                                       |
| 固定链接     | 全站为 `post/:abbrlink.html`，短且稳定；勿依赖中文文件名当 URL         |
| `tags`       | 细粒度、可检索；同一概念固定一种写法                                   |
| `categories` | 与站点导航、专题一致                                                   |
| `updated`    | 大改时可写；否则可依赖 `_config.yml` 的 `updated_option`（如 `mtime`） |

## 三、SEO 核心原则（People-First + E-E-A-T）

- **Experience**：环境、版本、耗时、失败与复现步骤等**一手信息**（最强区分度）
- **Expertise**：准确、可深入；引用可核对来源
- **Authoritativeness**：Topic Cluster（支柱文 + 集群文互链），形成专题深度
- **Trust**：链接有效、版本与更新透明、不误导

**避免**：薄内容、无人工校验的纯 AI 堆砌、关键词堆砌、标题党。算法与系统更新会持续向「有帮助的原创内容」倾斜；可关注官方时间线：[Google Search · Ranking 历史](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history?hl=zh-cn)。

## 四、每篇 On-Page SEO 执行清单

- **Title**：与 `title` 一致；主关键词靠前；长度控制在搜索结果不易截断的范围内
- **Meta Description**（主题支持时，或由首段承担）：约 150–160 字；主关键词 + 价值 + 轻 CTA；首段前两句尽量可当摘要
- **结构**：可选文首 **TL;DR**（3–6 条）；H2/H3 覆盖子意图（原理、步骤、对比、排错）；主关键词自然出现在首屏与首个 H2 附近即可，**忌堆砌**
- **内链**：至少 3–5 条指向相关文或支柱页；锚文本描述目标页
- **外链**：官方文档、RFC、权威来源为主
- **图片**：描述性 `alt`、压缩与合适格式
- **结尾**：相关阅读、轻 CTA；必要时短作者信息以体现经验

## 五、站点级技术 SEO 提醒

- HTTPS、移动端可用（Butterfly 响应式）
- 大图 WebP、懒加载；关注 Core Web Vitals
- 生成 **sitemap**，在 Search Console 提交；**robots** 勿误拦重要路径
- 重复内容用 **canonical**（若接入）
- 工具：Search Console、PageSpeed Insights、Lighthouse

## 六、Topic Cluster（专题集群）

- **Pillar**：一篇总览（定义、路线、索引内链）
- **Cluster**：多篇子题；文首或文末回链 Pillar 与姊妹篇
- `tags` / `categories` 命名与专题一致，便于内链与聚合

## 七、AI 辅助写作（减少幻觉）

1. 约定读者水平与格式：**Hexo Markdown**、**无正文 H1**、正文仅用 `##` / `###`
2. 事实边界：仅基于用户提供的材料；不确定处标「待验证」
3. 要求输出「须由作者补充的一手清单」（环境、版本、耗时、失败案例）
4. 同时索要 TL;DR 与 1–2 版 Meta Description 备选
5. **成文后人工**：核对事实、跑通命令/代码、补个人经验

**可复用 Prompt 示例**

- 作为技术博客编辑，根据下列要点写 Hexo 正文：【要点】。约束：主标题仅出现在 Frontmatter；正文 `##`/`###`；文首 TL;DR；融入关键词【主关键词】；预留「第一手经验」段落；附 1–2 条 Meta Description 建议。
- 作为 SEO 审阅：下列全文是否符合 Helpful Content 与 E-E-A-T，标出薄弱处与可执行的修改建议。

## 八、成文前自检（可复制）

```
- [ ] title 唯一、可读、主关键词靠前，无标题党
- [ ] 正文无 `#` H1；`##`/`###` 层级连续
- [ ] tags / categories 利于专题内链
- [ ] 长文 TL;DR 与结论一致
- [ ] 至少 3–5 条站内相关内链，锚文本具体
- [ ] 图片 alt、代码与引用可核对
- [ ] 含可验证的一手细节（环境、版本、踩坑等）
- [ ] 大改后考虑标注更新日期或依赖主题展示「更新于」
- [ ] 以解决读者问题为先，而非为 SEO 而 SEO
```

## 延伸资源

- [Google Search · Ranking 历史（官方事件时间线）](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history?hl=zh-cn)
- [Google Search Central — 创建实用、可靠、以用户为中心的内容](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)（People-first / 有用内容）
- [Hexo 文档](https://hexo.io/docs/) · [Butterfly](https://butterfly.js.org/)
- 本目录 [reference.md](reference.md)（站外 SEO、意图类型等扩展，按需打开）
