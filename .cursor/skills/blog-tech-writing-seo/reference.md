# 技术博客 SEO 参考（扩展）

本文档为 [SKILL.md](SKILL.md) 的补充：站外 SEO、监控与 Google 排名产品更新关注点。

## Google Search 排名相关更新（如何「跟进」）

- 官方事件列表：[Ranking 产品历史（Google Search Status Dashboard）](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history?hl=zh-cn)
- **写作策略**：把「系统更新」当作**质量方向**而非「关键词技巧」；核心仍是原创深度、清晰结构、可验证信息与良好体验（与 E-E-A-T、Helpful Content 一致）。

## 站外 SEO 与长期维护

- **外链**：优先相关站点、客座、资源页；重质不重量；拒绝购买链接与操纵性方案
- **品牌**：站内一致作者名、GitHub、关于页；鼓励自然搜索品牌词
- **分发**：视频/社交可回链正文；避免重复粘贴全文导致多 URL 重复（用 canonical 或单一原文）
- **监控**：Search Console（印象、点击、位置）；Analytics（跳出、停留）；定期修死链与过时命令/版本号

## 搜索意图类型（选题时对齐）

| 类型 | 读者目的 | 内容形态提示 |
|------|----------|----------------|
| 信息型 | 学会概念/步骤 | 教程、图解、FAQ |
| 导航型 | 找某官方页/工具 | 明确品牌名+路径，避免误导 |
| 比较型 | 选型 | 对比表、适用场景、限制 |
| 交易型 | 购买/注册 | 本技术博客少用；若涉及披露关系 |

## Topic Cluster 草图模板

```text
Pillar：《{专题} 完整指南》
  ├─ Cluster：《{子题 A} 实战》
  ├─ Cluster：《{子题 B} 排错》
  └─ Cluster：《{子题 C} 与 {X} 对比》
```

每篇 Cluster 文首或文末：「同系列：[[Pillar]]、[[姊妹篇]]」。

## Meta Description 书写要点

- 长度约 **150–160 字符**（中文按显示宽度近似）
- 包含 **1 次**主关键词的自然表述
- 一句**具体收益**（学会什么/解决什么）
- 轻 CTA（如「含步骤与命令」）；避免全站同一模板

## 结构化数据（实现时）

- 文章页：Article（headline、datePublished、author、image）
- 教程类：HowTo（步骤与工具）
- FAQ：仅当正文确有问答块时使用，避免虚假 FAQ

具体字段以 Hexo/主题/插件生成的 HTML 为准，与 frontmatter 保持一致。
