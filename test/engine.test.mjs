import assert from "node:assert/strict";
import { assessCompany, redactSensitiveText, validateDocuments } from "../src/engine.mjs";
import { samples } from "../src/data.mjs";

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
  assert.match(docs[0].redactedText, /手机号已脱敏/);
  assert.match(docs[0].redactedText, /邮箱已脱敏/);
});

run("template report works without AI", () => {
  const result = assessCompany({ profile: samples[0] });
  assert.match(result.report, /规则引擎模板兜底/);
  assert.match(result.report, /北贸星桥/);
  assert.ok(result.checklist.length > 0);
});
