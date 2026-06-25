import {
  dimensions,
  marketRules,
  options,
  ports,
  productProfiles,
  enterpriseOptions,
  serviceTypes,
  servicePartners,
  tobProductProfiles,
  tobServicePartners,
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

    const sanitizedText = redactSensitiveText(rawText).slice(0, 4000);
    const piiDetected = sanitizedText !== rawText;
    if (piiDetected) warnings.push("已检测并脱敏手机号、邮箱或证件号等敏感字段");

    return {
      id: doc.id || cryptoSafeId(doc.name || "document"),
      name: doc.name || doc.fileName || "未命名资料",
      extension,
      size,
      summary: doc.summary || summarizeDocumentName(doc.name || "", sanitizedText),
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
  if (text) return "已登记可脱敏文本资料，系统仅保留类别摘要，不保存原文内容";
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
  const docText = validatedDocuments.map((doc) => `${doc.name} ${doc.summary}`).join(" ");
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
        status: total >= 3.8 ? "初筛优先" : total >= 2.7 ? "谨慎准备" : "暂不建议",
        sourceNote: "基于 MVP 规则库、公开贸易数据入口和商务部国别指南形成的初筛分，需赛前补充 WITS/UN Comtrade/地方政策核验记录。"
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
      return {
        ...port,
        total,
        assumptionLevel: "路径假设",
        sourceNote: "基于省份、市场、品类和口岸通道经验规则形成，需货代按真实货量、目的地、季节和通关条件核价。"
      };
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
  const uploadedText = validatedDocuments.map((doc) => `${doc.name} ${doc.summary}`).join(" ");

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

const serviceTypeById = Object.fromEntries(serviceTypes.map((item) => [item.id, item]));

export function enterpriseLabelFor(group, value) {
  return enterpriseOptions[group]?.find(([id]) => id === value)?.[1] || value || "未填写";
}

export function normalizeTobProfile(input = {}) {
  const profile = input.profile || {};
  const company = input.company || profile.company || {};
  const product = input.product || profile.product || {};
  const trade = input.trade || profile.trade || {};
  const constraints = input.constraints || profile.constraints || {};

  return {
    company: {
      name: company.name || profile.companyName || "",
      province: company.province || profile.province || "heilongjiang",
      city: company.city || profile.city || "",
      companyType: company.companyType || "factory",
      businessScope: company.businessScope || "",
      mainBusiness: company.mainBusiness || "",
      employeeScale: company.employeeScale || "small",
      annualRevenue: company.annualRevenue || "unknown"
    },
    product: {
      name: product.name || profile.productName || "",
      category: product.category || profile.productCategory || "blackFungus",
      description: product.description || profile.productDescription || "",
      specs: product.specs || "",
      annualCapacity: product.annualCapacity || profile.annualCapacity || "稳定批量供应",
      shelfLife: product.shelfLife || "",
      coldChain: Boolean(product.coldChain),
      packageStatus: product.packageStatus || "editable",
      certifications: Array.isArray(product.certifications)
        ? product.certifications
        : Array.isArray(profile.certifications)
          ? profile.certifications
          : []
    },
    trade: {
      hasExportRight: Boolean(trade.hasExportRight ?? profile.hasExportRight),
      exportExperience: trade.exportExperience || profile.exportExperience || "none",
      teamSize: trade.teamSize || profile.teamSize || "none",
      languageCapability: trade.languageCapability || profile.languageCapability || "",
      channels: Array.isArray(trade.channels)
        ? trade.channels
        : Array.isArray(profile.channels)
          ? profile.channels
          : [],
      targetMarket: trade.targetMarket || profile.targetMarket || "russia",
      quoteBasis: trade.quoteBasis || "unknown",
      paymentReadiness: trade.paymentReadiness || ""
    },
    constraints: {
      budget: constraints.budget || profile.budget || "pilot",
      timelinePreference: constraints.timelinePreference || "normal",
      riskTolerance: constraints.riskTolerance || "medium",
      staffAvailable: constraints.staffAvailable || "",
      acceptsAgent: Boolean(constraints.acceptsAgent ?? true),
      bottlenecks: Array.isArray(constraints.bottlenecks) ? constraints.bottlenecks : []
    },
    documents: []
  };
}

function tobHasCert(profile, keyword) {
  return profile.product.certifications.some((item) => item.includes(keyword));
}

function tobHasChannel(profile, keyword) {
  return profile.trade.channels.some((item) => item.includes(keyword));
}

function textIncludesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function scaleScore(value, map, fallback = 3) {
  return map[value] ?? fallback;
}

function computeTobScores(profile, validatedDocuments = []) {
  const productProfile = tobProductProfiles[profile.product.category] || tobProductProfiles.highRegulation;
  const docText = validatedDocuments.map((doc) => `${doc.name} ${doc.summary}`).join(" ");
  const productText = `${profile.product.name} ${profile.product.description} ${profile.product.specs}`;
  const hasDetection = /检测|cert|haccp|iso|许可|license/i.test(docText) || tobHasCert(profile, "HACCP") || tobHasCert(profile, "食品生产");
  const hasLabel = /标签|label|俄文|英文|日文|韩文/i.test(docText) || tobHasCert(profile, "标签") || profile.product.packageStatus === "bilingual" || profile.product.packageStatus === "marketReady";
  const hasQuote = /报价|price|quotation/i.test(docText) || profile.trade.quoteBasis !== "unknown";
  const hasProductMaterial = productText.length >= 30;
  const docBoost = Math.min(0.8, validatedDocuments.filter((doc) => doc.status === "accepted").length * 0.12);

  const supplyMap = { "规模化产能": 4.4, "稳定批量供应": 4, "小批量试产": 2.7 };
  const teamMap = { none: 1.2, one: 2.7, small: 3.8, mature: 4.6 };
  const budgetMap = { tight: 1.8, pilot: 3.1, ready: 4, strong: 4.6 };
  const experienceMap = { none: 1.4, agent: 3.2, trial: 3.6, stable: 4.5 };

  const productScore = clamp(productProfile.baseFit + (hasProductMaterial ? 0.35 : -0.35) + docBoost);
  const complianceScore = clamp(
    1.1 +
      (tobHasCert(profile, "食品生产") ? 1.05 : 0) +
      (tobHasCert(profile, "HACCP") || tobHasCert(profile, "ISO") ? 0.75 : 0) +
      (hasDetection ? 0.55 : 0) +
      (hasLabel ? 0.5 : 0) +
      (profile.trade.hasExportRight ? 0.5 : 0) -
      Math.max(0, productProfile.complianceLoad - 3.2) * 0.45
  );
  const supplyScore = clamp(
    scaleScore(profile.product.annualCapacity, supplyMap, productText.includes("规模") ? 4 : 3.2) +
      (profile.product.shelfLife ? 0.25 : -0.15) +
      (hasQuote ? 0.25 : 0) -
      (productProfile.supplyNeed > 4 ? 0.35 : 0)
  );
  const channelScore = clamp(
    1.1 +
      (tobHasChannel(profile, "B2B") ? 0.85 : 0) +
      (tobHasChannel(profile, "外贸") ? 0.85 : 0) +
      (tobHasChannel(profile, "国内") ? 0.25 : 0) +
      scaleScore(profile.trade.exportExperience, experienceMap, 1.5) * 0.42
  );
  const organizationScore = clamp(
    scaleScore(profile.trade.teamSize, teamMap, 1.2) +
      (/俄|英|日|韩|语|language/i.test(profile.trade.languageCapability) ? 0.35 : -0.15) +
      (profile.constraints.staffAvailable ? 0.2 : 0)
  );
  const financeScore = clamp(
    scaleScore(profile.constraints.budget, budgetMap, 3) +
      (profile.trade.paymentReadiness.includes("收款") || profile.trade.exportExperience === "stable" ? 0.3 : -0.1) +
      (profile.trade.quoteBasis === "ddp" ? -0.2 : 0)
  );
  const digitalScore = clamp(
    1.2 +
      docBoost * 1.4 +
      (validatedDocuments.length >= 3 ? 0.65 : 0) +
      (tobHasChannel(profile, "B2B") ? 0.7 : 0) +
      (productText.length > 55 ? 0.5 : 0)
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
    productProfile
  };
}

function classifyTobCompany(profile, scoreResult, validatedDocuments = []) {
  const hasDangerProduct = scoreResult.productProfile.riskBand === "X";
  const infoText = `${profile.product.description} ${profile.product.specs} ${profile.company.businessScope}`;
  const lacksCoreInfo = infoText.length < 40 || validatedDocuments.some((doc) => doc.status === "review");
  const foodLike = ["agri-food", "forest", "prepared-food"].includes(scoreResult.productProfile.industry);
  const lacksFoodCert = foodLike && !tobHasCert(profile, "食品生产");

  let type = "口岸小批量试单型";
  if (hasDangerProduct || lacksCoreInfo) type = "高风险资料不足型";
  else if (profile.trade.exportExperience === "stable" || profile.trade.exportExperience === "trial") type = "已有出口优化型";
  else if (lacksFoodCert || scoreResult.scores.compliance < 2.8) type = "合规补证优先型";
  else if (scoreResult.scores.product >= 3.8 && scoreResult.scores.supply >= 3.6 && scoreResult.scores.channel < 2.8) type = "产品成熟缺渠道型";
  else if (profile.trade.exportExperience === "none" && profile.trade.teamSize === "none") type = "零基础试水型";

  if (["japan", "korea"].includes(profile.trade.targetMarket) && scoreResult.scores.compliance < 3.6 && type !== "高风险资料不足型") {
    type = "日韩高标准准备型";
  }

  const stage =
    type === "高风险资料不足型"
      ? "S0 资料不足"
      : profile.trade.exportExperience === "stable"
        ? "S4 稳定出口"
        : profile.trade.exportExperience === "trial" || profile.trade.exportExperience === "agent"
          ? "S3 已有代理或试单"
          : scoreResult.scores.compliance >= 3.2 && scoreResult.scores.product >= 3.5
            ? "S2 资料较齐但无试单"
            : "S1 国内成熟但无外贸";

  const summaryMap = {
    零基础试水型: "建议先借助园区、商协会或外贸代理做低成本小批量验证，不宜马上自建完整外贸团队。",
    产品成熟缺渠道型: "产品和供应基础较好，关键短板是外贸渠道、报价体系和服务商协同。",
    合规补证优先型: "当前最优先的是补齐资质、检测、标签和准入材料，再进入试单。",
    口岸小批量试单型: "适合围绕东北口岸或港口做小批量路径验证，控制投入和收款风险。",
    日韩高标准准备型: "目标市场标准较高，需要先做标签、检测、包装和质量体系复核。",
    已有出口优化型: "已经具备外贸基础，应重点优化市场组合、服务商结构、收款和平台询盘效率。",
    高风险资料不足型: "信息或监管风险过高，系统只给准备清单，不给确定性出海结论。"
  };

  return {
    type,
    stage,
    productRiskLevel: scoreResult.productProfile.riskBand,
    summary: summaryMap[type]
  };
}

function computeTobRisks(profile, scoreResult, classification, validatedDocuments = []) {
  const risks = [];
  const add = (severity, title, text, ruleId, forceHumanReview = false) => {
    risks.push({ severity, title, text, ruleId, forceHumanReview });
  };

  if (!profile.trade.hasExportRight && !profile.constraints.acceptsAgent) {
    add("danger", "出口主体路径不清", "企业未具备出口权且不接受代理/园区服务路径，需要先确定出口主体和合同责任。", "R-ORG-EXPORT", true);
  } else if (!profile.trade.hasExportRight) {
    add("warning", "出口主体能力待补齐", "建议先确认自营出口、代理出口或园区综合服务模式。", "R-ORG-EXPORT");
  }

  const foodLike = ["agri-food", "forest", "prepared-food"].includes(scoreResult.productProfile.industry);
  if (foodLike && !tobHasCert(profile, "食品生产")) {
    add("danger", "基础食品资质缺口", "食品/农产品加工企业未提供食品生产许可，不能给出确定性出口建议。", "R-FOOD-LICENSE", true);
  }

  if (profile.trade.targetMarket === "russia" && profile.product.packageStatus !== "bilingual" && profile.product.packageStatus !== "marketReady") {
    add("warning", "目标市场标签能力不足", "对俄试点前需要准备俄文标签、配料、保质期、生产批次等材料。", "R-LABEL-RU");
  }

  if (profile.product.category === "prepared" || profile.product.coldChain) {
    add("danger", "冷链和保质期复核", "预制/冷冻食品必须复核冷链、保质期、包装、温控和目标市场准入要求。", "R-COLD-CHAIN", true);
  }

  if (profile.product.category === "highRegulation") {
    add("danger", "高监管品类需人工复核", "功能食品、营养食品或信息不足产品不能由 AI 给出准入、关税、HS 编码或法律合规结论。", "R-HIGH-REG", true);
  }

  if (profile.trade.exportExperience === "none" && profile.trade.teamSize === "none") {
    add("warning", "从零出海组织能力弱", "建议通过园区、商协会、外贸服务机构或代理商做小批量路径验证。", "R-TEAM-ZERO");
  }

  if (profile.constraints.budget === "tight") {
    add("warning", "试点资金不足", "不建议直接投入展会、建站或大规模投放，应先完成低成本诊断和资料补齐。", "R-FIN-TIGHT");
  }

  if (profile.trade.targetMarket === "russia") {
    add(
      "warning",
      "对俄收款与银行通道需人工核验",
      "俄罗斯场景必须复核买方资信、收款币种、T/T 或信用证路径、银行通道、制裁/合规名单和汇率波动，系统不做最终收款可行性判断。",
      "R-PAY-RU",
      true
    );
  }

  if (profile.trade.quoteBasis === "ddp") {
    add(
      "danger",
      "DDP/包税到门风险较高",
      "DDP 或包税到门会把关税、清关、末端交付和合规责任前置到企业侧，必须由货代、报关、法务和财税人员共同复核。",
      "R-INCOTERM-DDP",
      true
    );
  }

  if (!profile.trade.paymentReadiness || profile.trade.paymentReadiness.length < 6) {
    add("warning", "收款方案未成型", "需在试单前明确付款方式、账期、收款账户、汇率风险和坏账处理边界。", "R-PAY-MISSING");
  }

  for (const doc of validatedDocuments.filter((item) => item.status === "review")) {
    add("warning", "上传资料需人工检查", `${doc.name} 存在格式、大小或敏感字段问题，已降级为摘要处理。`, "R-DOC-REVIEW");
  }

  if (classification.type === "已有出口优化型" && !risks.some((risk) => risk.severity === "danger")) {
    add("good", "已有试点基础", "企业可进入市场对比、渠道优化和服务商组合优化阶段，但合同、收款和准入仍需人工核验。", "R-EXPORT-BASE");
  }

  return risks;
}

function computeServiceNeeds(profile, scoreResult, classification, risks = []) {
  const ids = new Set(scoreResult.productProfile.defaultNeeds);
  const riskText = risks.map((risk) => `${risk.title} ${risk.text}`).join(" ");

  if (scoreResult.scores.compliance < 3.2 || /资质|认证|检测|高监管/.test(riskText)) ids.add("certification");
  if (profile.trade.targetMarket === "russia" || /标签|本地化/.test(riskText)) ids.add("labeling");
  if (!profile.trade.hasExportRight || profile.trade.exportExperience === "none") ids.add("agency");
  if (profile.trade.teamSize === "none" || scoreResult.scores.channel < 3) ids.add("park");
  if (scoreResult.scores.channel < 3.2 && profile.trade.exportExperience !== "none") ids.add("b2b");
  if (profile.trade.quoteBasis === "unknown" || profile.constraints.budget === "tight" || profile.trade.paymentReadiness.length < 6) ids.add("finance");
  ids.add("logistics");
  ids.add("customs");

  return [...ids].map((id) => ({
    id,
    label: serviceTypeById[id]?.label || id,
    description: serviceTypeById[id]?.description || "",
    investmentRange: serviceTypeById[id]?.investmentRange || "需服务商报价",
    priority:
      classification.type === "高风险资料不足型" && id === "certification"
        ? "最高"
        : ["certification", "labeling", "agency", "customs"].includes(id)
          ? "高"
          : "中",
    reason: serviceNeedReason(id, profile, classification)
  }));
}

function serviceNeedReason(id, profile, classification) {
  const reasons = {
    certification: "用于确认产品能不能进入目标市场，以及当前资质缺口在哪里。",
    labeling: "目标市场需要本地语言标签和包装材料，尤其对俄、日韩食品类项目。",
    customs: "企业需要知道试单时要准备哪些报关、商检、原产地和合同资料。",
    logistics: "东北企业必须比较口岸、港口、冷链和样品路径，避免试单成本失控。",
    agency: "企业外贸团队不足时，代理或园区综合服务比自建团队更现实。",
    b2b: "已有产品基础后，需要把产品资料转成可被海外客户理解的询盘入口。",
    finance: "第一次出海常见问题集中在账期、汇率、收款和合同责任。",
    park: "园区和商协会适合作为低成本入口，帮助筛选可信服务商。"
  };
  if (classification.type === "已有出口优化型" && id === "b2b") return "企业已有出口经验，B2B 与询盘 SOP 是优化重点。";
  if (profile.constraints.budget === "tight" && id === "park") return "预算有限时优先走公共服务入口，控制前期投入。";
  return reasons[id] || "根据企业画像和规则库命中。";
}

function buildInvestmentPlan(profile, serviceNeeds) {
  const items = [
    {
      category: "资料整理",
      item: "企业简介、产品目录、规格书、报价单、包装照片整理",
      range: "0-3000 元，团队自做可降成本",
      timing: "0-14 天",
      priority: "必须",
      rationale: "没有结构化资料，服务商和海外客户都无法判断是否可合作。"
    },
    {
      category: "样品与包装",
      item: "样品包、外文标签、基础包装改版",
      range: "3000-15000 元",
      timing: "15-45 天",
      priority: "高",
      rationale: "用于服务商评估、渠道测试和第一次客户沟通。"
    }
  ];

  for (const need of serviceNeeds) {
    if (need.id === "certification") {
      items.push({
        category: "认证检测",
        item: "检测报告、食品/质量体系材料、准入资料复核",
        range: need.investmentRange,
        timing: "15-60 天",
        priority: need.priority,
        rationale: "合规材料是外贸试单前的硬门槛。"
      });
    }
    if (need.id === "logistics") {
      items.push({
        category: "物流试单",
        item: "样品寄送、小批量物流报价、口岸/港口路径比较",
        range: need.investmentRange,
        timing: "31-60 天",
        priority: "高",
        rationale: "先用小批量验证成本、时效、包装和服务商配合。"
      });
    }
    if (need.id === "b2b") {
      items.push({
        category: "渠道建设",
        item: "多语种产品页、B2B 平台资料、询盘 SOP",
        range: need.investmentRange,
        timing: "31-90 天",
        priority: "中",
        rationale: "把产品能力转化为海外客户能看懂的采购入口。"
      });
    }
    if (need.id === "finance") {
      items.push({
        category: "资金风控",
        item: "合同条款、收款方式、账期、汇率和信用风险复核",
        range: "以银行、信保或法务方案为准",
        timing: "31-90 天",
        priority: profile.constraints.budget === "tight" ? "高" : "中",
        rationale: "外贸转型不只是找客户，收款和风险分配必须提前设计。"
      });
    }
  }

  items.push({
    category: "试点周转",
    item: "首批样品或小批量订单备货周转金",
    range: profile.constraints.budget === "tight" ? "建议暂缓大额备货" : "3-15 万元，按产品和账期人工测算",
    timing: "61-90 天",
    priority: profile.constraints.budget === "tight" ? "暂缓" : "中",
    rationale: "没有真实订单前不建议盲目扩产，先保留小批量验证资金。"
  });

  return dedupeBy(items, (item) => `${item.category}-${item.item}`);
}

function buildTobChecklist(profile, scoreResult, serviceNeeds, validatedDocuments = []) {
  const docText = validatedDocuments.map((doc) => `${doc.name} ${doc.summary}`).join(" ");
  const docs = [
    ...scoreResult.productProfile.typicalDocs,
    "营业执照/经营范围",
    "产品图片与包装照片",
    "报价单与最小起订量",
    "收款和合同条款人工复核"
  ];

  return dedupeBy(docs, (item) => item).map((item) => {
    const has =
      profile.product.certifications.some((cert) => item.includes(cert) || cert.includes(item.replace(/\/.*$/, ""))) ||
      docText.includes(item.replace(/\/.*$/, "")) ||
      (item.includes("报价") && profile.trade.quoteBasis !== "unknown") ||
      (item.includes("经营范围") && profile.company.businessScope);

    return {
      item,
      status: has ? "已有或疑似已有" : "建议补齐",
      priority: serviceNeeds.some((need) => need.priority === "最高") && !has ? "高" : has ? "低" : "中",
      owner: has ? "企业确认" : item.includes("标签") ? "标签/本地化服务商" : item.includes("检测") ? "认证检测服务商" : "企业与服务商协同"
    };
  });
}

function computeTobMarkets(profile, scoreResult, risks = []) {
  const dangerPenalty = risks.some((risk) => risk.severity === "danger") ? 0.45 : 0;
  return marketRules
    .map((market) => {
      const provinceBoost = market.fitProvinces.includes(profile.company.province) ? 0.45 : 0;
      const productBoost = market.fitProducts.includes(profile.product.category) ? 0.35 : -0.1;
      const selectedBoost = market.id === profile.trade.targetMarket ? 0.25 : 0;
      const highRegPenalty = scoreResult.productProfile.complianceLoad > 4 ? 0.35 : 0;
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
        status: total >= 3.8 ? "初筛优先" : total >= 2.7 ? "谨慎准备" : "暂不建议",
        assumptionLevel: "市场初筛",
        sourceNote: "基于 MVP 规则库、公开贸易数据入口和商务部国别指南形成的初筛分，需赛前补充 WITS/UN Comtrade/地方政策核验记录。",
        ruleBoundary: "不代表市场准入、关税、订单机会或最终经营可行性。"
      };
    })
    .sort((a, b) => b.total - a.total);
}

function computeTobRoutes(profile, bestMarketId) {
  const speedMap = { 高: 4.4, 中高: 4, 中: 3.4, 中低: 2.8, 低: 2.2 };
  return ports
    .map((port) => {
      const total = clamp(
        2.2 +
          (port.provinceFit.includes(profile.company.province) ? 0.85 : 0) +
          (port.productFit.includes(profile.product.category) ? 0.55 : 0) +
          (port.marketFit.includes(bestMarketId) ? 0.55 : 0) +
          ((speedMap[port.speedLevel] || 3.2) - 3) * 0.25 +
          (profile.product.coldChain && port.coldChain === "高" ? 0.3 : 0)
      );
      return {
        ...port,
        total,
        assumptionLevel: "路径假设",
        sourceNote: "基于省份、市场、品类和口岸通道经验规则形成，需货代按真实货量、目的地、季节和通关条件核价。",
        ruleBoundary: "不代表最终物流报价、通关时效、检疫结果或运输承诺。"
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function filterTobPartners(filters = {}) {
  return tobServicePartners
    .filter((partner) => !filters.province || partner.province === filters.province)
    .filter((partner) => !filters.market || partner.targetMarkets.includes(filters.market))
    .filter((partner) => !filters.productCategory || partner.productCategories.includes(filters.productCategory))
    .filter((partner) => !filters.serviceNeed || partner.serviceTypes.includes(filters.serviceNeed))
    .filter((partner) => !filters.stage || partner.suitableStages.includes(filters.stage));
}

function recommendTobPartners(profile, serviceNeeds, classification, routes, limit = 6) {
  const serviceIds = serviceNeeds.map((need) => need.id);
  const bestPortId = routes[0]?.id;

  return tobServicePartners
    .map((partner) => {
      const reasons = [];
      let score = 1.2;

      if (partner.province === profile.company.province) {
        score += 0.75;
        reasons.push("同省或近域服务");
      }
      if (partner.targetMarkets.includes(profile.trade.targetMarket)) {
        score += 0.65;
        reasons.push(`覆盖${enterpriseLabelFor("targetMarkets", profile.trade.targetMarket)}`);
      }
      if (partner.productCategories.includes(profile.product.category)) {
        score += 0.65;
        reasons.push(`适配${tobProductProfiles[profile.product.category]?.name || "当前品类"}`);
      }
      if (partner.suitableStages.includes(classification.type)) {
        score += 0.65;
        reasons.push(`适合${classification.type}`);
      }
      if (bestPortId && partner.ports.includes(bestPortId)) {
        score += 0.5;
        reasons.push(`匹配${routes[0].name}`);
      }
      const matchedServices = partner.serviceTypes.filter((id) => serviceIds.includes(id));
      if (matchedServices.length) {
        score += matchedServices.length * 0.3;
        reasons.push(`可补${matchedServices.map((id) => serviceTypeById[id]?.label || id).join("、")}`);
      }
      if (partner.sourceType !== "official-reference") score -= 0.2;

      return {
        ...partner,
        matchScore: clamp(score),
        matchReasons: reasons.length ? reasons : ["作为备选资源纳入人工核验清单"],
        recommendationLevel: partner.sourceType === "official-reference" ? "公开入口" : "待核验候选",
        riskNote:
          partner.sourceType === "official-reference"
            ? "公开机构入口仍需核验地方页面、服务范围和最新联系方式。"
            : "演示或待核验资源，不可直接作为真实联系方式使用，需赛前通过官网、园区、商协会或授权入驻二次核验。",
        contactChecklist: dedupeBy(
          [
            ...partner.contactPrep,
            ...matchedServices.flatMap((id) => serviceTypeById[id]?.contactPrep || [])
          ],
          (item) => item
        ).slice(0, 8)
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

function buildTobTimeline(profile, classification, serviceNeeds, partners) {
  const highRisk = classification.type === "高风险资料不足型";
  const agencyFirst = serviceNeeds.some((need) => need.id === "agency");
  const firstPartner = partners[0]?.orgName || "园区、商协会或外贸综合服务商";

  return [
    {
      phase: "0-14 天",
      goal: highRisk ? "补齐人工复核资料" : "建立企业外贸档案",
      actions: [
        "整理营业执照、经营范围、产品规格、包装照片、报价底线和现有资质。",
        highRisk ? "先完成成分、功效表述、检测报告和 HS 候选编码人工复核。" : "把资料转成可发给服务商的企业简介和产品清单。",
        `准备联系候选资源前所需材料，优先由团队或园区先核验 ${firstPartner} 的服务范围。`
      ]
    },
    {
      phase: "15-30 天",
      goal: "完成合规与报价框架",
      actions: [
        "确认目标市场标签、检测、包装和准入资料缺口。",
        "形成 EXW/FOB/CIF 等报价口径，明确样品政策和最小起订量。",
        agencyFirst ? "确定代理出口或园区综合服务边界。" : "复核现有外贸团队的职责分工。"
      ]
    },
    {
      phase: "31-60 天",
      goal: "服务商匹配与小批量路径验证",
      actions: [
        "向 2-3 家服务商询问认证、物流、报关、代理或平台服务方案。",
        "比较推荐口岸/港口路线的成本、时效、冷链和风险。",
        "完成样品寄送或模拟试单资料包。"
      ]
    },
    {
      phase: "61-90 天",
      goal: "形成第一次出海 SOP",
      actions: [
        "沉淀报价单、装箱单、合同条款、收款风控和服务商协同流程。",
        "根据反馈决定是否进入真实小批量试单。",
        "保留人工复核记录，不把系统建议当作最终法律或报关结论。"
      ]
    },
    {
      phase: "3-6 个月",
      goal: classification.type === "已有出口优化型" ? "优化渠道与复购" : "从试点转向稳定能力建设",
      actions: [
        "评估 B2B 平台、展会、代理和自建团队的投入产出。",
        "补齐长期认证、品牌资料、售后和客户管理能力。",
        "建立服务商白名单和风险事件复盘表。"
      ]
    }
  ];
}

function dedupeBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
    });
}

function buildRouteAssumptions(profile, routes) {
  const firstRoute = routes[0];
  return {
    origin: `${enterpriseLabelFor("provinces", profile.company.province)}${profile.company.city ? ` ${profile.company.city}` : ""}`,
    targetMarket: enterpriseLabelFor("targetMarkets", profile.trade.targetMarket),
    cargoBatch: profile.product.annualCapacity || "未填写",
    temperature: profile.product.coldChain ? "需温控/冷链" : "常温为主，仍需按产品复核",
    packageStatus: enterpriseLabelFor("packageStatus", profile.product.packageStatus),
    quoteNeeded: [
      "向 2-3 家货代核价样品、小批量和整柜/拼箱差异",
      "复核季节、通关、检疫、仓储、冷链和口岸排队风险",
      "确认目的城市、收货方资质、交货条款和保险责任",
      "用真实体积重量、包装尺寸和货值重算成本"
    ],
    selectedPathHypothesis: firstRoute
      ? `${firstRoute.name} 仅为路径假设，需货代按真实货量和目的地核价`
      : "尚未形成路径假设"
  };
}

function buildPaymentRiskModule(profile, riskAnalysis) {
  const rows = [
    {
      item: "付款方式",
      status: profile.trade.paymentReadiness || "未填写",
      action: "试单前明确 T/T、信用证、预付款比例、尾款节点和违约责任。"
    },
    {
      item: "币种与汇率",
      status: profile.trade.targetMarket === "russia" ? "对俄场景需重点复核" : "需按目标市场复核",
      action: "测算报价有效期、汇率波动区间和调价条款。"
    },
    {
      item: "买方资信",
      status: "系统不做最终信用判断",
      action: "通过商协会、信保、银行或服务商核验买方主体、付款记录和合同签署主体。"
    },
    {
      item: "交货条款",
      status: enterpriseLabelFor("quoteBasis", profile.trade.quoteBasis),
      action:
        profile.trade.quoteBasis === "ddp"
          ? "DDP/包税到门必须人工复核关税、清关、末端交付和税务责任。"
          : "确认 EXW/FOB/CIF 等条款下费用和风险转移节点。"
    }
  ];

  return {
    level: riskAnalysis.some((risk) => risk.ruleId === "R-INCOTERM-DDP" || risk.ruleId === "R-PAY-RU") ? "high" : "medium",
    rows,
    manualReviewRequired: true
  };
}

function verdictFromClassification(classification, scoreResult, risks) {
  if (classification.type === "高风险资料不足型" || risks.filter((risk) => risk.forceHumanReview).length >= 2) {
    return {
      level: "hold",
      title: "暂缓直接出海，先人工复核",
      text: "当前资料或监管风险较高，只建议补齐材料、联系专业机构复核，不建议直接报价或承诺交付。"
    };
  }
  if (scoreResult.overall >= 3.8 && !risks.some((risk) => risk.severity === "danger")) {
    return {
      level: "pilot",
      title: "可进入小批量试点",
      text: "企业具备一定外贸基础，可围绕推荐市场和服务商做低成本验证。"
    };
  }
  return {
    level: "prepare",
    title: "谨慎准备后试点",
    text: "企业有出海潜力，但资质、渠道、组织或资金仍需补强，建议先执行 90 天准备计划。"
  };
}

export function buildTobTemplateReport(assessment) {
  const {
    profile,
    classification,
    scoreResult,
    serviceNeeds,
    checklist,
    investmentPlan,
    timeline,
    markets,
    routes,
    partners,
    riskAnalysis,
    manualReviewFlags,
    verdictResult,
    aiMode = "template"
  } = assessment;

  const scoreLines = dimensions.map((dimension) => `- ${dimension.label}: ${scoreResult.scores[dimension.key].toFixed(1)} / 5`).join("\n");
  const needLines = serviceNeeds.map((need) => `- ${need.label}: ${need.reason} 投入参考：${need.investmentRange}`).join("\n");
  const checklistLines = checklist.map((item) => `- ${item.item}: ${item.status}，负责人建议：${item.owner}`).join("\n");
  const investmentLines = investmentPlan.map((item) => `- ${item.timing} | ${item.category}: ${item.item}，预算：${item.range}，优先级：${item.priority}`).join("\n");
  const timelineLines = timeline.map((phase) => `- ${phase.phase} ${phase.goal}: ${phase.actions.join("；")}`).join("\n");
  const riskLines = riskAnalysis.map((risk) => `- [${risk.severity}] ${risk.title}: ${risk.text}`).join("\n");
  const partnerLines = partners
    .map(
      (partner) =>
        `- ${partner.orgName}（${partner.orgType}）: ${partner.recommendationLevel}；${partner.matchReasons.join("；")}；公开联系：${partner.publicContact}；核验状态：${partner.trustLevel}；风险提示：${partner.riskNote}；联系前准备：${partner.contactChecklist.join("、")}`
    )
    .join("\n");
  const paymentLines = assessment.paymentRiskModule.rows
    .map((item) => `- ${item.item}: ${item.status}。建议：${item.action}`)
    .join("\n");
  const routeAssumptionLines = assessment.routeAssumptions.quoteNeeded.map((item) => `- ${item}`).join("\n");

  return `# 《北贸星桥企业外贸行动建议书》

## 1. 企业经营画像
企业名称：${profile.company.name || "未命名企业"}
所在地：${enterpriseLabelFor("provinces", profile.company.province)} ${profile.company.city || ""}
经营范围：${profile.company.businessScope || "未填写"}
主营业务：${profile.company.mainBusiness || "未填写"}
产品：${profile.product.name || "未填写"} / ${scoreResult.productProfile.name}
目标市场：${enterpriseLabelFor("targetMarkets", profile.trade.targetMarket)}
报告模式：${aiMode === "ai" ? "报告润色 + 规则结论" : "规则模板兜底"}

## 2. 外贸转型分类
企业分型：${classification.type}
阶段判断：${classification.stage}
产品风险分级：${classification.productRiskLevel}
结论：${verdictResult.title}
说明：${classification.summary}

## 3. 七维评分
综合准备度：${scoreResult.overall.toFixed(1)} / 5
${scoreLines}

## 4. 资料自检清单
${checklistLines}

## 5. 需要补齐的服务能力
${needLines}

## 6. 物质投入建议
${investmentLines}

## 7. 时间周期建议
${timelineLines}

## 8. 市场初筛与路径假设
市场初筛候选：${markets[0].name}，${markets[0].status}，评分 ${markets[0].total.toFixed(1)} / 5。
市场规则来源与边界：${markets[0].sourceNote} ${markets[0].ruleBoundary}
路径假设：${routes[0].name}，${routes[0].transport}，${routes[0].note}
路径规则来源与边界：${routes[0].sourceNote} ${routes[0].ruleBoundary}
路径核价假设：${assessment.routeAssumptions.selectedPathHypothesis}
起运地：${assessment.routeAssumptions.origin}
货物批量：${assessment.routeAssumptions.cargoBatch}
温控要求：${assessment.routeAssumptions.temperature}
需向货代核价：
${routeAssumptionLines}

## 9. 待核验候选服务资源
${partnerLines}

## 10. 收款、汇率与合同风控
风控等级：${assessment.paymentRiskModule.level}
${paymentLines}

## 11. 风险分析与人工复核
${riskLines}

人工复核项：${manualReviewFlags.length ? manualReviewFlags.join("；") : "仍需复核准入、合同、收款、关税、HS 编码和服务商资质。"}

## 12. 边界声明
本报告用于出海前诊断与资源匹配，不承诺订单、成交或收益；不替代报关、认证、税务、法务、HS 编码、关税和出口管制等专业判断。`;
}

export function assessTobCompany(input = {}) {
  const profile = normalizeTobProfile(input);
  const documents = validateDocuments(input.documents || input.profile?.documents || input.documentsMeta || []);
  const scoreResult = computeTobScores(profile, documents);
  const classification = classifyTobCompany(profile, scoreResult, documents);
  const riskAnalysis = computeTobRisks(profile, scoreResult, classification, documents);
  const serviceNeeds = computeServiceNeeds(profile, scoreResult, classification, riskAnalysis);
  const checklist = buildTobChecklist(profile, scoreResult, serviceNeeds, documents);
  const markets = computeTobMarkets(profile, scoreResult, riskAnalysis);
  const routes = computeTobRoutes(profile, markets[0]?.id || profile.trade.targetMarket);
  const routeAssumptions = buildRouteAssumptions(profile, routes);
  const partnerMatches = recommendTobPartners(profile, serviceNeeds, classification, routes);
  const investmentPlan = buildInvestmentPlan(profile, serviceNeeds);
  const timeline = buildTobTimeline(profile, classification, serviceNeeds, partnerMatches);
  const verdictResult = verdictFromClassification(classification, scoreResult, riskAnalysis);
  const paymentRiskModule = buildPaymentRiskModule(profile, riskAnalysis);
  const manualReviewFlags = riskAnalysis
    .filter((risk) => risk.forceHumanReview)
    .map((risk) => `${risk.ruleId}: ${risk.title}`);

  manualReviewFlags.push("所有 HS 编码、关税、准入、合同、收款和法律合规结论需人工复核");

  const assessment = {
    profile,
    company: profile.company,
    product: profile.product,
    trade: profile.trade,
    constraints: profile.constraints,
    documents,
    classification,
    scores: scoreResult.scores,
    scoreResult,
    serviceNeeds,
    checklist,
    investmentPlan,
    timeline,
    markets,
    routes,
    routeAssumptions,
    partnerMatches,
    partners: partnerMatches,
    riskAnalysis,
    paymentRiskModule,
    risks: riskAnalysis,
    manualReviewFlags,
    verdictResult,
    generatedAt: new Date().toISOString()
  };

  const templateReport = buildTobTemplateReport({ ...assessment, aiMode: "template" });
  return {
    ...assessment,
    templateReport,
    report: templateReport
  };
}
