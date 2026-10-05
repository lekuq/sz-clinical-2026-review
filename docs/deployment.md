# 部署说明

## 首发题库

- `bankId`：`sz-clinical-2026`
- 产品名：医考通 · 2026 深圳医师定期考核临床类别复习助手
- 构建命令：

```powershell
cd app
npm.cmd run build:bank -- --bank sz-clinical-2026
```

构建产物位于 `app/dist`。应用是纯静态 PWA，不包含后端接口。

## Cloudflare Pages

首次发布：

```powershell
npx wrangler login
npx wrangler pages project create sz-clinical-2026-review --production-branch main
npx wrangler pages deploy app/dist --project-name sz-clinical-2026-review --branch main
```

项目名如被占用，依次尝试：

- `sz-clinical-2026-review-01`
- `sz-clinical-2026-review-02`

网址一旦确定，后续更新继续部署到同一项目，买家使用原网址。

## 发布前检查

1. `npm.cmd test` 全部通过。
2. `npm.cmd run build:bank -- --bank sz-clinical-2026` 成功。
3. 首页显示 500 道题。
4. 背题、做题、模拟考试、错题集和搜题可正常使用。
5. 清除浏览器缓存前，完成进度和错题可以本地保留。
6. 开发者工具确认 Manifest 和 Service Worker 已注册。
7. 浏览器切换为 Offline 后刷新，题库仍可打开。
