/**
 * 极简 Markdown 渲染器（零依赖）
 * 支持：h2/h3、段落、有序/无序列表、引用块、表格、分隔线、行内代码、链接、粗体、强调、标记
 * 输出 HTML 片段 + 目录结构，供静态页面生成使用。
 */

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function inline(text) {
  let t = escapeHtml(text);
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => {
    const external = /^https?:/i.test(href);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${href}"${attrs}>${label}</a>`;
  });
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  t = t.replace(/==([^=]+)==/g, '<mark>$1</mark>');
  return t;
}

/** 生成可用于 id 的短标识（中文标题用序号代替，保证合法且稳定） */
function slugId(prefix, n) {
  return `${prefix}-${n}`;
}

/** 支持 `## 标题 {#anchors-id}` 形式的自定义锚点 */
function splitAnchor(raw) {
  const m = raw.match(/^(.*?)\s*\{#([A-Za-z][\w-]*)\}\s*$/);
  if (m) return { text: m[1].trim(), id: m[2] };
  return { text: raw.trim(), id: '' };
}

export function renderMarkdown(source) {
  const lines = String(source).replace(/\r\n/g, '\n').split('\n');
  const toc = [];
  const out = [];
  let i = 0;
  let headingCount = 0;

  const isListStart = (line) => /^\s*([-*]|\d+\.)\s+/.test(line);
  const isTableStart = (line, next) => /^\s*\|.*\|\s*$/.test(line) && /^\s*\|[\s:|-]+\|\s*$/.test(next || '');

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    // 分隔线
    if (/^\s*(---|\*\*\*)\s*$/.test(line)) {
      out.push('<hr />');
      i += 1;
      continue;
    }

    // 二级 / 三级标题
    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      headingCount += 1;
      const { text, id: custom } = splitAnchor(h[2]);
      const id = custom || slugId('sec', headingCount);
      toc.push({ level, text, id });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i += 1;
      continue;
    }

    // 一级标题：正文中不允许出现，统一降级为 h2，避免破坏页面 H1
    if (/^#\s+/.test(line)) {
      headingCount += 1;
      const parsed = splitAnchor(line.replace(/^#\s+/, ''));
      const id = parsed.id || slugId('sec', headingCount);
      toc.push({ level: 2, text: parsed.text, id });
      out.push(`<h2 id="${id}">${inline(parsed.text)}</h2>`);
      i += 1;
      continue;
    }

    // 引用块
    if (/^\s*>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''));
        i += 1;
      }
      out.push(`<blockquote><p>${inline(buf.join(' '))}</p></blockquote>`);
      continue;
    }

    // 表格
    if (isTableStart(line, lines[i + 1])) {
      const header = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
        i += 1;
      }
      const thead = `<thead><tr>${header.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${rows
        .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
        .join('')}</tbody>`;
      out.push(`<div class="table-wrap"><table>${thead}${tbody}</table></div>`);
      continue;
    }

    // 列表
    if (isListStart(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items = [];
      while (i < lines.length && isListStart(lines[i])) {
        const raw = lines[i].replace(/^\s*([-*]|\d+\.)\s+/, '');
        items.push(raw);
        i += 1;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${tag}>`);
      continue;
    }

    // 段落
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4})\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !isListStart(lines[i]) &&
      !/^\s*(---|\*\*\*)\s*$/.test(lines[i]) &&
      !isTableStart(lines[i], lines[i + 1])
    ) {
      buf.push(lines[i].trim());
      i += 1;
    }
    if (buf.length) out.push(`<p>${inline(buf.join(''))}</p>`);
  }

  return { html: out.join('\n'), toc };
}

/** 统计中文字符数，用于估算阅读时长 */
export function countChars(source) {
  return String(source).replace(/\s/g, '').length;
}