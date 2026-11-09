# linG5821 · homepage

个人主页。一屏睁眼，一屏全息投影立绘，一屏找我。

纯静态站点：没有构建步骤、没有框架、没有外部 CDN。克隆下来起个静态服务器就能跑。

```
首页  →  开屏动画 / 名字 / 本地时间
关于  →  头像 + 身份标识 + 全息投影立绘
找到我 →  ID 复制 + 平台入口
```

## 目录

```
.
├── index.html          页面结构
├── styles.css          全部样式（含全息投影、响应式、动效）
├── src/
│   └── main.js         加载动画、视频播放/重播、时钟、复制、滚动视差、入场动画
├── assets/
│   ├── eye2.mp4              开屏动画（800×1108，7.04s，24fps，H.264 High，821KB）
│   ├── eye2-poster.jpg       视频 poster（900×1246）
│   ├── whalegirl.webp        全息投影立绘（431×1200，透明底）
│   ├── whalegirl-scan.webp   按立绘轮廓生成的扫描线层
│   └── avatar.webp           头像（520×520）
└── vendor/fonts/             本地字体，5 个 woff2
```

## 本地运行

**必须走 HTTP。** `file://` 下 `type="module"` 和被浏览器接管的 video 都会被拦。

```bash
python3 -m http.server 8899
# → http://127.0.0.1:8899/
```

或者：

```bash
npx serve .
```

## 部署

纯静态，把整个目录原样放到 Web 服务器的站点根目录即可。**目录结构必须保留**，`index.html` 用相对路径引用 `styles.css` / `src/` / `assets/` / `vendor/`。

nginx 最小配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/homepage;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.mp4$ {
        add_header Accept-Ranges bytes;
        add_header Cache-Control "public, max-age=2592000";
    }

    location ~* \.(webp|jpg|woff2)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

两个容易踩的点：

1. **`.mp4` 的 MIME 必须是 `video/mp4`**。精简过的 nginx 镜像如果缺 `mime.types`，视频不播。
2. **不要只上传 `index.html`**。缺 `assets/` 会白屏。

GitHub Pages 也能直接托管：Settings → Pages → 选 `main` 分支根目录即可，无需其他配置。

## 交互

| 操作 | 行为 |
|---|---|
| 首屏点击（链接、按钮、`关于`、`找到我` 区块除外） | 重播睁眼动画 |
| 「点一下 · 再看她睁眼」 | 同上（始终可点） |
| 复制按钮 | 复制 ID `linG5821` 到剪贴板（带 `execCommand` 兜底） |
| 滚动 | 背景视差淡出，各区块入场动画 |
| `prefers-reduced-motion` | 动画时长压到 0.001ms，入场元素直接显示 |

视频只播一次，结束后停在睁眼帧。

## 浏览器支持

现代浏览器（Chrome / Edge / Firefox / Safari 最近两年版本）。依赖：

- `mask-image` / `clip-path` 合成
- `IntersectionObserver`
- `aspect-ratio`、`clamp()`、`svh` 单位

极旧的 Safari 上全息锥体可能退化成纯色梯形，功能不受影响。

---

# 资源来源与许可

## 开屏动画（睁眼）

`assets/eye2.mp4`、`assets/eye2-poster.jpg`

- 原动画：**NativeDog1 / dsh-boot-animation**
  <https://github.com/NativeDog1/dsh-boot-animation>
- 8K 修复版：**1catmint1 / dsh-boot-animation-8k**
  <https://github.com/1catmint1/dsh-boot-animation-8k>
- 模板整理：**LeeRolling / dsh-boot-suite**
  <https://github.com/LeeRolling/dsh-boot-suite>
- 许可：**BSD-3-Clause**

本仓库里的版本在原素材基础上裁掉了左侧 DeepSeek 字标与右侧 HUD 文字，缩放到 800×1108 并转码为 H.264（CRF 26，High profile，`yuv420p`，`+faststart`）。原许可与署名要求仍然适用。

## 角色立绘

`assets/whalegirl.webp`、`assets/whalegirl-scan.webp`、`assets/avatar.webp`

- 设定图作者：**上善无形** / **ZipZipPipe**
- 来源：社区资源库 **TreapGoGo / deepseek-whale-girl**
  <https://github.com/TreapGoGo/deepseek-whale-girl>
- 许可：**CC BY-NC-SA 4.0**
  <https://creativecommons.org/licenses/by-nc-sa/4.0/>

**仅限非商业使用。** 二次创作需署名、以相同许可共享。本仓库中的处理：

- `whalegirl.webp`：去白底转透明，缩放到 431×1200，保留原图影子
- `whalegirl-scan.webp`：按立绘 alpha 轮廓生成的扫描线层，供全息效果使用
- `avatar.webp`：半身像裁切至 520×520

## 字体

均放在 `vendor/fonts/`，本地自托管，无外部请求。

| 字体 | 文件 | 许可 |
|---|---|---|
| Chakra Petch | `chakra-400.woff2`、`chakra-600.woff2` | SIL Open Font License 1.1 |
| JetBrains Mono | `jbmono-400.woff2`、`jbmono-500.woff2` | SIL Open Font License 1.1 |
| Michroma | `michroma-400.woff2` | SIL Open Font License 1.1 |

OFL 1.1：<https://openfontlicense.org/>

## 代码

`index.html`、`styles.css`、`src/main.js` 为本项目原创。

---

## 说明

DeepSeek 官方从未发布拟人形象。页面中的角色为社区二创，本仓库仅作个人主页展示，与 DeepSeek 官方无关。
