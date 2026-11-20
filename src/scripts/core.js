/* 基础交互：主题、移动端导航、提示、复制、分享、本地存储 */

export const KEYS = {
  theme: 'alw-theme',
  favArticles: 'alw-fav-articles',
  favQuotes: 'alw-fav-quotes',
  recent: 'alw-recent',
};

export function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

export function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

/** 站点在服务器上的根路径（兼容 GitHub Pages 子路径） */
export function siteBase() {
  const pagePath = document.documentElement.getAttribute('data-path') || '/';
  const loc = window.location.pathname;
  if (pagePath !== '/' && loc.endsWith(pagePath)) {
    return loc.slice(0, loc.length - pagePath.length);
  }
  if (pagePath === '/') {
    return loc.replace(/[^/]*$/, '');
  }
  return '';
}

/** 把 /character/ 形式站内绝对路径转换为带部署前缀的路径 */
export function withBase(url) {
  if (!url) return url;
  if (/^(https?:|mailto:|tel:|#)/.test(url)) return url;
  return `${siteBase()}/${String(url).replace(/^\//, '')}`;
}

let toastTimer = null;

export function toast(message) {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2200);
}

export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    /* 回退到 execCommand */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch (error) {
    return false;
  }
}

export async function share({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (error) {
      if (error && error.name === 'AbortError') return 'cancel';
    }
  }
  const ok = await copyText(`${text ? `${text}\n` : ''}${url}`);
  toast(ok ? '链接已复制，可粘贴分享' : '分享失败，请手动复制地址');
  return ok ? 'copied' : 'failed';
}

export function initTheme() {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;
  const sync = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    button.setAttribute('aria-pressed', String(isDark));
    button.setAttribute('aria-label', isDark ? '切换到浅色阅读模式' : '切换到深色阅读模式');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#1B1A17' : '#F7F5EF');
  };
  button.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    writeStore(KEYS.theme, next);
    sync();
    toast(next === 'dark' ? '已切换到深色阅读模式' : '已切换到浅色阅读模式');
  });
  sync();
}

export function initNav() {
  const button = document.querySelector('[data-menu-toggle]');
  const panel = document.getElementById('mobile-nav');
  if (!button || !panel) return;

  const close = () => {
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', '打开菜单');
  };

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      close();
    } else {
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', '关闭菜单');
    }
  });

  panel.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') close();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1180 && button.getAttribute('aria-expanded') === 'true') close();
  });
}

export function initBackToTop() {
  const button = document.querySelector('[data-back-to-top]');
  if (!button) return;
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

export function togglePressed(button, active, labels = ['收藏', '已收藏']) {
  if (!button) return;
  button.setAttribute('aria-pressed', String(active));
  button.classList.toggle('is-active', active);
  const textNode = Array.from(button.childNodes).find((n) => n.nodeType === 3 && n.textContent.trim());
  if (textNode) textNode.textContent = active ? labels[1] : labels[0];
}

export function isSaved(key, id, field = 'slug') {
  const list = readStore(key, []);
  return list.some((item) => (typeof item === 'string' ? item === id : item[field] === id));
}

export function addToStore(key, item, limit = 60) {
  const list = readStore(key, []);
  const id = typeof item === 'string' ? item : item.slug || item.id;
  const filtered = list.filter((entry) => (typeof entry === 'string' ? entry !== id : (entry.slug || entry.id) !== id));
  filtered.unshift(item);
  writeStore(key, filtered.slice(0, limit));
}

export function removeFromStore(key, id) {
  const list = readStore(key, []);
  writeStore(
    key,
    list.filter((entry) => (typeof entry === 'string' ? entry !== id : (entry.slug || entry.id) !== id)),
  );
}