/* 我的书签：收藏文章、收藏金句、最近阅读（LocalStorage） */

import { KEYS, readStore, writeStore, withBase, toast } from './core.js';

const TYPE_LABEL = { classic: '经典原文', excerpt: '可靠摘录', editorial: '编辑原创' };

function escapeHtml(text) {
  return String(text == null ? '' : text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function articleCard(item) {
  return `<article class="card article-card">
    <div class="card-meta"><span class="card-cat">${escapeHtml(item.category || '文章')}</span><span>收藏于 ${escapeHtml(item.date || '')}</span></div>
    <h3><a href="${withBase(item.url)}">${escapeHtml(item.title)}</a></h3>
    <div class="card-foot">
      <span class="card-read">已存入本地书签</span>
      <button type="button" class="mini-btn" data-remove-article="${escapeHtml(item.slug)}">移除</button>
    </div>
  </article>`;
}

function quoteCard(q) {
  return `<figure class="quote-card">
    <blockquote class="quote-text">${escapeHtml(q.text)}</blockquote>
    <figcaption class="quote-meta">
      <span>${escapeHtml(q.author || '本站编辑原创')}</span>
      <span class="quote-type type-${escapeHtml(q.type)}">${TYPE_LABEL[q.type] || '编辑原创'}</span>
    </figcaption>
    <div class="quote-actions">
      <a class="mini-btn" href="${withBase('/quotes/')}#q-${escapeHtml(q.id)}">查看出处</a>
      <button type="button" class="mini-btn" data-remove-quote="${escapeHtml(q.id)}">移除</button>
    </div>
  </figure>`;
}

export function initLibrary() {
  const root = document.querySelector('[data-library-root]');
  if (!root) return;

  const quotesEl = document.getElementById('quotes-data');
  let quotes = [];
  try {
    quotes = quotesEl ? JSON.parse(quotesEl.textContent) : [];
  } catch (error) {
    quotes = [];
  }
  const quoteMap = new Map(quotes.map((q) => [q.id, q]));

  const status = document.querySelector('[data-library-status]');
  const setCount = (selector, n) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = String(n);
  };

  const render = () => {
    const favArticles = readStore(KEYS.favArticles, []);
    const favQuoteIds = readStore(KEYS.favQuotes, []);
    const recent = readStore(KEYS.recent, []);

    const articleBox = root.querySelector('[data-fav-articles]');
    const quoteBox = root.querySelector('[data-fav-quotes]');
    const recentBox = root.querySelector('[data-recent-list]');

    if (articleBox) {
      articleBox.innerHTML = favArticles.map(articleCard).join('');
      articleBox.hidden = favArticles.length === 0;
    }
    root.querySelector('[data-empty-fav-articles]')?.toggleAttribute('hidden', favArticles.length > 0);

    const quoteCards = favQuoteIds.map((id) => quoteMap.get(id)).filter(Boolean);
    if (quoteBox) {
      quoteBox.innerHTML = quoteCards.map(quoteCard).join('');
      quoteBox.hidden = quoteCards.length === 0;
    }
    root.querySelector('[data-empty-fav-quotes]')?.toggleAttribute('hidden', quoteCards.length > 0);

    if (recentBox) {
      recentBox.innerHTML = recent
        .map(
          (item) => `<li><a href="${withBase(item.url)}">${escapeHtml(item.title)}</a><span>${escapeHtml(item.at)}</span></li>`,
        )
        .join('');
      recentBox.hidden = recent.length === 0;
    }
    root.querySelector('[data-empty-recent]')?.toggleAttribute('hidden', recent.length > 0);

    setCount('[data-count-fav-articles]', favArticles.length);
    setCount('[data-count-fav-quotes]', quoteCards.length);
    setCount('[data-count-recent]', recent.length);

    if (status) {
      const total = favArticles.length + quoteCards.length + recent.length;
      status.textContent = total ? `本地共 ${total} 条记录，仅保存在这台设备` : '暂无本地记录';
    }
  };

  root.addEventListener('click', (event) => {
    const removeArticle = event.target.closest('[data-remove-article]');
    if (removeArticle) {
      const id = removeArticle.getAttribute('data-remove-article');
      writeStore(KEYS.favArticles, readStore(KEYS.favArticles, []).filter((i) => i.slug !== id));
      toast('已移除收藏');
      render();
      return;
    }
    const removeQuote = event.target.closest('[data-remove-quote]');
    if (removeQuote) {
      const id = removeQuote.getAttribute('data-remove-quote');
      writeStore(KEYS.favQuotes, readStore(KEYS.favQuotes, []).filter((i) => i !== id));
      toast('已移除金句');
      render();
    }
  });

  document.querySelector('[data-library-clear]')?.addEventListener('click', () => {
    if (!window.confirm('确定清空本机保存的收藏与阅读记录吗？此操作不可恢复。')) return;
    writeStore(KEYS.favArticles, []);
    writeStore(KEYS.favQuotes, []);
    writeStore(KEYS.recent, []);
    toast('本地记录已清空');
    render();
  });

  render();
}