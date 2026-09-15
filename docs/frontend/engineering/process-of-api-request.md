---
title: 本地 Vite 和测试 Nginx，请求到底怎么走
date: 2026-09-15
tags: [vite, nginx, 前端工程化, 接口代理, 调试排查]
category: 工程化
description: 讲清楚本地 Vite 开发环境和测试环境 Nginx 的请求链路，区分代理、跨域和静态资源来源，帮助前端更准确地定位接口问题。
---

# 本地 Vite 和测试 Nginx，请求到底怎么走

本地能调通，一上测试就 404、跨域，或打到了另一套后端。很多时候不是接口写错了，而是没分清：**开发环境是 Vite 在接请求，测试环境是 Nginx 在接请求**。

下文域名均为示例：

- 测试站点：`http://app.test.example.com`
- CDN：`https://cdn.example.com`
- 内网后端：`http://10.0.0.10:8101`

---

## 先看结论

| | 测试环境 | 开发环境 |
|---|---|---|
| 入口 | Nginx（`app.test.example.com`） | 本地 Vite 开发服务器 |
| 页面 / 打包后的 JS、CSS | Nginx 返回 dist | Vite 本地编译返回 |
| 接口 | `/api` → Nginx 转发到后端 | `/dev` → Vite proxy 转发 |
| CDN 资源 | 浏览器直连 `cdn.example.com` | 同样直连 CDN |

开发环境的接口会不会经过 Nginx，取决于代理目标配的是测试域名，还是内网机器。

---

## 为什么开发要走 Vite 代理

浏览器有同源策略。页面在 `http://localhost:9000`，接口若直接请求 `http://app.test.example.com/api`，就会跨域。

Vite 代理的做法是：浏览器只请求同源的 `/dev`，由开发服务器在 Node 侧转发到真实后端。浏览器看到的始终是同源，跨域问题被代理消掉。

所以 `/dev` 不是后端真实路径，只是本地给代理用的前缀。

---

## 测试环境：先到 Nginx

浏览器访问的是已经 build 好的前端，第一站是 Nginx。

```
浏览器
  ├─ HTML / JS / CSS 等站点静态资源 → Nginx 直接返回 dist
  ├─ 部分图片 / 字体等           → https://cdn.example.com
  └─ /api/... 接口              → Nginx 反代到后端
                                 （常见路径：Gateway → 各微服务）
```

接口走同源 `/api`，实际请求形如 `http://app.test.example.com/api/user`。

对应的 Nginx 可以简化成：

```nginx
server {
    listen 80;
    server_name app.test.example.com;

    # 站点静态资源
    location / {
        root /var/www/dist;
        try_files $uri $uri/ /index.html;
    }

    # 接口转给后端
    location /api/ {
        proxy_pass http://gateway:8080/;
    }
}
```

要点：

- 站点静态资源一般由 Nginx 返回，接口由 Nginx 转走。
- 不是所有静态资源都来自 Nginx。CDN 上的资源，浏览器会直接请求 `cdn.example.com`。
- Nginx 后面通常还有 Gateway，不是 Nginx 直接打到某一台业务机。Nginx 负责域名、静态文件和 `/api` 分流；Gateway 再按服务名做鉴权、路由。

---

## 开发环境：先到 Vite

本地用 Vite 起前端：

- 页面入口：`http://localhost:9000`
- 接口前缀：`/dev`
- 代理目标：`http://app.test.example.com/api`（也可以改成内网后端）

代理指向测试环境时，链路是：

```
浏览器 → Vite 开发服务器（http://localhost:9000）
  ├─ 源码、HMR、本地静态 → Vite 自己处理（不经过 Nginx）
  └─ /dev/...          → Vite proxy
                          → http://app.test.example.com/api/...
                          → 测试环境 Nginx
                          → Gateway / 后端
```

Vite 本身是开发服务器，proxy 只是其中一块：只有匹配到的前缀才会转发，页面、HMR、源码模块都在本地编译返回。

对应配置可以写成：

```ts
// vite.config.ts
export default {
  server: {
    port: 9000,
    proxy: {
      '/dev': {
        target: 'http://app.test.example.com/api',
        changeOrigin: true,
      },
    },
  },
}
```

浏览器请求 `http://localhost:9000/dev/user`，Vite 转发到 `http://app.test.example.com/api/user`。

---

## 两个容易混的点

### 1. 开发环境不一定经过 Nginx

代理目标是可切换的。例如改成直连内网后端：

```ts
target: 'http://10.0.0.10:8101'
```

这时链路变成：

```
Vite proxy → http://10.0.0.10:8101
```

中间没有测试环境的 Nginx。本地能调通，只说明打到了当前 `target`，不代表测试环境的 Nginx 规则也一定正确。

只有 `target` 指向 `http://app.test.example.com/api` 时，才是「Vite → Nginx → 后端」，本地接口和测试环境走同一套入口。

### 2. 静态资源来源不只有一层

- 测试：页面和打包产物走 Nginx；部分图片、字体走 `cdn.example.com`。
- 开发：页面和模块走 Vite；CDN 资源仍然直连 `cdn.example.com`。

排查「资源 404」时，先看请求域名：是本地、测试站点，还是 CDN。

## 记住这三句

1. 测试环境：先 Nginx。页面看 dist，接口看 `/api`。
2. 开发环境：静态看 Vite，接口看 proxy。
3. 代理目标决定过不过 Nginx：指向测试域名会经过；指向内网后端会跳过。
