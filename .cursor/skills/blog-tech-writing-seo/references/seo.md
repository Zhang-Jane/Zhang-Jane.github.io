# SEO 参考（扩展）

**主入口**：[SKILL.md](../SKILL.md)（标题层级、最小 Frontmatter、延伸资源索引）。本文件收录 **E-E-A-T、On-Page、站点级、专题与意图、站外维护、Meta/结构化数据** 全文，避免与主文件重复。

**相关**：[写作补充](writing.md) · [配图](images.md)

---

## E-E-A-T 核心原则（People-First）

- **Experience**：环境、版本、耗时、失败与复现步骤等**一手信息**（最强区分度）
- **Expertise**：准确、可深入；引用可核对来源
- **Authoritativeness**：Topic Cluster（支柱文 + 集群文互链），形成专题深度
- **Trust**：链接有效、版本与更新透明、不误导

**避免**：薄内容、无人工校验的纯 AI 堆砌、关键词堆砌、标题党。算法与系统更新会持续向「有帮助的原创内容」倾斜；可关注官方时间线：[Google Search · Ranking 历史](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history?hl=zh-cn)。

---

## 每篇 On-Page SEO 执行清单

- **Title**：与 `title` 一致；主关键词靠前；长度控制在搜索结果不易截断的范围内
- **Meta Description**（主题支持时，或由首段承担）：约 150–160 字；主关键词 + 价值 + 轻 CTA；首段前两句尽量可当摘要（细则见下文「Meta Description 书写要点」）
- **结构**：可选文首 **要点列表**（3–6 条）；H2/H3 覆盖子意图（原理、步骤、对比、排错）；主关键词自然出现在首屏与首个 H2 附近即可，**忌堆砌**
- **内链**：至少 3–5 条指向相关文或支柱页；锚文本描述目标页
- **外链**：官方文档、RFC、权威来源为主
- **图片**：描述性 `alt`、压缩与合适格式；类型与数量见 [images.md](images.md)（真实截图与官方图优先；**不**依赖 AI 生图）
- **结尾**：2–3 句总结 + 1 句轻 CTA；相关阅读用正文内链或短段落嵌入链接。若正文使用上标编号引用，文末按 [writing.md](writing.md) 用 **`## 引用来源`** 收束，**避免**无编号、无说明的链接堆砌；必要时短作者信息以体现经验

---

## 站点级技术 SEO 提醒

- HTTPS、移动端可用（Butterfly 响应式）
- 大图 WebP、懒加载；关注 Core Web Vitals
- 生成 **sitemap**，在 Search Console 提交；**robots** 勿误拦重要路径
- 重复内容用 **canonical**（若接入）
- 工具：Search Console、PageSpeed Insights、Lighthouse

---

## Topic Cluster（专题集群）

- **Pillar**：一篇总览（定义、路线、索引内链）
- **Cluster**：多篇子题；文首或文末回链 Pillar 与姊妹篇
- `tags` / `categories` 命名与专题一致，便于内链与聚合

**草图模板**：

```text
Pillar：《{专题} 完整指南》
  ├─ Cluster：《{子题 A} 实战》
  ├─ Cluster：《{子题 B} 排错》
  └─ Cluster：《{子题 C} 与 {X} 对比》
```

每篇 Cluster 文首或文末：「同系列：[[Pillar]]、[[姊妹篇]]」。

---

## 搜索意图类型（选题时对齐）

| 类型 | 读者目的 | 内容形态提示 |
|------|----------|----------------|
| 信息型 | 学会概念/步骤 | 教程、图解、FAQ |
| 导航型 | 找某官方页/工具 | 明确品牌名+路径，避免误导 |
| 比较型 | 选型 | 对比表、适用场景、限制 |
| 交易型 | 购买/注册 | 本技术博客少用；若涉及披露关系 |

---

## Google Search 排名相关更新（如何「跟进」）

- 官方事件列表：[Ranking 产品历史（Google Search Status Dashboard）](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history?hl=zh-cn)
- **写作策略**：把「系统更新」当作**质量方向**而非「关键词技巧」；核心仍是原创深度、清晰结构、可验证信息与良好体验（与 E-E-A-T、Helpful Content 一致）。

---

## 站外 SEO 与长期维护

- **外链**：优先相关站点、客座、资源页；重质不重量；拒绝购买链接与操纵性方案
- **品牌**：站内一致作者名、GitHub、关于页；鼓励自然搜索品牌词
- **分发**：视频/社交可回链正文；避免重复粘贴全文导致多 URL 重复（用 canonical 或单一原文）
- **监控**：Search Console（印象、点击、位置）；Analytics（跳出、停留）；定期修死链与过时命令/版本号

---

## Meta Description 书写要点

- 长度约 **150–160 字符**（中文按显示宽度近似）
- 包含 **1 次**主关键词的自然表述
- 一句**具体收益**（学会什么/解决什么）
- 轻 CTA（如「含步骤与命令」）；避免全站同一模板

---

## 结构化数据（实现时）

- 文章页：Article（headline、datePublished、author、image）
- 教程类：HowTo（步骤与工具）
- FAQ：仅当正文确有问答块时使用，避免虚假 FAQ

具体字段以 Hexo/主题/插件生成的 HTML 为准，与 frontmatter 保持一致。
