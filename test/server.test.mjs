import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const port = 5193;
const base = `http://127.0.0.1:${port}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) return;
    } catch {
      await wait(150);
    }
  }
  throw new Error("server did not start");
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const text = await response.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { response, json };
}

function run(name, fn) {
  return fn()
    .then(() => console.log(`ok - ${name}`))
    .catch((error) => {
      console.error(`not ok - ${name}`);
      throw error;
    });
}

await run("frontend upload flow keeps only document metadata", async () => {
  const source = readFileSync("src/runtime-app.js", "utf8");
  assert.doesNotMatch(source, /file\.text\s*\(/);
  assert.doesNotMatch(source, /FileReader/);
  assert.doesNotMatch(source, /text\.slice\s*\(/);
  assert.doesNotMatch(source, /\bextractedText\b/);
  assert.match(source, /safeDocumentMeta/);
});

const server = spawn(process.execPath, ["src/server.mjs"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(port),
    AI_ENABLED: "false",
    ADMIN_TOKEN: "",
    MINIMAX_API_KEY: "test-secret-key",
    MINIMAX_ENDPOINT: "https://api.minimax.chat/v1/text/chatcompletion_v2"
  },
  stdio: "ignore"
});

try {
  await waitForServer();

  await run("ai config safe response does not expose key preview", async () => {
    const { response, json } = await requestJson("/api/ai/config");
    assert.equal(response.ok, true);
    assert.equal(json.minimax.apiKeySet, true);
    assert.equal(Object.hasOwn(json.minimax, "apiKeyPreview"), false);
    assert.doesNotMatch(JSON.stringify(json), /test-secret-key/);
  });

  await run("ai config write is rejected without admin token", async () => {
    const { response } = await requestJson("/api/ai/config", {
      method: "POST",
      body: JSON.stringify({ enabled: true, endpoint: "https://example.com/steal" })
    });
    assert.equal(response.ok, false);
  });

  await run("assessment response does not retain raw document pii", async () => {
    const { json: bootstrap } = await requestJson("/api/bootstrap");
    const sample = bootstrap.samples[0];
    const confidentialToken = "CONFIDENTIAL_ROUTE_PRICE_TOKEN";
    sample.documents = [
      {
        name: "quote.txt",
        size: 128,
        text: `phone 13812345678 email buyer@example.com ${confidentialToken}`
      }
    ];
    const { response, json } = await requestJson("/api/assessments", {
      method: "POST",
      body: JSON.stringify(sample)
    });
    assert.equal(response.ok, true);
    const serialized = JSON.stringify(json);
    assert.doesNotMatch(serialized, /13812345678|buyer@example.com/);
    assert.doesNotMatch(serialized, new RegExp(confidentialToken));
    assert.equal(json.profile.documents.length, 0);
    assert.equal(json.documents[0].piiDetected, true);
  });

  await run("ai report endpoint strips direct document text and arbitrary summaries", async () => {
    const { json: bootstrap } = await requestJson("/api/bootstrap");
    const { json: assessment } = await requestJson("/api/assessments", {
      method: "POST",
      body: JSON.stringify(bootstrap.samples[0])
    });
    const secret = "CONFIDENTIAL_DIRECT_REPORT_TOKEN";
    assessment.profile.documents = [{ text: secret }];
    assessment.documents = [
      {
        name: "quote.txt",
        size: 100,
        text: secret,
        extractedText: secret,
        summary: secret,
        piiDetected: true,
        status: "review",
        warnings: [secret]
      }
    ];
    const { response, json } = await requestJson("/api/ai/report", {
      method: "POST",
      body: JSON.stringify({ assessment })
    });
    assert.equal(response.ok, true);
    assert.equal(json.mode, "template");
    assert.doesNotMatch(JSON.stringify(json), new RegExp(secret));
  });
} finally {
  server.kill();
}

await run("server rejects non-allowlisted minimax endpoint from env", async () => {
  const badServer = spawn(process.execPath, ["src/server.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port + 1),
      MINIMAX_ENDPOINT: "https://evil.example/v1/test"
    },
    stdio: "ignore"
  });
  await wait(500);
  assert.notEqual(badServer.exitCode, null);
});
