---
theme: channing-cyan
date: 2026-04-14
---

# Vue 3：打开弹窗组件的 3 种常用方式

在实际项目中，弹窗（Dialog/Modal）通常会拆成独立组件，这样更利于复用、维护和团队协作。  
本文结合 `Vue 3 + Ant Design Vue 3.x`，整理 3 种常见的“打开弹窗”方式，并给出各自适用场景与选型建议。

## 一、`props + emit`：经典父子通信

这种方式由父组件维护弹窗显隐状态，子组件通过事件通知父组件关闭弹窗，职责清晰、可读性高。

### 父组件

```vue
<template>
  <div class="home">
    <a-button @click="handleOpenDialog">打开对话框</a-button>
    <MyModal :visible="visible" @close-modal="handleCloseDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MyModal from './MyModal.vue';

const visible = ref(false);
const handleOpenDialog = () => {
  visible.value = true;
};
const handleCloseDialog = () => {
  visible.value = false;
};
</script>
```

### 子组件（弹窗）

```vue
<template>
  <a-modal :visible="props.visible" title="Basic Modal" @cancel="handleClose" @ok="handleOK">
    <p>Some contents...</p>
  </a-modal>
</template>
<script setup lang="ts">
interface IProps {
  visible: boolean;
}
const props = withDefaults(defineProps<IProps>(), {
  visible: false
});

const emit = defineEmits(['closeModal']);

const handleOK = () => {
  emit('closeModal');
  // 其他逻辑
};
const handleClose = () => {
  emit('closeModal');
  // 其他逻辑
};
</script>
```

### 特点

- 优点：语义直观，父组件统一管理状态，便于排查问题。
- 缺点：多层组件传递时会有“事件透传”成本。

---

## 二、`ref + defineExpose`：父组件直接调用子组件方法

这种方式通过组件实例调用子组件暴露的方法，适合“命令式”打开弹窗。

### 父组件

```vue
<template>
  <div class="home">
    <a-button @click="handleOpenDialog">打开对话框</a-button>
    <MyModal ref="myModalRef" />
  </div>
</template>
<script setup lang="ts">
import MyModal from './MyModal.vue';

const myModalRef = ref<InstanceType<typeof MyModal> | null>(null);
//获取子组件的组件实例

const handleOpenDialog = () => {
  myModalRef.value?.handleOpen();
};
</script>
```

### 子组件（弹窗）

```vue
<template>
  <a-modal v-model:visible="visible" title="Basic Modal" @cancel="handleClose" @ok="handleOK">
    <p>Some contents...</p>
  </a-modal>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);

const handleOpen = () => {
  visible.value = true;
  // 其他逻辑
};
const handleClose = () => {
  visible.value = false;
  // 其他逻辑
};

const handleOK = () => {
  visible.value = false;
  // 其他逻辑
};

defineExpose({
  handleOpen,
  handleClose
});
</script>
```

### 特点

- 优点：调用直接，父组件逻辑简洁，适合按钮触发类场景。
- 缺点：父组件与子组件耦合更强，不适合跨层级复杂通信。

---

## 三、组件 `v-model`：双向绑定最简洁

这种方式本质是 `props + emit('update:xxx')` 的语法糖，业务中使用非常普遍。

### 父组件

```vue
<template>
  <div class="home">
    <a-button @click="handleOpenDialog">打开对话框</a-button>
    <MyModal v-model:visible="visible" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import MyModal from './MyModal.vue';

const visible = ref(false);
const handleOpenDialog = () => {
  visible.value = true;
};
</script>
```

### 子组件（弹窗）

```vue
<template>
  <a-modal :visible="props.visible" title="Basic Modal" @cancel="handleClose" @ok="handleOk">
    <p>Some contents...</p>
  </a-modal>
</template>

<script setup lang="ts">
interface IProps {
  visible: boolean;
}
const props = withDefaults(defineProps<IProps>(), {
  visible: false
});

const emit = defineEmits(['update:visible']);

const handleClose = () => {
  emit('update:visible', false);
  // 其他逻辑
};
const handleOk = () => {
  emit('update:visible', false);
  // 其他逻辑
};
</script>
```

### 特点

- 优点：写法统一、模板简洁，符合 Vue 3 组件设计习惯。
- 缺点：需要规范命名（`v-model:visible` 对应 `update:visible`），否则易出错。

---

## 四、实战建议

1. 弹窗尽量独立成组件，避免页面文件过重。  
2. 明确“状态归属”：是父组件管控，还是子组件自管。  
3. 团队内统一一种主方案（通常是 `v-model`），减少维护成本。  


---

## 六、总结

这 3 种方式本质都是在管理“弹窗可见状态”，差异在于状态放在哪里、由谁驱动。  
实际项目建议以 `v-model` 作为默认方案，`props + emit` 作为清晰通信方案，`ref + defineExpose` 作为特定场景补充方案。

