---
title: 前端项目如何优雅配置 @ 别名（Webpack / Vite + TypeScript）
date: 2026-04-14
tags: [工程化, webpack, vite, typescript]
category: 工程化
description: 两步完成 @ 别名配置，让路径引用告别 ../../，并获得 TypeScript 智能提示。
---

# 前端项目如何优雅配置 @ 别名（Webpack / Vite + TypeScript）

## 前言

在项目里频繁看到 `../../../`、`../../` 这种相对路径时，代码虽然能跑，但可读性和可维护性都会下降。  
配置 `@` 别名后，引用路径会更清晰，也更容易快速定位文件。

比如：

```ts
// 配置前
import Header from "../../../components/Header";

// 配置后
import Header from "@/components/Header";
```

本文用两步讲清楚 `@` 别名配置，适用于常见的 Webpack / Vite 项目。


## 一、核心思路：让两个系统都认识 `@`

你只需要记住一句话：

1. **让打包工具认识 `@`**：代码才能被正确编译。
2. **让 TypeScript 认识 `@`**：编辑器才能正确跳转和智能提示。

两个步骤缺一不可。

## 二、第一步：配置打包工具

### 方案 1：Webpack 项目

在 `webpack.config.js` 中添加 `resolve.alias`：

```js
const path = require("path");

module.exports = {
  // ...其他配置
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
};
```

如果你是 Vue CLI 项目（`vue.config.js`），也可以这样写：

```js
const path = require("path");

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  },
};
```

### 方案 2：Vite 项目

在 `vite.config.ts`（或 `vite.config.js`）中添加：

```ts
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

## 三、第二步：配置 TypeScript 路径映射

在 `tsconfig.json` 中补充：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

配置完成后，TypeScript 才能正确识别 `@/xxx`，IDE 才能正常提示与跳转。

## 四、常见问题排查

### 1）改完不生效？

- 重启开发服务（`npm run dev` / `pnpm dev`）
- 重启 IDE 的 TS Server（有些编辑器不会立刻刷新路径映射）

### 2）`@` 指向错目录？

- 确认是否使用了正确的根目录（通常是项目根目录下的 `src`）
- 留意 `"src"` 和 `"./src"` 都可用，但建议团队统一一种写法

### 3）JS 项目需要配 `tsconfig` 吗？

- 纯 JS 项目可使用 `jsconfig.json` 写同样的 `baseUrl + paths` 配置
