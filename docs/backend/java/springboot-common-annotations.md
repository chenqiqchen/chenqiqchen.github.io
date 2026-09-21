---
theme: channing-cyan
date: 2026-09-21
---

# Spring Boot 开发中常见的注解

前言：Spring Boot 通过大量注解简化了项目配置和业务开发。本文按使用场景整理一些日常开发中最常见的注解，并配上简单示例，方便快速查阅。

## 一、启动与组件扫描

### 1. `@SpringBootApplication`

通常放在启动类上，是 Spring Boot 应用的入口注解。它组合了以下三个注解：

- `@SpringBootConfiguration`：标记当前类是 Spring Boot 配置类。
- `@EnableAutoConfiguration`：根据依赖自动配置 Spring Boot 功能。
- `@ComponentScan`：扫描当前包及其子包中的组件。

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

启动类通常放在项目的根包下，这样默认扫描范围才能覆盖 `controller`、`service`、`repository` 等子包。

### 2. `@ComponentScan`

指定 Spring 扫描组件的包路径。一般不需要单独配置，只有当启动类不在根包，或需要扫描额外模块时才使用。

```java
@SpringBootApplication
@ComponentScan({"com.example.user", "com.example.common"})
public class Application {
}
```

## 二、组件与依赖注入

### 3. `@Component`、`@Service`、`@Repository`

这三个注解都会把类注册为 Spring 容器中的 Bean，主要区别在于语义：

- `@Component`：通用组件。
- `@Controller`：控制层组件
- `@Service`：业务逻辑层组件。
- `@Repository`：数据访问层组件，还可以参与持久化异常转换。

```java
@Service
public class UserService {
    public User findById(Long id) {
        return null;
    }
}
```

### 4. `@Controller` 与 `@RestController`

- `@Controller`：表示 MVC 控制器，方法通常返回视图名称。
- `@RestController`：等价于 `@Controller` + `@ResponseBody`，方法返回值会直接作为 HTTP 响应体，常用于 REST API。

```java
@RestController
@RequestMapping("/users")
public class UserController {
    @GetMapping("/{id}")
    public User detail(@PathVariable Long id) {
        return userService.findById(id);
    }
}
```

### 5. `@Autowired`

`@Autowired` 默认按类型注入依赖，适合注入 Spring 容器中的 Bean。

```java
@Service
public class OrderService {
    @Autowired
    private UserService userService;
}
```

### 6. `@Resource`

`@Resource` 默认优先按名称注入依赖，也可以通过 `name` 属性明确指定 Bean 名称。

```java
@Service
public class OrderService {
    @Resource(name = "userServiceImpl")
    private UserService userService;
}
```

### 7. `@Primary`

当同一接口有多个 Bean，且大多数场景都希望使用其中一个时，可以在默认实现上添加 `@Primary`。

```java
@Primary
@Service
public class DefaultNotificationService implements NotificationService {
}
```

## 三、配置文件与环境

### 8. `@Value`

读取配置文件中的单个配置项。

```java
@Component
public class AppConfig {
    @Value("${app.name:demo}")
    private String appName;
}
```

`${app.name:demo}` 表示读取 `app.name`，没有配置时使用默认值 `demo`。

### 9. `@ConfigurationProperties`

适合批量绑定具有相同前缀的配置，比在多个字段上重复使用 `@Value` 更适合管理结构化配置。

```java
@Component
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {
    private String bucket;
    private int timeout;

    // getter、setter
}
```

对应配置：

```yaml
app:
  storage:
    bucket: user-files
    timeout: 30
```

### 10. `@Configuration` 与 `@Bean`

`@Configuration` 标记配置类，`@Bean` 用于把方法返回的对象注册到 Spring 容器中，适合注册第三方库对象或自定义基础设施。

```java
@Configuration
public class AppBeanConfiguration {
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
```

## 四、Web 接口开发

### 11. `@RequestMapping`、`@GetMapping` 等请求映射注解

`@RequestMapping` 可以定义路径和请求方法，`@GetMapping`、`@PostMapping`、`@PutMapping`、`@DeleteMapping` 是更简洁的专用写法。

```java
@RestController
@RequestMapping("/users")
public class UserController {
    @GetMapping
    public List<User> list() {
        return userService.list();
    }

    @PostMapping
    public User create(@RequestBody CreateUserRequest request) {
        return userService.create(request);
    }
}
```

### 12. `@PathVariable`、`@RequestParam`、`@RequestBody`

- `@PathVariable`：读取路径参数，例如 `/users/{id}` 中的 `id`。
- `@RequestParam`：读取查询参数，例如 `/users?page=1` 中的 `page`。
- `@RequestBody`：把 JSON 请求体转换为 Java 对象。

```java
@GetMapping("/{id}")
public User detail(@PathVariable Long id,
                   @RequestParam(defaultValue = "false") boolean brief) {
    return userService.detail(id, brief);
}
```

### 13. `@RequestHeader` 与 `@CookieValue`

分别用于读取请求头和 Cookie 中的值，例如读取登录凭证或客户端标识。

```java
@GetMapping("/profile")
public User profile(@RequestHeader("Authorization") String authorization,
                    @CookieValue("clientId") String clientId) {
    return userService.profile(authorization, clientId);
}
```

### 14. `@ResponseBody` 与 `@ResponseStatus`

- `@ResponseBody`：将方法返回值直接写入响应体。
- `@ResponseStatus`：指定接口返回的 HTTP 状态码。

`@RestController` 已经隐含了 `@ResponseBody`。

```java
@ResponseStatus(HttpStatus.CREATED)
@PostMapping
public User create(@RequestBody CreateUserRequest request) {
    return userService.create(request);
}
```

## 五、参数校验

### 15. `@Valid`、`@Validated` 与校验注解

`@Valid` 和 `@Validated` 用于触发 Bean Validation。常见字段注解包括：

- `@NotNull`：不能为 `null`。
- `@NotBlank`：字符串不能为 `null`，且去除空白后不能为空。
- `@Size`：限制字符串、集合或数组长度。
- `@Min`、`@Max`：限制数值范围。
- `@Email`：校验邮箱格式。

```java
public class CreateUserRequest {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @Email(message = "邮箱格式不正确")
    private String email;

    // getter、setter
}
```

在 Controller 参数上使用 `@Valid`：

```java
@PostMapping
public User create(@Valid @RequestBody CreateUserRequest request) {
    return userService.create(request);
}
```

如果需要分组校验或校验方法参数，可以使用 `@Validated`。使用校验注解前，需要引入 Bean Validation 实现，Spring Boot 项目通常添加 `spring-boot-starter-validation`。

## 六、事务与异常处理

### 16. `@Transactional`

声明一个方法或类需要事务管理。方法中的多个数据库操作要么全部成功，要么在出现异常时回滚。

```java
@Transactional
public void createOrder(Order order) {
    orderRepository.save(order);
    stockService.deduct(order.getProductId(), order.getQuantity());
}
```

常见注意事项：

- 通常放在 Service 层，而不是 Controller 层。
- 默认对运行时异常回滚，受检异常需要根据业务配置 `rollbackFor`。

### 17. `@ControllerAdvice` 与 `@ExceptionHandler`

用于集中处理 Controller 抛出的异常，统一返回错误信息。

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleUserNotFound(UserNotFoundException exception) {
        return new ErrorResponse("USER_NOT_FOUND", exception.getMessage());
    }
}
```

`@RestControllerAdvice` 是 `@ControllerAdvice` 和 `@ResponseBody` 的组合，适合 REST 接口项目。

## 七、条件装配与其他常用注解

### 18. `@Profile`

根据当前环境决定是否注册 Bean。

```java
@Profile("dev")
@Bean
public PaymentService mockPaymentService() {
    return new MockPaymentService();
}
```

只有激活 `dev` profile 时，这个 Bean 才会生效。

### 19. `@ConditionalOnProperty`

当配置项满足条件时才创建 Bean，常用于开关某个功能。

```java
@Bean
@ConditionalOnProperty(name = "feature.audit.enabled", havingValue = "true")
public AuditService auditService() {
    return new AuditService();
}
```

### 20. `@Async` 与 `@Scheduled`

- `@Async`：让方法异步执行，需要配合启动类上的 `@EnableAsync`。
- `@Scheduled`：按固定时间或间隔执行任务，需要配合 `@EnableScheduling`。

```java
@Service
public class ReportService {
    @Async
    public void generateAsync() {
        // 异步生成报表
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanExpiredReports() {
        // 每天凌晨 2 点清理数据
    }
}
```

## 八、注解选择小结

| 使用场景 | 常见注解 |
| --- | --- |
| 启动项目 | `@SpringBootApplication` |
| 注册组件 | `@Component`、`@Service`、`@Repository` |
| 提供接口 | `@RestController`、`@RequestMapping`、`@GetMapping` |
| 接收参数 | `@PathVariable`、`@RequestParam`、`@RequestBody` |
| 读取配置 | `@Value`、`@ConfigurationProperties` |
| 注册配置 Bean | `@Configuration`、`@Bean` |
| 参数校验 | `@Valid`、`@Validated`、`@NotBlank` |
| 事务控制 | `@Transactional` |
| 全局异常 | `@RestControllerAdvice`、`@ExceptionHandler` |
| 定时与异步 | `@Scheduled`、`@Async` |

实际开发中不需要追求“注解越多越好”。先明确组件职责和调用边界，再选择能表达当前意图的注解，代码会更容易理解和维护。