import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { assessTobCompany, buildTobTemplateReport, filterTobPartners } from "./engine.mjs";
import {
  dimensions,
  enterpriseOptions,
  marketRules,
  ports,
  serviceTypes,
  sources,
  tobSamples,
  tobServicePartners,
  uploadPolicy
} from "./data.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = resolve(__dirname, "..");
const publicDir = join(rootDir, "public");
const storageDir = join(rootDir, "storage", "assessments");
const defaultMinimaxEndpoint = "https://api.minimax.chat/v1/text/chatcompletion_v2";
const allowedMinimaxHosts = new Set(["api.minimax.chat", "api.minimaxi.chat"]);

loadDotEnv();

const port = Number(process.env.PORT || 5178);
const runtimeAiConfig = createRuntimeAiConfig();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);

    if (url.pathname === "/api/health" && request.method === "GET") {
      return sendJson(response, {
        ok: true,
        product: "北贸星桥 / NorthBridge Trade",
        aiProvider: "minimax",
        aiEnabled: runtimeAiConfig.enabled,
        aiConfigured: isAiConfigured(),
        fallbackEnabled: runtimeAiConfig.errorFallback
      });
    }

    if (url.pathname === "/api/ai/config" && request.method === "GET") {
      return sendJson(response, getSafeAiConfig());
    }

    if (url.pathname === "/api/ai/config" && request.method === "POST") {
      requireAdmin(request);
      const body = await readJson(request);
      updateRuntimeAiConfig(body);
      return sendJson(response, getSafeAiConfig());
    }

    if (url.pathname === "/api/bootstrap" && request.method === "GET") {
      return sendJson(response, {
        dimensions,
        serviceTypes,
        marketRules,
        options: enterpriseOptions,
        ports,
        samples: tobSamples,
        servicePartners: tobServicePartners,
        sources,
        uploadPolicy
      });
    }

    if (url.pathname === "/api/assessments" && request.method === "POST") {
      const body = await readJson(request);
      const assessment = assessTobCompany(body);
      const id = randomUUID();
      const storedAssessment = { id, ...assessment };
      await persistAssessment(storedAssessment);
      return sendJson(response, storedAssessment, 201);
    }

    if (url.pathname === "/api/partners" && request.method === "GET") {
      return sendJson(
        response,
        filterTobPartners({
          province: url.searchParams.get("province") || "",
          market: url.searchParams.get("market") || "",
          productCategory: url.searchParams.get("productCategory") || "",
          serviceNeed: url.searchParams.get("serviceNeed") || "",
          stage: url.searchParams.get("stage") || ""
        })
      );
    }

    if (url.pathname === "/api/ai/report" && request.method === "POST") {
      const body = await readJson(request);
      const reportResult = await generateAiReport(body.assessment || body);
      return sendJson(response, reportResult);
    }

    if (url.pathname === "/app.js" && request.method === "GET") {
      const appSource = await readFile(join(rootDir, "src", "runtime-app.js"), "utf8");
      response.writeHead(200, {
        "Content-Type": "text/javascript; charset=utf-8",
        "Cache-Control": "no-store"
      });
      response.end(`${buildBridgeScript()}\n${appSource}`);
      return;
    }

    if (url.pathname === "/bridge.js" && request.method === "GET") {
      response.writeHead(200, {
        "Content-Type": "text/javascript; charset=utf-8",
        "Cache-Control": "no-store"
      });
      response.end(buildBridgeScript());
      return;
    }

    return serveStatic(url.pathname, response);
  } catch (error) {
    console.error(error);
    return sendJson(
      response,
      {
        ok: false,
        error: "SERVER_ERROR",
        message: error.message || "服务器处理失败"
      },
      500
    );
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`NorthBridge Trade running at http://127.0.0.1:${port}`);
});

function loadDotEnv() {
  const envPath = join(rootDir, ".env");
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
    }
  }
}

function createRuntimeAiConfig() {
  return {
    provider: "minimax",
    enabled: process.env.AI_ENABLED === "true",
    errorFallback: process.env.AI_ERROR_FALLBACK !== "false",
    minimax: {
      apiKey: process.env.MINIMAX_API_KEY || "",
      model: process.env.MINIMAX_MODEL || "MiniMax-Text-01",
      endpoint: sanitizeHttpsEndpoint(process.env.MINIMAX_ENDPOINT || defaultMinimaxEndpoint),
      groupId: process.env.MINIMAX_GROUP_ID || ""
    }
  };
}

function getActiveProviderConfig() {
  return runtimeAiConfig.minimax || {};
}

function isAiConfigured() {
  const providerConfig = getActiveProviderConfig();
  return Boolean(providerConfig.apiKey && providerConfig.model);
}

function maskKey(value = "") {
  if (!value) return "";
  if (value.length <= 8) return "********";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function getSafeAiConfig() {
  return {
    provider: "minimax",
    enabled: runtimeAiConfig.enabled,
    errorFallback: runtimeAiConfig.errorFallback,
    configured: isAiConfigured(),
    adminWritable: Boolean(process.env.ADMIN_TOKEN),
    minimax: {
      model: runtimeAiConfig.minimax.model,
      endpoint: runtimeAiConfig.minimax.endpoint,
      groupIdSet: Boolean(runtimeAiConfig.minimax.groupId),
      apiKeySet: Boolean(runtimeAiConfig.minimax.apiKey)
    }
  };
}

function updateRuntimeAiConfig(body = {}) {
  if (typeof body.enabled === "boolean") runtimeAiConfig.enabled = body.enabled;
  if (typeof body.errorFallback === "boolean") runtimeAiConfig.errorFallback = body.errorFallback;

  const minimax = body.minimax || body;
  if (minimax) {
    if (typeof minimax.model === "string" && minimax.model.trim()) runtimeAiConfig.minimax.model = minimax.model.trim();
    if (typeof minimax.endpoint === "string" && minimax.endpoint.trim()) {
      runtimeAiConfig.minimax.endpoint = sanitizeHttpsEndpoint(minimax.endpoint.trim());
    }
    if (typeof minimax.groupId === "string") runtimeAiConfig.minimax.groupId = minimax.groupId.trim();
    if (typeof minimax.apiKey === "string" && minimax.apiKey.trim()) {
      runtimeAiConfig.minimax.apiKey = minimax.apiKey.trim();
    }
  }
}

function sanitizeHttpsEndpoint(value) {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:") {
    throw new Error("MiniMax endpoint 必须使用 https://");
  }
  if (!allowedMinimaxHosts.has(parsed.hostname)) {
    throw new Error("MiniMax endpoint 仅允许官方 API 域名");
  }
  return parsed.toString();
}

function requireAdmin(request) {
  const token = process.env.ADMIN_TOKEN || "";
  if (!token) {
    throw new Error("后台配置写入已关闭，请通过 .env 配置 ADMIN_TOKEN 和 MINIMAX_API_KEY");
  }
  const provided = request.headers["x-admin-token"] || "";
  if (provided !== token) {
    throw new Error("缺少有效后台维护令牌");
  }
  const origin = request.headers.origin || "";
  if (origin && !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) {
    throw new Error("拒绝跨源后台配置请求");
  }
  const contentType = request.headers["content-type"] || "";
  if (!contentType.includes("application/json")) {
    throw new Error("后台配置仅接受 JSON 请求");
  }
}

async function persistAssessment(assessment) {
  await mkdir(storageDir, { recursive: true });
  await writeFile(join(storageDir, `${assessment.id}.json`), JSON.stringify(assessment, null, 2), "utf8");
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 2 * 1024 * 1024) {
      throw new Error("请求体超过 2MB，MVP 仅接收资料摘要和元数据。");
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function generateAiReport(assessment) {
  const cleanAssessment = sanitizeAssessmentForReport(assessment);
  const fallbackReport = buildTobTemplateReport({ ...cleanAssessment, aiMode: "template" });

  if (!runtimeAiConfig.enabled) {
    return {
      mode: "template",
      fallbackReason: "外部报告润色服务未开启",
      report: fallbackReport
    };
  }

  if (!isAiConfigured()) {
    return {
      mode: "template",
      fallbackReason: "外部报告润色服务未完成配置",
      report: fallbackReport
    };
  }

  try {
    const aiText = await callAiReport(cleanAssessment);
    return {
      mode: "ai",
      fallbackReason: "",
      report: aiText
    };
  } catch (error) {
    if (!runtimeAiConfig.errorFallback) throw error;
    return {
      mode: "template",
      fallbackReason: `外部报告润色失败，已降级为规则模板`,
      report: fallbackReport
    };
  }
}

function sanitizeAssessmentForReport(assessment = {}) {
  const profile = assessment.profile || {};
  return {
    ...assessment,
    profile: {
      ...profile,
      documents: []
    },
    documents: (assessment.documents || []).slice(0, 8).map((doc) => ({
      id: doc.id,
      name: doc.name || doc.fileName || "未命名资料",
      extension: doc.extension || extname(doc.name || doc.fileName || "").toLowerCase(),
      size: Number(doc.size || doc.fileSize || 0),
      summary: safeDocumentSummary(doc),
      piiDetected: Boolean(doc.piiDetected),
      status: doc.status === "accepted" ? "accepted" : "review",
      warnings: doc.piiDetected || doc.status !== "accepted" ? ["资料需人工复核，原文未进入报告接口"] : []
    }))
  };
}

function safeDocumentSummary(doc = {}) {
  const name = `${doc.name || doc.fileName || ""} ${doc.extension || ""}`.toLowerCase();
  if (name.includes("license") || name.includes("营业执照")) return "已登记主体资质文件元数据，原文需人工查看。";
  if (name.includes("cert") || name.includes("认证") || name.includes("检测")) return "已登记认证/检测材料元数据，原文需人工查看。";
  if (name.includes("quote") || name.includes("报价") || name.includes("price")) return "已登记报价或价格材料元数据，原文需人工查看。";
  if (name.includes("label") || name.includes("标签")) return "已登记标签/包装材料元数据，原文需人工查看。";
  return "已登记文件元数据，不读取或发送原文内容。";
}

function buildAiMessages(assessment) {
  return [
    {
      role: "system",
      content:
        "你是北贸星桥 NorthBridge Trade 的企业外贸行动建议书助手。只根据用户提供的结构化规则结果写报告，不重新判断关税、HS编码、准入、法律合规或订单机会。不得编造服务商联系方式、价格、承诺成交或官方认证结论。必须保留人工复核项。输出中文 Markdown，结构包括企业画像、外贸转型分类、资料自检、物质投入、90天周期、3-6个月延展、风险分析、服务机构联系准备和边界声明。"
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          profile: {
            company: {
              name: assessment.profile?.company?.name,
              province: assessment.profile?.company?.province,
              city: assessment.profile?.company?.city,
              companyType: assessment.profile?.company?.companyType,
              businessScope: assessment.profile?.company?.businessScope,
              mainBusiness: assessment.profile?.company?.mainBusiness,
              employeeScale: assessment.profile?.company?.employeeScale,
              annualRevenue: assessment.profile?.company?.annualRevenue
            },
            product: {
              name: assessment.profile?.product?.name,
              category: assessment.profile?.product?.category,
              description: assessment.profile?.product?.description,
              specs: assessment.profile?.product?.specs,
              annualCapacity: assessment.profile?.product?.annualCapacity,
              shelfLife: assessment.profile?.product?.shelfLife,
              coldChain: assessment.profile?.product?.coldChain,
              packageStatus: assessment.profile?.product?.packageStatus,
              certifications: assessment.profile?.product?.certifications
            },
            trade: assessment.trade,
            constraints: assessment.constraints
          },
          documents: assessment.documents?.map((doc) => ({
            name: doc.name,
            summary: doc.summary,
            status: doc.status,
            piiDetected: doc.piiDetected,
            warnings: doc.warnings
          })),
          classification: assessment.classification,
          scores: assessment.scoreResult,
          verdict: assessment.verdictResult,
          serviceNeeds: assessment.serviceNeeds,
          checklist: assessment.checklist,
          investmentPlan: assessment.investmentPlan,
          timeline: assessment.timeline,
          riskAnalysis: assessment.riskAnalysis,
          manualReviewFlags: assessment.manualReviewFlags,
          markets: assessment.markets?.slice(0, 4),
          routes: assessment.routes?.slice(0, 3),
          partners: assessment.partners?.map((partner) => ({
            orgName: partner.orgName,
            orgType: partner.orgType,
            businessScope: partner.businessScope,
            publicContact: partner.publicContact,
            matchReasons: partner.matchReasons,
            contactChecklist: partner.contactChecklist,
            trustLevel: partner.trustLevel,
            sourceType: partner.sourceType
          }))
        },
        null,
        2
      )
    }
  ];
}

async function callAiReport(assessment) {
  return callMinimaxReport(assessment);
}

async function callMinimaxReport(assessment) {
  const url = new URL(runtimeAiConfig.minimax.endpoint);
  if (runtimeAiConfig.minimax.groupId && !url.searchParams.has("GroupId")) {
    url.searchParams.set("GroupId", runtimeAiConfig.minimax.groupId);
  }

  const result = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${runtimeAiConfig.minimax.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: runtimeAiConfig.minimax.model,
      messages: buildAiMessages(assessment),
      stream: false,
      temperature: 0.2
    })
  });

  const text = await result.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {};
  }

  if (!result.ok) {
    throw new Error(`MiniMax API ${result.status}: ${text.slice(0, 200)}`);
  }

  const content =
    json.choices?.[0]?.message?.content ||
    json.choices?.[0]?.messages?.[0]?.text ||
    json.reply ||
    json.output_text ||
    json.output?.text ||
    "";

  if (!content) {
    const statusMsg = json.base_resp?.status_msg || json.error?.message || "MiniMax 未返回可读文本";
    throw new Error(statusMsg);
  }

  return content;
}

async function serveStatic(pathname, response) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = resolve(publicDir, `.${safePath}`);
  if (!filePath.startsWith(publicDir)) {
    return sendJson(response, { ok: false, error: "INVALID_PATH" }, 400);
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");
    const content = await readFile(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream" });
    response.end(content);
  } catch {
    const index = await readFile(join(publicDir, "index.html"));
    response.writeHead(200, { "Content-Type": contentTypes[".html"] });
    response.end(index);
  }
}

function sendJson(response, payload, statusCode = 200) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function buildBridgeScript() {
  return `
window.NB_BRIDGE = {
  async send(kind, payload = {}) {
    const routes = {
      boot: { path: "/api/bootstrap", method: "GET" },
      status: { path: "/api/health", method: "GET" },
      assess: { path: "/api/assessments", method: "POST" },
      draft: { path: "/api/ai/report", method: "POST" }
    };
    const route = routes[kind];
    if (!route) throw new Error("Unknown service route");
    const response = await fetch(route.path, {
      method: route.method,
      headers: { "Content-Type": "application/json" },
      body: route.method === "GET" ? undefined : JSON.stringify(payload)
    });
    if (!response.ok) throw new Error((await response.text()) || "Service request failed");
    return response.json();
  }
};
`;
}
