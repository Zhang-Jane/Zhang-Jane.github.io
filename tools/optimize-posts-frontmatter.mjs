/**
 * 批量优化 source/_posts 下文章的 title、description（140–160 字）与正文开头空行。
 * 依赖：node_modules/js-yaml（位于站点根目录 node_modules）
 * 用法：FORCE=1 node tools/optimize-posts-frontmatter.mjs
 * 说明：勿放入 Hexo scripts/，以免被当作插件加载。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, "..", "source", "_posts");

const DESC_MIN = 140;
const DESC_MAX = 160;

const ulen = (s) => [...String(s)].length;

/** 少量笔记的 description 人工维护（须满足 140–160 字） */
const MANUAL_DESCRIPTION = {
  "后端是什么2026.md":
    "面向初学与回顾的后端结构化笔记：厘清前后端分工、HTTP 与并发 I/O、典型 Web 处理链，对比 REST/GraphQL/RPC 等接口风格，并介绍 Python WSGI/ASGI、多语言应用服务器边界、数据库 ORM 与 Raw 分层，以及网关安全与学习路径。助你建立总览。",
  "go语言基础.md":
    "Go 语言基础笔记：从强类型、类型推导与基本数据类型，到切片、映射、接口与并发原语，配合示例梳理常见语法与踩坑。内容含 := 与作用域、错误处理与工程实践提示，适合入门与日常查阅、复习对照及按需检索。另附标准库与常见命令速查要点，便于工程落地时快速回看。适合按需检索与常见踩坑对照。",
  "产品入门.md":
    "互联网产品经理基本功学习笔记：从 PRD 规范、SaaS 基础与需求采集，到 5W2H、JTBD、用户故事、KANO、MoSCoW 与 MVP，并梳理 2026 年 AI 时代 PM 角色演进。面向新手结构化整理，含案例与「定义—为何—如何做」写法，适合入门、复习与方法论速查对照。",
};

/** 去掉行内 Markdown 标记，便于 Meta 描述纯文本展示 */
function stripInlineMd(s) {
  return String(s)
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/~~([^~]*)~~/g, "$1")
    .replace(/_([^_\n]+)_/g, "$1");
}

/** 正文去掉代码块、链接与多余标记，取纯文本摘要 */
function markdownToPlain(md) {
  const t = stripInlineMd(md);
  return t
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMeaningfulParagraph(body) {
  const lines = body.split(/\n/);
  const buf = [];
  for (const line of lines) {
    let t = line.trim();
    if (!t || t.startsWith("---")) continue;
    if (/^#{1,6}\s/.test(t)) break;
    if (/^!\[/.test(t)) continue;
    if (/^_\s*图[：:]/.test(t)) continue;
    if (/^>\s?/.test(t)) t = t.replace(/^>\s?/, "");
    t = stripInlineMd(t);
    if (!t) continue;
    buf.push(t);
    if (buf.join(" ").length > 55) break;
  }
  return buf.join(" ");
}

function firstH2(body) {
  const m = body.match(/^##\s+(.+)$/m);
  return m ? m[1].replace(/[#`]/g, "").trim() : "";
}

/** 标题可读性：纠错与小写技术名规范化 */
function polishTitle(rawTitle, basename, body) {
  let t =
    rawTitle != null && String(rawTitle).trim() !== ""
      ? String(rawTitle).trim()
      : basename.replace(/\.md$/, "");
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1);
  }

  t = t.replace(/下上文/g, "上下文");
  t = t.replace(/\bandorid\b/gi, "Android");

  const techStarts = [
    [/^go语言/i, "Go 语言"],
    [/^scrapy/i, "Scrapy"],
    [/^django/i, "Django"],
    [/^flask/i, "Flask"],
    [/^frida/i, "Frida"],
    [/^kafka$/i, "Kafka"],
    [/^redis/i, "Redis"],
    [/^mongo/i, "Mongo"],
    [/^mysql/i, "MySQL"],
    [/^vim$/i, "Vim"],
    [/^ajax$/i, "Ajax"],
    [/^rpc$/i, "RPC"],
    [/^websocket$/i, "WebSocket"],
    [/^web-api$/i, "Web API"],
    [/^web api$/i, "Web API"],
    [/^git$/i, "Git"],
    [/^poetry$/i, "Poetry"],
    [/^hexo/i, "Hexo"],
    [/^zookeeper$/i, "ZooKeeper"],
    [/^mitmdump$/i, "mitmproxy / mitmdump"],
    [/^k8s/i, "Kubernetes"],
    [/^android/i, "Android"],
    [/^appium/i, "Appium"],
    [/^chrome-console/i, "Chrome DevTools Console"],
    [/^xposed/i, "Xposed"],
    [/^ida/i, "IDA"],
    [/^jni/i, "JNI"],
    [/^ndk/i, "NDK"],
    [/^twisted/i, "Twisted"],
    [/^python/i, "Python"],
    [/^java/i, "Java"],
    [/^js的/i, "JavaScript "],
    [/^mac安装/i, "macOS 安装"],
  ];
  for (const [re, rep] of techStarts) {
    if (re.test(t)) {
      t = t.replace(re, rep);
      break;
    }
  }

  t = t.replace(/\bmysql\b/gi, "MySQL");
  t = t.replace(/\bredis\b/gi, "Redis");
  t = t.replace(/\bkafka\b/gi, "Kafka");
  t = t.replace(/\bweb\b/gi, "Web");
  t = t.replace(/\blinux\b/gi, "Linux");
  t = t.replace(/\bwindows\b/gi, "Windows");

  const h2 = firstH2(body);
  if (!/[：:]/.test(t) && t.length < 18 && h2) {
    const hint = h2.slice(0, 24);
    t = `${t}：${hint}${h2.length > 24 ? "…" : ""}`;
  } else if (!/[：:]/.test(t) && t.length < 14) {
    t = `${t}：学习笔记与要点整理`;
  }

  return t.trim();
}

function stripTitleForDesc(title) {
  return String(title)
    .replace(/^["']|["']$/g, "")
    .replace(/（[^）]*）\s*$/u, "")
    .trim();
}

const FILLERS = [
  "适合日常查阅、复习对照与工程检索。",
  "含命令、参数与常见踩坑提示。",
  "便于按需检索与落地对照。",
];

/** 生成 140–160 字（含标点）的 Meta 描述 */
function buildDescription(basename, title, bodyAfterFm) {
  if (Object.prototype.hasOwnProperty.call(MANUAL_DESCRIPTION, basename)) {
    return MANUAL_DESCRIPTION[basename];
  }

  const shortTitle = stripTitleForDesc(title);
  let plain =
    firstMeaningfulParagraph(bodyAfterFm) ||
    markdownToPlain(bodyAfterFm.slice(0, 3500));
  plain = stripInlineMd(plain).replace(/\s+/g, " ").trim();
  if (!plain) plain = "整理要点、命令与实践经验，便于复习与检索。";

  const head =
    ulen(shortTitle) > 36 ? [...shortTitle].slice(0, 35).join("") + "…" : shortTitle;

  let core = plain;
  const maxCore = 95;
  if (ulen(core) > maxCore) {
    core = [...core].slice(0, maxCore - 1).join("") + "…";
  }

  const joiner =
    /[：:]/.test(head) && !/^[：:]/.test(core) ? "。" : "：";
  let s = `${head}${joiner}${core}`;
  s = s.replace(/\s+/g, " ").trim();

  let fill = 0;
  while (ulen(s) < DESC_MIN && fill < FILLERS.length) {
    s = s + FILLERS[fill++];
  }

  const LONG_PAD =
    "本笔记整理要点、命令与常见踩坑，适合日常查阅、复习对照与工程落地时快速检索。";
  let guard = 0;
  while (ulen(s) < DESC_MIN && guard++ < 4) {
    s = (s + LONG_PAD).replace(/\s+/g, " ").trim();
  }
  const escPad = LONG_PAD.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  s = s.replace(new RegExp(`(${escPad}\\s*)+`, "g"), LONG_PAD);

  if (ulen(s) > DESC_MAX) {
    const cut = s.lastIndexOf("。", DESC_MAX + 10);
    if (cut >= DESC_MIN - 1) {
      s = s.slice(0, cut + 1);
    } else {
      s = [...s].slice(0, DESC_MAX - 1).join("") + "…";
    }
  }

  if (ulen(s) < DESC_MIN) {
    s = (s + LONG_PAD).replace(/\s+/g, " ").trim();
  }
  s = s.replace(new RegExp(`(${escPad}\\s*)+`, "g"), LONG_PAD);

  if (ulen(s) > DESC_MAX) {
    s = [...s].slice(0, DESC_MAX - 1).join("") + "…";
  }

  return s;
}

/** 确保正文以单个空行开头，利于阅读 */
function normalizeBodyLead(body) {
  if (!body) return "\n";
  let b = body.replace(/^\uFEFF/, "");
  if (b.startsWith("\n\n\n")) {
    b = "\n\n" + b.replace(/^\n+/, "");
  } else if (b.startsWith("\n") && !b.startsWith("\n\n")) {
    b = "\n" + b;
  } else if (!b.startsWith("\n")) {
    b = "\n\n" + b;
  }
  return b;
}

function splitFrontMatter(content) {
  if (!content.startsWith("---")) return null;
  const sep = "\n---\n";
  let idx = content.indexOf(sep, 4);
  let sepLen = sep.length;
  if (idx === -1) {
    const sep2 = "\r\n---\r\n";
    idx = content.indexOf(sep2, 4);
    if (idx === -1) return null;
    sepLen = sep2.length;
  }
  const yamlStr = content.slice(4, idx).replace(/\r\n/g, "\n");
  const body = content.slice(idx + sepLen);
  return { yamlStr, body };
}

function orderedDump(fm) {
  const preferred = [
    "title",
    "description",
    "date",
    "updated",
    "tags",
    "categories",
    "top_img",
    "cover",
    "abbrlink",
  ];
  const ordered = {};
  for (const k of preferred) {
    if (Object.prototype.hasOwnProperty.call(fm, k)) ordered[k] = fm[k];
  }
  for (const k of Object.keys(fm)) {
    if (!Object.prototype.hasOwnProperty.call(ordered, k)) ordered[k] = fm[k];
  }
  return (
    yaml.dump(ordered, {
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
      sortKeys: false,
    }) + "\n"
  );
}

function main() {
  const force = process.env.FORCE === "1";

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  let changed = 0;
  for (const file of files) {
    const full = path.join(POSTS_DIR, file);
    let raw = fs.readFileSync(full, "utf8");
    const split = splitFrontMatter(raw);
    if (!split) {
      console.warn("skip (no frontmatter):", file);
      continue;
    }

    let fm;
    try {
      fm = yaml.load(split.yamlStr);
    } catch (e) {
      console.warn("skip (yaml parse):", file, e.message);
      continue;
    }
    if (!fm || typeof fm !== "object") continue;

    const body = split.body;
    const origTitleNorm = String(fm.title ?? "")
      .replace(/^["']|["']$/g, "")
      .trim();
    const newTitle = polishTitle(fm.title, file, body);
    const newDesc = buildDescription(file, newTitle, body);
    const origDescNorm =
      fm.description == null
        ? ""
        : String(fm.description).replace(/\s+/g, " ").trim();

    const titleChanged = newTitle !== origTitleNorm;
    const descChanged = origDescNorm !== newDesc;

    fm.title = newTitle;
    fm.description = newDesc;

    let newBody = normalizeBodyLead(body);
    const bodyChanged = newBody !== body;

    if (!force && !titleChanged && !descChanged && !bodyChanged) {
      continue;
    }

    const out = "---\n" + orderedDump(fm) + "---\n" + newBody;
    fs.writeFileSync(full, out, "utf8");
    changed++;
    console.log("updated:", file);
  }
  console.log("done, files updated:", changed, "/", files.length);
}

main();
