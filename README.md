# 北贸星桥 / NorthBridge Trade

面向东北中小企业的外贸转型评测与服务导航 SaaS 原型。

它不是跨境交易平台，也不承诺带来订单。核心闭环是：企业录入画像并上传资料摘要，系统用规则库生成出海自检清单、市场与口岸路径建议、风险提示、90 天行动计划，并推荐公开来源或演示核验中的外贸服务机构。

## MVP 边界

- 保留：企业外贸体检、资料完整性检查、规则评分、服务机构资源库、AI 报告润色、无 AI 兜底。
- 降级：外贸人脉网降级为公开来源服务机构库；联系人展示为企业公开渠道，不展示个人手机号/微信。
- 禁止：AI 最终判定 HS 编码、关税、准入、法律合规；不得把上传资料默认用于训练；不得在前端暴露 API key。

## 本地运行

```bash
npm start
```

打开 `http://127.0.0.1:5178`。

AI 默认关闭。演示时可以直接在页面左侧点击“配置 MiniMax”，输入 MiniMax API Key、模型和 endpoint。该配置只保存在当前 Node 服务进程内存里，不写入浏览器 localStorage，也不会提交 Git。

如果希望服务重启后仍保留配置，可以使用 `.env`：

```bash
copy .env.example .env
# 填入 MINIMAX_API_KEY，并设置 AI_ENABLED=true
npm start
```

前端永远不读取 `MINIMAX_API_KEY` 或 `OPENAI_API_KEY`。所有 AI 调用只从 `src/server.mjs` 发起；如果 key 缺失、AI 关闭或调用失败，系统自动使用规则模板报告。

## 验证

```bash
npm run check
npm test
```

## 数据来源与核验策略

当前数据是比赛 MVP 的垂直样本库，服务机构分为 `official-reference`、`partner-demo`、`needs-verification`。正式参赛前需要通过园区、商协会、贸促系统、服务商主动入驻或公开官网二次核验后再上线联系方式。

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
