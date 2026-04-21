---
theme: channing-cyan
date: 2026-04-20
---

# Vue 3 组合式函数（Hook）实战：把重复请求逻辑抽成可复用能力

多个页面都要请求相似数据，难道每个组件里都再写一遍 `loading + fetch + 渲染`？

短期看“复制粘贴”很快，长期看会带来 3 个明显成本：

- 维护成本高：接口字段改一次，要改多个组件。
- 容易不一致：A 页面有错误处理，B 页面没有。
- 组件变臃肿：业务模板和数据请求逻辑混在一起。

Vue 3 的组合式函数（通常也叫 Hook/Composable）正是为了解决这类“有状态逻辑复用”问题。

## 一、先看常见写法（逻辑全写在组件里）

下面是一个典型场景：组件加载后拉取列表数据，并处理 `loading` 状态。

```vue
<script setup lang="ts">
import { ref } from 'vue';

interface IData {
  fundCode: string;
  fundName: string;
}

const listData = ref<IData[]>([]);
const loading = ref(false);

const loadData = () => {
  loading.value = true;
  fetch('/public/mock/data.json')
    .then((res) => res.json())
    .then((res) => {
      listData.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

loadData();
</script>

<template>
  <div class="home">
    <template v-if="loading">
      <p>loading</p>
    </template>
    <template v-else>
      <ul v-for="item in listData" :key="item.fundCode">
        <li>{{ item.fundName }}</li>
      </ul>
    </template>
  </div>
</template>
```

这个写法本身没问题，但只要第二个页面也要同样逻辑，你就会开始重复写。

## 二、把请求逻辑提取成组合式函数

约定上，组合式函数通常使用驼峰命名并以 `use` 开头，例如：`useGetListData`。

```ts
import { ref } from 'vue';

interface IData {
  fundCode: string;
  fundName: string;
}

export const useGetListData = () => {
  const listData = ref<IData[]>([]);
  const loading = ref(false);

  const loadData = async () => {
    loading.value = true;
    try {
      const res = await fetch('/public/mock/data.json');
      const data = await res.json();
      listData.value = data.data ?? [];
    } finally {
      loading.value = false;
    }
  };

  loadData();

  return {
    listData,
    loading,
    loadData
  };
};
```

这里的核心思想很简单：  
把“状态 + 行为”封装到函数里，通过 `return` 暴露给业务组件使用。

## 三、组件里如何使用

```vue
<script setup lang="ts">
import { useGetListData } from './useGetListData';

const { listData, loading } = useGetListData();
</script>

<template>
  <div class="home">
    <template v-if="loading">
      <p>loading</p>
    </template>
    <template v-else>
      <ul v-for="item in listData" :key="item.fundCode">
        <li>{{ item.fundName }}</li>
      </ul>
    </template>
  </div>
</template>
```

你会发现：页面模板几乎不变，但组件本身变“薄”了，关注点更清晰。

## 四、为什么这种写法更适合真实项目

### 1）复用更直接

相同请求逻辑在多个页面复用，不再复制粘贴。

### 2）统一处理更容易

后续想增加 `error`、重试、取消请求、埋点上报，都可以在组合式函数内统一扩展。

### 3）更利于协作

组件负责“展示”，组合式函数负责“数据状态与行为”，职责边界清楚，团队协作更顺滑。

## 五、实战小建议

- 命名尽量语义化：`useXXX` 一眼能看出用途。
- 返回值按需暴露：只暴露业务需要的状态和方法，避免“全量透出”。
- 副作用可控：是否自动执行 `loadData()`，建议通过参数控制，便于复用。

当你在项目里看到重复的请求逻辑时，优先考虑提取 `useXXX`，通常都能显著提升可维护性。
