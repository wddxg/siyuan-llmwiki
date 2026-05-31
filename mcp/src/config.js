import fs from "node:fs";
import path from "node:path";

function asBool(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return String(value).toLowerCase() === "true";
}

function asList(value) {
  if (!value) {
    return [];
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function loadConfig() {
  const logDir = process.env.MCP_LOG_DIR || "/app/logs";
  const tempDir = process.env.MCP_TEMP_DIR || "/app/temp";
  const importDir = process.env.MCP_IMPORT_DIR || path.join(tempDir, "imports");
  const exportDir = process.env.MCP_EXPORT_DIR || "/app/exports";
  const embeddingCacheDir = process.env.MCP_EMBEDDING_CACHE_DIR || path.join(tempDir, "embeddings");

  fs.mkdirSync(logDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });
  fs.mkdirSync(importDir, { recursive: true });
  fs.mkdirSync(exportDir, { recursive: true });
  fs.mkdirSync(embeddingCacheDir, { recursive: true });

  return {
    server: {
      host: process.env.MCP_BIND_HOST || "0.0.0.0",
      port: Number(process.env.MCP_PORT || 31710),
      authToken: process.env.MCP_AUTH_TOKEN || "",
      logDir,
      tempDir,
      importDir,
      exportDir,
      docsDir: "/app/source"
    },
    siyuan: {
      url: process.env.SIYUAN_URL || "http://127.0.0.1:6806",
      token: process.env.SIYUAN_TOKEN || "",
      defaultNotebook: process.env.SIYUAN_DEFAULT_NOTEBOOK || "",
      permissionMode: process.env.SIYUAN_PERMISSION_MODE || "whitelist",
      notebookAllowlist: asList(process.env.SIYUAN_NOTEBOOK_ALLOWLIST),
      deleteSafeMode: asBool(process.env.SIYUAN_DELETE_SAFE_MODE, true),
      deleteRequireConfirmation: asBool(process.env.SIYUAN_DELETE_REQUIRE_CONFIRMATION, true),
      tlsAllowSelfSigned: asBool(process.env.SIYUAN_TLS_ALLOW_SELF_SIGNED, false),
      tlsAllowedHosts: asList(process.env.SIYUAN_TLS_ALLOWED_HOSTS)
    },
    runtime: {
      generatedAt: new Date().toISOString(),
      logFile: path.join(logDir, "mcp.log")
    },
    embeddings: {
      enabled: asBool(process.env.MCP_EMBEDDING_ENABLED, false),
      provider: process.env.MCP_EMBEDDING_PROVIDER || "openai-compatible",
      baseUrl: process.env.MCP_EMBEDDING_BASE_URL || "",
      apiKey: process.env.MCP_EMBEDDING_API_KEY || "",
      model: process.env.MCP_EMBEDDING_MODEL || "",
      dimensions: Number(process.env.MCP_EMBEDDING_DIMENSIONS || 0),
      topK: Number(process.env.MCP_EMBEDDING_TOP_K || 8),
      cacheDir: embeddingCacheDir
    }
  };
}
