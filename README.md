# 文明的视界

wlwenming 的个人欢迎页，部署在 GitHub Pages。

线上地址：<https://wlwenming.github.io/>

## 目录

页面只放内容。样式、首页脚本和图标分开：

- `index.html`、`about.html`、`ai-hot.html`、`update.html`、`privacy.html`、`terms.html`、`404.html`：各页内容
- `assets/css/site.css`：全站样式，颜色和字号集中在文件顶部
- `assets/js/home.js`：首页随机欢迎语和返回顶部
- `assets/images/favicon.svg`、`assets/images/favicon.ico`：站点图标

## 部署

站点内容在 `main` 分支的根目录。在仓库 **Settings → Pages** 中：

1. Source 选择 **Deploy from a branch**。
2. Branch 选择 **main**，文件夹选择 **/ (root)**，然后保存。
3. 大约一分钟后即可通过上面的地址访问。

更新后推送到 `main`：

```bash
git push -u origin main
```

## 本地预览

在仓库根目录执行：

```bash
npx --yes serve .
```

也可以直接用浏览器打开 `index.html`。首页欢迎语和「返回顶部」依赖 JavaScript；不执行脚本时会显示一段固定欢迎语。

## AI 热点自动更新

`.github/workflows/update-ai-hot.yml` 会每天北京时间 08:00 和 17:00 自动运行，也可以在 GitHub Actions 页面手动运行。脚本从量子位、InfoQ、IT之家等中文 RSS 源筛选当天 AI 资讯，更新 `assets/data/ai-hot-latest.js`，并将上一版数据归档到 `assets/data/ai-hot-history.js`。

`update.html` 可手动触发 workflow。页面使用的 Fine-grained Token 只需要仓库范围为 `wlwenming/wlwenming.github.io`，并授予 `Actions: Read and write`；Token 只在当前页面内存中使用，不会写入仓库。
