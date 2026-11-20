import { formatDate } from './content.js';
import {
  esc,
  rel,
  icon,
  layout,
  breadcrumbs,
  sectionHead,
  tagRow,
} from './ui.js';
import { quoteCard, bookCover, localizeHtml } from './views.js';

/* ---------------------------------------------------------------- 金句库 */

export function renderQuotes({ site, nav, quotes }) {
  const depth = 1;
  const categories = [...new Set(quotes.map((q) => q.category))];
  const classic = quotes.filter((q) => q.type === 'classic').length;
  const editorial = quotes.filter((q) => q.type === 'editorial').length;

  const body = `<section class="page-hero">
  <div class="shell">
    ${breadcrumbs([{ label: '首页', path: '/' }, { label: '人生金句' }], depth)}
    <div class="page-hero-grid">
      <div>
        <p class="eyebrow">Quotes · 可核验的短句</p>
        <h1>人生金句</h1>
        <p class="page-hero-desc">共 ${quotes.length} 条。每条都标注类型：${classic} 条经典原文、${quotes.length - classic - editorial} 条可靠摘录、${editorial} 条编辑原创。出处无法确认的句子，我们不会署上名人的名字。</p>
        <div class="page-hero-meta">
          <span>${categories.length} 个分类</span>
          <span>支持复制 · 收藏 · 生成图片</span>
        </div>
      </div>
      <figure class="page-hero-art">
        <img src="/assets/illustrations/quote-scroll.svg" alt="卷轴与印章的原创插画" width="420" height="300" loading="lazy" decoding="async" />
      </figure>
    </div>
  </div>
</section>

<section class="section section-tight">
  <div class="shell">
    <div class="type-legend">
      <div><span class="quote-type type-classic">经典原文</span><p>直接引自可查证的典籍或著作，标注书名与篇章。</p></div>
      <div><span class="quote-type type-excerpt">可靠摘录</span><p>来自公开演讲、访谈或书信，出处可追溯；不排除译本差异。</p></div>
      <div><span class="quote-type type-editorial">编辑原创</span><p>本站编辑撰写，不冒充古人或名人；可自由引用并注明来源。</p></div>
    </div>

    <div class="list-toolbar">
      <h2>全部金句<span class="count">${quotes.length}</span></h2>
      <div class="filter-row" data-quote-filter-group>
        <button type="button" class="chip is-active" data-quote-filter="all">全部</button>
        ${categories.map((c) => `<button type="button" class="chip" data-quote-filter="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>
    </div>

    <div class="quote-grid" data-quote-grid>
      ${quotes.map((q) => `<div data-quote-cat="${esc(q.category)}">${quoteCard(q, { withActions: true, depth })}</div>`).join('')}
    </div>
    <p class="empty-hint" data-quote-empty hidden>该分类下暂无金句。</p>

    <div class="cite-note">
      <h2>引用与版权说明</h2>
      <p>本站金句用于学习与研究，单条引用控制在必要范围内，并尽量标注作者、书名与篇章。古典文献（如《论语》《道德经》）已进入公有领域；近现代作品仅作短句摘录与评论，不提供全文。若你是权利人并认为某条摘录超出合理使用范围，请通过 GitHub Issues 联系删除。</p>
      <p>「编辑原创」条目由本站撰写，采用 CC BY-NC 4.0 协议授权，转载请注明「做人和为人处世」及原文链接。</p>
    </div>
  </div>
</section>
<script type="application/json" id="quotes-data">${JSON.stringify(quotes)}</script>`;

  return layout({
    site,
    nav,
    depth,
    active: '/quotes/',
    page: {
      title: `人生金句｜可核验的名言与编辑原创｜${site.name}`,
      description: `收录 ${quotes.length} 条人生金句，按做人修养、为人处世、沟通表达、情绪管理等分类，标注经典原文、可靠摘录与编辑原创，支持复制、收藏与生成金句卡片。`,
      canonical: `${site.url}/quotes/`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: '人生金句',
          url: `${site.url}/quotes/`,
          description: '可核验的中文人生金句库，区分经典原文、可靠摘录与编辑原创。',
          isPartOf: { '@type': 'WebSite', name: site.name, url: `${site.url}/` },
        },
      ],
    },
    content: body,
  });
}

/* ---------------------------------------------------------------- 书籍库 */

export function renderBooks({ site, nav, books }) {
  const depth = 1;
  const categories = [...new Set(books.map((b) => b.category))];

  const body = `<section class="page-hero">
  <div class="shell">
    ${breadcrumbs([{ label: '首页', path: '/' }, { label: '经典书籍' }], depth)}
    <div class="page-hero-grid">
      <div>
        <p class="eyebrow">Books · 十五本基础读物</p>
        <h1>经典书籍</h1>
        <p class="page-hero-desc">从《论语》到《非暴力沟通》，每本书都说明作者、成书背景、核心观点、适读人群与可能的局限。我们区分作者原意与编辑解读，不替代你亲自阅读。</p>
        <div class="page-hero-meta">
          <span>${books.length} 本书</span>
          <span>${categories.length} 个类别</span>
          <span>含阅读顺序建议</span>
        </div>
      </div>
      <figure class="page-hero-art">
        <img src="/assets/illustrations/books.svg" alt="书架与书卷的原创插画" width="420" height="300" loading="lazy" decoding="async" />
      </figure>
    </div>
  </div>
</section>

<section class="section section-tight">
  <div class="shell">
    <div class="list-toolbar">
      <h2>书目<span class="count">${books.length}</span></h2>
      <div class="filter-row" data-book-filter-group>
        <button type="button" class="chip is-active" data-book-filter="all">全部</button>
        ${categories.map((c) => `<button type="button" class="chip" data-book-filter="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>
    </div>

    <div class="book-grid" data-book-grid>
      ${books
        .map(
          (b) => `<article class="book-card" id="book-${esc(b.id)}" data-book-cat="${esc(b.category)}">
        <div class="book-card-head">
          <div class="book-cover-wrap">${bookCover(b)}</div>
          <div class="book-info">
            <p class="eyebrow">${esc(b.category)} · ${esc(b.era)}</p>
            <h3>《${esc(b.title)}》</h3>
            <p class="book-author">${esc(b.author)}</p>
            <p class="book-summary">${esc(b.summary)}</p>
            <div class="tag-row">${(b.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
          </div>
        </div>
        <details class="book-details">
          <summary>展开：核心观点 · 适读人群 · 实践建议</summary>
          <div class="book-details-body">
            <h4>核心观点</h4>
            <ul>${(b.ideas || []).map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
            <h4>适合谁读</h4>
            <p>${esc(b.readers)}</p>
            <h4>值得带着读的三个问题</h4>
            <ul>${(b.questions || []).map((q) => `<li>${esc(q)}</li>`).join('')}</ul>
            <h4>对现实生活的启发</h4>
            <p>${esc(b.insight)}</p>
            <h4>实践建议</h4>
            <ul>${(b.practice || []).map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
            ${b.caution ? `<h4>阅读提醒</h4><p>${esc(b.caution)}</p>` : ''}
            ${b.related?.length
              ? `<p class="book-related">相关文章：${b.related
                  .map((r) => `<a href="${rel(depth, r)}">${esc(r.split('/').filter(Boolean).pop())}</a>`)
                  .join(' · ')}</p>`
              : ''}
          </div>
        </details>
      </article>`,
        )
        .join('')}
    </div>

    <div class="reading-path">
      <h2>如果不知道从哪本开始</h2>
      <div class="path-grid">
        <div><span>入门</span><p>《非暴力沟通》《被讨厌的勇气》——先学会表达与分离课题。</p></div>
        <div><span>进阶</span><p>《关键对话》《思考，快与慢》——理解冲突中的判断偏差。</p></div>
        <div><span>古典</span><p>《论语》《道德经》《菜根谭》——建立自己的价值坐标。</p></div>
        <div><span>长期</span><p>《曾国藩家书》《原则》——把修养变成可持续的系统。</p></div>
      </div>
      <p class="path-note">书目信息以公开出版信息为准。不同版本、译本的章节与表述可能存在差异，引用时请以你手中的版本核对。</p>
    </div>
  </div>
</section>`;

  return layout({
    site,
    nav,
    depth,
    active: '/books/',
    page: {
      title: `经典书籍｜${books.length} 本处世与修养读物｜${site.name}`,
      description: `精选 ${books.length} 本关于做人、沟通、心理学与传统文化的中文读物，含作者、核心观点、适读人群、实践建议与阅读顺序。`,
      canonical: `${site.url}/books/`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: '经典书籍',
          numberOfItems: books.length,
          itemListElement: books.map((b, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: { '@type': 'Book', name: b.title, author: { '@type': 'Person', name: b.author } },
          })),
        },
      ],
    },
    content: body,
  });
}

/* ---------------------------------------------------------------- 关于 */

export function renderAbout({ site, nav, page }) {
  const depth = 1;
  const body = `<section class="page-hero page-hero-compact">
  <div class="shell">
    ${breadcrumbs([{ label: '首页', path: '/' }, { label: '关于本站' }], depth)}
    <p class="eyebrow">About · 立场与方法</p>
    <h1>关于「${esc(site.name)}」</h1>
    <p class="page-hero-desc">${esc(site.description)}</p>
  </div>
</section>
<section class="section section-tight">
  <div class="shell about-layout">
    <div class="prose about-prose">${localizeHtml(page.html, depth)}</div>
    <aside class="category-aside">
      <div class="aside-card">
        <h3>快速导航</h3>
        <ul class="aside-links">
          ${page.toc.map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}
        </ul>
      </div>
      <div class="aside-card">
        <h3>参与共建</h3>
        <ul class="aside-links">
          <li><a href="${esc(site.github)}" target="_blank" rel="noopener noreferrer">GitHub 仓库<span>提交 Issue / PR</span></a></li>
          <li><a href="${esc(site.github)}/issues" target="_blank" rel="noopener noreferrer">内容纠错<span>发现事实错误请告知</span></a></li>
        </ul>
      </div>
      <div class="aside-note"><p>${esc(site.motto)}</p></div>
    </aside>
  </div>
</section>`;

  return layout({
    site,
    nav,
    depth,
    active: '/about/',
    page: {
      title: `关于本站｜${site.name}`,
      description: '了解「做人和为人处世」的定位、核心理念、内容标准、编辑流程、引用规范与参与方式。',
      canonical: `${site.url}/about/`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: `关于本站｜${site.name}`,
          url: `${site.url}/about/`,
          isPartOf: { '@type': 'WebSite', name: site.name, url: `${site.url}/` },
        },
      ],
    },
    content: body,
  });
}

/* ---------------------------------------------------------------- 我的书签 */

export function renderLibrary({ site, nav, quotes }) {
  const depth = 1;
  const body = `<section class="page-hero page-hero-compact">
  <div class="shell">
    ${breadcrumbs([{ label: '首页', path: '/' }, { label: '我的书签' }], depth)}
    <p class="eyebrow">My Library · 本地存储</p>
    <h1>我的书签</h1>
    <p class="page-hero-desc">收藏的文章、保存的金句与最近阅读记录都存储在你的浏览器本地（LocalStorage），不会上传到任何服务器。清除浏览器数据后会丢失。</p>
    <div class="library-actions">
      <button type="button" class="btn btn-ghost btn-sm" data-library-clear>清空本地记录</button>
      <span class="library-status" data-library-status>读取中…</span>
    </div>
  </div>
</section>

<section class="section section-tight">
  <div class="shell library-layout" data-library-root>
    <section class="library-block">
      <div class="list-toolbar"><h2>收藏的文章<span class="count" data-count-fav-articles>0</span></h2></div>
      <div class="card-grid card-grid-2" data-fav-articles></div>
      <div class="empty-state" data-empty-fav-articles hidden>
        <img src="/assets/illustrations/empty-state.svg" alt="" width="180" height="120" loading="lazy" />
        <p>还没有收藏文章。阅读时点击「收藏」，方便以后回来。</p>
      </div>
    </section>

    <section class="library-block">
      <div class="list-toolbar"><h2>保存的金句<span class="count" data-count-fav-quotes>0</span></h2></div>
      <div class="quote-grid quote-grid-2" data-fav-quotes></div>
      <div class="empty-state" data-empty-fav-quotes hidden>
        <img src="/assets/illustrations/empty-state.svg" alt="" width="180" height="120" loading="lazy" />
        <p>还没有收藏金句。去金句库挑一句喜欢的。</p>
      </div>
    </section>

    <section class="library-block">
      <div class="list-toolbar"><h2>最近阅读<span class="count" data-count-recent>0</span></h2></div>
      <ul class="recent-list" data-recent-list></ul>
      <div class="empty-state" data-empty-recent hidden>
        <img src="/assets/illustrations/empty-state.svg" alt="" width="180" height="120" loading="lazy" />
        <p>暂无阅读记录。打开任意一篇文章后会自动记录。</p>
      </div>
    </section>
  </div>
</section>
<script type="application/json" id="quotes-data">${JSON.stringify(quotes)}</script>`;

  return layout({
    site,
    nav,
    depth,
    active: '/library/',
    page: {
      title: `我的书签｜收藏与最近阅读｜${site.name}`,
      description: '查看你在本站收藏的文章、保存的金句与最近阅读记录。数据保存在浏览器本地。',
      canonical: `${site.url}/library/`,
      extraHead: '<meta name="robots" content="noindex, follow" />',
    },
    content: body,
  });
}

/* ---------------------------------------------------------------- 404 */

export function renderNotFound({ site, nav, categories }) {
  const depth = 0;
  const body = `<section class="section notfound">
  <div class="shell notfound-inner">
    <img src="/assets/illustrations/empty-state.svg" alt="空山与孤舟的插画" width="320" height="220" />
    <p class="eyebrow">404 · 此路不通</p>
    <h1>这一页不在山中</h1>
    <p>链接可能已经移动，或者从未存在。你可以回到首页，或从一个具体栏目重新出发。</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="${rel(depth, '/')}">回到首页${icon('arrow', 'icon-xs')}</a>
      <a class="btn btn-ghost" href="${rel(depth, '/scenarios/')}">看现实场景库</a>
    </div>
    <ul class="notfound-links">
      ${categories.slice(0, 6).map((c) => `<li><a href="${rel(depth, c.path)}">${esc(c.name)}</a></li>`).join('')}
    </ul>
  </div>
</section>`;

  return layout({
    site,
    nav,
    depth,
    page: {
      title: `页面未找到｜${site.name}`,
      description: '你访问的页面不存在。回到首页继续浏览做人修养、为人处世与沟通表达的深度内容。',
      canonical: `${site.url}/404.html`,
      extraHead: '<meta name="robots" content="noindex, follow" />',
    },
    content: body,
  });
}