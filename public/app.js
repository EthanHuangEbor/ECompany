const state = {
  bootstrap: null,
  documents: [],
  assessment: null,
  health: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
}

function labelFor(group, value) {
  return state.bootstrap?.options?.[group]?.find(([id]) => id === value)?.[1] || value || "未填写";
}

function populateSelect(id, rows) {
  const select = $(`#${id}`);
  select.innerHTML = rows.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
}

function applySample(sampleId) {
  const sample = state.bootstrap.samples.find((item) => item.id === sampleId) || state.bootstrap.samples[0];
  $("#companyName").value = sample.companyName;
  $("#province").value = sample.province;
  $("#city").value = sample.city;
  $("#industry").value = sample.industry;
  $("#productCategory").value = sample.productCategory;
  $("#productDescription").value = sample.productDescription;
  $("#annualCapacity").value = sample.annualCapacity;
  $("#targetMarket").value = sample.targetMarket;
  $("#exportExperience").value = sample.exportExperience;
  $("#teamSize").value = sample.teamSize;
  $("#languageCapability").value = sample.languageCapability;
  $("#budget").value = sample.budget;
  $("#hasExportRight").checked = sample.hasExportRight;

  $$("input[name='certifications']").forEach((input) => {
    input.checked = sample.certifications.includes(input.value);
  });
  $$("input[name='channels']").forEach((input) => {
    input.checked = sample.channels.includes(input.value);
  });

  state.documents = sample.documents || [];
  renderDocuments();
  runAssessment();
}

function readProfile() {
  return {
    companyName: $("#companyName").value.trim(),
    province: $("#province").value,
    city: $("#city").value.trim(),
    industry: $("#industry").value,
    productCategory: $("#productCategory").value,
    productDescription: $("#productDescription").value.trim(),
    annualCapacity: $("#annualCapacity").value.trim(),
    targetMarket: $("#targetMarket").value,
    exportExperience: $("#exportExperience").value,
    teamSize: $("#teamSize").value,
    languageCapability: $("#languageCapability").value.trim(),
    budget: $("#budget").value,
    hasExportRight: $("#hasExportRight").checked,
    certifications: $$("input[name='certifications']:checked").map((input) => input.value),
    channels: $$("input[name='channels']:checked").map((input) => input.value)
  };
}

async function runAssessment() {
  const button = $("#runAssessmentBtn");
  button.textContent = "评测中";
  button.disabled = true;
  try {
    const result = await api("/api/assessments", {
      method: "POST",
      body: JSON.stringify({
        profile: readProfile(),
        documents: state.documents
      })
    });
    state.assessment = result;
    renderAssessment(result);
    $("#aiReportBtn").disabled = false;
  } catch (error) {
    $("#reportOutput").textContent = `评测失败：${error.message}`;
  } finally {
    button.textContent = "运行评测";
    button.disabled = false;
  }
}

async function generateAiReport() {
  if (!state.assessment) return;
  const button = $("#aiReportBtn");
  button.textContent = "生成中";
  button.disabled = true;
  try {
    const result = await api("/api/ai/report", {
      method: "POST",
      body: JSON.stringify({ assessment: state.assessment })
    });
    state.assessment.report = result.report;
    $("#reportOutput").textContent = result.report;
    $("#reportMode").textContent = result.mode === "ai" ? "AI 润色" : "规则模板";
    if (result.fallbackReason) {
      $("#reportMode").textContent += `：${result.fallbackReason}`;
    }
  } catch (error) {
    $("#reportOutput").textContent = `报告生成失败：${error.message}`;
  } finally {
    button.textContent = "生成 AI 报告";
    button.disabled = false;
  }
}

async function handleFiles(event) {
  const files = [...event.target.files];
  const policy = state.bootstrap.uploadPolicy;
  const accepted = [];

  for (const file of files.slice(0, policy.maxFiles)) {
    const extension = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || "";
    let text = "";
    if ([".txt", ".csv"].includes(extension) && file.size <= policy.maxFileSizeMb * 1024 * 1024) {
      text = await file.text();
    }
    accepted.push({
      id: `${Date.now()}-${accepted.length}`,
      name: file.name,
      size: file.size,
      type: file.type,
      text,
      summary: text ? text.slice(0, 160) : "已登记文件元数据，待后端规则检查"
    });
  }

  state.documents = accepted;
  renderDocuments();
}

function renderDocuments() {
  const policy = state.bootstrap?.uploadPolicy;
  if (policy) {
    $("#uploadPolicy").textContent = `允许 ${policy.allowedExtensions.join("、")}；单文件不超过 ${policy.maxFileSizeMb}MB；${policy.privacyNote}`;
    $("#documentInput").accept = policy.allowedExtensions.join(",");
  }

  $("#documentList").innerHTML = state.documents.length
    ? state.documents
        .map(
          (doc) => `
          <article class="doc-row">
            <strong>${escapeHtml(doc.name)}</strong>
            <p>${(Number(doc.size || 0) / 1024).toFixed(1)} KB · ${escapeHtml(doc.type || "未知类型")}</p>
            <p>${escapeHtml(doc.summary || "已登记资料")}</p>
          </article>
        `
        )
        .join("")
    : `<article class="doc-row"><strong>暂无资料</strong><p>可选择营业执照、产品手册、检测报告、认证证书、报价单等资料。</p></article>`;
}

function renderAssessment(assessment) {
  const score = assessment.scoreResult.overall;
  $("#overallScore").textContent = score.toFixed(1);
  $("#verdictTitle").textContent = assessment.verdictResult.title;
  $("#bestMarket").textContent = assessment.markets[0]?.name || "-";
  $("#marketStatus").textContent = assessment.markets[0] ? `${assessment.markets[0].status} · ${assessment.markets[0].total.toFixed(1)}` : "等待输入";
  $("#bestRoute").textContent = assessment.routes[0]?.name || "-";
  $("#routeNote").textContent = assessment.routes[0]?.note || "等待输入";
  $("#partnerCount").textContent = assessment.partners.length;
  $("#reportOutput").textContent = assessment.report;
  $("#reportMode").textContent = "规则模板";

  renderRadar(assessment.scoreResult.scores);
  renderDimensions(assessment);
  renderMarkets(assessment.markets);
  renderRoutes(assessment.routes);
  renderPartners(assessment.partners);
  renderChecklist(assessment.checklist);
  renderRisks(assessment.risks);
  renderActions(assessment.actions);
}

function renderRadar(scores) {
  const canvas = $("#radarCanvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const center = { x: w / 2, y: h / 2 + 8 };
  const radius = 112;
  const dims = state.bootstrap.dimensions;

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#d8e2dc";
  ctx.fillStyle = "#5c6b62";
  ctx.font = "13px Segoe UI, sans-serif";
  ctx.textAlign = "center";

  for (let ring = 1; ring <= 5; ring += 1) {
    ctx.beginPath();
    dims.forEach((dimension, index) => {
      const angle = (Math.PI * 2 * index) / dims.length - Math.PI / 2;
      const r = (radius * ring) / 5;
      const x = center.x + Math.cos(angle) * r;
      const y = center.y + Math.sin(angle) * r;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  }

  dims.forEach((dimension, index) => {
    const angle = (Math.PI * 2 * index) / dims.length - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius);
    ctx.stroke();
    ctx.fillText(dimension.label, center.x + Math.cos(angle) * (radius + 42), center.y + Math.sin(angle) * (radius + 28));
  });

  ctx.beginPath();
  dims.forEach((dimension, index) => {
    const angle = (Math.PI * 2 * index) / dims.length - Math.PI / 2;
    const r = (radius * (scores[dimension.key] || 0)) / 5;
    const x = center.x + Math.cos(angle) * r;
    const y = center.y + Math.sin(angle) * r;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(33, 133, 84, 0.22)";
  ctx.strokeStyle = "#1c6f45";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  dims.forEach((dimension, index) => {
    const angle = (Math.PI * 2 * index) / dims.length - Math.PI / 2;
    const r = (radius * (scores[dimension.key] || 0)) / 5;
    ctx.beginPath();
    ctx.fillStyle = "#c7902e";
    ctx.arc(center.x + Math.cos(angle) * r, center.y + Math.sin(angle) * r, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function renderDimensions(assessment) {
  $("#dimensionList").innerHTML = state.bootstrap.dimensions
    .map((dimension) => {
      const score = assessment.scoreResult.scores[dimension.key] || 0;
      return `
        <article class="dimension-item">
          <div class="dimension-top">
            <strong>${escapeHtml(dimension.label)}</strong>
            <span>${score.toFixed(1)} / 5</span>
          </div>
          <div class="progress"><span style="width:${Math.round((score / 5) * 100)}%"></span></div>
          <p>${dimensionText(dimension.key, score)}</p>
        </article>
      `;
    })
    .join("");
}

function dimensionText(key, score) {
  const weak = score < 2.6;
  const texts = {
    product: weak ? "产品资料和目标市场适配仍需补充。" : "产品基础适配度较好，可进入市场对比。",
    compliance: weak ? "认证、标签或出口主体材料不足。" : "已有基础合规材料，但仍需人工复核。",
    supply: weak ? "产能、交付或保质期证明需要补齐。" : "供应交付具备试点基础。",
    channel: weak ? "渠道基础薄弱，建议优先联系外贸服务机构。" : "已有一定渠道或代理基础。",
    organization: weak ? "外贸团队和语言能力不足。" : "组织能力可支撑小批量验证。",
    finance: weak ? "资金承受能力偏弱，应控制试点成本。" : "资金状态可支持阶段性投入。",
    digital: weak ? "数字资料、产品页和平台运营基础不足。" : "数字化材料可支持报告和平台入驻。"
  };
  return texts[key] || "等待规则解释。";
}

function renderMarkets(markets) {
  $("#marketList").innerHTML = markets
    .map(
      (market) => `
        <article class="market-card">
          <div class="card-top">
            <h4>${escapeHtml(market.name)}</h4>
            <span class="tag">${escapeHtml(market.status)}</span>
          </div>
          <p>${escapeHtml(market.note)}</p>
          <div class="mini-metrics">
            <span>机会 ${market.opportunity.toFixed(1)}</span>
            <span>风险 ${market.risk.toFixed(1)}</span>
            <span>总分 ${market.total.toFixed(1)}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderRoutes(routes) {
  $("#routeList").innerHTML = routes
    .slice(0, 4)
    .map(
      (route) => `
        <article class="route-card">
          <div class="card-top">
            <h4>${escapeHtml(route.name)}</h4>
            <span class="tag">${route.total.toFixed(1)}</span>
          </div>
          <p>${escapeHtml(route.note)}</p>
          <div class="mini-metrics">
            <span>${escapeHtml(route.transport)}</span>
            <span>成本 ${escapeHtml(route.costLevel)}</span>
            <span>冷链 ${escapeHtml(route.coldChain)}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderPartners(partners) {
  $("#partnerList").innerHTML = partners
    .map(
      (partner) => `
        <article class="partner-card">
          <div class="partner-top">
            <h4>${escapeHtml(partner.orgName)}</h4>
            <span class="tag">${partner.matchScore.toFixed(1)}</span>
          </div>
          <p><strong>${escapeHtml(partner.orgType)}</strong> · ${escapeHtml(partner.city)}</p>
          <p>${escapeHtml(partner.serviceScope.join("、"))}</p>
          <p>匹配原因：${escapeHtml(partner.matchReasons.join("；"))}</p>
          <p>公开联系：${escapeHtml(partner.publicContact)}</p>
          <p class="trust">${escapeHtml(partner.trustLevel)}</p>
        </article>
      `
    )
    .join("");
}

function renderChecklist(items) {
  $("#checklist").innerHTML = items
    .map(
      (item) => `
        <article class="check-item">
          <div class="card-top">
            <strong>${escapeHtml(item.item)}</strong>
            <span class="tag">${escapeHtml(item.status)}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderRisks(risks) {
  $("#riskList").innerHTML = risks
    .map(
      (risk) => `
        <article class="risk-item ${escapeHtml(risk.severity)}">
          <div class="card-top">
            <strong>${escapeHtml(risk.title)}</strong>
            <span class="tag">${escapeHtml(risk.ruleId)}</span>
          </div>
          <p>${escapeHtml(risk.text)}</p>
        </article>
      `
    )
    .join("");
}

function renderActions(actions) {
  $("#actionPlan").innerHTML = actions
    .map(
      (item) => `
        <article class="timeline-item">
          <h4>${escapeHtml(item.phase)}</h4>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `
    )
    .join("");
}

function renderSources() {
  $("#sourceList").innerHTML = state.bootstrap.sources
    .map(
      (source) => `
        <article class="source-item">
          <strong><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a></strong>
          <p>${escapeHtml(source.purpose)}</p>
        </article>
      `
    )
    .join("");
}

function bindTabs() {
  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".nav-item").forEach((item) => item.classList.remove("active"));
      $$(".tab-panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      $(`#tab-${button.dataset.tab}`).classList.add("active");
    });
  });
}

async function detectHealth() {
  try {
    state.health = await api("/api/health");
    $("#serverStatus").classList.add("ok");
    $("#aiStatusText").textContent = state.health.aiConfigured ? "AI 可用" : "规则模式";
    $("#aiStatusDetail").textContent = state.health.aiEnabled
      ? state.health.aiConfigured
        ? "服务端已配置模型与密钥"
        : "AI 已开启但缺少服务端配置"
      : "AI 关闭，使用规则兜底";
  } catch {
    $("#serverStatus").classList.remove("ok");
    $("#aiStatusText").textContent = "离线";
    $("#aiStatusDetail").textContent = "未连接后端服务";
  }
}

async function copyReport() {
  const text = $("#reportOutput").textContent;
  if (!text) return;
  await navigator.clipboard.writeText(text);
  const button = $("#copyReportBtn");
  button.textContent = "已复制";
  setTimeout(() => {
    button.textContent = "复制报告";
  }, 1200);
}

async function init() {
  bindTabs();
  await detectHealth();
  state.bootstrap = await api("/api/bootstrap");
  populateSelect("province", state.bootstrap.options.provinces);
  populateSelect("industry", state.bootstrap.options.industries);
  populateSelect("productCategory", state.bootstrap.options.productCategories);
  populateSelect("targetMarket", state.bootstrap.options.targetMarkets);
  populateSelect("exportExperience", state.bootstrap.options.exportExperience);
  populateSelect("teamSize", state.bootstrap.options.teamSize);
  populateSelect("budget", state.bootstrap.options.budget);
  $("#sampleSelect").innerHTML = state.bootstrap.samples.map((sample) => `<option value="${escapeHtml(sample.id)}">${escapeHtml(sample.name)}</option>`).join("");

  $("#sampleSelect").addEventListener("change", (event) => applySample(event.target.value));
  $("#runAssessmentBtn").addEventListener("click", runAssessment);
  $("#aiReportBtn").addEventListener("click", generateAiReport);
  $("#copyReportBtn").addEventListener("click", copyReport);
  $("#documentInput").addEventListener("change", handleFiles);
  $("#profileForm").addEventListener("change", () => {
    if (state.assessment) runAssessment();
  });

  renderSources();
  renderDocuments();
  $("#aiReportBtn").disabled = true;
  applySample(state.bootstrap.samples[0].id);
}

init().catch((error) => {
  $("#reportOutput").textContent = `初始化失败：${error.message}`;
});
