# Backend

该目录用于承载 ACE 后端服务。当前 Demo 尚未接入真实后端，本目录只建立研发边界，不提供虚构接口实现。

```text
src/
├── router/       后端总路由注册
├── modules/      与前端产品板块同名的业务模块
└── shared/       数据库、认证、日志、错误等公共能力
```

后端模块内部建议按 `routes / controller / service / repository / validator / model` 组织；仅在实际开始后端实现时创建对应文件。
