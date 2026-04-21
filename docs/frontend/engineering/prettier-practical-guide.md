---
title: Prettier 实战指南：统一代码风格，减少低价值争论
date: 2026-04-21
tags: [prettier, 工程化, 前端规范, 代码格式化]
category: 工程化
description: 一篇讲透 Prettier 的实战文章，覆盖最小配置、与 ESLint 协作、团队落地流程和常见坑位排查。
---

# Prettier 实战指南：统一代码风格

## 一、先搞懂：Prettier 解决的到底是什么问题？

一句话版本：

**Prettier 是代码格式化工具，解决代码风格的问题。**

保存时自动格式化代码，你可以把它理解成“自动排版器”：

- 统一代码风格，降低评审噪音
- 减少手动调整格式的时间
- 降低多人协作时的风格冲突


## 二、完成最小可用配置

### 第一步：安装 Prettier

```bash
npm install -D prettier
```

### 第二步：新增 [`.prettierrc`](https://prettier.io/docs/configuration)

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "arrowParens": "always"
}
```

### 第三步：新增 [`.prettierignore`](https://prettier.io/docs/ignore)

```txt
dist
node_modules
*.min.js
.gitignore
package.json
.editorconfig
```

忽略构建产物和第三方依赖，可以显著提升格式化速度。

### 第四步：在 `package.json` 增加脚本

```json
{
  "scripts": {
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  }
}
```

建议在本地用 `format` 修复格式，在 CI 用 `format:check` 做兜底校验。

## 三、常用配置项怎么选？（可点击查看官方说明）

下面是项目里最常见的选项：

- [`printWidth`](https://prettier.io/docs/options#print-width)：建议 `100` 或 `120`，太小会频繁换行
- [`singleQuote`](https://prettier.io/docs/options#quotes)：前端项目通常设为 `true`
- [`semi`](https://prettier.io/docs/options#semicolons)：建议统一为 `true`，减少 ASI（自动插入分号）歧义
- [`trailingComma`](https://prettier.io/docs/options#trailing-commas)：建议 `"all"`，对 diff 更友好

## 四、和 ESLint 的关系：分工明确，不互相打架

很多人第一次接入 Prettier 时会遇到“刚格式化完，ESLint 又报错”的问题。  
根因通常是：两套工具都在管同一类格式规则。

推荐做法是：

1. **格式交给 Prettier**
2. **质量交给 ESLint**
3. 通过 [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier) 关闭 ESLint 中与格式冲突的规则

安装：

```bash
npm install -D eslint-config-prettier
```

如果你使用 Flat Config（`eslint.config.js`），可这样接入：

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier
];
```

关键点：`eslintConfigPrettier` 放在配置数组后面，确保冲突规则被正确覆盖。

## 五、团队落地建议：本地、提交前、CI 三层兜底

### 1）vscode编辑器保存自动格式化

下载 `Prettier - Code formatter` 插件

在项目根目录创建 `.vscode` 文件夹，并创建 `settings.json` 文件：

```json
{
  // 编辑器默认使用 prettier 格式化代码
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  // 保存代码时，格式化代码
  "editor.formatOnSave": true,
  // 保存代码时，修复代码
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  }
}
```
按保存键时，可自动格式化代码

### 2）提交前只格式化暂存文件

配合 [`husky`](https://typicode.github.io/husky/) + [`lint-staged`](https://github.com/lint-staged/lint-staged)，避免每次都全量扫描：

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,css,scss,md,json,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

### 3）CI 中做一致性校验

在流水线中增加：

```bash
npm run format:check
```

这样即使有人本地漏执行，CI 也能统一拦截。

## 配置页面直达（点击打开）

- [Prettier 配置文件说明](https://prettier.io/docs/configuration)
- [Prettier 忽略文件说明](https://prettier.io/docs/ignore)
- [ESLint 与 Prettier 冲突处理](https://github.com/prettier/eslint-config-prettier)
