---
theme: channing-cyan
---

# React 常用知识点速查

前言：本文总结React 常用知识点，给出简洁的说明和示例，方便记忆和速查

---

## 1. JSX 基础

- JSX 中可使用 `{}` 嵌入 JS 表达式。
- 渲染原生 HTML 片段使用 `dangerouslySetInnerHTML`。

```jsx
function App() {
  const rawHtmlData = {
    __html: "<span>富文本内容<i>斜体</i><b>加粗</b></span>",
  };

  return <div dangerouslySetInnerHTML={rawHtmlData} />;
}
```

---

## 2. 循环渲染（`map` + `key`）

- 列表渲染通常使用 `map`。
- `key` 必须稳定且唯一，优先使用后端 `id`。

```jsx
<ul>
  {list.map((item) => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>
```

---

## 3. 条件渲染

### 简单场景：`&&`、三元表达式

```jsx
{/* 逻辑与 */}
{isLogin && <span>this is span</span>}

{/* 三元表达式 */}
{isLogin ? <span>jack</span> : <span>loading...</span>}
```

### 复杂场景：函数返回 JSX
可使用if语句，switch语句或策略模式，判断返回不同的JSX

```jsx
function App() {
  const type = 1; // 0 | 1 | 3

  function getArticleJSX() {
    if (type === 0) return <div>无图模式模板</div>;
    if (type === 1) return <div>单图模式模板</div>;
    if (type === 3) return <div>三图模式模板</div>;
    return null;
  }

  return <>{getArticleJSX()}</>;
}
```

---

## 4. 事件绑定

- 语法：`on + 事件名 = {事件处理函数}`（驼峰命名）。
- 传参通常使用箭头函数。
- 同时传事件对象和自定义参数时，手动透传 `e`。

```jsx
// 基础掉用，使用事件对象
function App() {
  const handleClick = (e) => {
    console.log("点击了按钮", e);
  };
  return (
   <div>
     <button onClick={handleClick}>点击</button>
   </div>
);
}

// 传递自定义参数
function App() {
  const handleClick = (name) => {
    console.log("点击了按钮", name);
  };
  return (
    <div>
      <button onClick={() => handleClick('zs')}>点击</button>
    </div>
  );
}

// 同时传递事件对象+自定义参数
function App() {
  const handleClick = (e, name) => {
    console.log("点击了按钮", e, name);
  };
  return (
    <div>
      <button onClick={(e) => handleClick(e, 'zs')}>点击</button>
    </div>
  );
}
```

---

## 5. 组件基础

- 组件本质是首字母大写的函数（函数声明或箭头函数都可以）。
- 组件内部包含状态、逻辑和 UI，使用时像标签一样书写。

```jsx
function Welcome() {
  return <h1>Hello React</h1>;
}
```

---

## 6. CSS 样式

- 行内样式：`style={ { fontSize: "16px" } }`
- 类名：`className="xxx"`
- 状态控制类名（条件拼接）：

```jsx
{tabs.map((item) => (
  <span
    key={item.type}
    className={`nav-item ${item.type === type ? "active" : ""}`}
    onClick={() => handleTabChange(item.type)}
  >
    {item.text}
  </span>
))}
```

---

## 7. `useState` 状态管理

- `const [state, setState] = useState(initialValue)`
- 初始值只在首次渲染生效，后续渲染不会重新初始化。
- 状态是只读的：更新时用“替换”，不要直接修改原对象/原数组。
- 依赖旧值更新时，优先函数式写法。

```jsx
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    setCount(count + 1);
    // setCount((preCount) => preCount +1);
  }
  return (
    <div>
    <button onClick={handleClick}>{count}</button>
    </div>
  );
}
```

对象更新示例：

```jsx
const [form, setForm] = useState({ username: "zhangsan", password: "" });
setForm({ ...form, password: "123456" });
```

---

## 8. `useEffect`

`useEffect(effect, deps)` 常用于请求数据、订阅、定时器等副作用。

- 不传依赖：每次渲染后都执行。
- 传空数组 `[]`：仅首次渲染后执行一次。
- 传具体依赖 `[a, b]`：首次渲染 + 依赖变化时执行。
- 清理函数用于取消订阅、清除定时器等：

```jsx
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
}, []);
```



---

## 9. `useRef`

- 获取 DOM：`ref={inputRef}`，`inputRef.current.focus()`
- 存储不会触发重渲染的可变值（如定时器 id）

```jsx
const inputRef = useRef(null);
inputRef.current?.focus();
```

---

## 10. 受控组件 vs 非受控组件

- 受控组件：表单值由 React 状态控制（`value + onChange`）,初始状态+更新事件函数。
- 非受控组件：值由 DOM 自己维护，通常用 `ref` 获取当前值。


```jsx
// 受控
function App(){
  const [value, setValue] = useState('')
  return (
    <input 
      type="text" 
      value={value} 
      onChange={e => setValue(e.target.value)}
    />
  )
}

```

```jsx
// 非受控
function App(){
  const inputRef = useRef(null)
  const onChange = ()=>{
    console.log(inputRef.current.value)
  }
  return (
    <input 
      type="text" 
      ref={inputRef}
      onChange={onChange}
    />
    )
}
```

---

## 11. 组件通信

- 父传子：`props`
- 插槽能力：`props.children`
- 子传父：父传函数给子，子调用并回传参数
- 兄弟通信：状态提升（共享父组件中转）
- 跨层通信：`Context`
- 更复杂全局状态：`Redux`（或其他状态库）

---

## 12. `useContext`

1. `createContext` 创建上下文对象  
2. 顶层用 `Provider` 提供 `value`  
3. 子孙组件用 `useContext` 消费数据

```jsx
const ThemeContext = createContext("light");

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  );
}
```

---

## 13. Hooks 使用规则

1. 只能在函数组件或自定义 Hook 中调用。
2. 只能在组件顶层调用，不能写在 `if/for/switch/普通函数` 内。

---

## 14. 自定义 Hook

- 命名必须以 `use` 开头。
- 目的：复用“状态 + 副作用逻辑”。

```jsx
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue((v) => !v);
  return [value, toggle];
}
```

---

## 15. `useReducer`

适合复杂状态流转或多分支更新。

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "INC":
      return state + 1;
    case "DEC":
      return state - 1;
    case "SET":
      return action.payload;
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, 0);
dispatch({ type: "INC" });
dispatch({ type: "SET", payload: 100 });
```

---

## 16. `useMemo`（缓存值）

- 在依赖不变时复用计算结果，减少重复计算。
- 常用于缓存“昂贵计算结果”或“稳定引用（数组/对象）”。

```jsx
const result = useMemo(() => heavyCalc(count1), [count1]);

const list = useMemo(() => [1, 2, 3], []);
```

---

## 17. `React.memo`（缓存组件）

- 当 `props` 未变化时跳过子组件重渲染。
- React 会对 props 做浅比较（`Object.is`）。

```jsx
const MemoComponent = memo(function SomeComponent(props) {
  return <div>{props.value}</div>;
});
```

---

## 18. `useCallback`（缓存函数）

- 缓存函数引用，避免子组件因函数地址变化而无意义重渲染。

```jsx
const changeHandler = useCallback((value) => {
  console.log(value);
}, []);
```

---

## 19. `forwardRef`

- 作用：让父组件拿到子组件内部的 DOM/实例能力。
- React 19 中 `ref` 可像普通 prop 一样传递到函数组件，但很多项目仍大量使用 `forwardRef`，兼容性更好。

```jsx
import { forwardRef, useRef } from 'react'

const MyInput = forwardRef(function Input(props, ref) {
  return <input type="text" {...props} ref={ref} />
}, [])

function App() {
  const ref = useRef(null)
  const focusHandle = () => {
    ref.current.focus()
  }
  return (
    <div>
      <MyInput ref={ref} />
      <button onClick={focusHandle}>focus</button>
    </div>
  )
}
```

---

## 20. `useImperativeHandle`

- 用于“自定义 ref 暴露内容”，而不是直接暴露整个 DOM。

```jsx
import { forwardRef, useImperativeHandle, useRef } from 'react'

const MyInput = forwardRef(function Input(props, ref) {
  // 实现内部的聚焦逻辑
  const inputRef = useRef(null)
  const focus = () => inputRef.current.focus()

  // 暴露子组件内部的聚焦方法
  useImperativeHandle(ref, () => {
    return {
      focus,
    }
  })

  return <input {...props} ref={inputRef} type="text" />
})

function App() {
  const ref = useRef(null)

  const focusHandle = () => ref.current.focus()

  return (
    <div>
      <MyInput ref={ref} />
      <button onClick={focusHandle}>focus</button>
    </div>
  )
}
```

---

## 21. `useLayoutEffect`

- `useEffect`：浏览器绘制后异步执行，不阻塞渲染。
- `useLayoutEffect`：DOM 更新后、绘制前同步执行，会阻塞渲染。
- 场景：需要在绘制前读取布局并立即修正（避免闪动）。

---

## 22. 路由懒加载：`lazy + Suspense`

```jsx
import { lazy, Suspense } from "react";

const Home = lazy(() => import("@/pages/Home"));

function App() {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <Home />
    </Suspense>
  );
}
```

---

## 高频易错点（建议重点记）

- `key` 不要用随机值或 `index`（除非列表完全静态）。
- 更新对象/数组状态时必须返回新引用。
- `useEffect` 依赖项写全，避免闭包拿到旧值。
- 性能优化优先级：先排查真实瓶颈，再使用 `memo/useMemo/useCallback`。
- `dangerouslySetInnerHTML` 只用于可信内容，避免 XSS 风险。
