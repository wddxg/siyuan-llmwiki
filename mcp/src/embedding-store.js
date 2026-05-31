import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";
import crypto from "node:crypto";

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function stableHash(input) {
  return crypto.createHash("sha256").update(String(input || ""), "utf8").digest("hex");
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildDocFingerprint(item) {
  return stableHash(`${item.id || ""}\n${item.hpath || ""}\n${item.content || ""}\n${item.updated || ""}`);
}

async function postJson(url, payload, apiKey) {
  const parsed = new URL(url);
  const driver = parsed.protocol === "https:" ? https : http;
  const body = JSON.stringify(payload);
  const headers = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body)
  };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  return await new Promise((resolve, reject) => {
    const req = driver.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path: `${parsed.pathname}${parsed.search}`,
        method: "POST",
        headers
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Embedding API HTTP ${res.statusCode}: ${raw}`));
            return;
          }
          try {
            resolve(raw ? JSON.parse(raw) : {});
          } catch (error) {
            reject(new Error(`Failed to parse embedding response: ${error.message}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export class EmbeddingStore {
  constructor(config) {
    this.config = config;
    this.enabled = Boolean(config?.enabled && config?.baseUrl && config?.model);
    this.cacheDir = config?.cacheDir || "";
  }

  getNotebookFile(notebookId) {
    return path.join(this.cacheDir, `${notebookId}.json`);
  }

  readNotebookCache(notebookId) {
    if (!this.enabled) {
      return { notebookId, docs: {}, updatedAt: "" };
    }
    const file = this.getNotebookFile(notebookId);
    if (!fs.existsSync(file)) {
      return { notebookId, docs: {}, updatedAt: "" };
    }
    try {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      return { notebookId, docs: {}, updatedAt: "" };
    }
  }

  writeNotebookCache(notebookId, cache) {
    if (!this.enabled) {
      return;
    }
    const file = this.getNotebookFile(notebookId);
    fs.writeFileSync(file, JSON.stringify(cache, null, 2), "utf8");
  }

  async embedTexts(texts) {
    if (!this.enabled) {
      return [];
    }
    const payload = {
      model: this.config.model,
      input: texts
    };
    if (this.config.dimensions > 0) {
      payload.dimensions = this.config.dimensions;
    }
    const response = await postJson(this.config.baseUrl, payload, this.config.apiKey);
    const data = Array.isArray(response?.data) ? response.data : [];
    return data.map((item) => item.embedding || []);
  }

  async ensureNotebookEmbeddings(notebookId, docs) {
    if (!this.enabled) {
      return null;
    }
    const cache = this.readNotebookCache(notebookId);
    const liveIds = new Set(docs.map((item) => item.id));
    for (const key of Object.keys(cache.docs || {})) {
      if (!liveIds.has(key)) {
        delete cache.docs[key];
      }
    }
    const pending = [];
    const pendingKeys = [];

    for (const item of docs) {
      const key = item.id;
      const fingerprint = buildDocFingerprint(item);
      const cached = cache.docs[key];
      if (!cached || cached.fingerprint !== fingerprint) {
        pending.push(normalizeText(`${item.hpath}\n${item.content || ""}`));
        pendingKeys.push({ key, fingerprint, item });
      }
    }

    if (pending.length > 0) {
      const vectors = await this.embedTexts(pending);
      for (let i = 0; i < pendingKeys.length; i += 1) {
        const { key, fingerprint, item } = pendingKeys[i];
        cache.docs[key] = {
          id: item.id,
          path: item.hpath,
          content: item.content || "",
          updated: item.updated || "",
          fingerprint,
          vector: vectors[i] || []
        };
      }
      cache.updatedAt = new Date().toISOString();
      this.writeNotebookCache(notebookId, cache);
    }

    return cache;
  }

  async searchNotebook(notebookId, docs, query, topK = 8) {
    if (!this.enabled || !query) {
      return [];
    }
    const cache = await this.ensureNotebookEmbeddings(notebookId, docs);
    if (!cache) {
      return [];
    }
    const [queryVector] = await this.embedTexts([normalizeText(query)]);
    if (!Array.isArray(queryVector) || queryVector.length === 0) {
      return [];
    }

    return Object.values(cache.docs)
      .map((item) => ({
        id: item.id,
        path: item.path,
        snippet: item.content,
        semanticScore: cosineSimilarity(queryVector, item.vector || [])
      }))
      .filter((item) => item.semanticScore > 0)
      .sort((a, b) => b.semanticScore - a.semanticScore)
      .slice(0, topK);
  }
}
