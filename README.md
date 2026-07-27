# Bettr Credit Engine Demo

ACE 产品 Demo 采用前后端与接口协议分区、业务模块对齐产品架构的目录组织方式。

## 目录入口

- `frontend/`：当前可运行的 React + Vite 前端 Demo。
- `backend/`：后端边界与业务模块目录，当前尚未接入真实服务。
- `contracts/`：前后端共享的数据结构和接口协议，当前为规划目录。
- `docs/`：架构、产品和研发说明。
- `scripts/`：独立的开发辅助脚本。
- `SCOPE.md`：每轮修改必须遵守的范围规则。

## 运行前端

```bash
cd frontend
npm run dev
```

## 构建前端

```bash
cd frontend
npm run build
```

后端和 contracts 目录当前只定义边界，不包含虚构的生产实现。
