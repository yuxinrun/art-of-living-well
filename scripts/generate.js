import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, PAGES_DIR, readJson, loadArticles, ensureDir } from './lib/content.js';
import { getData } from './lib/ui.js';
import { renderHome, renderCategory, renderArticle } from './lib/views.js';
import { renderQuotes, renderBooks, renderAbout, renderLibrary, renderNotFound } from './lib/views-library.js';

const writeHtml = (urlPath, html) => {
  const clean = urlPath.replace(/^\/+|\/+$/g, '');
  const dir = clean ? path.join(PAGES_DIR, clean) : PAGES_DIR;
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
};

export function generate() {
  const { site, categories, nav } = getData();
  const quotes = readJson('data/quotes.json');
  const books = readJson('data/books.json');
  const collections = readJson('data/collections.json');

  const all = loadArticles();
  const pages = all.filter((a) => a.category === 'pages');
  const articles = all.filter((a) => a.category !== 'pages');

  if (fs.existsSync(PAGES_DIR)) fs.rmSync(PAGES_DIR, { recursive: true, force: true });
  ensureDir(PAGES_DIR);

  const about = pages.find((p) => p.slug === 'about');

  // 校验合集引用的文章是否真实存在，避免死链
  const articleKeys = new Set(articles.map((a) => `${a.category}/${a.slug}`));
  const validCollections = collections.map((c) => {
    const items = (c.items || []).filter((key) => articleKeys.has(key));
    const first = articles.find((a) => `${a.category}/${a.slug}` === items[0]);
    return {
      ...c,
      items,
      count: items.length,
      href: first ? first.url : c.href || '/',
    };
  }).filter((c) => c.count > 0);

  // 首页
  writeHtml('/', renderHome({ site, nav, categories, articles, quotes, books, collections: validCollections }));

  // 栏目页
  for (const cat of categories) {
    writeHtml(cat.path, renderCategory({ site, nav, categories, cat, articles, allArticles: articles }));
  }

  // 文章页
  for (const article of articles) {
    writeHtml(article.url, renderArticle({ site, nav, categories, article, allArticles: articles }));
  }

  // 金句 / 书籍 / 书签
  writeHtml('/quotes/', renderQuotes({ site, nav, quotes }));
  writeHtml('/books/', renderBooks({ site, nav, books }));
  writeHtml('/library/', renderLibrary({ site, nav, quotes }));

  // 关于
  if (about) {
    writeHtml('/about/', renderAbout({ site, nav, page: about }));
  }

  // 404
  fs.writeFileSync(
    path.join(PAGES_DIR, '404.html'),
    renderNotFound({ site, nav, categories }),
    'utf8',
  );

  // 搜索索引（供前端动态加载）
  const searchIndex = {
    generatedAt: new Date().toISOString().slice(0, 10),
    articles: articles.map((a) => ({
      title: a.title,
      url: a.url,
      category: categories.find((c) => c.id === a.category)?.name || a.category,
      summary: a.summary || a.subtitle || '',
      keywords: (a.tags || []).join(' '),
      kind: a.type,
      readingTime: a.readingTime,
    })),
    quotes: quotes.map((q) => ({
      id: q.id,
      text: q.text,
      author: q.author,
      category: q.category,
      type: q.type,
    })),
    books: books.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      category: b.category,
      summary: b.summary,
    })),
  };
  ensureDir(path.join(ROOT, 'src/generated'));
  fs.writeFileSync(
    path.join(ROOT, 'src/generated/search-index.json'),
    JSON.stringify(searchIndex),
    'utf8',
  );

  // 站点地图
  const urls = [
    { loc: '/', priority: '1.0', lastmod: articles[0]?.date },
    ...categories.map((c) => ({ loc: c.path, priority: '0.8', lastmod: articles.find((a) => a.category === c.id)?.date })),
    ...articles.map((a) => ({ loc: a.url, priority: a.featured ? '0.8' : '0.7', lastmod: a.updated || a.date })),
    { loc: '/quotes/', priority: '0.7', lastmod: articles[0]?.date },
    { loc: '/books/', priority: '0.6', lastmod: articles[0]?.date },
    ...(about ? [{ loc: '/about/', priority: '0.4', lastmod: about.date }] : []),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${site.url}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.loc === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(PAGES_DIR, 'sitemap.xml'), sitemap, 'utf8');

  fs.writeFileSync(
    path.join(PAGES_DIR, 'robots.txt'),
    `User-agent: *\nAllow: /\nDisallow: /library/\n\nSitemap: ${site.url}/sitemap.xml\n`,
    'utf8',
  );

  const count = (t) => articles.filter((a) => a.type === t).length;
  console.log(
    `[content] ${articles.length} 篇内容（文章 ${count('article')} / 场景 ${count('scenario')}）· ${quotes.length} 条金句 · ${books.length} 本书 · ${categories.length} 个栏目`,
  );
  return { articles, quotes, books };
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) generate();