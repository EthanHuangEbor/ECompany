import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { assessCompany, buildTemplateReport } from "./engine.mjs";
import { dimensions, marketRules, options, ports, samples, servicePartners, sources, uploadPolicy } from "./data.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = resolve(__dirname, "..");
const publicDir = join(rootDir, "public");
const storageDir = join(rootDir, "storage", "assessments");
const defaultMinimaxEndpoint = "https://api.minimax.chat/v1/text/chatcompletion_v2";

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
        aiProvider: runtimeAiConfig.provider,
        aiEnabled: runtimeAiConfig.enabled,
        aiConfigured: isAiConfigured(),
        fallbackEnabled: runtimeAiConfig.errorFallback
      });
    }

    if (url.pathname === "/api/ai/config" && request.method === "GET") {
      return sendJson(response, getSafeAiConfig());
    }

    if (url.pathname === "/api/ai/config" && request.method === "POST") {
      const body = await readJson(request);
      updateRuntimeAiConfig(body);
      return sendJson(response, getSafeAiConfig());
    }

    if (url.pathname === "/api/bootstrap" && request.method === "GET") {
      return sendJson(response, {
        dimensions,
        marketRules,
        options,
        ports,
        samples,
        servicePartners,
        sources,
        uploadPolicy
      });
    }

    if (url.pathname === "/api/assessments" && request.method === "POST") {
      const body = await readJson(request);
      const assessment = assessCompany(body);
      const id = randomUUID();
      const storedAssessment = { id, ...assessment };
      await persistAssessment(storedAssessment);
      return sendJson(response, storedAssessment, 201);
    }

    if (url.pathname === "/api/ai/report" && request.method === "POST") {
      const body = await readJson(request);
      const reportResult = await generateAiReport(body.assessment || body);
      return sendJson(response, reportResult);
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
  const provider = process.env.AI_PROVIDER || (process.env.MINIMAX_API_KEY ? "minimax" : "openai");
  return {
    provider,
    enabled: process.env.AI_ENABLED === "true",
    errorFallback: process.env.AI_ERROR_FALLBACK !== "false",
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      model: process.env.OPENAI_MODEL || ""
    },
    minimax: {
      apiKey: process.env.MINIMAX_API_KEY || "",
      model: process.env.MINIMAX_MODEL || "MiniMax-Text-01",
      endpoint: process.env.MINIMAX_ENDPOINT || defaultMinimaxEndpoint,
      groupId: process.env.MINIMAX_GROUP_ID || ""
    }
  };
}

function getActiveProviderConfig() {
  return runtimeAiConfig[runtimeAiConfig.provider] || {};
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
    provider: runtimeAiConfig.provider,
    enabled: runtimeAiConfig.enabled,
    errorFallback: runtimeAiConfig.errorFallback,
    configured: isAiConfigured(),
    openai: {
      model: runtimeAiConfig.openai.model,
      apiKeySet: Boolean(runtimeAiConfig.openai.apiKey),
      apiKeyPreview: maskKey(runtimeAiConfig.openai.apiKey)
    },
    minimax: {
      model: runtimeAiConfig.minimax.model,
      endpoint: runtimeAiConfig.minimax.endpoint,
      groupIdSet: Boolean(runtimeAiConfig.minimax.groupId),
      apiKeySet: Boolean(runtimeAiConfig.minimax.apiKey),
      apiKeyPreview: maskKey(runtimeAiConfig.minimax.apiKey)
    }
  };
}

function updateRuntimeAiConfig(body = {}) {
  if (typeof body.enabled === "boolean") runtimeAiConfig.enabled = body.enabled;
  if (typeof body.errorFallback === "boolean") runtimeAiConfig.errorFallback = body.errorFallback;
  if (["openai", "minimax"].includes(body.provider)) runtimeAiConfig.provider = body.provider;

  if (body.openai) {
    if (typeof body.openai.model === "string") runtimeAiConfig.openai.model = body.openai.model.trim();
    if (typeof body.openai.apiKey === "string" && body.openai.apiKey.trim()) {
      runtimeAiConfig.openai.apiKey = body.openai.apiKey.trim();
    }
  }

  if (body.minimax) {
    if (typeof body.minimax.model === "string") runtimeAiConfig.minimax.model = body.minimax.model.trim();
    if (typeof body.minimax.endpoint === "string" && body.minimax.endpoint.trim()) {
      runtimeAiConfig.minimax.endpoint = sanitizeHttpsEndpoint(body.minimax.endpoint.trim());
    }
    if (typeof body.minimax.groupId === "string") runtimeAiConfig.minimax.groupId = body.minimax.groupId.trim();
    if (typeof body.minimax.apiKey === "string" && body.minimax.apiKey.trim()) {
      runtimeAiConfig.minimax.apiKey = body.minimax.apiKey.trim();
    }
  }
}

function sanitizeHttpsEndpoint(value) {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:") {
    throw new Error("MiniMax endpoint 必须使用 https://");
  }
  return parsed.toString();
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
  const fallbackReport = buildTemplateReport({ ...assessment, aiMode: "template" });

  if (!runtimeAiConfig.enabled) {
    return {
      mode: "template",
      fallbackReason: "AI_ENABLED 未开启",
      report: fallbackReport
    };
  }

  if (!isAiConfigured()) {
    return {
      mode: "template",
      fallbackReason: `缺少 ${runtimeAiConfig.provider} API Key 或模型配置`,
      report: fallbackReport
    };
  }

  try {
    const aiText = await callAiReport(assessment);
    return {
      mode: "ai",
      fallbackReason: "",
      report: aiText
    };
  } catch (error) {
    if (!runtimeAiConfig.errorFallback) throw error;
    return {
      mode: "template",
      fallbackReason: `AI 调用失败，已降级：${error.message}`,
      report: fallbackReport
    };
  }
}

function buildAiMessages(assessment) {
  return [
    {
      role: "system",
      content:
        "你是北贸星桥的企业外贸转型报告助手。只根据用户提供的结构化评分、规则命中项和服务机构摘要润色报告。不得编造关税、HS编码、订单、联系方式或法律结论。所有高风险项必须保留人工复核提示。"
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          profile: assessment.profile,
          scores: assessment.scoreResult,
          verdict: assessment.verdictResult,
          risks: assessment.risks,
          checklist: assessment.checklist,
          markets: assessment.markets?.slice(0, 4),
          routes: assessment.routes?.slice(0, 3),
          partners: assessment.partners?.map((partner) => ({
            orgName: partner.orgName,
            orgType: partner.orgType,
            publicContact: partner.publicContact,
            matchReasons: partner.matchReasons,
            trustLevel: partner.trustLevel,
            sourceType: partner.sourceType
          })),
          actions: assessment.actions
        },
        null,
        2
      )
    }
  ];
}

async function callAiReport(assessment) {
  if (runtimeAiConfig.provider === "minimax") return callMinimaxReport(assessment);
  return callOpenAiReport(assessment);
}

async function callOpenAiReport(assessment) {
  const payload = {
    model: runtimeAiConfig.openai.model,
    input: buildAiMessages(assessment),
    temperature: 0.2
  };

  const result = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${runtimeAiConfig.openai.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!result.ok) {
    const errorText = await result.text();
    throw new Error(`OpenAI Responses API ${result.status}: ${errorText.slice(0, 200)}`);
  }

  const json = await result.json();
  if (json.output_text) return json.output_text;

  const extracted = json.output
    ?.flatMap((item) => item.content || [])
    ?.map((content) => content.text || "")
    ?.filter(Boolean)
    ?.join("\n");

  if (!extracted) throw new Error("AI 未返回可读文本");
  return extracted;
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
