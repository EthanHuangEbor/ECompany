import {
  dimensions,
  marketRules,
  options,
  ports,
  productProfiles,
  servicePartners,
  uploadPolicy
} from "./data.mjs";

const MB = 1024 * 1024;

export function clamp(value, min = 0, max = 5) {
  return Math.max(min, Math.min(max, value));
}

export function labelFor(group, value) {
  return options[group]?.find(([id]) => id === value)?.[1] || value || "未填写";
}

export function extensionOf(fileName = "") {
  const match = fileName.toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? match[0] : "";
}

export function redactSensitiveText(text = "") {
  return String(text)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[邮箱已脱敏]")
    .replace(/(?<!\d)1[3-9]\d{9}(?!\d)/g, "[手机号已脱敏]")
    .replace(/(?<!\d)\d{17}[\dXx](?!\d)/g, "[身份证号已脱敏]")
    .replace(/(?<!\d)\d{16,19}(?!\d)/g, "[长数字已脱敏]");
}

export function validateDocuments(documents = []) {
  return documents.slice(0, uploadPolicy.maxFiles).map((doc) => {
    const extension = extensionOf(doc.name || doc.fileName || "");
    const size = Number(doc.size || doc.fileSize || 0);
    const rawText = doc.text || doc.extractedText || "";
    const warnings = [];

    if (!uploadPolicy.allowedExtensions.includes(extension)) {
      warnings.push(`暂不支持 ${extension || "无扩展名"} 文件`);
    }
    if (uploadPolicy.blockedExtensions.includes(extension)) {
      warnings.push("该扩展名位于禁止上传清单");
    }
    if (size > uploadPolicy.maxFileSizeMb * MB) {
      warnings.push(`文件超过 ${uploadPolicy.maxFileSizeMb}MB`);
    }

    const redactedText = redactSensitiveText(rawText).slice(0, 4000);
    const piiDetected = redactedText !== rawText;
    if (piiDetected) warnings.push("已检测并脱敏手机号、邮箱或证件号等敏感字段");

    return {
      id: doc.id || cryptoSafeId(doc.name || "document"),
      name: doc.name || doc.fileName || "未命名资料",
      extension,
      size,
      summary: doc.summary || summarizeDocumentName(doc.name || "", redactedText),
      redactedText,
      piiDetected,
      status: warnings.length ? "review" : "accepted",
      warnings
    };
  });
}

function cryptoSafeId(seed) {
  const normalized = String(seed).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return normalized || `doc-${Date.now()}`;
}

function summarizeDocumentName(name, text) {
  const lower = `${name} ${text}`.toLowerCase();
  if (lower.includes("license") || lower.includes("营业执照")) return "疑似营业执照或主体资质文件";
  if (lower.includes("cert") || lower.includes("认证") || lower.includes("检测")) return "疑似认证/检测材料";
  if (lower.includes("报价") || lower.includes("price")) return "疑似报价单或产品价格文件";
  if (lower.includes("label") || lower.includes("标签")) return "疑似标签/包装材料";
  if (text) return text.slice(0, 80);
  return "已登记文件元数据，MVP 未解析该格式全文";
}

function hasCert(profile, keyword) {
  return (profile.certifications || []).some((item) => item.includes(keyword));
}

function hasChannel(profile, keyword) {
  return (profile.channels || []).some((item) => item.includes(keyword));
}

function capacityScore(value = "") {
  if (value.includes("规模")) return 4.4;
  if (value.includes("稳定")) return 3.9;
  if (value.includes("小批")) return 2.8;
  return 3.1;
}

function teamScore(value = "") {
  if (value === "mature") return 4.6;
  if (value === "small") return 3.8;
  if (value === "one") return 2.8;
  return 1.2;
}

function budgetScore(value = "") {
  if (value === "strong") return 4.6;
  if (value === "ready") return 4;
  if (value === "pilot") return 3.2;
  return 1.9;
}

function experienceScore(value = "") {
  if (value === "stable") return 4.4;
  if (value === "trial") return 3.6;
  if (value === "agent") return 3.2;
  return 1.5;
}

export function computeScores(profile, validatedDocuments = []) {
  const product = productProfiles[profile.productCategory] || productProfiles.unclear;
  const docBoost = Math.min(0.7, validatedDocuments.filter((doc) => doc.status === "accepted").length * 0.12);
  const docText = validatedDocuments.map((doc) => `${doc.name} ${doc.summary} ${doc.redactedText}`).join(" ");
  const hasDetection = /检测|cert|haccp|iso|许可|license/i.test(docText) || hasCert(profile, "HACCP") || hasCert(profile, "食品生产");
  const hasLabel = /标签|label|俄文|英文|日语|韩语/i.test(docText) || hasCert(profile, "标签");
  const hasQuote = /报价|price|quotation/i.test(docText);
  const hasProductMaterial = (profile.productDescription || "").length >= 24 || /产品|规格|配料|参数/i.test(docText);

  const productScore = clamp(product.baseFit + (hasProductMaterial ? 0.25 : -0.25) + docBoost);
  const complianceScore = clamp(
    1.2 +
      (hasCert(profile, "食品生产") ? 1.1 : 0) +
      (hasCert(profile, "HACCP") || hasCert(profile, "ISO") ? 0.75 : 0) +
      (hasDetection ? 0.55 : 0) +
      (hasLabel ? 0.45 : 0) +
      (profile.hasExportRight ? 0.55 : 0) -
      Math.max(0, product.complianceLoad - 3.2) * 0.45
  );
  const supplyScore = clamp(capacityScore(profile.annualCapacity) + (hasQuote ? 0.25 : 0) - (product.supplyNeed > 4 ? 0.35 : 0));
  const channelScore = clamp(
    1.1 +
      (hasChannel(profile, "B2B") ? 0.9 : 0) +
      (hasChannel(profile, "外贸") ? 0.9 : 0) +
      (hasChannel(profile, "国内") ? 0.25 : 0) +
      experienceScore(profile.exportExperience) * 0.42
  );
  const organizationScore = clamp(teamScore(profile.teamSize) + (/俄|英|日|韩/i.test(profile.languageCapability || "") ? 0.35 : -0.2));
  const financeScore = clamp(budgetScore(profile.budget) + (profile.exportExperience === "stable" ? 0.25 : 0));
  const digitalScore = clamp(
    1.2 +
      docBoost * 1.4 +
      (validatedDocuments.length >= 3 ? 0.65 : 0) +
      (hasChannel(profile, "B2B") ? 0.75 : 0) +
      ((profile.productDescription || "").length > 35 ? 0.45 : 0)
  );

  const scores = {
    product: productScore,
    compliance: complianceScore,
    supply: supplyScore,
    channel: channelScore,
    organization: organizationScore,
    finance: financeScore,
    digital: digitalScore
  };

  const weighted = dimensions.reduce(
    (acc, dimension) => {
      acc.score += scores[dimension.key] * dimension.weight;
      acc.weight += dimension.weight;
      return acc;
    },
    { score: 0, weight: 0 }
  );

  return {
    scores,
    overall: clamp(weighted.score / weighted.weight),
    productProfile: product
  };
}

export function computeRisks(profile, scoreResult, validatedDocuments = []) {
  const product = scoreResult.productProfile;
  const risks = [];
  const add = (severity, title, text, ruleId, forceHumanReview = false) => {
    risks.push({ severity, title, text, ruleId, forceHumanReview });
  };

  if (!profile.hasExportRight) {
    add("warning", "出口主体能力待补齐", "未勾选出口权或外贸代理路径，建议先确认自营出口、代理出口或园区服务模式。", "R-ORG-EXPORT");
  }
  if (["agri-food", "forest", "prepared-food"].includes(product.industry) && !hasCert(profile, "食品生产")) {
    add("danger", "基础食品资质缺口", "食品/农产品加工企业未提供食品生产许可，不能给出确定性出口建议。", "R-FOOD-SC", true);
  }
  if (profile.targetMarket === "russia" && !hasCert(profile, "俄文") && !hasCert(profile, "标签")) {
    add("warning", "目标市场标签能力不足", "对俄试点前需要准备俄文标签、配料、保质期、生产批次等材料。", "R-LABEL-RU");
  }
  if (["prepared", "unclear"].includes(profile.productCategory)) {
    add("danger", "高监管品类需人工复核", `${product.name} 的准入、冷链或检测要求较高，系统只做风险提示。`, "R-HIGH-REG", true);
  }
  if (profile.exportExperience === "none" && profile.teamSize === "none") {
    add("warning", "从零出海组织能力弱", "建议优先通过园区、商协会、外贸服务机构或代理商做小批量路径验证。", "R-TEAM-ZERO");
  }
  if (profile.budget === "tight") {
    add("warning", "试点资金不足", "不建议直接投入展会、建站或大规模投放，应先做低成本诊断和服务商协同。", "R-FIN-TIGHT");
  }
  if ((profile.productDescription || "").length < 18 || profile.productCategory === "unclear") {
    add("danger", "产品信息不足", "缺少成分、规格、HS 候选编码或认证材料，目标市场和关税信息必须人工复核。", "R-DOC-MISSING", true);
  }

  const reviewDocuments = validatedDocuments.filter((doc) => doc.status === "review");
  if (reviewDocuments.length) {
    add(
      "warning",
      "上传资料需人工检查",
      `${reviewDocuments.length} 份资料存在格式、大小或敏感字段问题，AI 分析前已降级为摘要处理。`,
      "R-DOC-REVIEW"
    );
  }

  if (scoreResult.overall >= 3.8 && risks.every((risk) => risk.severity !== "danger")) {
    add("good", "风险较可控", "当前画像适合进入小批量试点，但仍需人工核验准入、合同收款和服务机构资质。", "R-PILOT-OK");
  }

  return risks;
}

export function computeMarkets(profile, scoreResult, risks = []) {
  const product = scoreResult.productProfile;
  const dangerPenalty = risks.some((risk) => risk.severity === "danger") ? 0.45 : 0;

  return marketRules
    .map((market) => {
      const provinceBoost = market.fitProvinces.includes(profile.province) ? 0.45 : 0;
      const productBoost = market.fitProducts.includes(profile.productCategory) ? 0.35 : -0.1;
      const selectedBoost = market.id === profile.targetMarket ? 0.25 : 0;
      const highRegPenalty = product.complianceLoad > 4 ? 0.35 : 0;
      const total = clamp(
        market.opportunity * 0.3 +
          market.logistics * 0.18 +
          (5 - market.difficulty) * 0.16 +
          (5 - market.risk) * 0.12 +
          scoreResult.overall * 0.44 +
          provinceBoost +
          productBoost +
          selectedBoost -
          highRegPenalty -
          dangerPenalty
      );
      return {
        ...market,
        total,
        status: total >= 3.8 ? "优先试点" : total >= 2.7 ? "谨慎准备" : "暂不建议"
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function computeRoutes(profile, bestMarketId) {
  const speedMap = { 高: 4.4, 中高: 4, 中: 3.4, 中低: 2.8, 低: 2.2 };
  return ports
    .map((port) => {
      const total = clamp(
        2.2 +
          (port.provinceFit.includes(profile.province) ? 0.85 : 0) +
          (port.productFit.includes(profile.productCategory) ? 0.55 : 0) +
          (port.marketFit.includes(bestMarketId) ? 0.55 : 0) +
          ((speedMap[port.speedLevel] || 3.2) - 3) * 0.25 +
          (profile.productCategory === "prepared" && port.coldChain === "高" ? 0.3 : 0)
      );
      return { ...port, total };
    })
    .sort((a, b) => {
      const provinceTie = Number(b.provinceFit.includes(profile.province)) - Number(a.provinceFit.includes(profile.province));
      const productTie = Number(b.productFit.includes(profile.productCategory)) - Number(a.productFit.includes(profile.productCategory));
      return b.total - a.total || provinceTie || productTie;
    });
}

export function recommendPartners(profile, risks = [], routes = [], limit = 5) {
  const bestPortId = routes[0]?.id;
  const riskText = risks.map((risk) => `${risk.title} ${risk.text}`).join(" ");

  return servicePartners
    .map((partner) => {
      const reasons = [];
      let score = 1.2;

      if (partner.province === profile.province) {
        score += 0.9;
        reasons.push("同省或近域服务");
      }
      if (partner.targetMarkets.includes(profile.targetMarket)) {
        score += 0.75;
        reasons.push(`覆盖${labelFor("targetMarkets", profile.targetMarket)}`);
      }
      if (partner.productCategories.includes(profile.productCategory)) {
        score += 0.75;
        reasons.push(`适配${productProfiles[profile.productCategory]?.name || "当前品类"}`);
      }
      if (bestPortId && partner.ports.includes(bestPortId)) {
        score += 0.65;
        reasons.push(`匹配${routes[0].name}`);
      }
      if (/标签|俄文/.test(riskText) && partner.serviceScope.some((item) => /俄文|标签|本地化/.test(item))) {
        score += 0.55;
        reasons.push("可补标签/本地化短板");
      }
      if (/组织|团队|渠道/.test(riskText) && partner.serviceScope.some((item) => /代理|平台|运营|培训/.test(item))) {
        score += 0.5;
        reasons.push("可补外贸团队或渠道短板");
      }
      if (/资质|认证|检测|高监管/.test(riskText) && partner.serviceScope.some((item) => /认证|检测|复核/.test(item))) {
        score += 0.5;
        reasons.push("可做认证/检测资料复核");
      }

      const trustPenalty = partner.permissionLevel === "demo-only" ? 0.25 : 0;
      return {
        ...partner,
        matchScore: clamp(score - trustPenalty),
        matchReasons: reasons.length ? reasons : ["作为备选资源纳入人工核验清单"]
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

export function buildChecklist(profile, scoreResult, risks, validatedDocuments = []) {
  const product = scoreResult.productProfile;
  const uploadedText = validatedDocuments.map((doc) => `${doc.summary} ${doc.redactedText}`).join(" ");

  return product.typicalDocs.map((docName) => {
    const existing =
      (profile.certifications || []).some((cert) => cert.includes(docName.replace(/\/.*$/, ""))) ||
      uploadedText.includes(docName.replace(/\/.*$/, ""));
    return {
      item: docName,
      status: existing ? "已有或疑似已有" : "建议补齐",
      risk: existing ? "low" : risks.some((risk) => risk.forceHumanReview) ? "high" : "medium"
    };
  });
}

export function buildActionPlan(profile, markets, routes, partners, checklist) {
  const missing = checklist.filter((item) => item.status !== "已有或疑似已有").slice(0, 4).map((item) => item.item);
  const bestMarket = markets[0];
  const bestRoute = routes[0];
  const bestPartner = partners[0];

  return [
    {
      phase: "0-30 天",
      text: `补齐${missing.length ? ` ${missing.join("、")}` : "报价单、产品页和资料台账"}；确认产品规格、候选 HS 编码和目标市场准入材料。`
    },
    {
      phase: "31-60 天",
      text: `围绕 ${bestMarket.name} 做小批量路径验证，优先比较 ${bestRoute.name} 与备选口岸的物流、标签、收款和服务商风险。`
    },
    {
      phase: "61-90 天",
      text: `通过${bestPartner ? bestPartner.orgName : "园区、商协会或外贸服务机构"}完成试单方案，形成报价模板、多语种产品页和风险复核记录。`
    }
  ];
}

export function verdict(overall, risks) {
  const dangerCount = risks.filter((risk) => risk.severity === "danger").length;
  if (dangerCount >= 2 || overall < 2.4) {
    return {
      level: "hold",
      title: "暂不建议直接出海",
      text: "当前材料和能力缺口较大，应先补齐产品信息、资质材料和服务机构协同，再进入市场试点。"
    };
  }
  if (overall >= 3.8 && dangerCount === 0) {
    return {
      level: "pilot",
      title: "优先小批量试点",
      text: "企业具备一定出海基础，可先围绕推荐市场和口岸做低成本验证，并保留人工合规复核。"
    };
  }
  return {
    level: "prepare",
    title: "谨慎准备后试点",
    text: "企业具有出海潜力，但认证、渠道、团队或资金仍需补强。建议先做 90 天准备计划。"
  };
}

export function buildTemplateReport(assessment) {
  const { profile, scoreResult, risks, markets, routes, partners, checklist, actions, verdictResult, aiMode = "template" } = assessment;
  const dimensionLines = dimensions
    .map((dimension) => `- ${dimension.label}：${scoreResult.scores[dimension.key].toFixed(1)} / 5`)
    .join("\n");
  const riskLines = risks.map((risk) => `- [${risk.severity}] ${risk.title}：${risk.text}`).join("\n") || "- 暂无红色风险，但仍需人工核验准入、合同和收款。";
  const partnerLines = partners
    .map((partner) => `- ${partner.orgName}（${partner.orgType}）：${partner.matchReasons.join("；")}；公开联系：${partner.publicContact}；可信状态：${partner.trustLevel}`)
    .join("\n");
  const checklistLines = checklist.map((item) => `- ${item.item}：${item.status}`).join("\n");
  const actionLines = actions.map((item) => `- ${item.phase}：${item.text}`).join("\n");

  return `《北贸星桥企业外贸转型诊断报告》

一、企业画像
企业名称：${profile.companyName || "未命名企业"}
所在地：${labelFor("provinces", profile.province)} ${profile.city || ""}
行业/产品：${labelFor("industries", profile.industry)} / ${productProfiles[profile.productCategory]?.name || profile.productCategory}
目标市场：${labelFor("targetMarkets", profile.targetMarket)}
外贸经验：${labelFor("exportExperience", profile.exportExperience)}
外贸团队：${labelFor("teamSize", profile.teamSize)}

二、诊断结论
综合准备度：${scoreResult.overall.toFixed(1)} / 5
结论：${verdictResult.title}
说明：${verdictResult.text}
报告模式：${aiMode === "ai" ? "AI 润色 + 规则结论" : "规则引擎模板兜底"}

三、七维评分
${dimensionLines}

四、资料自检清单
${checklistLines}

五、目标市场与口岸路径
优先市场：${markets[0].name}（${markets[0].status}，${markets[0].total.toFixed(1)} / 5）
推荐路径：${routes[0].name}（${routes[0].transport}，${routes[0].note}）

六、风险提示
${riskLines}

七、建议联系的服务机构
${partnerLines}

八、90 天行动计划
${actionLines}

九、边界说明
本报告由规则库、公开数据来源和演示服务机构库生成，用于出海前初步诊断。系统不承诺订单，不替代报关、法务、认证、税则、HS 编码和出口管制等专业判断；高风险项必须人工复核。`;
}

export function assessCompany(input = {}) {
  const profile = normalizeProfile(input.profile || input);
  const validatedDocuments = validateDocuments(input.documents || profile.documents || []);
  const scoreResult = computeScores(profile, validatedDocuments);
  const risks = computeRisks(profile, scoreResult, validatedDocuments);
  const markets = computeMarkets(profile, scoreResult, risks);
  const routes = computeRoutes(profile, markets[0]?.id || profile.targetMarket);
  const partners = recommendPartners(profile, risks, routes);
  const checklist = buildChecklist(profile, scoreResult, risks, validatedDocuments);
  const actions = buildActionPlan(profile, markets, routes, partners, checklist);
  const verdictResult = verdict(scoreResult.overall, risks);

  const assessment = {
    profile,
    documents: validatedDocuments,
    scoreResult,
    risks,
    markets,
    routes,
    partners,
    checklist,
    actions,
    verdictResult,
    generatedAt: new Date().toISOString()
  };

  return {
    ...assessment,
    report: buildTemplateReport({ ...assessment, aiMode: "template" })
  };
}

export function normalizeProfile(profile = {}) {
  return {
    companyName: profile.companyName || "",
    province: profile.province || "heilongjiang",
    city: profile.city || "",
    industry: profile.industry || productProfiles[profile.productCategory]?.industry || "agri-food",
    productCategory: profile.productCategory || "blackFungus",
    productDescription: profile.productDescription || "",
    annualCapacity: profile.annualCapacity || "稳定批量供应",
    certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
    hasExportRight: Boolean(profile.hasExportRight),
    exportExperience: profile.exportExperience || "none",
    teamSize: profile.teamSize || "none",
    languageCapability: profile.languageCapability || "",
    targetMarket: profile.targetMarket || "russia",
    budget: profile.budget || "pilot",
    channels: Array.isArray(profile.channels) ? profile.channels : [],
    documents: Array.isArray(profile.documents) ? profile.documents : []
  };
}
