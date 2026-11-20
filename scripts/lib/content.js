import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMarkdown, countChars } from './markdown.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const PAGES_DIR = path.join(ROOT, 'pages');
export const CONTENT_DIR = path.join(ROOT, 'content');

export const readJson = (relPath) =>
  JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** 解析简单 YAML 风格 frontmatter（支持字符串、布尔、数字、内联数组与块数组） */
export function parseFrontmatter(raw) {
  const text = String(raw).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) return { data: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: text };
  const head = text.slice(4, end);
  const body = text.slice(text.indexOf('\n', end + 1) + 1);
  const data = {};
  let currentKey = null;

  for (const line of head.split('\n')) {
    if (!line.trim()) continue;
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(stripQuotes(listItem[1].trim()));
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const value = kv[2].trim();
    currentKey = key;
    if (!value) {
      data[key] = [];
      continue;
    }
    if (/^\[.*\]$/.test(value)) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => stripQuotes(s.trim()))
        .filter(Boolean);
    } else if (/^(true|false)$/.test(value)) {
      data[key] = value === 'true';
    } else if (/^\d+$/.test(value)) {
      data[key] = Number(value);
    } else {
      data[key] = stripQuotes(value);
    }
  }
  return { data, body };
}

function stripQuotes(s) {
  return s.replace(/^["']/, '').replace(/["']$/, '');
}

export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = String(iso).split('-');
  if (!d) return `${y} 年 ${Number(m)} 月`;
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`;
}

/** 读取全部 Markdown 内容 */
export function loadArticles() {
  const articles = [];
  if (!fs.existsSync(CONTENT_DIR)) return articles;

  for (const dir of fs.readdirSync(CONTENT_DIR, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const category = dir.name;
    const dirPath = path.join(CONTENT_DIR, category);
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.endsWith('.md')) continue;
      const abs = path.join(dirPath, file);
      const { data, body } = parseFrontmatter(fs.readFileSync(abs, 'utf8'));
      const slug = file.replace(/\.md$/, '');
      const { html, toc } = renderMarkdown(body);
      const plain = body.replace(/[#>*`|\-]/g, '').replace(/\s/g, '');
      const readingTime = Math.max(3, Math.round(countChars(plain) / 420));
      articles.push({
        ...data,
        slug,
        category,
        body,
        html,
        toc,
        readingTime,
        date: data.date || '2026-01-01',
        tags: toArray(data.tags),
        keyPoints: toArray(data.keyPoints),
        type: category === 'scenarios' ? 'scenario' : 'article',
        url: data.url || `/${category}/${slug}/`,
      });
    }
  }

  articles.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return String(a.title).localeCompare(String(b.title), 'zh');
  });
  return articles;
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(/[,，、]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function groupByCategory(articles) {
  const map = {};
  for (const article of articles) {
    map[article.category] = map[article.category] || [];
    map[article.category].push(article);
  }
  return map;
}

/** 依内容日期生成"最近更新"文本 */
export function latestDate(articles) {
  return articles.reduce((acc, a) => (a.date > acc ? a.date : acc), '2026-01-01');
}