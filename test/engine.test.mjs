import assert from "node:assert/strict";
import { assessCompany, assessTobCompany, filterTobPartners, redactSensitiveText, validateDocuments } from "../src/engine.mjs";
import { samples, tobSamples } from "../src/data.mjs";

function run(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

run("high-risk sample is held for human review", () => {
  const result = assessCompany({ profile: samples.find((sample) => sample.id === "high-risk") });
  assert.equal(result.verdictResult.level, "hold");
  assert.ok(result.risks.some((risk) => risk.forceHumanReview));
  assert.match(result.report, /人工复核/);
});

run("Liaoning experienced exporter gets Dalian route and pilot verdict", () => {
  const result = assessCompany({ profile: samples.find((sample) => sample.id === "ln-honey") });
  assert.equal(result.verdictResult.level, "pilot");
  assert.equal(result.routes[0].name, "大连港");
  assert.ok(result.partners.some((partner) => partner.province === "liaoning"));
});

run("document validation redacts sensitive contact data", () => {
  const docs = validateDocuments([
    {
      name: "quote.csv",
      size: 120,
      text: "联系人 13812345678, email buyer@example.com, price 100"
    }
  ]);
  assert.equal(docs[0].piiDetected, true);
  assert.equal(Object.hasOwn(docs[0], "redactedText"), false);
  assert.match(docs[0].warnings.join(" "), /敏感字段/);
});

run("template report works without AI", () => {
  const result = assessCompany({ profile: samples[0] });
  assert.match(result.report, /规则引擎模板兜底/);
  assert.match(result.report, /北贸星桥/);
  assert.ok(result.checklist.length > 0);
});

run("zero-base Heilongjiang fungus company gets service-led ToB plan", () => {
  const result = assessTobCompany(tobSamples.find((sample) => sample.id === "hlj-fungus-basic"));
  assert.ok(["零基础试水型", "合规补证优先型", "口岸小批量试单型"].includes(result.classification.type));
  assert.ok(result.serviceNeeds.some((need) => need.id === "labeling"));
  assert.ok(result.serviceNeeds.some((need) => need.id === "agency" || need.id === "park"));
  assert.ok(result.investmentPlan.some((item) => /标签|样品|认证/.test(item.item)));
  assert.ok(result.riskAnalysis.some((risk) => risk.ruleId === "R-PAY-RU"));
  assert.ok(result.paymentRiskModule.manualReviewRequired);
  assert.ok(result.routeAssumptions.quoteNeeded.length >= 4);
  assert.match(result.markets[0].sourceNote, /WITS|Comtrade|公开贸易/);
  assert.match(result.routes[0].sourceNote, /货代|真实货量/);
  assert.ok(result.timeline.length >= 5);
  assert.match(result.report, /物质投入建议/);
  assert.match(result.report, /人工复核/);
});

run("Jilin corn processor without team is routed to agency and park support", () => {
  const result = assessTobCompany(tobSamples.find((sample) => sample.id === "jl-corn-no-team"));
  assert.notEqual(result.classification.type, "已有出口优化型");
  assert.ok(result.serviceNeeds.some((need) => need.id === "agency"));
  assert.ok(result.partners.some((partner) => partner.province === "jilin"));
  assert.ok(result.partners.some((partner) => partner.serviceTypes.includes("agency") || partner.serviceTypes.includes("park")));
  assert.ok(result.partners.every((partner) => partner.recommendationLevel));
});

run("experienced Liaoning exporter gets optimization rather than basic-only advice", () => {
  const result = assessTobCompany(tobSamples.find((sample) => sample.id === "ln-honey-exporter"));
  assert.equal(result.classification.type, "已有出口优化型");
  assert.equal(result.routes[0].name, "大连港");
  assert.ok(result.serviceNeeds.some((need) => need.id === "b2b" || need.id === "finance"));
  assert.ok(result.partners.some((partner) => partner.province === "liaoning"));
});

run("high-regulation or insufficient product triggers manual review", () => {
  const result = assessTobCompany(tobSamples.find((sample) => sample.id === "high-risk-functional"));
  assert.equal(result.classification.type, "高风险资料不足型");
  assert.equal(result.verdictResult.level, "hold");
  assert.ok(result.manualReviewFlags.some((item) => /HS|人工复核|高监管/.test(item)));
  assert.ok(result.riskAnalysis.some((risk) => risk.forceHumanReview));
});

run("partner matching filters by product, market, province and service need", () => {
  const rows = filterTobPartners({
    province: "jilin",
    market: "russia",
    productCategory: "corn",
    serviceNeed: "agency"
  });
  assert.ok(rows.length > 0);
  assert.ok(rows.every((partner) => partner.province === "jilin"));
  assert.ok(rows.every((partner) => partner.targetMarkets.includes("russia")));
  assert.ok(rows.every((partner) => partner.productCategories.includes("corn")));
  assert.ok(rows.every((partner) => partner.serviceTypes.includes("agency")));
});

run("new template report contains budget, timeline, partners and no deal promise", () => {
  const result = assessTobCompany(tobSamples[0]);
  assert.match(result.templateReport, /预算/);
  assert.match(result.templateReport, /90 天|0-14 天/);
  assert.match(result.templateReport, /待核验候选服务资源/);
  assert.match(result.templateReport, /收款、汇率与合同风控/);
  assert.match(result.templateReport, /路径假设/);
  assert.doesNotMatch(result.templateReport, /保证成交|精准预测订单/);
});

run("ToB assessment does not keep raw uploaded document text in profile", () => {
  const confidentialToken = "CONFIDENTIAL_SUPPLIER_MARGIN_ABC";
  const result = assessTobCompany({
    ...tobSamples[0],
    documents: [
      {
        name: "quote.txt",
        size: 200,
        text: `联系人 13812345678, email buyer@example.com, price 100, ${confidentialToken}`
      }
    ]
  });
  assert.deepEqual(result.profile.documents, []);
  assert.equal(result.documents[0].piiDetected, true);
  assert.doesNotMatch(JSON.stringify(result.profile), /13812345678|buyer@example.com/);
  assert.doesNotMatch(JSON.stringify(result), /13812345678|buyer@example.com/);
  assert.doesNotMatch(JSON.stringify(result), new RegExp(confidentialToken));
  assert.equal(Object.hasOwn(result.documents[0], "redactedText"), false);
  assert.match(result.documents[0].warnings.join(" "), /敏感字段/);
});
