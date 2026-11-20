import { formatDate } from './content.js';
import {
  getData,
  esc,
  rel,
  catOf,
  icon,
  layout,
  breadcrumbs,
  sectionHead,
  articleCard,
  scenarioCard,
  categoryCard,
  tagRow,
} from './ui.js';

const TYPE_LABEL = { classic: '经典原文', excerpt: '可靠摘录', editorial: '编辑原创' };

/** 把正文里以 / 开头的站内链接改写为相对路径，兼容 GitHub Pages 子路径 */
export function localizeHtml(html, depth) {
  const prefix = '../'.repeat(depth);
  return String(html).replace(/(href|src)="\/(?!\/)/g, `$1="${prefix}`);
}

export function quoteCard(q, { withActions = false, depth = 0 } = {}) {
  const meta = q.author
    ? `${esc(q.author)}${q.source ? ` · ${esc(q.source)}` : ''}`
    : '本站编辑原创';
  return `<figure class="quote-card" id="q-${esc(q.id)}" data-quote-id="${esc(q.id)}">
  <span class="quote-mark" aria-hidden="true">${icon('quote')}</span>
  <blockquote class="quote-text">${esc(q.text)}</blockquote>
  <figcaption class="quote-meta">
    <span class="quote-author">${meta}</span>
    <span class="quote-type type-${esc(q.type)}">${TYPE_LABEL[q.type] || '编辑原创'}</span>
  </figcaption>
  ${withActions
      ? `<div class="quote-actions">
    <button type="button" class="mini-btn" data-quote-copy="${esc(q.id)}">${icon('copy', 'icon-xs')}复制</button>
    <button type="button" class="mini-btn" data-quote-fav="${esc(q.id)}" aria-pressed="false">${icon('bookmark', 'icon-xs')}收藏</button>
    <button type="button" class="mini-btn" data-quote-card="${esc(q.id)}">${icon('download', 'icon-xs')}存为图片</button>
    <button type="button" class="mini-btn" data-quote-share="${esc(q.id)}">${icon('share', 'icon-xs')}分享</button>
  </div>`
      : ''}
</figure>`;
}

export function bookCover(book, extraClass = '') {
  const chars = String(book.title).slice(0, 6).split('');
  const lines = [];
  const max = 4;
  for (let i = 0; i < chars.length; i += max) lines.push(chars.slice(i, i + max).join(''));
  const startY = 96 - (lines.length - 1) * 16;
  return `<svg class="book-cover ${extraClass}" viewBox="0 0 160 220" role="img" aria-label="《${esc(book.title)}》书封插画">
  <rect x="0.5" y="0.5" width="159" height="219" fill="#EFE9DC" stroke="#D9D0BC"/>
  <rect x="9" y="9" width="142" height="202" fill="none" stroke="#C9B893" stroke-width="0.8"/>
  <line x1="20" y1="26" x2="44" y2="26" stroke="#A64B3C" stroke-width="2"/>
  ${lines.map((line, i) => `<text x="128" y="${startY + i * 34}" text-anchor="middle" class="book-cover-title" font-size="27" fill="#2C2A24" font-family="Songti SC, STSong, SimSun, serif">${esc(line)}</text>`).join('')}
  <rect x="112" y="176" width="18" height="18" fill="#A64B3C" opacity="0.9"/>
  <text x="121" y="189.5" text-anchor="middle" font-size="10" fill="#F7F5EF" font-family="Songti SC, serif">和</text>
</svg>`;
}

function hero(site, articles, quotes, books) {
  return `<section class="hero">
  <div class="shell hero-inner">
    <div class="hero-copy">
      <p class="hero-eyebrow"><span class="seal-dot" aria-hidden="true"></span>人生智慧研究 · 中文知识库</p>
      <h1>做人有温度，<br />处世有分寸。</h1>
      <p class="hero-sub">读懂人性，修炼自己，善待他人，在复杂的世界里清醒、真诚而有力量。</p>
      <p class="hero-manifesto">这里不教你圆滑世故，也不教你讨好所有人。我们研究做人修养、人际关系和处世智慧，帮助你建立原则、理解他人、改善关系、做好自己。</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="scenarios/">探索为人处世之道${icon('arrow', 'icon-xs')}</a>
        <a class="btn btn-ghost" href="chinese-wisdom/">阅读人生智慧</a>
      </div>
      <dl class="hero-stats">
        <div><dt>研究栏目</dt><dd>12</dd></div>
        <div><dt>深度文章</dt><dd>${articles.filter((a) => a.type === 'article').length}</dd></div>
        <div><dt>场景指南</dt><dd>${articles.filter((a) => a.type === 'scenario').length}</dd></div>
        <div><dt>金句 · 书籍</dt><dd>${quotes.length} · ${books.length}</dd></div>
      </dl>
    </div>
    <div class="hero-art">
      <img src="/assets/illustrations/hero-mountains.svg" alt="原创水墨插画：远山层叠、松树立于坡上，一人携书卷行于山道，题「行远」" width="760" height="680" fetchpriority="high" decoding="async" />
      <p class="hero-art-note">《行远》 · 本站原创水墨 SVG</p>
    </div>
  </div>
  <div class="hero-rule shell" aria-hidden="true"><span></span></div>
</section>`;
}

function dailyQuote(quotes) {
  const q = quotes[0];
  if (!q) return '';
  return `<section class="section daily-section">
  <div class="shell">
    <div class="daily-quote" data-daily-quote>
      <div class="daily-head">
        <p class="eyebrow">每日一句 · 人生智慧</p>
        <button type="button" class="mini-btn" data-quote-random>${icon('shuffle', 'icon-xs')}换一句</button>
      </div>
      <blockquote data-daily-text>${esc(q.text)}</blockquote>
      <div class="daily-meta">
        <span data-daily-author>${q.author ? `${esc(q.author)}${q.source ? ` · ${esc(q.source)}` : ''}` : '本站编辑原创'}</span>
        <span class="quote-type type-${esc(q.type)}" data-daily-type>${TYPE_LABEL[q.type] || '编辑原创'}</span>
      </div>
      <div class="daily-actions">
        <button type="button" class="mini-btn" data-daily-copy>${icon('copy', 'icon-xs')}复制金句</button>
        <button type="button" class="mini-btn" data-daily-fav aria-pressed="false">${icon('bookmark', 'icon-xs')}收藏</button>
        <button type="button" class="mini-btn" data-daily-share>${icon('share', 'icon-xs')}分享</button>
        <a class="mini-btn" href="quotes/">${icon('quote', 'icon-xs')}查看全部金句</a>
      </div>
    </div>
  </div>
</section>`;
}

function categoryGrid(categories, articles, depth = 0) {
  return `<section class="section" id="sections">
  <div class="shell">
    ${sectionHead({
      eyebrow: '十二个研究方向',
      title: '从一个具体的问题开始',
      desc: '修养、处世、沟通、关系、职场、情绪、识人、家庭、礼仪、冲突、传统智慧与现实场景——每个栏目都有独立的方法与边界。',
      href: '/about/',
      label: '了解本站方法',
      depth,
    })}
    <div class="cat-grid">
      ${categories.map((cat) => categoryCard(cat, depth, articles.filter((a) => a.category === cat.id).length)).join('')}
    </div>
  </div>
</section>`;
}

function featuredBlock(articles, depth = 0) {
  const featured = articles.filter((a) => a.featured && a.type === 'article').slice(0, 4);
  if (!featured.length) return '';
  const [lead, ...rest] = featured;
  return `<section class="section">
  <div class="shell">
    ${sectionHead({
      eyebrow: '编辑精选',
      title: '值得慢读的深度文章',
      desc: '不是结论的堆砌，而是把一个问题拆到底：先看清结构，再决定怎么做。',
      href: '/character/',
      label: '进入文章库',
      depth,
    })}
    <div class="feature-split">
      <a class="feature-main" href="${rel(depth, lead.url)}">
        <div class="feature-art"><img src="/assets/illustrations/${esc(lead.cover || 'reading-cultivation.svg')}" alt="" loading="lazy" decoding="async" /></div>
        <div class="feature-body">
          <p class="eyebrow">${esc(catOf(getData().categories, lead.category).name)} · 深度</p>
          <h3>${esc(lead.title)}</h3>
          <p>${esc(lead.summary || '')}</p>
          <span class="text-link">阅读全文${icon('arrow', 'icon-xs')}</span>
        </div>
      </a>
      <ul class="feature-list">
        ${rest
          .map(
            (a, i) => `<li>
          <a href="${rel(depth, a.url)}">
            <span class="feature-index">0${i + 1}</span>
            <span class="feature-item-body">
              <strong>${esc(a.title)}</strong>
              <em>${esc(a.summary || '')}</em>
            </span>
            <span class="feature-time">${a.readingTime} 分钟</span>
          </a>
        </li>`,
          )
          .join('')}
      </ul>
    </div>
  </div>
</section>`;
}

function topicPanel({ cat, items, desc, depth = 0, span = '' }) {
  return `<article class="topic-panel ${span}">
  <header class="topic-head">
    <div>
      <p class="eyebrow">${esc(cat.en)}</p>
      <h3>${esc(cat.name)}专题</h3>
    </div>
    <a class="circle-link" href="${rel(depth, cat.path)}" aria-label="进入${esc(cat.name)}栏目">${icon('arrow', 'icon-xs')}</a>
  </header>
  <p class="topic-desc">${esc(desc)}</p>
  <ul class="topic-list">
    ${items
      .map(
        (a) => `<li><a href="${rel(depth, a.url)}"><span>${esc(a.title)}</span><em>${a.readingTime} 分钟</em></a></li>`,
      )
      .join('')}
  </ul>
</article>`;
}

function topicSections(articles, categories, depth = 0) {
  const pick = (catId, n = 3) => articles.filter((a) => a.category === catId && a.type === 'article').slice(0, n);
  const panels = [
    { cat: catOf(categories, 'social-wisdom'), items: pick('social-wisdom'), desc: '把「会来事」拆成可验证的判断：什么时候该近、什么时候该退、哪些忙不能帮。' },
    { cat: catOf(categories, 'character'), items: pick('character'), desc: '修养不是道德表演，而是你在没有人监督时的默认选择。' },
    { cat: catOf(categories, 'communication'), items: pick('communication'), desc: '给出可直接使用的表达结构，同时说明它的适用条件与失效场景。' },
    { cat: catOf(categories, 'workplace'), items: pick('workplace'), desc: '职场里的委屈，多半来自角色不清、责任不明，而不是「情商不够」。' },
  ].filter((p) => p.items.length);
  if (!panels.length) return '';

  const wisdom = articles.filter((a) => a.category === 'chinese-wisdom' && a.classicLine).slice(0, 3);
  return `<section class="section section-warm">
  <div class="shell">
    ${sectionHead({
      eyebrow: '专题研读',
      title: '四个绕不开的处世课题',
      desc: '每个专题都由一组文章构成：先讲清底层逻辑，再给出可执行的做法。',
      href: '/character/',
      label: '按栏目浏览',
      depth,
    })}
    <div class="topic-grid">
      ${panels.map((p) => topicPanel({ ...p, depth })).join('')}
    </div>
    ${wisdom.length
      ? `<div class="classic-strip">
      <div class="classic-strip-head">
        <p class="eyebrow">传统处世智慧</p>
        <h3>古人没有给我们答案，但给了坐标</h3>
        <p>逐篇标注原文、出处、白话解释、现实用法与可能的误读。不把编辑观点冒充古人原话。</p>
        <a class="btn btn-ghost btn-sm" href="${rel(depth, '/chinese-wisdom/')}">进入传统智慧专栏${icon('arrow', 'icon-xs')}</a>
      </div>
      <ul class="classic-lines">
        ${wisdom
          .map(
            (a) => `<li>
          <p class="classic-line">${esc(a.classicLine)}</p>
          <p class="classic-source">${esc(a.classicSource || '')}</p>
          <a class="classic-link" href="${rel(depth, a.url)}">${esc(a.title)}${icon('arrow', 'icon-xs')}</a>
        </li>`,
          )
          .join('')}
      </ul>
    </div>`
      : ''}
  </div>
</section>`;
}

function quoteWall(quotes, depth = 0) {
  const list = quotes.slice(0, 9);
  return `<section class="section">
  <div class="shell">
    ${sectionHead({
      eyebrow: '人生金句墙',
      title: '可以抄下来的一句话',
      desc: '每条金句都标注类型：经典原文、可靠摘录或编辑原创。出处无法确认的，不署名人。',
      href: '/quotes/',
      label: '进入金句库',
      depth,
    })}
    <div class="quote-wall">
      ${list.map((q) => quoteCard(q, { depth })).join('')}
    </div>
  </div>
</section>`;
}

function countToCn(n) {
  if (n >= 10 && n < 20) return `十${'一二三四五六七八九'[n - 11] || ''}`;
  return String(n);
}

function booksBlock(books, depth = 0) {
  const list = books.slice(0, 6);
  return `<section class="section section-warm">
  <div class="shell">
    ${sectionHead({
      eyebrow: '经典书籍',
      title: `${countToCn(books.length)} 本值得反复读的书`,
      desc: '区分作者原意与编辑解读，说明适合谁读、哪里可能有局限。',
      href: '/books/',
      label: '查看书籍库',
      depth,
    })}
    <div class="book-strip">
      ${list
        .map(
          (b) => `<a class="book-mini" href="${rel(depth, '/books/')}#book-${esc(b.id)}">
        ${bookCover(b)}
        <span class="book-mini-body"><strong>${esc(b.title)}</strong><em>${esc(b.author)}</em></span>
      </a>`,
        )
        .join('')}
    </div>
  </div>
</section>`;
}

function collectionsBlock(collections, depth = 0) {
  if (!collections.length) return '';
  return `<section class="section">
  <div class="shell">
    ${sectionHead({
      eyebrow: '阅读专题与知识合集',
      title: '按路径读，而不是按时间读',
      desc: '把散落的文章编成一条线：先读哪篇、再读哪篇、最后怎么用。',
      href: '/about/',
      label: '阅读方法',
      depth,
    })}
    <div class="collection-grid">
      ${collections
        .map(
          (c, i) => `<a class="collection-card" href="${rel(depth, c.href)}">
        <span class="collection-no">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.desc)}</p>
        <span class="collection-meta">${c.count} 篇 · ${esc(c.stage)}</span>
      </a>`,
        )
        .join('')}
    </div>
  </div>
</section>`;
}

function latestBlock(articles, categories, depth = 0) {
  const latest = articles.filter((a) => a.type === 'article').slice(0, 6);
  return `<section class="section">
  <div class="shell">
    ${sectionHead({
      eyebrow: '最新文章',
      title: '最近写下的思考',
      desc: '按发布时间排列，包含修养、关系、沟通与传统智慧的交叉议题。',
      href: '/library/',
      label: '我的书签',
      depth,
    })}
    <div class="card-grid">${latest.map((a) => articleCard(a, depth, categories)).join('')}</div>
  </div>
</section>`;
}

function aboutBlock(site, depth = 0) {
  return `<section class="section about-home">
  <div class="shell about-home-inner">
    <div>
      <p class="eyebrow">关于本站</p>
      <h2>不提供标准答案，只提供更清楚的判断</h2>
      <p>「${esc(site.name)}」是一个长期更新的中文知识库。我们把做人做事拆成可以讨论的问题：什么是好人品、如何拒绝、怎样面对不尊重、如何在利益面前守住原则。</p>
      <p>所有文章遵循同一套标准：观点要有逻辑，方法要能执行，案例要标明来源，引用要可核验。我们不制造焦虑，也不承诺「三招搞定所有人」。</p>
      <a class="btn btn-primary btn-sm" href="${rel(depth, '/about/')}">阅读本站立场与方法${icon('arrow', 'icon-xs')}</a>
    </div>
    <ul class="principle-list">
      <li><span>一</span><div><strong>有温度</strong><p>承认人的软弱与处境，不用道德大棒打人。</p></div></li>
      <li><span>二</span><div><strong>有分寸</strong><p>不越界、不操控、不把世故包装成智慧。</p></div></li>
      <li><span>三</span><div><strong>有原则</strong><p>该拒绝时拒绝，该承担时承担，不拿原则换人情。</p></div></li>
      <li><span>四</span><div><strong>有要求</strong><p>对自己有标准，也对读者诚实交代内容的局限。</p></div></li>
    </ul>
  </div>
</section>`;
}

export function renderHome({ site, nav, categories, articles, quotes, books, collections }) {
  const depth = 0;
  const body = `${hero(site, articles, quotes, books)}
${dailyQuote(quotes)}
${categoryGrid(categories, articles, depth)}
${featuredBlock(articles, depth)}
${topicSections(articles, categories, depth)}
${quoteWall(quotes, depth)}
${booksBlock(books, depth)}
${collectionsBlock(collections, depth)}
${latestBlock(articles, categories, depth)}
${aboutBlock(site, depth)}
${quotes.length ? `<script type="application/json" id="quotes-data">${JSON.stringify(quotes)}</script>` : ''}`;

  return layout({
    site,
    nav,
    depth,
    active: '/',
    bodyClass: 'page page-home',
    page: {
      title: `${site.name}｜${site.tagline}`,
      description: site.description,
      canonical: `${site.url}/`,
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: site.name,
          alternateName: site.nameEn,
          url: `${site.url}/`,
          description: site.description,
          inLanguage: 'zh-CN',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${site.url}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: site.name,
          url: `${site.url}/`,
          logo: `${site.url}/assets/icons/favicon.svg`,
          sameAs: [site.github],
        },
      ],
    },
    content: body,
  });
}

/* ---------------------------------------------------------------- 栏目页 */

export function renderCategory({ site, nav, categories, cat, articles, allArticles }) {
  const depth = 1;
  const list = articles.filter((a) => a.category === cat.id);
  const isScenario = cat.id === 'scenarios';
  const tags = [...new Set(list.flatMap((a) => a.tags || []))].slice(0, 12);
  const featured = list.find((a) => a.featured) || list[0];
  const rest = list.filter((a) => a !== featured);
  const related = categories
    .filter((c) => c.id !== cat.id)
    .slice(0, 3);

  const listHtml = isScenario
    ? `<div class="card-grid card-grid-2">${rest.map((a) => scenarioCard(a, depth, categories)).join('')}</div>`
    : `<div class="card-grid">${rest.map((a) => articleCard(a, depth, categories)).join('')}</div>`;

  const body = `<section class="page-hero">
  <div class="shell">
    ${breadcrumbs([{ label: '首页', path: '/' }, { label: cat.name }], depth)}
    <div class="page-hero-grid">
      <div>
        <p class="eyebrow">${esc(cat.en)}</p>
        <h1>${esc(cat.name)}</h1>
        <p class="page-hero-desc">${esc(cat.description)}</p>
        <div class="page-hero-meta">
          <span>${list.length} 篇内容</span>
          <span>更新至 ${formatDate(list[0]?.date)}</span>
          <span>${esc(cat.en)}</span>
        </div>
      </div>
      <figure class="page-hero-art">
        <img src="/${esc(cat.cover)}" alt="${esc(cat.name)}栏目插画" width="420" height="300" loading="lazy" decoding="async" />
      </figure>
    </div>
  </div>
</section>

<section class="section section-tight">
  <div class="shell category-layout">
    <div class="category-main">
      <div class="intro-panel">
        <h2>这一栏目在研究什么</h2>
        <p>${esc(cat.intro)}</p>
        <ul class="topic-tags">${cat.topics.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>

      ${featured
        ? `<a class="lead-article" href="${rel(depth, featured.url)}">
        <div class="lead-body">
          <p class="eyebrow">栏目精选</p>
          <h2>${esc(featured.title)}</h2>
          <p>${esc(featured.summary || featured.subtitle || '')}</p>
          <div class="lead-meta"><span>${formatDate(featured.date)}</span><span>${featured.readingTime} 分钟</span>${tagRow(featured.tags)}</div>
          <span class="text-link">开始阅读${icon('arrow', 'icon-xs')}</span>
        </div>
      </a>`
        : ''}

      <div class="list-toolbar">
        <h2>全部内容<span class="count">${rest.length}</span></h2>
        ${tags.length
          ? `<div class="filter-row" data-filter-group>
          <button type="button" class="chip is-active" data-filter-tag="all">全部</button>
          ${tags.map((t) => `<button type="button" class="chip" data-filter-tag="${esc(t)}">${esc(t)}</button>`).join('')}
        </div>`
          : ''}
      </div>
      ${listHtml}
      <p class="empty-hint" data-filter-empty hidden>当前标签下暂无内容，试试其他标签。</p>
    </div>

    <aside class="category-aside">
      <div class="aside-card">
        <h3>本栏目研究清单</h3>
        <ol class="aside-topics">${cat.topics.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
      </div>
      <div class="aside-card">
        <h3>相关栏目</h3>
        <ul class="aside-links">
          ${related.map((c) => `<li><a href="${rel(depth, c.path)}">${esc(c.name)}<span>${esc(c.en)}</span></a></li>`).join('')}
        </ul>
      </div>
      <div class="aside-note">
        <p>${esc(site.motto)}</p>
      </div>
    </aside>
  </div>
</section>`;

  return layout({
    site,
    nav,
    depth,
    active: cat.path,
    page: {
      title: `${cat.name}｜${site.name}`,
      description: cat.description,
      canonical: `${site.url}${cat.path}`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${cat.name}｜${site.name}`,
          description: cat.description,
          url: `${site.url}${cat.path}`,
          isPartOf: { '@type': 'WebSite', name: site.name, url: `${site.url}/` },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首页', item: `${site.url}/` },
            { '@type': 'ListItem', position: 2, name: cat.name, item: `${site.url}${cat.path}` },
          ],
        },
      ],
    },
    content: body,
  });
}

/* ---------------------------------------------------------------- 文章页 */

function tocHtml(toc) {
  if (!toc.length) return '';
  return `<nav class="toc" aria-label="文章目录">
    <p class="toc-title">本文目录</p>
    <ol>
      ${toc
        .map(
          (item) =>
            `<li class="toc-l${item.level}"><a href="#${item.id}" data-toc-link>${esc(item.text)}</a></li>`,
        )
        .join('')}
    </ol>
  </nav>`;
}

export function renderArticle({ site, nav, categories, article, allArticles }) {
  const depth = 2;
  const cat = catOf(categories, article.category);
  const isScenario = article.type === 'scenario';
  const siblings = allArticles.filter((a) => a.category === article.category);
  const index = siblings.findIndex((a) => a.slug === article.slug);
  const prev = siblings[index + 1];
  const next = siblings[index - 1];
  const related = allArticles
    .filter((a) => a.slug !== article.slug && (a.category === article.category || a.tags?.some((t) => article.tags?.includes(t))))
    .slice(0, 3);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary || article.subtitle || '',
    datePublished: article.date,
    dateModified: article.updated || article.date,
    inLanguage: 'zh-CN',
    author: { '@type': 'Person', name: site.editor },
    publisher: { '@type': 'Organization', name: site.name, url: `${site.url}/` },
    mainEntityOfPage: `${site.url}${article.url}`,
    articleSection: cat.name,
    keywords: (article.tags || []).join(','),
    image: `${site.url}/assets/images/og-cover.png`,
  };

  const body = `<div class="shell article-shell">
  ${breadcrumbs(
    [
      { label: '首页', path: '/' },
      { label: cat.name, path: cat.path },
      { label: article.title },
    ],
    depth,
  )}
  <article class="post" data-article="${esc(article.slug)}" data-article-title="${esc(article.title)}" data-article-url="${esc(article.url)}">
    <header class="post-head">
      <p class="eyebrow">${esc(cat.name)} · ${isScenario ? '现实场景' : '深度文章'}</p>
      <h1>${esc(article.title)}</h1>
      ${article.subtitle ? `<p class="post-sub">${esc(article.subtitle)}</p>` : ''}
      <div class="post-meta">
        <span>${icon('clock', 'icon-xs')}${article.readingTime} 分钟阅读</span>
        <span>编辑：${esc(site.editor)}</span>
        <span>${formatDate(article.date)}</span>
        ${article.updated ? `<span>修订于 ${formatDate(article.updated)}</span>` : ''}
        <div class="post-actions">
          <button type="button" class="mini-btn" data-article-fav aria-pressed="false">${icon('bookmark', 'icon-xs')}收藏</button>
          <button type="button" class="mini-btn" data-article-share>${icon('share', 'icon-xs')}分享</button>
        </div>
      </div>
    </header>

    <figure class="post-cover">
      <img src="/assets/illustrations/${esc(article.cover || cat.cover.split('/').pop())}" alt="${esc(article.title)} 配图：${esc(cat.name)}主题原创插画" width="960" height="320" loading="eager" decoding="async" />
      <figcaption>${esc(cat.name)} · 本站原创插画</figcaption>
    </figure>

    <div class="post-layout">
      <div class="post-body">
        ${article.summary ? `<p class="post-lead">${esc(article.summary)}</p>` : ''}

        ${article.keyPoints?.length
          ? `<aside class="key-points">
          <h2>核心观点</h2>
          <ul>${article.keyPoints.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        </aside>`
          : ''}

        ${article.original
          ? `<figure class="classic-block">
          <figcaption>${esc(article.classic || '经典原文')}${article.classicSource ? ` · ${esc(article.classicSource)}` : ''}</figcaption>
          <blockquote>${esc(article.original)}</blockquote>
        </figure>`
          : ''}

        ${isScenario && article.oneliner
          ? `<aside class="scenario-summary"><p class="eyebrow">一句话总结</p><p>${esc(article.oneliner)}</p></aside>`
          : ''}

        <div class="prose">${localizeHtml(article.html, depth)}</div>

        ${article.quote
          ? `<blockquote class="end-quote">
          <p>${esc(article.quote)}</p>
          <cite>—— 本文结论</cite>
        </blockquote>`
          : ''}

        <div class="editor-note">
          <h2>关于本文的说明</h2>
          <p>本文属于${isScenario ? '现实场景指南' : '深度研究文章'}，观点由本站编辑撰写并经交叉核对。文中涉及的心理学、社会学研究均为已被广泛讨论的经典结论，具体效果受个体与情境影响；涉及古文的部分标注了原文与出处，白话解释与编辑判断已作区分。</p>
          <p>本文不构成心理诊断或法律意见。若你正经历持续的情绪困扰、家庭暴力或经济纠纷，请优先寻求专业心理咨询师、法律援助或相关机构的帮助。</p>
          ${tagRow(article.tags)}
          <p class="note-quiet"><button type="button" class="mini-btn" data-article-fav aria-pressed="false">${icon('bookmark', 'icon-xs')}收藏这篇</button></p>
        </div>

        <nav class="post-nav" aria-label="上一篇与下一篇">
          ${prev ? `<a class="post-nav-item" href="${rel(depth, prev.url)}"><span>上一篇</span><strong>${esc(prev.title)}</strong></a>` : '<span></span>'}
          ${next ? `<a class="post-nav-item is-next" href="${rel(depth, next.url)}"><span>下一篇</span><strong>${esc(next.title)}</strong></a>` : '<span></span>'}
        </nav>
      </div>

      <aside class="post-aside">
        ${tocHtml(article.toc)}
        <div class="aside-card aside-card-sm">
          <h3>相关内容</h3>
          <ul class="aside-links">
            ${related.map((a) => `<li><a href="${rel(depth, a.url)}">${esc(a.title)}<span>${a.readingTime} 分钟</span></a></li>`).join('')}
          </ul>
        </div>
        <div class="aside-card aside-card-sm">
          <h3>回到栏目</h3>
          <ul class="aside-links">
            <li><a href="${rel(depth, cat.path)}">${esc(cat.name)}<span>${siblings.length} 篇</span></a></li>
            <li><a href="${rel(depth, '/scenarios/')}">现实场景库<span>20 个场面</span></a></li>
            <li><a href="${rel(depth, '/quotes/')}">人生金句<span>可复制收藏</span></a></li>
          </ul>
        </div>
      </aside>
    </div>
  </article>
</div>`;

  return layout({
    site,
    nav,
    depth,
    active: cat.path,
    bodyClass: 'page page-article',
    page: {
      title: `${article.title}｜${cat.name}｜${site.name}`,
      description: article.summary || article.subtitle || site.description,
      canonical: `${site.url}${article.url}`,
      ogType: 'article',
      progress: true,
      jsonLd: [
        articleSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首页', item: `${site.url}/` },
            { '@type': 'ListItem', position: 2, name: cat.name, item: `${site.url}${cat.path}` },
            { '@type': 'ListItem', position: 3, name: article.title, item: `${site.url}${article.url}` },
          ],
        },
      ],
    },
    content: body,
  });
}