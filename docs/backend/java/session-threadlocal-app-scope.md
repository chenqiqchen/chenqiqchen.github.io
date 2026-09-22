---
theme: channing-cyan
date: 2026-09-21
---

# Session、ThreadLocal 和应用级变量：先分清“作用域”，再选技术

 `Session`、`ThreadLocal`、全局变量都能“保存数据”，但本质上并不一样：

- `Session` 是会话级别的
- `ThreadLocal` 是请求级别的
- 应用级变量是全局级别的

## 1. 先说结论：三者的作用域不同

### 会话级别：`Session`

`Session` 的生命周期通常和用户登录会话绑定。一个用户从登录到退出、超时，都是同一个会话。此时保存在 `Session` 里的数据，对这个用户的后续请求都可见。

常见场景：

- 登录用户信息
- 用户购物车
- 用户偏好设置
- 验证码、权限状态

```java
HttpSession session = request.getSession();
session.setAttribute("user", user);
User loginUser = (User) session.getAttribute("user");
```

这里的关键是：同一个用户的不同请求，可以共享同一个 `Session`。而不同用户之间，通常是隔离的。

也就是说：

- 作用域：用户会话
- 生命周期：登录到超时/退出
- 典型意义：保存“当前用户相关”的状态

### 请求级别：`ThreadLocal`

`ThreadLocal` 的数据是和当前线程绑定的，不是和用户绑定的。它最典型的用途，是在同一条请求处理链路中，把上下文信息透传给后续调用，而不必一直手动往方法参数里塞。

```java
public class RequestContext {
    private static final ThreadLocal<User> USER = new ThreadLocal<>();

    public static void setUser(User user) {
        USER.set(user);
    }

    public static User getUser() {
        return USER.get();
    }

    public static void clear() {
        USER.remove();
    }
}
```

在过滤器或拦截器里设置，然后在后续 service 层读取：

```java
public class AuthFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        User user = ...;

        try {
            RequestContext.setUser(user);
            chain.doFilter(request, response);
        } finally {
            RequestContext.clear();
        }
    }
}
```

这里的关键是：

- `ThreadLocal` 绑定的是“当前线程”
- 同一个请求通常走同一个线程
- 请求结束后，一定要 `remove()`，否则线程复用时，可能出现脏数据

所以，`ThreadLocal` 更准确地说，是“请求级别/线程级别”的上下文数据，不是会话级别。

### 应用级别：全局共享状态

应用级数据的生命周期通常和应用启动同步，直到进程结束才结束。真正的“全局状态”往往放在单例 Bean、静态变量、配置中心、缓存等地方。

```java
@Component
public class AppConfig {
    private final Map<String, String> configMap = new ConcurrentHashMap<>();

    public String get(String key) {
        return configMap.get(key);
    }
}
```

或者：

```java
public class GlobalCache {
    public static final Map<String, Object> CACHE = new ConcurrentHashMap<>();
}
```

这种数据对所有用户、所有请求共享。它的特点是：

- 作用域：整个应用
- 生命周期：应用启动到关闭
- 适用场景：公共配置、全局缓存、系统级状态

但它也最容易带来线程安全问题，因为多个请求可能同时访问同一份数据。

## 2. 一张图理解三者的区别

可以把它们想成三种不同的“范围”：

- 会话级：用户打开网页到关闭页面/退出登录的这段时间
- 请求级：一次 HTTP 请求从进入到返回的这段时间
- 应用级：整个服务进程从启动到关闭的这段时间

对应关系大致是：

- `Session`：用户维度
- `ThreadLocal`：请求维度
- 全局变量/单例：应用维度

## 3. 实际开发中怎么选

### 场景一：保存登录用户信息

应该用 `Session`。

```java
session.setAttribute("loginUser", user);
```

这个信息本来就是和当前用户绑定的，而且在后续访问中要保持一致。

### 场景二：在请求链路中传递当前用户、TraceId

应该用 `ThreadLocal`，但必须清理。

```java
RequestContext.setUser(user);
RequestContext.setTraceId(traceId);
```

这样，同一请求调用链路中的多个对象都能拿到上下文，不需要每一层都显式传参。

### 场景三：保存系统配置、全局缓存、字典数据

应该用应用级对象，例如 Spring Bean、缓存、配置中心。

```java
@Component
public class CacheService {
    private final Map<String, Object> cache = new ConcurrentHashMap<>();
}
```

## 4. 一个更稳妥的思路

在企业项目中，通常推荐这样分层：

- `Session`：用户状态、登录态、用户偏好
- `ThreadLocal`：请求上下文、TraceId、当前用户（仅在链路中使用）
- 应用级缓存/Bean：公共配置、全局字典、系统级缓存

这样做的好处是：

- 语义更清晰
- 生命周期更明确
- 更容易排查问题
- 更少出现跨请求污染、跨用户串数据的问题

## 5. 总结

一句话概括：

- `Session` 是会话级别，适合存用户相关状态
- `ThreadLocal` 是请求级别，适合存请求链路中的上下文
- 应用级变量是全局级别，适合存系统公共配置和缓存
