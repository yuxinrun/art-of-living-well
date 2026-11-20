import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate } from './scripts/generate.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const PAGES_DIR = path.join(root, 'pages');

function collectHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...collectHtml(abs));
    else if (entry.name.endsWith('.html')) result.push(abs);
  }
  return result;
}

/** 内容管线：开发时按需生成页面并挂载路由；构建前由 npm run build 生成 */
function contentPlugin() {
  return {
    name: 'alw-content',
    configureServer(server) {
      generate();
      let timer = null;
      const rebuild = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          try {
            generate();
            server.ws.send({ type: 'full-reload' });
          } catch (error) {
            server.config.logger.error(`[content] ${error.message}`);
          }
        }, 120);
      };
      server.watcher.add([path.join(root, 'content'), path.join(root, 'data')]);
      server.watcher.on('add', rebuild);
      server.watcher.on('change', rebuild);
      server.watcher.on('unlink', rebuild);

      // 将 /character/ 之类的语义化路径映射到生成的静态 HTML
      server.middlewares.use((req, _res, next) => {
        const url = decodeURIComponent((req.url || '/').split('?')[0]);
        if (
          url.startsWith('/@') ||
          url.startsWith('/src/') ||
          url.startsWith('/node_modules/') ||
          url.startsWith('/pages/') ||
          url.startsWith('/assets/') ||
          /\.[a-z0-9]+$/i.test(url)
        ) {
          return next();
        }
        if (url === '/') {
          req.url = '/pages/index.html';
          return next();
        }
        const target = `/pages${url.endsWith('/') ? url : `${url}/`}index.html`;
        const abs = path.join(PAGES_DIR, target.replace(/^\/pages/, '').replace(/\/$/, ''));
        if (fs.existsSync(abs)) {
          req.url = target;
        }
        next();
      });
    },
  };
}

/** 构建后把 pages/ 下的目录树提升到 dist 根目录，得到干净的 URL 结构 */
function flattenPagesPlugin() {
  return {
    name: 'alw-flatten-pages',
    apply: 'build',
    closeBundle() {
      const dist = path.join(root, 'dist');
      const pages = path.join(dist, 'pages');
      if (!fs.existsSync(pages)) return;
      for (const entry of fs.readdirSync(pages)) {
        const from = path.join(pages, entry);
        const to = path.join(dist, entry);
        fs.rmSync(to, { recursive: true, force: true });
        fs.renameSync(from, to);
      }
      fs.rmSync(pages, { recursive: true, force: true });

      // 非 HTML 的站点级文件（sitemap / robots）不参与 Rollup 打包，单独拷贝
      for (const file of ['sitemap.xml', 'robots.txt']) {
        const from = path.join(PAGES_DIR, file);
        if (fs.existsSync(from)) fs.copyFileSync(from, path.join(dist, file));
      }
    },
  };
}

export default defineConfig(({ command }) => {
  generate();
  const inputs = collectHtml(PAGES_DIR);
  const base = process.env.BASE_PATH || '/';

  return {
    root,
    base,
    appType: 'mpa',
    plugins: [contentPlugin(), flattenPagesPlugin()],
    server: {
      port: 5173,
      host: '127.0.0.1',
      open: false,
    },
    preview: {
      port: 4173,
      host: '127.0.0.1',
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      emptyOutDir: true,
      cssCodeSplit: false,
      target: 'es2019',
      rollupOptions: {
        input: inputs,
        output: {
          entryFileNames: 'static/[name]-[hash].js',
          chunkFileNames: 'static/[name]-[hash].js',
          assetFileNames: 'static/[name]-[hash][extname]',
        },
      },
    },
  };
});