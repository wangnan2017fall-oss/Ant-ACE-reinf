# Frontend

前端基于 React + Vite，业务模块名称与 ACE 产品导航保持一致。

```text
src/
├── router/       页面路由
├── shell/        Sidebar、Header、Layout 等产品外壳
├── modules/      按业务板块组织的页面和功能
├── shared/       前端公共组件
├── App.jsx       应用外壳组装
└── main.jsx      启动入口
```

业务页面优先在自己的模块内完成，不应直接依赖其他业务模块的内部文件。
