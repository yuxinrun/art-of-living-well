/* 文章页：阅读进度、目录高亮、收藏、分享、最近阅读；通用滚动 UI */

import { KEYS, readStore, writeStore, addToStore, isSaved, removeFromStore, togglePressed, toast, share, withBase } from './core.js';

export function initScrollUI() {
  const progress = document.querySelector('[data-progress]');
  const backToTop = document.querySelector('[data-back-to-top]');
  let ticking = false;

  const update = () => {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const height = doc.scrollHeight - window.innerHeight;
    if (progress) {
      const ratio = height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0;
      progress.style.width = `${ratio}%`;
    }
    if (backToTop) backToTop.classList.toggle('is-visible', scrollTop > 560);
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  window.addEventListener('resize', update);
  update();
}

export function initTocSpy() {
  const links = Array.from(document.querySelectorAll('[data-toc-link]'));
  if (!links.length) return;
  const targets = links
    .map((link) => {
      const id = link.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      return el ? { link, el } : null;
    })
    .filter(Boolean);
  if (!targets.length) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const offset = 130;
    let active = targets[0];
    for (const target of targets) {
      if (target.el.getBoundingClientRect().top <= offset) active = target;
      else break;
    }
    targets.forEach((t) => t.link.classList.toggle('is-active', t.link === active.link));
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

export function initArticlePage() {
  const post = document.querySelector('[data-article]');
  if (!post) return;

  const slug = post.getAttribute('data-article');
  const title = post.getAttribute('data-article-title') || document.title;
  const url = post.getAttribute('data-article-url') || window.location.pathname;
  const category = document.querySelector('.post-head .eyebrow')?.textContent || '';
  const absolute = `${window.location.origin}${withBase(url)}`;

  // 收藏
  const buttons = document.querySelectorAll('[data-article-fav]');
  const sync = () => {
    const saved = isSaved(KEYS.favArticles, slug);
    buttons.forEach((btn) => togglePressed(btn, saved));
  };
  sync();

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const saved = isSaved(KEYS.favArticles, slug);
      if (saved) {
        removeFromStore(KEYS.favArticles, slug);
        toast('已从书签中移除');
      } else {
        addToStore(KEYS.favArticles, {
          slug,
          title,
          url,
          category: category.split('·')[0].trim(),
          date: new Date().toISOString().slice(0, 10),
        });
        toast('已收藏到「我的书签」');
      }
      sync();
    });
  });

  // 分享
  document.querySelector('[data-article-share]')?.addEventListener('click', () => {
    share({ title, text: document.title, url: absolute });
  });

  // 最近阅读
  const recent = readStore(KEYS.recent, []);
  const entry = {
    slug,
    title,
    url,
    at: new Date().toISOString().slice(0, 10),
  };
  const rest = recent.filter((item) => item.slug !== slug);
  writeStore(KEYS.recent, [entry, ...rest].slice(0, 12));
}