const state = {
  catalog: null,
  assessment: null,
  documents: []
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

async function requestJson(kind, payload) {
  return window.NB_BRIDGE.send(kind, payload);
}

function labelFor(group, value) {
  return state.catalog?.options?.[group]?.find(([id]) => id === value)?.[1] || value || "未填写";
}

function populateSelect(id, rows) {
  const select = $(`#${id}`);
  select.innerHTML = rows.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
}

function shell() {
  document.body.innerHTML = `
    <div class="tob-shell">
      <aside class="tob-sidebar">
        <div class="brand">
          <div class="brand-mark">北</div>
          <div><p>NorthBridge Trade</p><h1>北贸星桥</h1></div>
        </div>
        <nav class="nav-list" aria-label="工作台导航">
          <button class="nav-item active" data-tab="profile" type="button">企业经营档案</button>
          <button class="nav-item" data-tab="product" type="button">产品与资料</button>
          <button class="nav-item" data-tab="result" type="button">评测结果</button>
          <button class="nav-item" data-tab="partners" type="button">待核验资源</button>
          <button class="nav-item" data-tab="plan" type="button">行动建议</button>
          <button class="nav-item" data-tab="report" type="button">报告中心</button>
        </nav>
        <div class="side-panel">
          <label class="field"><span>演示企业样例</span><select id="sampleSelect"></select></label>
          <button id="runBtn" class="primary-button" type="button">运行企业评测</button>
          <button id="reportBtn" class="secondary-button" type="button">生成行动建议书</button>
          <button id="copyBtn" class="ghost-button" type="button">复制报告</button>
        </div>
        <div class="system-indicator">
          <span id="serverStatus" class="signal-dot"></span>
          <div><strong id="statusText">规则模式</strong><p id="statusDetail">检测服务端状态</p></div>
        </div>
        <button id="settingsBtn" class="settings-link" type="button" hidden>系统维护</button>
      </aside>

      <main class="workspace">
        <header class="topbar tob-topbar">
          <div><p class="eyebrow">东北企业外贸转型评测与资源匹配</p><h2>企业填写经营信息，规则库先分类，系统生成可执行外贸行动建议</h2></div>
          <div class="guardrail-row"><span>ToB 评测</span><span>待核验资源库</span><span>人工复核边界</span></div>
        </header>

        <section class="kpi-grid">
          <div class="kpi-card"><span>企业分型</span><strong id="classification">待评测</strong><p id="stage">填写后生成</p></div>
          <div class="kpi-card"><span>准备度</span><strong id="overall">0.0</strong><p>满分 5 分</p></div>
          <div class="kpi-card"><span>市场候选</span><strong id="bestMarket">-</strong><p id="marketStatus">等待输入</p></div>
          <div class="kpi-card"><span>服务需求</span><strong id="needCount">0</strong><p>类能力待补齐</p></div>
        </section>

        <section id="tab-profile" class="tab-panel active">
          <form id="profileForm" class="tob-form">
            <div class="surface">
              <div class="section-heading"><span>01</span><h3>企业基础与经营范围</h3></div>
              <div class="form-grid">
                <label class="field"><span>企业名称</span><input id="companyName" type="text" /></label>
                <label class="field"><span>所在省份/通道</span><select id="province"></select></label>
                <label class="field"><span>城市</span><input id="city" type="text" /></label>
                <label class="field"><span>企业类型</span><select id="companyType"></select></label>
                <label class="field"><span>员工规模</span><select id="employeeScale"></select></label>
                <label class="field"><span>年营收区间</span><select id="annualRevenue"></select></label>
              </div>
              <label class="field"><span>注册经营范围</span><textarea id="businessScope" rows="3"></textarea></label>
              <label class="field"><span>当前主营业务与客户</span><textarea id="mainBusiness" rows="3"></textarea></label>
            </div>

            <div id="productBlock" class="embedded-panel">
              <div class="surface">
                <div class="section-heading"><span>02</span><h3>产品能力</h3></div>
                <div class="form-grid">
                  <label class="field"><span>主推产品名称</span><input id="productName" type="text" /></label>
                  <label class="field"><span>产品类别</span><select id="productCategory"></select></label>
                  <label class="field"><span>年产能/供货能力</span><input id="annualCapacity" type="text" /></label>
                  <label class="field"><span>保质期/售后周期</span><input id="shelfLife" type="text" /></label>
                  <label class="field"><span>包装标签状态</span><select id="packageStatus"></select></label>
                  <label class="field toggle-field"><input id="coldChain" type="checkbox" /><span>需要冷链或温控</span></label>
                </div>
                <label class="field"><span>产品说明</span><textarea id="productDescription" rows="3"></textarea></label>
                <label class="field"><span>规格、配料、包装参数</span><textarea id="productSpecs" rows="3"></textarea></label>
                <fieldset class="check-field compact-checks"><legend>已有资质/资料</legend>${["食品生产许可", "HACCP/ISO22000", "检测报告", "俄文/英文标签", "原产地证明", "报价单"].map((item) => `<label><input type="checkbox" name="certifications" value="${item}" /> ${item}</label>`).join("")}</fieldset>
              </div>
              <div class="surface">
                <div class="section-heading"><span>03</span><h3>资料上传摘要</h3></div>
                <input id="documentInput" class="file-input" type="file" multiple />
                <p id="uploadPolicy" class="upload-policy"></p>
                <div id="documentList" class="document-list"></div>
              </div>
            </div>

            <div class="surface">
              <div class="section-heading"><span>04</span><h3>外贸现状与投入约束</h3></div>
              <div class="form-grid">
                <label class="field"><span>目标市场</span><select id="targetMarket"></select></label>
                <label class="field"><span>外贸经验</span><select id="exportExperience"></select></label>
                <label class="field"><span>外贸团队</span><select id="teamSize"></select></label>
                <label class="field"><span>报价口径</span><select id="quoteBasis"></select></label>
                <label class="field"><span>预算档位</span><select id="budget"></select></label>
                <label class="field"><span>期望周期</span><select id="timelinePreference"></select></label>
                <label class="field"><span>风险承受</span><select id="riskTolerance"></select></label>
                <label class="field toggle-field"><input id="hasExportRight" type="checkbox" /><span>已有出口权或明确代理路径</span></label>
                <label class="field toggle-field"><input id="acceptsAgent" type="checkbox" checked /><span>接受外贸代理/园区服务模式</span></label>
              </div>
              <label class="field"><span>语言与团队能力</span><input id="languageCapability" type="text" /></label>
              <label class="field"><span>收款与合同准备</span><input id="paymentReadiness" type="text" /></label>
              <label class="field"><span>可投入人员</span><input id="staffAvailable" type="text" /></label>
              <label class="field"><span>当前最卡的问题</span><textarea id="bottlenecks" rows="3" placeholder="每行一个问题，例如：没有俄文标签、不了解报关资料、缺外贸团队"></textarea></label>
              <fieldset class="check-field compact-checks"><legend>现有渠道</legend>${["国内经销", "外贸公司", "B2B 平台", "展会/商协会", "海外客户线索"].map((item) => `<label><input type="checkbox" name="channels" value="${item}" /> ${item}</label>`).join("")}</fieldset>
            </div>
          </form>
        </section>

        <section id="tab-result" class="tab-panel">
          <div class="decision-grid"><div class="surface"><div class="section-heading"><span>05</span><h3>七维评分</h3></div><div id="scoreList" class="dimension-list"></div></div><div class="surface"><div class="section-heading"><span>06</span><h3>资料自检清单</h3></div><div id="checklist" class="checklist"></div></div></div>
          <div class="decision-grid"><div class="surface"><div class="section-heading"><span>07</span><h3>市场初筛</h3></div><div id="marketList" class="card-list"></div></div><div class="surface"><div class="section-heading"><span>08</span><h3>口岸路径假设</h3></div><div id="routeList" class="card-list"></div></div></div>
        </section>
        <section id="tab-partners" class="tab-panel"><div class="surface"><div class="section-heading"><span>09</span><h3>待核验服务资源库</h3></div><div id="partnerList" class="partner-grid"></div></div></section>
        <section id="tab-plan" class="tab-panel"><div class="decision-grid"><div class="surface"><div class="section-heading"><span>10</span><h3>需要补齐的服务能力</h3></div><div id="needs" class="card-list"></div></div><div class="surface"><div class="section-heading"><span>11</span><h3>物质投入清单</h3></div><div id="investments" class="card-list"></div></div></div><div class="surface"><div class="section-heading"><span>12</span><h3>90 天与 3-6 个月行动周期</h3></div><div id="timeline" class="timeline"></div></div><div class="surface"><div class="section-heading"><span>13</span><h3>风险分析与人工复核</h3></div><div id="risks" class="risk-list"></div></div></section>
        <section id="tab-report" class="tab-panel"><div class="surface report-panel"><div class="report-toolbar"><div><p class="eyebrow">Action Report</p><h3>企业外贸行动建议书</h3></div><span id="reportMode" class="mode-badge">规则模板</span></div><pre id="reportOutput"></pre></div><div class="surface"><div class="section-heading"><span>14</span><h3>公开数据与边界</h3></div><div id="sourceList" class="source-list"></div></div></section>
      </main>
    </div>

  `;
}

function setChecks(name, values = []) {
  $$(`input[name="${name}"]`).forEach((input) => {
    input.checked = values.includes(input.value);
  });
}

function checked(name) {
  return $$(`input[name="${name}"]:checked`).map((input) => input.value);
}

function applySample(sampleId) {
  const sample = state.catalog.samples.find((item) => item.id === sampleId) || state.catalog.samples[0];
  const { company, product, trade, constraints } = sample;
  $("#companyName").value = company.name || "";
  $("#province").value = company.province;
  $("#city").value = company.city || "";
  $("#companyType").value = company.companyType;
  $("#businessScope").value = company.businessScope || "";
  $("#mainBusiness").value = company.mainBusiness || "";
  $("#employeeScale").value = company.employeeScale;
  $("#annualRevenue").value = company.annualRevenue;
  $("#productName").value = product.name || "";
  $("#productCategory").value = product.category;
  $("#productDescription").value = product.description || "";
  $("#productSpecs").value = product.specs || "";
  $("#annualCapacity").value = product.annualCapacity || "";
  $("#shelfLife").value = product.shelfLife || "";
  $("#packageStatus").value = product.packageStatus;
  $("#coldChain").checked = Boolean(product.coldChain);
  $("#targetMarket").value = trade.targetMarket;
  $("#exportExperience").value = trade.exportExperience;
  $("#teamSize").value = trade.teamSize;
  $("#quoteBasis").value = trade.quoteBasis;
  $("#languageCapability").value = trade.languageCapability || "";
  $("#paymentReadiness").value = trade.paymentReadiness || "";
  $("#hasExportRight").checked = Boolean(trade.hasExportRight);
  $("#budget").value = constraints.budget;
  $("#timelinePreference").value = constraints.timelinePreference;
  $("#riskTolerance").value = constraints.riskTolerance;
  $("#staffAvailable").value = constraints.staffAvailable || "";
  $("#acceptsAgent").checked = Boolean(constraints.acceptsAgent);
  $("#bottlenecks").value = (constraints.bottlenecks || []).join("\n");
  setChecks("certifications", product.certifications || []);
  setChecks("channels", trade.channels || []);
  state.documents = (sample.documents || []).map(safeDocumentMeta);
  renderDocuments();
  runAssessment();
}

function readProfile() {
  return {
    company: { name: $("#companyName").value.trim(), province: $("#province").value, city: $("#city").value.trim(), companyType: $("#companyType").value, businessScope: $("#businessScope").value.trim(), mainBusiness: $("#mainBusiness").value.trim(), employeeScale: $("#employeeScale").value, annualRevenue: $("#annualRevenue").value },
    product: { name: $("#productName").value.trim(), category: $("#productCategory").value, description: $("#productDescription").value.trim(), specs: $("#productSpecs").value.trim(), annualCapacity: $("#annualCapacity").value.trim(), shelfLife: $("#shelfLife").value.trim(), coldChain: $("#coldChain").checked, packageStatus: $("#packageStatus").value, certifications: checked("certifications") },
    trade: { hasExportRight: $("#hasExportRight").checked, exportExperience: $("#exportExperience").value, teamSize: $("#teamSize").value, languageCapability: $("#languageCapability").value.trim(), channels: checked("channels"), targetMarket: $("#targetMarket").value, quoteBasis: $("#quoteBasis").value, paymentReadiness: $("#paymentReadiness").value.trim() },
    constraints: { budget: $("#budget").value, timelinePreference: $("#timelinePreference").value, riskTolerance: $("#riskTolerance").value, staffAvailable: $("#staffAvailable").value.trim(), acceptsAgent: $("#acceptsAgent").checked, bottlenecks: $("#bottlenecks").value.split(/\n+/).map((item) => item.trim()).filter(Boolean) },
    documents: state.documents.map(safeDocumentMeta)
  };
}

async function runAssessment() {
  const button = $("#runBtn");
  button.disabled = true;
  button.textContent = "评测中";
  try {
    const result = await requestJson("assess", readProfile());
    state.assessment = result;
    renderAssessment(result);
    $("#reportBtn").disabled = false;
  } finally {
    button.disabled = false;
    button.textContent = "运行企业评测";
  }
}

function renderAssessment(result) {
  $("#classification").textContent = result.classification.type;
  $("#stage").textContent = result.classification.stage;
  $("#overall").textContent = result.scoreResult.overall.toFixed(1);
  $("#bestMarket").textContent = result.markets[0]?.name || "-";
  $("#marketStatus").textContent = result.markets[0] ? `${result.markets[0].status} ${result.markets[0].total.toFixed(1)}` : "等待输入";
  $("#needCount").textContent = result.serviceNeeds.length;
  $("#reportOutput").textContent = result.report;
  $("#reportMode").textContent = "规则模板";
  renderScores(result);
  renderChecklist(result.checklist);
  renderMarkets(result.markets);
  renderRoutes(result.routes);
  renderNeeds(result.serviceNeeds);
  renderInvestments(result.investmentPlan);
  renderTimeline(result.timeline);
  renderRisks(result.riskAnalysis);
  renderPartners(result.partners);
}

function renderScores(result) {
  $("#scoreList").innerHTML = state.catalog.dimensions.map((dimension) => {
    const score = result.scoreResult.scores[dimension.key] || 0;
    return `<article class="dimension-item"><div class="dimension-top"><strong>${escapeHtml(dimension.label)}</strong><span>${score.toFixed(1)} / 5</span></div><div class="progress"><span style="width:${Math.round((score / 5) * 100)}%"></span></div><p>${escapeHtml(dimension.short || "")}</p></article>`;
  }).join("");
}

function renderChecklist(items) {
  $("#checklist").innerHTML = items.map((item) => `<article class="check-item"><div class="card-top"><strong>${escapeHtml(item.item)}</strong><span class="tag">${escapeHtml(item.status)}</span></div><p>${escapeHtml(item.owner)} · ${escapeHtml(item.priority)}</p></article>`).join("");
}

function renderMarkets(markets) {
  $("#marketList").innerHTML = markets.map((market) => `<article class="market-card"><div class="card-top"><h4>${escapeHtml(market.name)}</h4><span class="tag">${escapeHtml(market.status)}</span></div><p>${escapeHtml(market.note)}</p><p class="muted-line">${escapeHtml(market.sourceNote || "需公开数据二次核验")}</p><div class="mini-metrics"><span>机会 ${market.opportunity.toFixed(1)}</span><span>风险 ${market.risk.toFixed(1)}</span><span>总分 ${market.total.toFixed(1)}</span></div></article>`).join("");
}

function renderRoutes(routes) {
  $("#routeList").innerHTML = routes.slice(0, 4).map((route) => `<article class="route-card"><div class="card-top"><h4>${escapeHtml(route.name)}</h4><span class="tag">${route.total.toFixed(1)}</span></div><p>${escapeHtml(route.note)}</p><p class="muted-line">${escapeHtml(route.sourceNote || "需货代核价")}</p><div class="mini-metrics"><span>${escapeHtml(route.transport)}</span><span>成本 ${escapeHtml(route.costLevel)}</span><span>冷链 ${escapeHtml(route.coldChain)}</span></div></article>`).join("");
}

function renderNeeds(needs) {
  $("#needs").innerHTML = needs.map((need) => `<article class="market-card"><div class="card-top"><h4>${escapeHtml(need.label)}</h4><span class="tag">${escapeHtml(need.priority)}</span></div><p>${escapeHtml(need.reason)}</p><p class="muted-line">${escapeHtml(need.investmentRange)}</p></article>`).join("");
}

function renderInvestments(items) {
  $("#investments").innerHTML = items.map((item) => `<article class="market-card"><div class="card-top"><h4>${escapeHtml(item.category)}</h4><span class="tag">${escapeHtml(item.timing)}</span></div><p><strong>${escapeHtml(item.item)}</strong></p><p>${escapeHtml(item.range)}</p><p class="muted-line">${escapeHtml(item.rationale)}</p></article>`).join("");
}

function renderTimeline(phases) {
  $("#timeline").innerHTML = phases.map((phase) => `<article class="timeline-item"><h4>${escapeHtml(phase.phase)} · ${escapeHtml(phase.goal)}</h4><ul>${phase.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ul></article>`).join("");
}

function renderRisks(risks) {
  $("#risks").innerHTML = risks.map((risk) => `<article class="risk-item ${escapeHtml(risk.severity)}"><div class="card-top"><strong>${escapeHtml(risk.title)}</strong><span class="tag">${escapeHtml(risk.ruleId)}</span></div><p>${escapeHtml(risk.text)}</p></article>`).join("");
}

function serviceLabel(id) {
  return state.catalog.serviceTypes.find((item) => item.id === id)?.label || id;
}

function renderPartners(partners) {
  $("#partnerList").innerHTML = partners.map((partner) => `<article class="partner-card"><div class="partner-top"><h4>${escapeHtml(partner.orgName)}</h4><span class="tag">${partner.matchScore.toFixed(1)}</span></div><p><strong>${escapeHtml(partner.orgType)}</strong> · ${escapeHtml(partner.city)}</p><p><span class="tag">${escapeHtml(partner.recommendationLevel || "待核验候选")}</span></p><p>${escapeHtml(partner.businessScope)}</p><p>服务类型：${partner.serviceTypes.map((id) => escapeHtml(serviceLabel(id))).join("、")}</p><p>匹配原因：${escapeHtml(partner.matchReasons.join("；"))}</p><p>公开联系：${escapeHtml(partner.publicContact)}</p><p>联系前准备：${escapeHtml(partner.contactChecklist.join("、"))}</p><p class="trust">${escapeHtml(partner.trustLevel)} · ${escapeHtml(partner.riskNote || "需人工核验服务范围和联系方式")}</p></article>`).join("");
}

async function handleFiles(event) {
  const files = [...event.target.files];
  const policy = state.catalog.uploadPolicy;
  const accepted = [];
  for (const file of files.slice(0, policy.maxFiles)) {
    const extension = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || "";
    accepted.push(safeDocumentMeta({ id: `${Date.now()}-${accepted.length}`, name: file.name, size: file.size, type: file.type, extension }));
  }
  state.documents = accepted;
  renderDocuments();
}

function safeDocumentMeta(doc = {}) {
  const name = doc.name || doc.fileName || "未命名资料";
  const extension = doc.extension || name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || "";
  return {
    id: doc.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    extension,
    size: Number(doc.size || doc.fileSize || 0),
    type: doc.type || doc.mimeType || extension || "未知类型",
    summary: inferDocumentSummary(name, extension)
  };
}

function inferDocumentSummary(name, extension) {
  const lower = `${name} ${extension}`.toLowerCase();
  if (lower.includes("license") || lower.includes("营业执照")) return "已登记主体资质文件元数据，原文需人工查看。";
  if (lower.includes("cert") || lower.includes("认证") || lower.includes("检测")) return "已登记认证/检测材料元数据，原文需人工查看。";
  if (lower.includes("quote") || lower.includes("报价") || lower.includes("price")) return "已登记报价或价格材料元数据，原文需人工查看。";
  if (lower.includes("label") || lower.includes("标签")) return "已登记标签/包装材料元数据，原文需人工查看。";
  return "已登记文件元数据，不读取或发送原文内容。";
}

function renderDocuments() {
  const policy = state.catalog?.uploadPolicy;
  if (policy) {
    $("#uploadPolicy").textContent = `允许 ${policy.allowedExtensions.join("、")}；单文件不超过 ${policy.maxFileSizeMb}MB。${policy.privacyNote}`;
    $("#documentInput").accept = policy.allowedExtensions.join(",");
  }
  $("#documentList").innerHTML = state.documents.length ? state.documents.map((doc) => `<article class="doc-row"><strong>${escapeHtml(doc.name)}</strong><p>${(Number(doc.size || 0) / 1024).toFixed(1)} KB · ${escapeHtml(doc.type || "未知类型")}</p><p>${escapeHtml(doc.summary || "已登记资料")}</p></article>`).join("") : `<article class="doc-row"><strong>暂无资料</strong><p>可选择营业执照、产品手册、检测报告、认证证书、报价单、标签包装等。</p></article>`;
}

async function generateReport() {
  if (!state.assessment) return;
  const button = $("#reportBtn");
  button.disabled = true;
  button.textContent = "生成中";
  try {
    const result = await requestJson("draft", { assessment: state.assessment });
    state.assessment.report = result.report;
    $("#reportOutput").textContent = result.report;
    $("#reportMode").textContent = result.mode === "ai" ? "报告润色" : "规则模板";
  } finally {
    button.disabled = false;
    button.textContent = "生成行动建议书";
  }
}


async function detectHealth() {
  try {
    await requestJson("status");
    $("#serverStatus").classList.add("ok");
    $("#statusText").textContent = "规则模式";
    $("#statusDetail").textContent = "使用规则模板兜底";
  } catch {
    $("#serverStatus").classList.remove("ok");
    $("#statusText").textContent = "离线";
    $("#statusDetail").textContent = "未连接后端服务";
  }
}

function bindTabs() {
  $$('[data-tab]').forEach((button) => {
    button.addEventListener("click", () => {
      $$('[data-tab]').forEach((item) => item.classList.remove("active"));
      $$(".workspace > .tab-panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      const tab = button.dataset.tab === "product" ? "profile" : button.dataset.tab;
      $(`#tab-${tab}`)?.classList.add("active");
      if (button.dataset.tab === "product") $("#productBlock")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderSources() {
  $("#sourceList").innerHTML = state.catalog.sources.map((source) => `<article class="source-item"><strong><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a></strong><p>${escapeHtml(source.purpose)}</p></article>`).join("");
}

async function copyReport() {
  const text = $("#reportOutput").textContent;
  if (!text) return;
  await navigator.clipboard.writeText(text);
  const button = $("#copyBtn");
  button.textContent = "已复制";
  setTimeout(() => { button.textContent = "复制报告"; }, 1200);
}

async function init() {
  shell();
  bindTabs();
  state.catalog = await requestJson("boot");
  populateSelect("province", state.catalog.options.provinces);
  populateSelect("companyType", state.catalog.options.companyTypes);
  populateSelect("employeeScale", state.catalog.options.employeeScale);
  populateSelect("annualRevenue", state.catalog.options.revenueScale);
  populateSelect("productCategory", state.catalog.options.productCategories);
  populateSelect("packageStatus", state.catalog.options.packageStatus);
  populateSelect("targetMarket", state.catalog.options.targetMarkets);
  populateSelect("exportExperience", state.catalog.options.exportExperience);
  populateSelect("teamSize", state.catalog.options.teamSize);
  populateSelect("quoteBasis", state.catalog.options.quoteBasis);
  populateSelect("budget", state.catalog.options.budget);
  populateSelect("timelinePreference", state.catalog.options.timelinePreference);
  populateSelect("riskTolerance", state.catalog.options.riskTolerance);
  $("#sampleSelect").innerHTML = state.catalog.samples.map((sample) => `<option value="${escapeHtml(sample.id)}">${escapeHtml(sample.name)}</option>`).join("");
  $("#sampleSelect").addEventListener("change", (event) => applySample(event.target.value));
  $("#runBtn").addEventListener("click", runAssessment);
  $("#reportBtn").addEventListener("click", generateReport);
  $("#copyBtn").addEventListener("click", copyReport);
  $("#documentInput").addEventListener("change", handleFiles);
  $("#profileForm").addEventListener("change", () => { if (state.assessment) runAssessment(); });
  $("#reportBtn").disabled = true;
  renderSources();
  renderDocuments();
  await detectHealth();
  applySample(state.catalog.samples[0].id);
}

init().catch((error) => {
  document.body.innerHTML = `<main class="fatal-error">初始化失败：${escapeHtml(error.message)}</main>`;
});
