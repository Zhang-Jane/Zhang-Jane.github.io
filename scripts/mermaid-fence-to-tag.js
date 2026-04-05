/**
 * 将 Markdown 中的 ```mermaid 代码块转为 Butterfly 的 {% mermaid %} 标签。
 *
 * 原因：Hexo 默认 highlight 会把 ```mermaid 渲染成 figure.highlight.plaintext，
 * 主题的 codeToMermaid() 只识别 pre > code.mermaid，无法匹配，图表不会执行。
 * 转为 Hexo 标签后由主题输出 .mermaid-wrap，与 Mermaid.js 一致。
 *
 * 依赖：_config.butterfly.yml 中 mermaid.enable: true
 */
'use strict';

// 优先级须 < 10（Hexo 内置 backtick_code_block 默认 10），否则 ``` 已被转成高亮占位，无法匹配
hexo.extend.filter.register(
  'before_post_render',
  (data) => {
    if (typeof data.content !== 'string' || !data.content.includes('```mermaid')) {
      return data;
    }
    data.content = data.content.replace(
      /```mermaid\s*\n([\s\S]*?)```/g,
      (_, code) => `{% mermaid %}\n${code.trim()}\n{% endmermaid %}\n`
    );
    return data;
  },
  9
);
