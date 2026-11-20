import { readJson, formatDate } from './content.js';

/** 读取站点基础数据（体积很小，按需读取便于开发时热更新） */
export function getData() {
  const site = readJson('data/site.json');
  const categories = readJson('data/categories.json');
  const nav = readJson('data/navigation.json');
  return { site, categories, nav };
}

export const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** 相对根路径：depth 为当前页面所在层级 */
export const rel = (depth, p) => `${'../'.repeat(depth)}${String(p).replace(/^\//, '')}`;

export const catOf = (categories, id) =>
  categories.find((c) => c.id === id) || { id, name: id, path: `/${id}/`, en: id };

const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  arrowUp: '<path d="M12 19V5m-6 6 6-6 6 6"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 5H6a1 1 0 0 0-1 1v9"/>',
  bookmark: '<path d="M6 4h12v16l-6-4-6 4V4Z"/>',
  share: '<path d="M12 16V4m0 0L8 8m4-4 4 4"/><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/>',
  shuffle: '<path d="M4 7h3l3 4 3-4h3m0 0-2-2m2 2-2 2M4 17h3l3-4 3 4h3m0 0-2-2m2 2-2 2"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  check: '<path d="m5 13 4 4L19 7"/>',
  quote: '<path d="M9 7c-3 1-4 3.5-4 7v3h5v-6H7c0-2 .7-3 2-4V7Zm10 0c-3 1-4 3.5-4 7v3h5v-6h-3c0-2 .7-3 2-4V7Z"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5"/>',
  download: '<path d="M12 4v10m0 0 4-4m-4 4-4-4"/><path d="M4 18h16"/>',
  heart: '<path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15 9-2 4-4 2 2-4 4-2Z"/>',
  spark: '<path d="M12 3v4m0 10v4M3 12h4m10 0h4"/><path d="m6 6 2 2m8 8 2 2m0-12-2 2M8 16l-2 2"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 5.3l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1.5-1.5"/>',
};

export function icon(name, cls = '') {
  const path = ICONS[name] || ICONS.arrow;
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
}

const SPRITE = `
<svg class="svg-sprite" aria-hidden="true" focusable="false" width="0" height="0" style="position:absolute">
  <defs>
    <symbol id="cat-character" viewBox="0 0 40 40"><path d="M20 7c4 4 6 8 6 13 0 4-2.7 7-6 7s-6-3-6-7c0-5 2-9 6-13Z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M20 14v18M14 26c-3 1-5 3-6 6m18-6c3 1 5 3 6 6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></symbol>
    <symbol id="cat-social" viewBox="0 0 40 40"><circle cx="15" cy="17" r="5" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="26" cy="20" r="4" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M6 33c1-5 4.5-7.5 9-7.5s8 2.5 9 7.5M23 29c1.5-2.6 3.6-4 6-4 2.8 0 4.6 1.6 5 4.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></symbol>
    <symbol id="cat-communication" viewBox="0 0 40 40"><path d="M7 11h18a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H15l-6 5v-5H7a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3Z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M30 9h3a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-1v4l-4-3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" opacity=".55"/><path d="M11 16h10M11 21h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></symbol>
    <symbol id="cat-relationship" viewBox="0 0 40 40"><circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 4"/><circle cx="20" cy="13" r="4" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="25" r="3.4" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="28" cy="25" r="3.4" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M20 17v6m-8 3 6-4m10 4-6-4" stroke="currentColor" stroke-width="1.2"/></symbol>
    <symbol id="cat-workplace" viewBox="0 0 40 40"><path d="M8 15h24v17H8z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M15 15v-3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3M8 22h24" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M18 22v3h4v-3" fill="none" stroke="currentColor" stroke-width="1.3"/></symbol>
    <symbol id="cat-emotions" viewBox="0 0 40 40"><path d="M20 33S9 26 9 17.5A6.5 6.5 0 0 1 20 13a6.5 6.5 0 0 1 11 4.5C31 26 20 33 20 33Z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M20 17v7m0 3v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></symbol>
    <symbol id="cat-understanding" viewBox="0 0 40 40"><path d="M7 20c3-6 8-9 13-9s10 3 13 9c-3 6-8 9-13 9S10 26 7 20Z" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="20" cy="20" r="4" fill="none" stroke="currentColor" stroke-width="1.3"/></symbol>
    <symbol id="cat-family" viewBox="0 0 40 40"><path d="M7 21 20 10l13 11" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M11 20v12h18V20" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M17 32v-7h6v7" fill="none" stroke="currentColor" stroke-width="1.3"/></symbol>
    <symbol id="cat-etiquette" viewBox="0 0 40 40"><path d="M12 14h16l2 8a10 10 0 0 1-20 0l2-8Z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M16 10c0 2 1 2 1 4m4-6c0 2 1 2 1 4m4-2c0 2 1 2 1 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></symbol>
    <symbol id="cat-conflict" viewBox="0 0 40 40"><path d="M9 31 17 20m14 11-8-11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M20 9v9m-4-5h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="20" cy="27" r="6" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".6"/></symbol>
    <symbol id="cat-wisdom" viewBox="0 0 40 40"><path d="M10 29c2-8 6-13 10-16 4 3 8 8 10 16" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M7 30h26" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="20" cy="10" r="3" fill="none" stroke="currentColor" stroke-width="1.3"/></symbol>
    <symbol id="cat-scenarios" viewBox="0 0 40 40"><path d="M9 9h10v10H9zM21 21h10v10H21z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M19 14h6a3 3 0 0 1 3 3v4M21 26h-6a3 3 0 0 1-3-3v-4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2.5 3"/></symbol>
  </defs>
</svg>`;

export function head({ site, title, description, canonical, depth, ogType = 'website', ogImage, jsonLd = [], extraHead = '' }) {
  const cssHref = '/src/styles/main.css';
  const jsSrc = '/src/scripts/main.js';
  const image = ogImage || `${site.url}/assets/images/og-cover.png`;
  const pagePath =
    canonical && canonical.startsWith(site.url) ? canonical.slice(site.url.length) || '/' : '/';
  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light" data-path="${esc(pagePath)}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(canonical)}" />
<meta name="theme-color" content="#F7F5EF" />
<link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml" />
<meta property="og:type" content="${ogType}" />
<meta property="og:site_name" content="${esc(site.name)}" />
<meta property="og:locale" content="zh_CN" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(canonical)}" />
<meta property="og:image" content="${esc(image)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
<link rel="stylesheet" href="${cssHref}" />
<script type="module" src="${jsSrc}"></script>
<script>
  try {
    var t = localStorage.getItem('alw-theme');
    if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}
</script>
${jsonLd.map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`).join('\n')}
${extraHead}
</head>`;
}

function navLinks(nav, depth, active) {
  return nav.main
    .map((item) => {
      const isActive = active === item.path;
      return `<a class="nav-link${isActive ? ' is-active' : ''}" href="${rel(depth, item.path)}"${isActive ? ' aria-current="page"' : ''}>${esc(item.label)}</a>`;
    })
    .join('');
}

export function header(nav, depth, active) {
  const moreLinks = nav.more
    .map((item) => `<a href="${rel(depth, item.path)}">${esc(item.label)}<span>${esc(item.note || '')}</span></a>`)
    .join('');
  const mobileLinks = nav.mobile
    .map(
      (item) =>
        `<a class="mobile-link${active === item.path ? ' is-active' : ''}" href="${rel(depth, item.path)}">${esc(item.label)}</a>`,
    )
    .join('');
  return `${SPRITE}
<header class="site-header" data-header>
  <div class="shell header-inner">
    <a class="brand" href="${rel(depth, '/')}" aria-label="${esc(nav.brand.full)} 首页">
      <span class="brand-seal" aria-hidden="true">和</span>
      <span class="brand-text">
        <strong>${esc(nav.brand.name)}</strong>
        <em>${esc(nav.brand.en)}</em>
      </span>
    </a>
    <nav class="nav" aria-label="主导航">
      ${navLinks(nav, depth, active)}
      <details class="nav-more">
        <summary>全部栏目${icon('arrow', 'icon-xs')}</summary>
        <div class="nav-more-panel">${moreLinks}</div>
      </details>
    </nav>
    <div class="header-tools">
      <button class="icon-btn" type="button" data-search-open aria-label="搜索全站内容" title="搜索（快捷键 /）">
        ${icon('search')}
      </button>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="切换深色阅读模式" title="切换阅读模式">
        ${icon('moon', 'icon-moon')}${icon('sun', 'icon-sun')}
      </button>
      <button class="icon-btn menu-btn" type="button" data-menu-toggle aria-expanded="false" aria-controls="mobile-nav" aria-label="打开菜单">
        ${icon('menu', 'icon-menu')}${icon('close', 'icon-close')}
      </button>
    </div>
  </div>
  <nav class="mobile-nav" id="mobile-nav" aria-label="移动端导航" hidden>
    <div class="shell">${mobileLinks}</div>
  </nav>
</header>
<dialog class="search-dialog" id="search-dialog" aria-labelledby="search-title">
  <form class="search-form" role="search" data-search-form>
    <h2 id="search-title" class="sr-only">全站搜索</h2>
    <div class="search-field">
      ${icon('search')}
      <input type="search" name="q" placeholder="搜索文章、场景、金句与书籍…" autocomplete="off" data-search-input aria-label="搜索关键词" />
      <button type="button" class="search-close" data-search-close aria-label="关闭搜索">${icon('close')}</button>
    </div>
    <p class="search-hint">试试「拒绝」「边界」「论语」「情绪」等关键词</p>
  </form>
  <div class="search-results" data-search-results>
    <p class="search-empty">输入关键词开始检索，支持标题、摘要、标签与栏目。</p>
  </div>
</dialog>`;
}

export function footer(site, nav, depth) {
  const col = (title, items) =>
    `<div class="footer-col">
      <h3>${esc(title)}</h3>
      <ul>${items.map((i) => `<li><a href="${rel(depth, i.path)}">${esc(i.label)}</a></li>`).join('')}</ul>
    </div>`;
  return `<footer class="site-footer">
  <div class="shell footer-grid">
    <div class="footer-brand">
      <a class="brand" href="${rel(depth, '/')}">
        <span class="brand-seal" aria-hidden="true">和</span>
        <span class="brand-text"><strong>${esc(site.name)}</strong><em>${esc(site.nameEn)}</em></span>
      </a>
      <p>${esc(site.tagline)}。不做鸡汤，不教圆滑，只讨论可以落地的做人做事之道。</p>
      <p class="footer-motto">${esc(site.motto)}</p>
    </div>
    ${col('核心栏目', nav.footer.columns[0])}
    ${col('内容形态', nav.footer.columns[1])}
    ${col('关于与规范', nav.footer.columns[2])}
  </div>
  <div class="shell footer-bottom">
    <p>© ${site.startYear}–${new Date().getFullYear()} ${esc(site.name)} · ${esc(site.nameEn)}</p>
    <p>${esc(site.license)} · 引用请注明出处，原创内容转载需授权</p>
  </div>
</footer>
<button class="back-to-top" type="button" data-back-to-top aria-label="返回顶部">${icon('arrowUp')}</button>
<div class="toast" role="status" aria-live="polite" data-toast></div>`;
}

export function layout({ page, depth, content, active, site, nav, bodyClass = 'page' }) {
  const { site: s, nav: n } = site && nav ? { site, nav } : getData();
  return `${head({
    site: s,
    title: page.title,
    description: page.description,
    canonical: page.canonical,
    depth,
    ogType: page.ogType,
    ogImage: page.ogImage,
    jsonLd: page.jsonLd,
    extraHead: page.extraHead,
  })}
<body class="${bodyClass}">
<a class="skip-link" href="#main">跳转到正文</a>
${page.progress ? '<div class="progress-bar" data-progress aria-hidden="true"></div>' : ''}
${header(n, depth, active)}
<main id="main">
${content}
</main>
${footer(s, n, depth)}
</body>
</html>`;
}

export function breadcrumbs(items, depth) {
  return `<nav class="breadcrumbs" aria-label="面包屑导航">
    <ol>
      ${items
        .map((item, index) =>
          index === items.length - 1
            ? `<li aria-current="page">${esc(item.label)}</li>`
            : `<li><a href="${rel(depth, item.path)}">${esc(item.label)}</a></li>`,
        )
        .join('<li aria-hidden="true">/</li>')}
    </ol>
  </nav>`;
}

export function sectionHead({ eyebrow, title, desc, href, label = '查看全部', depth = 0 }) {
  return `<div class="section-head">
    <div class="section-head-main">
      ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
      <h2>${esc(title)}</h2>
      ${desc ? `<p class="section-desc">${esc(desc)}</p>` : ''}
    </div>
    ${href ? `<a class="section-link" href="${rel(depth, href)}">${esc(label)}${icon('arrow', 'icon-xs')}</a>` : ''}
  </div>`;
}

export function articleCard(article, depth, categories, options = {}) {
  const cat = catOf(categories, article.category);
  const tags = (article.tags || []).slice(0, 2).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
  return `<a class="card article-card" href="${rel(depth, article.url)}" data-tags="${esc((article.tags || []).join('|'))}">
    <div class="card-meta">
      <span class="card-cat">${esc(cat.name)}</span>
      <span>${formatDate(article.date)}</span>
    </div>
    <h3>${esc(article.title)}</h3>
    <p class="card-summary">${esc(article.summary || article.subtitle || '')}</p>
    <div class="card-foot">
      <div class="tag-row">${tags}</div>
      <span class="card-read">${icon('clock', 'icon-xs')}${article.readingTime} 分钟</span>
    </div>
  </a>`;
}

export function scenarioCard(article, depth, categories) {
  const cat = catOf(categories, article.category);
  return `<a class="card scenario-card" href="${rel(depth, article.url)}" data-tags="${esc((article.tags || []).join('|'))}">
    <div class="card-meta">
      <span class="card-cat">${esc(cat.name)}</span>
      <span class="card-level">${esc(article.level || '通用')}</span>
    </div>
    <h3>${esc(article.title)}</h3>
    <p class="card-summary">${esc(article.oneliner || article.summary || '')}</p>
    <span class="card-more">查看处理步骤${icon('arrow', 'icon-xs')}</span>
  </a>`;
}

export function categoryCard(cat, depth, count) {
  return `<a class="cat-card" href="${rel(depth, cat.path)}">
    <svg class="cat-icon" viewBox="0 0 40 40" aria-hidden="true"><use href="#cat-${cat.icon}"></use></svg>
    <h3>${esc(cat.name)}</h3>
    <p class="cat-en">${esc(cat.en)}</p>
    <p class="cat-desc">${esc(cat.tagline)}</p>
    <span class="cat-count">${count} 篇 · 进入栏目${icon('arrow', 'icon-xs')}</span>
  </a>`;
}

export function tagRow(tags) {
  if (!tags || !tags.length) return '';
  return `<div class="tag-row">${tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>`;
}