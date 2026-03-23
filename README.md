# 服务器主页

基于 `Vue 3 + Vite + Pinia` 的内网页面入口站点，用来集中展示常用系统链接、时间天气、一言和音乐播放器，并增加了一层登录门禁，适合做实验室、办公室或局域网服务器的首页。

![服务器主页预览](/screenshots/main.jpg)

## 功能概览

- 内网页面导航，支持站点卡片和社交入口
- 登录门禁，进入主页前需要先完成站点登录
- 实时时间、日期、运行天数和 Hitokoto 一言
- 天气信息展示，优先走高德 JS API
- 音乐播放器，支持通过环境变量切换歌单来源
- 背景图、图标、文案、备案号等基础信息可配置
- 桌面端与移动端自适应
- 可直接构建为静态站点，也支持 Docker 运行

## 技术栈

- Vue 3
- Vite 4
- Pinia
- Element Plus
- APlayer
- IconPark / xicons

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+ 或 npm

### 本地开发

先复制 `.env.example` 为 `.env`，再安装依赖并启动开发服务。

```bash
pnpm install
pnpm dev
```

默认开发服务器会监听局域网地址，启动后可直接在浏览器访问终端输出中的地址。

### 生产构建

```bash
pnpm build
```

构建产物位于 `dist/`，可以直接交给 Nginx、Caddy、宝塔静态站点或任意静态文件服务。

## 配置说明

项目的主要配置集中在 `.env` 和 `src/assets` 目录。

### 环境变量

复制 `.env.example` 为 `.env` 后，按需修改：

- `VITE_SITE_NAME`：站点名称
- `VITE_SITE_AUTHOR` / `VITE_SITE_AUTHOR_URL`：作者信息
- `VITE_SITE_DES` / `VITE_DESC_TEXT`：主页描述文案
- `VITE_SITE_URL`：站点访问地址或服务器 IP
- `VITE_SITE_LOGO` / `VITE_SITE_MAIN_LOGO`：站点图标和主 Logo
- `VITE_WEATHER_KEY`：高德 Web JS API Key
- `VITE_WEATHER_SECURITY_CODE`：高德安全密钥，开启安全校验时必填
- `VITE_WEATHER_CITY`：定位失败时的兜底城市
- `VITE_SONG_API`：音乐接口地址
- `VITE_SONG_SERVER` / `VITE_SONG_TYPE` / `VITE_SONG_ID`：播放器数据源配置

### 业务数据

- `src/assets/siteLinks.json`：主页快捷入口
- `src/assets/socialLinks.json`：社交按钮和联系方式
- `public/images/`：背景图
- `public/images/icon/`：站点图标和按钮图标

### 登录逻辑

当前登录校验是前端内置的演示实现，代码在 `src/api/index.js` 的 `loginSiteManager` 中。  
如果要用于生产环境，建议改成你自己的后端认证接口，或至少修改默认账号逻辑。

## Docker 部署

### 构建镜像

```bash
docker build -t server-homepage .
```

### 运行容器

```bash
docker run -d --name server-homepage -p 80:80 server-homepage
```

如果使用 `docker-compose`：

```bash
docker compose up -d --build
```

## 常见定制点

- 修改首页欢迎文案：`.env`
- 修改登录提示和交互：`src/App.vue`
- 修改登录账号逻辑：`src/api/index.js`
- 修改站点卡片图标映射：`src/components/Links.vue`
- 修改天气组件展示：`src/components/Weather.vue`

## 注意事项

- 未配置 `VITE_WEATHER_KEY` 时，天气组件无法正常加载高德天气数据。
- 未配置 `VITE_SONG_ID` 或音乐接口不可用时，播放器会提示加载失败。
- 当前仓库默认面向内网使用，公开部署前请先检查登录逻辑、站点链接和个人联系方式。

## License

本项目沿用仓库中的 [LICENSE](./LICENSE)。
