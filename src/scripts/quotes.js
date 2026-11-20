/* 金句：每日一句、随机切换、复制、收藏、分享、生成金句卡片 */

import { KEYS, copyText, share, toast, readStore, writeStore, isSaved, addToStore, removeFromStore, togglePressed, withBase } from './core.js';

const TYPE_LABEL = { classic: '经典原文', excerpt: '可靠摘录', editorial: '编辑原创' };

function getQuotes() {
  const el = document.getElementById('quotes-data');
  if (!el) return [];
  try {
    return JSON.parse(el.textContent);
  } catch (error) {
    return [];
  }
}

function quoteMeta(q) {
  return q.author ? `${q.author}${q.source ? ` · ${q.source}` : ''}` : '本站编辑原创';
}

function quoteText(q) {
  return `「${q.text}」\n—— ${quoteMeta(q)}（${TYPE_LABEL[q.type] || '编辑原创'}）\n做人和为人处世`;
}

/* ---------------- 金句卡片（Canvas 生成 PNG） ---------------- */

function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const char of text) {
    if (char === '\n') {
      lines.push(line);
      line = '';
      continue;
    }
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function downloadQuoteCard(q) {
  const canvas = document.createElement('canvas');
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#F7F5EF';
  ctx.fillRect(0, 0, W, H);

  // 纸面细纹
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = '#8C7A56';
  ctx.lineWidth = 1;
  for (let i = 0; i < 130; i += 1) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const len = 10 + Math.random() * 40;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
  ctx.restore();

  // 边框
  ctx.strokeStyle = '#E2DACB';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = '#EDE7DA';
  ctx.lineWidth = 1;
  ctx.strokeRect(58, 58, W - 116, H - 116);

  // 页眉
  ctx.fillStyle = '#9C8E74';
  ctx.textAlign = 'center';
  ctx.font = '500 24px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText('做人和为人处世 · THE ART OF LIVING WELL', W / 2, 132);
  ctx.strokeStyle = '#C9B893';
  ctx.beginPath();
  ctx.moveTo(W / 2 - 40, 160);
  ctx.lineTo(W / 2 + 40, 160);
  ctx.stroke();

  // 金句正文
  const long = q.text.length > 56;
  const fontSize = long ? 44 : 54;
  ctx.fillStyle = '#292923';
  ctx.textAlign = 'left';
  ctx.font = `600 ${fontSize}px "Songti SC","STSong","SimSun",serif`;
  const lines = wrapLines(ctx, q.text, W - 260);
  const lineHeight = fontSize * 1.85;
  const startY = Math.max(330, (H - lines.length * lineHeight) / 2 - 20);
  lines.forEach((line, i) => {
    ctx.fillText(line, 130, startY + i * lineHeight);
  });

  // 署名
  const metaY = startY + lines.length * lineHeight + 40;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#6B6355';
  ctx.font = '400 28px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText(quoteMeta(q), W - 130, metaY);
  ctx.fillStyle = '#A08B63';
  ctx.font = '400 22px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText(TYPE_LABEL[q.type] || '编辑原创', W - 130, metaY + 42);

  // 印章
  ctx.fillStyle = '#A64B3C';
  ctx.fillRect(130, H - 250, 88, 88);
  ctx.strokeStyle = 'rgba(253,248,238,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(139, H - 241, 70, 70);
  ctx.fillStyle = '#FDF8EE';
  ctx.textAlign = 'center';
  ctx.font = '600 44px "Songti SC","STSong","SimSun",serif';
  ctx.fillText('和', 174, H - 186);

  // 页脚
  ctx.textAlign = 'left';
  ctx.fillStyle = '#9C8E74';
  ctx.font = '400 22px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText('人生金句 · 做人修养 / 为人处世 / 沟通表达', 130, H - 118);
  ctx.textAlign = 'right';
  ctx.fillText('yuxinrun.github.io/art-of-living-well', W - 130, H - 118);

  canvas.toBlob((blob) => {
    if (!blob) {
      toast('图片生成失败，请稍后再试');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `金句卡片-${q.id}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast('金句卡片已生成，请查看下载文件');
  }, 'image/png');
}

/* ---------------- 每日一句 ---------------- */

export function initDailyQuote() {
  const root = document.querySelector('[data-daily-quote]');
  if (!root) return;
  const quotes = getQuotes();
  if (!quotes.length) return;

  let current = quotes[0];
  const textEl = root.querySelector('[data-daily-text]');
  const authorEl = root.querySelector('[data-daily-author]');
  const typeEl = root.querySelector('[data-daily-type]');
  const favBtn = root.querySelector('[data-daily-fav]');

  const paint = (q) => {
    current = q;
    if (textEl) textEl.textContent = q.text;
    if (authorEl) authorEl.textContent = quoteMeta(q);
    if (typeEl) {
      typeEl.textContent = TYPE_LABEL[q.type] || '编辑原创';
      typeEl.className = `quote-type type-${q.type}`;
    }
    if (favBtn) togglePressed(favBtn, isSaved(KEYS.favQuotes, q.id, 'id'), ['收藏', '已收藏']);
  };

  paint(quotes[0]);

  root.querySelector('[data-quote-random]')?.addEventListener('click', () => {
    if (quotes.length < 2) return;
    let next = current;
    while (next.id === current.id) {
      next = quotes[Math.floor(Math.random() * quotes.length)];
    }
    paint(next);
    toast('换一句，慢慢读');
  });

  root.querySelector('[data-daily-copy]')?.addEventListener('click', async () => {
    const ok = await copyText(quoteText(current));
    toast(ok ? '金句与出处已复制' : '复制失败，请手动选择文本');
  });

  root.querySelector('[data-daily-fav]')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const saved = isSaved(KEYS.favQuotes, current.id, 'id');
    if (saved) {
      removeFromStore(KEYS.favQuotes, current.id);
      togglePressed(button, false);
      toast('已取消收藏');
    } else {
      addToStore(KEYS.favQuotes, current.id, 100);
      togglePressed(button, true);
      toast('已收藏到「我的书签」');
    }
  });

  root.querySelector('[data-daily-share]')?.addEventListener('click', () => {
    share({ title: '人生金句', text: quoteText(current), url: window.location.origin + window.location.pathname });
  });
}

/* ---------------- 金句库页面 ---------------- */

export function initQuotePage() {
  const grid = document.querySelector('[data-quote-grid]');
  if (!grid) return;
  const quotes = getQuotes();
  const byId = new Map(quotes.map((q) => [q.id, q]));

  const syncFavButtons = (id) => {
    const saved = isSaved(KEYS.favQuotes, id, 'id');
    document.querySelectorAll(`[data-quote-fav="${id}"]`).forEach((btn) => togglePressed(btn, saved));
  };

  quotes.forEach((q) => syncFavButtons(q.id));

  document.addEventListener('click', async (event) => {
    const copyBtn = event.target.closest('[data-quote-copy]');
    if (copyBtn) {
      const q = byId.get(copyBtn.getAttribute('data-quote-copy'));
      if (!q) return;
      const ok = await copyText(quoteText(q));
      toast(ok ? '金句与出处已复制' : '复制失败，请手动选择文本');
      return;
    }

    const favBtn = event.target.closest('[data-quote-fav]');
    if (favBtn) {
      const id = favBtn.getAttribute('data-quote-fav');
      const saved = isSaved(KEYS.favQuotes, id, 'id');
      if (saved) {
        removeFromStore(KEYS.favQuotes, id);
        toast('已取消收藏');
      } else {
        addToStore(KEYS.favQuotes, id, 100);
        toast('已收藏到「我的书签」');
      }
      syncFavButtons(id);
      return;
    }

    const cardBtn = event.target.closest('[data-quote-card]');
    if (cardBtn) {
      const q = byId.get(cardBtn.getAttribute('data-quote-card'));
      if (q) downloadQuoteCard(q);
      return;
    }

    const shareBtn = event.target.closest('[data-quote-share]');
    if (shareBtn) {
      const q = byId.get(shareBtn.getAttribute('data-quote-share'));
      if (q) {
        share({
          title: '人生金句',
          text: quoteText(q),
          url: `${window.location.origin}${withBase(`/quotes/`)}#q-${q.id}`,
        });
      }
    }
  });

  // 分类筛选
  const chips = document.querySelectorAll('[data-quote-filter]');
  const groups = document.querySelectorAll('[data-quote-cat]');
  const empty = document.querySelector('[data-quote-empty]');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const value = chip.getAttribute('data-quote-filter');
      chips.forEach((c) => c.classList.toggle('is-active', c === chip));
      let visible = 0;
      groups.forEach((group) => {
        const show = value === 'all' || group.getAttribute('data-quote-cat') === value;
        group.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    });
  });
}