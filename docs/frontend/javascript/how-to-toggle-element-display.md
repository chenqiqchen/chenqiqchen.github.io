---
theme: channing-cyan
date: 2026-04-10
---

# 如何切换元素显示与隐藏

## 前言

在前端开发中，我们经常需要“显示/隐藏”某个元素，比如弹窗、提示条、加载状态等。  
这篇文章总结 3 种原生 JavaScript 常见做法，并给出它们在布局、交互和性能上的差异，帮助你按场景选择。


## 一、通过创建/销毁 DOM 元素切换显示

### 适用场景

- 元素不常出现，且每次显示都可以重新创建
- 希望隐藏后彻底从页面中移除，避免残留事件或状态

### 示例代码

```js
export const showDom = () => {
  const dom = document.createElement('div')
  dom.setAttribute('id', 'test')
  dom.innerHTML = 'test dom'
  document.body.appendChild(dom)
}

export const hideDom = () => {
  const dom = document.getElementById('test')
  if (dom) {
    document.body.removeChild(dom)
  }
  // dom?.remove()
}
```

### 说明

- `hideDom` 中既可以使用父元素的 `removeChild()`，也可以使用元素自身的 `remove()`。
- 这种方式是“真实移除节点”，再次显示时通常需要重建节点和相关逻辑。

---

## 二、通过切换 `display` 属性控制显示

### 适用场景

- 结构固定，元素在页面中长期存在
- 只需要快速切换显示状态

### 示例代码

先在页面中放置元素，并默认隐藏：

```html
<div id="test" style="display: none;">test dom</div>
```

再通过 JS 切换：

```js
export const showDom = () => {
  const dom = document.getElementById('test')
  dom?.style.setProperty('display', 'flex')
}

export const hideDom = () => {
  const dom = document.getElementById('test')
  dom?.style.setProperty('display', 'none')
}
```

### 说明

- `display: none` 会让元素脱离文档流，不占据布局空间。
- 再次显示时，浏览器会重新参与布局计算（可能触发重排）。

---

## 三、通过切换 `visibility` / `opacity` 控制显示

除了 `display`，也可以通过 `visibility` 或 `opacity` 控制视觉可见性。

### 示例代码

#### 1）`display`

```js
// 显示元素
element.style.display = 'block' // 或 'flex'、'grid' 等
// 隐藏元素
element.style.display = 'none'
```

#### 2）`visibility`

```js
// 显示元素
element.style.visibility = 'visible'
// 隐藏元素（保留布局空间）
element.style.visibility = 'hidden'
```

#### 3）`opacity`

```js
// 显示元素
element.style.opacity = '1'
// 隐藏元素（保留布局空间，默认仍可交互）
element.style.opacity = '0'

// 若需要“不可交互”，可额外禁用指针事件
element.style.pointerEvents = 'none'
```

### 差异对比

| 特性 | `display: none` | `visibility: hidden` | `opacity: 0` |
| --- | --- | --- | --- |
| 是否占据空间 | 否 | 是 | 是 |
| 是否可交互 | 否 | 否 | 是（默认） |
| 是否影响布局 | 是（可能触发重排） | 否（通常为重绘） | 否（通常为重绘） |

> 注意：`opacity: 0` 的元素默认仍可点击和聚焦。若需要彻底“不可操作”，请配合 `pointer-events: none`（必要时再处理可访问性属性）。

---

## 四、如何选型

- **需要彻底销毁节点**：选“创建/移除 DOM”。
- **需要简单开关、结构稳定**：优先 `display`。
- **需要保留布局并做过渡动画**：优先 `opacity` / `visibility`。

---

## 五、总结

页面中“显示与隐藏”不只是视觉问题，还会影响布局、交互和性能。  
建议先明确需求：是否保留空间、是否允许交互、是否需要动画，再选择合适的方案。

