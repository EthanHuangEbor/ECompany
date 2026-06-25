# 北贸星桥 / NorthBridge Trade

面向东北企业的 ToB 外贸转型评测、服务商匹配与行动建议 SaaS 原型。

它不是跨境交易平台，也不承诺带来订单。核心闭环是：企业填写经营范围、产品资料、资质、预算、团队能力和目标市场，系统先用规则库完成企业分型、产品风险分级、服务需求拆解和服务商匹配，再生成《企业外贸行动建议书》。

## MVP 边界

- 保留：企业经营档案、资料完整性检查、规则评分、企业分型、物质投入建议、时间周期、待核验服务机构资源库、报告润色、无外部模型兜底。
- 降级：外贸人脉网降级为公开来源与待核验服务机构库；联系人展示为企业公开渠道，不展示个人手机号/微信。
- 禁止：AI 最终判定 HS 编码、关税、准入、法律合规；不得把上传资料默认用于训练；不得在前端暴露 API key。

## 本地运行

```bash
npm start
```

打开 `http://127.0.0.1:5178`。

外部报告润色默认关闭。企业端不需要配置模型；管理员演示时可通过 `http://127.0.0.1:5178/?admin=1` 打开后台维护入口。写入后台配置需要 `.env` 中的 `ADMIN_TOKEN`，也可以直接在 `.env` 填入 `MINIMAX_API_KEY`。配置只保存在当前 Node 服务进程内存或本机 `.env`，不写入浏览器 localStorage，也不会提交 Git。

如果希望服务重启后仍保留配置，可以使用 `.env`：

```bash
copy .env.example .env
# 填入 MINIMAX_API_KEY，并设置 AI_ENABLED=true
# 如需页面后台临时修改配置，再填入 ADMIN_TOKEN
npm start
```

前端永远不读取 `MINIMAX_API_KEY`。所有外部模型调用只从 `src/server.mjs` 发起；如果 key 缺失、服务关闭或调用失败，系统自动使用规则模板报告。

## API 摘要

- `GET /api/bootstrap`：返回企业表单选项、服务类型、市场/口岸规则、服务商知识库和样例企业。
- `POST /api/assessments`：接收 `{ company, product, trade, constraints, documents }`，返回分型、评分、服务需求、投入清单、时间线、风险、服务商匹配和模板报告。
- `GET /api/partners`：按省份、市场、产品、服务需求、企业阶段筛选服务商。
- `GET/POST /api/ai/config`：只返回 MiniMax 安全状态，不返回明文 API Key。
- `POST /api/ai/report`：只把规则结果交给 MiniMax 润色，不让外部模型重算合规结论。

## 验证

```bash
npm run check
npm test
```

## 数据来源与核验策略

当前数据是比赛 MVP 的垂直样本库，服务机构分为 `official-reference`、`partner-demo`、`needs-verification`。除公开机构入口外，页面和报告均按“待核验候选资源”呈现；正式参赛前需要通过园区、商协会、贸促系统、服务商主动入驻或公开官网二次核验后再上线联系方式。

参考来源包括：

- [World Bank WITS](https://wits.worldbank.org/)
- [UN Comtrade Plus](https://comtradeplus.un.org/)
- [商务部国别指南](https://fec.mofcom.gov.cn/article/gbdqzn/)
- [生成式人工智能服务管理暂行办法](https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm)
- [个人信息保护法](https://flk.npc.gov.cn/detail2.html?ZmY4MDgxODE3YjY0NzJhMzAxN2I2NTZjYzIwNDAwNDQ%3D=)
- [GitHub Secret scanning](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning)

## 8 周实现路径

1. 锁定东北优势品类、市场、口岸、服务机构字段。
2. 访谈 20-30 家企业/服务机构并核验资源库。
3. 完成规则库、资料清单和服务匹配逻辑。
4. 完成企业体检、评分和资料上传工作台。
5. 完成市场、口岸、服务机构推荐。
6. 接入 AI 报告润色，同时保留模板兜底。
7. 形成 3-5 个匿名企业案例和反馈。
8. 完成商业计划书、演示视频、PPT 与支撑材料包。
