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

## GitHub Pages

发布使用 `.github/workflows/deploy-pages.yml`。仓库推送到 `main` 分支后，GitHub Actions 会自动执行：

1. 安装依赖。
2. 运行测试。
3. 构建首发题库。
4. 发布 `app/dist` 到 GitHub Pages。

发布前需要在 GitHub 仓库中把 Pages 的来源设置为 `GitHub Actions`。固定网址格式：

```text
https://lekuq.github.io/sz-clinical-2026-review/
```

应用采用 HashRouter，所以题目和页面链接形如：

```text
https://lekuq.github.io/sz-clinical-2026-review/#/study
```

## 发布前检查

1. `npm.cmd test` 全部通过。
2. `npm.cmd run lint` 通过。
3. `npm.cmd run build:bank -- --bank sz-clinical-2026` 成功。
4. 首页显示 500 道题。
5. 背题、做题、模拟考试、错题集和搜题可正常使用。
6. 开发者工具确认 Manifest 和 Service Worker 已注册。
7. 浏览器切换为 Offline 后刷新，题库仍可打开。
