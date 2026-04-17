---
theme: channing-cyan
date: 2026-04-14
---
# 【git】代码双仓库备份指南

## 前言

鸡蛋不要放在同一个篮子里。

代码仓库也是如此。无论是 GitHub 突然访问不了，还是公司 GitLab 服务器意外宕机，一份备份都能让你高枕无忧。

本文介绍 **三种**简单实用的 Git 多仓库备份方案，从命令行到平台配置，总有一种适合你。

## 方法一：单远程名 + 多 URL（一键推送）

**核心思路**：给同一个 `origin` 挂载多个推送地址，`git push` 一次搞定。

```bash
# 1. 设置主仓库地址
git remote add origin https://github.com/yourname/repo.git

# 2. 追加备份仓库地址（关键步骤）
git remote set-url --add origin https://gitlab.com/yourname/repo.git

# 3. 验证配置
git remote -v
```

执行 `git remote -v` 后，你会看到类似输出：

    origin  https://github.com/yourname/repo.git (fetch)
    origin  https://github.com/yourname/repo.git (push)
    origin  https://gitlab.com/yourname/repo.git (push)

**注意**：`fetch` 只会从第一个地址拉取，但 `push` 会同时推送到所有地址。

现在只需正常推送，两个仓库就能同步更新：

```bash
git push origin main
```

如果需要移除远程配置：

```bash
git remote remove origin
```

**✅ 优点**：操作简单，日常开发几乎无感知

**⚠️ 注意**：如果某个仓库推送失败，整个 push 操作会报错，但已成功的仓库不会回滚

## 方法二：多远程名分别管理（灵活控制）

**核心思路**：为每个仓库设置独立的远程名称，按需推送。

```bash
# 设置主开发仓库
git remote add origin https://github.com/username/repo.git

# 设置备份仓库（起一个有辨识度的名称）
git remote add gitlab https://gitlab.com/username/repo.git
```

日常使用时，可以灵活选择推送目标：

```bash
# 仅推送到 GitHub
git push origin main

# 仅推送到 GitLab
git push gitlab main

# 推送所有分支到 GitHub
git push origin --all

# 推送所有标签到 GitLab
git push gitlab --tags
```

如果觉得每次手动推两遍太麻烦，可以写一个简单的 alias：

```bash
# 在 ~/.gitconfig 中添加
[alias]
    pushall = !git push origin && git push gitlab
```

之后只需 `git pushall` 即可。

**✅ 优点**：推送目标明确，可灵活控制同步范围和时机

**⚠️ 适用场景**：主仓库和备份仓库需要区别对待，比如备份仓库只同步 `main` 分支

## 方法三：平台镜像功能（省心省力）

不想折腾命令行？部分代码托管平台提供 **仓库镜像** 功能，配置一次，自动同步。

### GitLab 镜像配置

1.  进入 GitLab 仓库 → **设置** → **仓库**
2.  展开 **「镜像仓库」** 部分
3.  选择 **「推送镜像」** 方向
4.  填写目标仓库地址和认证信息

![GitLab 镜像配置示例](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/bcb1fbcc9853442ca4552fd944e9f8de~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgRXhwbG9yZQ==:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiNzIwOTA5MjQ4NTAyNzgyIn0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1776760750&x-orig-sign=oMkMVCdfXDlHXkw24hLVWIWut10%3D)

**✅ 优点**：零本地操作，配置一次持续同步

**⚠️ 注意**：同步存在一定延迟，且依赖平台服务的稳定性

### Gitee 镜像配置

1.  进入 Gitee 仓库 → **管理** 页面
2.  选择 **「仓库镜像管理」**
3.  点击 **「添加镜像」**
4.  填入 GitHub 仓库地址及访问令牌

![Gitee 镜像配置示例](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/109eafa4f3de4d0b9ffe04dd57b273cb~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgRXhwbG9yZQ==:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiNzIwOTA5MjQ4NTAyNzgyIn0%3D&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1776760750&x-orig-sign=83cc0n%2FGQuNfKIA7Acl6ddPE2fc%3D)

## 三种方法对比

| 维度          | 方法一：单远程多 URL | 方法二：多远程名 | 方法三：平台镜像 |
| ----------- | ------------ | -------- | -------- |
| **配置难度**    | ⭐ 简单         | ⭐ 简单     | ⭐⭐ 需平台操作 |
| **推送方式**    | 自动同时推送       | 手动选择目标   | 全自动      |
| **灵活性**     | 低            | 高        | 中        |
| **适用场景**    | 完全同步         | 选择性同步    | 跨平台镜像    |
| **是否需本地操作** | 是            | 是        | 否        |

## 写在最后

三种方法没有绝对的优劣，关键是匹配你的实际需求：

*   **图省事** → 方法一，`git push` 一把梭
*   **要灵活** → 方法二，精确控制每个仓库
*   **全自动** → 方法三，平台帮你搞定一切

无论选择哪种方式，**多一份备份，多一份安心**。
