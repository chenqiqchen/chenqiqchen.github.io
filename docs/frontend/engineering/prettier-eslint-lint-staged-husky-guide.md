---
title: lint-staged + husky 实战：提交前自动修复与拦截
date: 2026-04-27
tags: [prettier, eslint, lint-staged, husky, 工程化]
category: 工程化
description: 一篇覆盖 Prettier 与 ESLint 协同、lint-staged 配置、husky 提交前拦截和常见坑位排查的实战指南。
---

# lint-staged + husky 实战指南

## 一、先明确分工：谁负责什么？

这 4 个工具一起用，核心是“职责拆开，流程串起来”：

- **Prettier**：负责代码格式（分号、引号、换行、缩进）
- **ESLint**：负责代码质量（潜在 bug、不安全写法）
- **lint-staged**：只处理“本次暂存区文件”，避免每次全量扫描
- **husky**：把 lint-staged 挂到 `git commit` 前，做到自动执行

一句话总结：  
**格式交给 Prettier，质量交给 ESLint，提交前由 husky + lint-staged 自动兜底。**

## 二、为什么推荐这套组合？

如果只靠开发者“自觉运行命令”，规范很容易失效。  
这套组合能同时解决三件事：

1. **本地体验好**：只检查暂存文件，速度快
2. **提交质量稳**：不合规代码在 commit 前被拦截
3. **团队成本低**：减少 review 中低价值风格争论

## 三、从 0 到 1：最小可用配置

这一节默认你已经完成 Prettier 和 ESLint 的安装与基础配置。  
这些内容我在另外两篇文章里已经详细讲过，这篇只聚焦 `lint-staged + husky` 的最小可用落地。

### 第一步：安装本节新增依赖

```bash
npm install -D husky lint-staged
```

### 第二步：在 `package.json` 增加脚本和 lint-staged 配置

```json
{
  "scripts": {
    "prepare": "husky",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,md,json,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

这套配置的好处：

- JS/TS 文件先做质量修复，再统一格式
- 文档和配置文件只走 Prettier，速度更快

### 第三步：初始化 husky 并添加 pre-commit 钩子

先执行：

```bash
npm run prepare
```

再创建 `.husky/pre-commit`：

```sh
npx lint-staged
```

之后每次执行 `git commit`，都会自动跑 lint-staged。

## 四、这条链路到底怎么跑？

当你提交代码时，流程通常是：

1. 触发 `husky` 的 `pre-commit`
2. `pre-commit` 执行 `lint-staged`
3. `lint-staged` 只拿暂存文件，匹配规则后执行任务
4. 可自动修复的问题被修复（如 `eslint --fix`、`prettier --write`）
5. 若仍有 error，commit 失败并提示你处理

## 五、常见坑位与排查建议

### 1）刚格式化完，ESLint 还是报格式错误

排查方向：

- 是否安装并接入了 `eslint-config-prettier`
- `eslint-config-prettier` 是否在配置数组靠后位置
- 项目里是否残留旧的风格类 ESLint 规则

### 2）pre-commit 很慢

排查方向：

- 是否误用了 `eslint .`（全量扫描）而不是 `eslint --fix`
- `lint-staged` 的文件匹配是否过宽
- 是否把构建产物目录也纳入检查

### 3）有人能绕过本地提交校验

解决方式：  
在 CI 增加二次兜底，至少包含：

```bash
npm run lint
npm run format:check
```

本地是体验优化，CI 才是最终质量防线。

## 六、团队落地建议（可直接照搬）

- 开发态：编辑器保存时自动格式化（提升即时反馈）
- 提交前：`husky + lint-staged` 自动修复和拦截
- CI：执行 `lint` 与 `format:check` 作为最终兜底

这套策略的核心价值不是“工具更复杂”，而是让规范执行从“靠人”升级成“靠流程”。

## 相关文档

- [Prettier 配置文档](https://prettier.io/docs/configuration)
- [ESLint 官方文档](https://eslint.org/docs/latest/)
- [lint-staged 仓库](https://github.com/lint-staged/lint-staged)
- [husky 官方文档](https://typicode.github.io/husky/)
