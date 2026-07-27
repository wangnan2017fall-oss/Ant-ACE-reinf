# Backend Modules

后端业务模块与 ACE 产品架构保持一致：

- `ticket`
- `data-asset/data-source`
- `data-asset/data-connector`
- `data-asset/feature`
- `decision`
- `policy`
- `ab-testing`
- `case-tracker`
- `credit-adjustment`
- `blockage-handling`
- `ai-decision`
- `approval-center`
- `settings`

模块之间不得直接引用对方的 repository；跨模块能力应通过明确的 service 或 contract 调用。
