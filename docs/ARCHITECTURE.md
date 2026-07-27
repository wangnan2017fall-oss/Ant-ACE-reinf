# Architecture

## 分层

```text
Browser
  -> frontend
  -> contracts
  -> backend
  -> database / external systems
```

## 目录原则

1. `frontend` 和 `backend` 是运行边界。
2. 两端内部均按 ACE 产品业务板块组织。
3. `contracts` 是前后端唯一共享的接口协议来源。
4. `router` 只负责注册页面或接口，不承载业务逻辑。
5. `shared` 只保存真正跨模块复用的能力。
6. 每次修改遵循根目录 `SCOPE.md`。

## 当前状态

- 前端 Demo 已可运行。
- 后端尚未实现。
- contracts 尚未定义正式 schema。
- 本次结构调整不改变现有页面内容和交互。
