# 医学题库 PWA

2026 深圳医师定期考核临床类别复习助手，使用 React、TypeScript 和 Vite 构建，提供背题、做题、模拟考试、错题集和本地智能搜题。

## 目录

- `app/`：响应式 PWA 应用
- `app/src/generated/`：当前题库配置和题目数据
- `scripts/`：题库导入、校验和构建脚本
- `docs/`：设计文档、实施计划、部署和销售资料

## 常用命令

```powershell
cd app
npm.cmd install
npm.cmd test
npm.cmd run build:bank -- --bank sz-clinical-2026
npm.cmd run dev
```

## 数据说明

- 每个题库使用独立 `bankId` 和独立 IndexedDB 数据库。
- 题目、解析和搜索词在构建前生成，运行时不调用 AI。
- 应用没有业务后端，买家进度只保存在当前设备。
