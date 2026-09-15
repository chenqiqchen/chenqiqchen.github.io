---
title: 【代码优化】记一次邮件复制功能的代码优化
date: 2026-06-10
tags: [前端, Vue, 代码优化, 复制功能, 经验总结]
category: 经验总结
description: 记录一次邮件复制功能的代码优化，把展示逻辑与复制逻辑解耦，避免重复维护内容，提升页面一致性和可维护性。
---

# 记一次邮件复制功能的代码优化


需求很简单：按行展示后端返回的邮件内容，按产品类型决定某行是否显示，点击复制时**保留换行格式**。

## 现状问题

展示用 `v-if`，复制却按 `type` 再拼一遍字符串：

```vue
<template>
  <div class="email-content">
    <p>Dear team,</p>
    <p>{{ data.greet }}</p>
    <br />
    <p>label1: {{ data.value1 }}</p>
    <p v-if="[1, 3].includes(type)">label2: {{ data.value2 }}</p>
    <p>label3: {{ data.value3 }}</p>
    <p v-if="[2].includes(type)">label4: {{ data.value4 }}</p>
  </div>
  <button @click="handleCopy">复制</button>
</template>

<script setup lang="ts">
const handleCopy = () => {
  let content = ''
  if (type.value === 1) {
    content = `Dear team,
${data.value.greet}

label1: ${data.value.value1}
label2: ${data.value.value2}
label3: ${data.value.value3}`
  } else if (type.value === 2) {
    content = `Dear team,
${data.value.greet}

label1: ${data.value.value1}
label3: ${data.value.value3}
label4: ${data.value.value4}`
  }
  copyText(content)
}
</script>
```

产品类型一多，`if` 就膨胀。改一行文案，HTML 和 JS 都要动，两边很容易漏改。

核心问题：**展示和复制各维护了一份内容**。

## 方案一：展示即复制

既然页面已经按类型渲染好了，复制时直接读 DOM 即可。

```vue
<div id="email-content" class="email-content">
  <!-- 原有模板不变 -->
</div>
```

```ts
const handleCopy = () => {
  const dom = document.getElementById('email-content')
  if (!dom) return

  const content = Array.from(dom.children)
    .map((el) => (el as HTMLElement).innerText)
    .join('\n')

  copyText(content)
}
```

之后只改 HTML，`v-if` 隐藏的行不会进 `children`，复制结果自动对齐。

注意用 `innerText` 而不是 `innerHTML`，避免把标签一起拷进去。

## 方案二：一份文本，两处使用

反过来：先拼好要复制的字符串，页面用 `<pre>` 原样展示。

```vue
<template>
  <div class="wrap">
    <pre class="email-content">{{ emailText }}</pre>
    <button @click="handleCopy">复制</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const type = ref(2)
const data = ref({
  greet: 'greet',
  value1: 'value1',
  value2: 'value2',
  value3: 'value3',
  value4: 'value4',
})

const emailText = computed(() => {
  const { greet, value1, value2, value3, value4 } = data.value

  return [
    'Dear team,',
    greet,
    '',
    `label1: ${value1}`,
    [1, 3].includes(type.value) ? `label2: ${value2}` : null,
    `label3: ${value3}`,
    type.value === 2 ? `label4: ${value4}` : null,
  ]
    .filter((line) => line !== null)
    .join('\n')
})

const handleCopy = () => {
  copyText(emailText.value)
}
</script>
```

不满足条件的行返回 `null` 再滤掉；空字符串 `''` 留下来，用来占空行。不要用 `filter(Boolean)`，空行会被误删。

展示和复制共用 `emailText`，改文案只动一处。

## 怎么选

| | 方案一：读 DOM | 方案二：computed |
| --- | --- | --- |
| 单源 | 模板 | `emailText` |
| 改动范围 | 只改 HTML | 只改数组 |
| 注意点 | 依赖已渲染的 DOM | 空行不要被 `filter` 掉 |

结构简单、以复制为准，用方案二；

希望正文长得像真实邮件、用 `v-if` 控制行，用方案一。

## 补充

**`children` vs `childNodes`**

- `children`：只有元素节点（`p`、`br`）
- `childNodes`：还包括文本节点、注释节点。Vue 模板里标签之间的换行也会进来，复制时容易多出空行

所以方案一用 `children`。

**`innerText` vs `innerHTML` vs `outerHTML`**

- `innerText`：可见文本，适合复制
- `innerHTML`：内部 HTML，可能带标签
- `outerHTML`：包含元素自身

**复制实现**

```ts
export const copyText = (text: string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
```
