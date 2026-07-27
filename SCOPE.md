# Change Scope Rules

每一轮修改开始前必须明确 scope。未被 scope 点名的目录和文件默认禁止修改。

## 常用 Scope

| Scope | 允许修改的目录 |
| --- | --- |
| `frontend:router` | `frontend/src/router/` |
| `frontend:shell` | `frontend/src/shell/` |
| `frontend:decision:list` | `frontend/src/modules/decision/list/` |
| `frontend:decision:detail` | `frontend/src/modules/decision/detail/` |
| `frontend:decision:canvas` | `frontend/src/modules/decision/canvas/` |
| `frontend:policy` | `frontend/src/modules/policy/` |
| `frontend:data-asset` | `frontend/src/modules/data-asset/` |
| `frontend:shared` | `frontend/src/shared/` |
| `backend:<module>` | `backend/src/modules/<module>/` |
| `contracts:<module>` | `contracts/<module>/` |

## 默认保护范围

- `frontend/node_modules/` 不手工修改。
- `frontend/dist/` 不手工修改，只允许构建命令重新生成。
- `frontend/package-lock.json` 未被 scope 点名时不修改。
- `frontend/src/shared/`、`frontend/src/router/` 和 `contracts/` 属于高影响区域，必须被明确点名。
- 任何未被本轮 scope 点名的业务模块均不可修改。

## 跨 Scope 处理

如果需求必须修改 scope 外文件，应先列出：

1. 需要新增的 scope。
2. 必须跨范围修改的原因。
3. 可能受到影响的页面或接口。

获得确认后才能继续。

## 每轮交付

每轮完成后需说明：

- 实际修改文件。
- 构建和测试结果。
- 是否重新生成 `frontend/dist/`。
- 是否出现超出原 scope 的改动。
