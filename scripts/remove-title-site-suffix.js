/**
 * 去掉 <title> 末尾的「 | 站点名」。
 * Butterfly 模板：layout/includes/head.pug
 *   tabTitle = pageTitle + ' | ' + config.title
 * _config.yml 的 title 仍用于 Open Graph / JSON-LD 等，仅影响文档 <title>。
 *
 * 关闭：根目录 _config.yml 设置 remove_title_site_suffix: false
 */
'use strict';

/** @param {string} html */
function stripTitleSiteSuffix(html) {
  if (typeof html !== 'string' || html.length === 0) {
    return html;
  }
  if (hexo.config.remove_title_site_suffix === false) {
    return html;
  }
  const siteTitle = hexo.config.title;
  if (!siteTitle) {
    return html;
  }
  const suffix = ` | ${siteTitle}`;
  // 无 <title> 或不含可剥离后缀时直接返回（避免无意义正则）
  if (!html.includes('<title>') || !html.includes(suffix)) {
    return html;
  }
  // 仅处理首个 <title>（整页 HTML）
  return html.replace(/<title>([^<]*)<\/title>/, (match, inner) => {
    if (inner.endsWith(suffix)) {
      return `<title>${inner.slice(0, -suffix.length)}</title>`;
    }
    return match;
  });
}

hexo.extend.filter.register('after_render:html', stripTitleSiteSuffix, 100);
