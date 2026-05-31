import express from "express";
import fs from "node:fs";
import { loadConfig } from "./config.js";
import { SiYuanClient } from "./siyuan-api-client.js";
import { WikiOps } from "./wiki-ops.js";
import { createMcpApp } from "./mcp-server.js";
import { EmbeddingStore } from "./embedding-store.js";

function appendLog(logFile, line) {
  fs.appendFileSync(logFile, `${new Date().toISOString()} ${line}\n`, "utf8");
}

const config = loadConfig();
const siyuan = new SiYuanClient(config.siyuan);
const embeddings = new EmbeddingStore(config.embeddings);
const wiki = new WikiOps({ siyuan, embeddings, config });
const mcpApp = createMcpApp({ wiki, config });

const app = express();
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  if (config.server.authToken) {
    const provided = req.headers.authorization?.replace(/^Bearer\s+/i, "") || "";
    if (provided !== config.server.authToken) {
      res.status(401).json({
        jsonrpc: "2.0",
        error: {
          code: -32001,
          message: "Unauthorized"
        },
        id: null
      });
      return;
    }
  }
  next();
});

app.all("/mcp", async (req, res) => {
  await mcpApp.handleRequest(req, res);
});

app.all("*", (_req, res) => {
  res.status(404).json({
    jsonrpc: "2.0",
    error: {
      code: -32601,
      message: "Use POST /mcp with MCP Streamable HTTP."
    },
    id: null
  });
});

app.listen(config.server.port, config.server.host, () => {
  appendLog(
    config.runtime.logFile,
    `server started host=${config.server.host} port=${config.server.port}`
  );
});
