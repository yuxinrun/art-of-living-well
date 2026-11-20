# 图片与 SVG 来源清单

本站不使用任何外部图床、远程图片 URL 或第三方素材库图标。所有视觉素材均为本站原创，或由本站在本地用代码生成，随仓库一起分发。

| 文件 | 类型 | 说明 | 作者 / 生成方式 | 授权 |
|---|---|---|---|---|
| `public/assets/illustrations/hero-mountains.svg` | 原创 SVG | 首页 Hero 主图《行远》：远山、红日、松树、山道、携书卷的行人、题字与朱印 | 本站手写 SVG（`viewBox 0 0 760 680`） | CC BY-NC 4.0 |
| `public/assets/illustrations/reading-cultivation.svg` | 原创 SVG | 阅读与修养：摊开的书、茶盏、远山 | 本站手写 SVG | CC BY-NC 4.0 |
| `public/assets/illustrations/communication.svg` | 原创 SVG | 沟通表达：两人对坐、对话气泡、小几与茶 | 本站手写 SVG | CC BY-NC 4.0 |
| `public/assets/illustrations/relationship.svg` | 原创 SVG | 人际关系：并立的两个人与连结的线 | 本站手写 SVG | CC BY-NC 4.0 |
| `public/assets/illustrations/workplace.svg` | 原创 SVG | 职场：案几、两盏灯、摊开的卷宗、书册与印 | 本站手写 SVG | CC BY-NC 4.0 |
| `public/assets/illustrations/books.svg` | 原创 SVG | 书籍专题：叠放的古籍与书签 | 本站手写 SVG | CC BY-NC 4.0 |
| `public/assets/illustrations/quote-scroll.svg` | 原创 SVG | 金句卡片装饰：卷轴与引号 | 本站手写 SVG | CC BY-NC 4.0 |
| `public/assets/illustrations/empty-state.svg` | 原创 SVG | 空状态：无结果的搜索与收藏 | 本站手写 SVG | CC BY-NC 4.0 |
| `public/assets/backgrounds/paper.svg` | 原创 SVG | 纸张纹理底纹，`body::before` 以低透明度平铺 | 本站手写 SVG（`feTurbulence` 噪点 + 纤维线） | CC BY-NC 4.0 |
| `public/assets/icons/favicon.svg` | 原创 SVG | 站点图标：朱砂方印中的「和」 | 本站手写 SVG | CC BY-NC 4.0 |
| `public/assets/images/og-cover.png` | 本地生成 PNG | 社交分享封面（1200 × 630），用于 Open Graph / Twitter Card | 由本地 HTML + Chrome 无头模式截取本站原创 SVG 山脉插画生成，非设计稿 | CC BY-NC 4.0 |
| `docs/screenshots/*.png` | 本地生成 PNG | 真实网页截图，用于 README 展示 | 构建 `dist/` 后用 Chrome DevTools Protocol 截取 | CC BY-NC 4.0 |

## 使用约定

1. **所有插画必须存放在 `public/assets/illustrations/`，用相对文件名在 frontmatter 的 `cover` 字段引用**（例如 `cover: communication.svg`），由构建脚本拼接成 `assets/illustrations/<文件名>`。
2. **不引用远程图片**。若确需新增位图，请先确认授权，压缩为 WebP/JPG 后放入 `public/assets/images/`，并在此表登记来源与授权。
3. **每个 `<img>` 必须有 `alt`**。装饰性图片使用空 `alt` 并由 CSS 背景承载，正文插图必须写清「画了什么」。
4. **不用于商业用途**。本站文字与插画统一采用 CC BY-NC 4.0（署名—非商业性使用—相同方式共享），转载需注明来源与链接。
5. 截图为真实页面渲染结果，未做设计稿替换或后期合成。

## 字体

不加载任何远程字体。标题使用系统衬线字体栈（Songti SC / SimSun / Source Han Serif），正文使用系统无衬线字体栈（PingFang SC / Microsoft YaHei / system-ui），因此首屏无字体请求、无 FOUT。