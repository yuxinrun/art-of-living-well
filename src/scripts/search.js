/* 全站搜索：动态加载索引，按标题、摘要、标签与栏目匹配 */

let indexPromise = null;

function loadIndex() {
  if (!indexPromise) {
    indexPromise = import('../generated/search-index.json')
      .then((mod) => mod.default || mod)
      .catch(() => null);
  }
  return indexPromise;
}

const TYPE_LABEL = { article: '深度文章', scenario: '现实场景', quote: '人生金句', book: '书籍' };

function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function highlight(text, tokens) {
  let html = escapeHtml(text);
  for (const token of tokens) {
    if (!token) continue;
    const safe = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(safe, 'gi'), (m) => `<mark>${m}</mark>`);
  }
  return html;
}

function score(item, tokens, fields) {
  let total = 0;
  for (const token of tokens) {
    const lower = token.toLowerCase();
    fields.forEach(([value, weight]) => {
      if (!value) return;
      const text = String(value).toLowerCase();
      if (text.includes(lower)) total += weight;
      if (text.startsWith(lower)) total += weight;
    });
  }
  return total;
}

function renderResults(container, results, tokens) {
  if (!results.length) {
    container.innerHTML = `<p class="search-empty">没有找到匹配内容。试试更短的关键词，例如「拒绝」「边界」「情绪」。</p>`;
    return;
  }
  const groups = [
    ['article', '深度文章与场景'],
    ['quote', '人生金句'],
    ['book', '书籍'],
  ];
  let html = `<p class="search-count">共 ${results.length} 条结果</p>`;
  for (const [type, label] of groups) {
    const list = results.filter((r) => r.type === type).slice(0, 8);
    if (!list.length) continue;
    html += `<p class="search-group-title">${label}</p>`;
    html += list
      .map(
        (r) => `<a class="search-item" href="${r.url}">
        <strong>${highlight(r.title, tokens)}</strong>
        <span>${highlight(r.summary || '', tokens).slice(0, 120)}${r.meta ? ` · ${escapeHtml(r.meta)}` : ''}</span>
      </a>`,
      )
      .join('');
  }
  container.innerHTML = html;
}

export function initSearch() {
  const dialog = document.getElementById('search-dialog');
  const trigger = document.querySelector('[data-search-open]');
  if (!dialog || !trigger) return;

  const input = dialog.querySelector('[data-search-input]');
  const resultsEl = dialog.querySelector('[data-search-results]');
  const closeBtn = dialog.querySelector('[data-search-close]');
  let data = null;
  let timer = null;

  const open = () => {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    setTimeout(() => input && input.focus(), 30);
    if (!data) loadIndex().then((d) => { data = d; });
  };

  const close = () => {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };

  trigger.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });

  const run = async (query) => {
    const tokens = query.trim().split(/\s+/).filter(Boolean).slice(0, 4);
    if (!tokens.length) {
      resultsEl.innerHTML = `<p class="search-empty">输入关键词开始检索，支持标题、摘要、标签与栏目。</p>`;
      return;
    }
    if (!data) data = await loadIndex();
    if (!data) {
      resultsEl.innerHTML = `<p class="search-empty">搜索索引未生成，请先运行 <code>npm run build</code> 或重启开发服务器。</p>`;
      return;
    }

    const scored = [];
    for (const a of data.articles || []) {
      const s = score(a, tokens, [
        [a.title, 6], [a.keywords, 4], [a.summary, 2], [a.category, 2],
      ]);
      if (s > 0) {
        scored.push({
          type: a.kind === 'scenario' ? 'scenario' : 'article',
          title: a.title,
          summary: a.summary,
          url: a.url,
          meta: a.category,
          score: s,
        });
      }
    }
    for (const q of data.quotes || []) {
      const s = score(q, tokens, [[q.text, 5], [q.category, 2], [q.author, 2]]);
      if (s > 0) {
        scored.push({
          type: 'quote',
          title: q.text.length > 46 ? `${q.text.slice(0, 46)}…` : q.text,
          summary: q.author ? `${q.author} · ${q.category}` : '本站编辑原创',
          url: `/quotes/#q-${q.id}`,
          score: s,
        });
      }
    }
    for (const b of data.books || []) {
      const s = score(b, tokens, [[b.title, 5], [b.author, 3], [b.summary, 2]]);
      if (s > 0) {
        scored.push({
          type: 'book',
          title: `《${b.title}》`,
          summary: b.author,
          url: `/books/#book-${b.id}`,
          score: s,
        });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    renderResults(resultsEl, scored.slice(0, 24), tokens);
  };

  input?.addEventListener('input', () => {
    clearTimeout(timer);
    const value = input.value;
    timer = setTimeout(() => run(value), 140);
  });

  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const first = resultsEl.querySelector('.search-item');
      if (first) {
        close();
        window.location.href = first.getAttribute('href');
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    const tag = (event.target && event.target.tagName) || '';
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);
    if (event.key === '/' && !typing) {
      event.preventDefault();
      open();
    }
  });

  loadIndex().then((d) => { data = d; });
}