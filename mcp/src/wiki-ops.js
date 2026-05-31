import { buildDirectoryIndex, buildLogEntry } from "./index-builder.js";

const RAW_ROOTS = ["/原始资料"];
const MAINTAINED_ROOTS = ["/实体", "/概念", "/对比", "/问答归档"];
const PROJECT_DOC_ROOTS = [];
const QUERY_VISIBLE_ROOTS = [...MAINTAINED_ROOTS, ...PROJECT_DOC_ROOTS, "/总索引", "/结构约定"];
const RAW_TYPE_SEGMENTS = ["文章", "论文", "仓库", "笔记", "数据"];
const RAW_CONTAINER_PATHS = new Set(["/原始资料", ...RAW_TYPE_SEGMENTS.map((item) => `/原始资料/${item}`)]);
const RAW_EXCLUDED_PREFIXES = [];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueBy(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

function extractYamlLikeField(markdown, field) {
  const regex = new RegExp(`^${field}:\\s*"?([^"\\n]+)"?\\s*$`, "m");
  const match = markdown.match(regex);
  return match ? match[1].trim() : "";
}

function extractSection(markdown, heading) {
  const lines = String(markdown || "").split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim().toLowerCase() === `# ${heading}`.toLowerCase());
  if (start < 0) {
    return "";
  }
  const collected = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^#\s+/.test(lines[i])) {
      break;
    }
    collected.push(lines[i]);
  }
  return collected.join("\n").trim();
}

function topNonEmptyLines(text, count) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, count);
}

function detectSignals(lines, patterns) {
  return lines.filter((line) => patterns.some((pattern) => pattern.test(line)));
}

function collectKeywords(text) {
  return Array.from(
    new Set(
      String(text || "")
        .toLowerCase()
        .split(/[^a-z0-9\u4e00-\u9fa5]+/)
        .filter((term) => term.length >= 4)
    )
  );
}

function normalizedTokens(text) {
  return Array.from(
    new Set(
      String(text || "")
        .toLowerCase()
        .split(/[^a-z0-9\u4e00-\u9fa5]+/)
        .filter((term) => term.length >= 2)
    )
  );
}

function pageTitleFromPath(docPath) {
  const parts = String(docPath || "").split("/").filter(Boolean);
  return parts[parts.length - 1] || "未命名页面";
}

function childrenOf(parentPathValue, rows) {
  return rows
    .filter((item) => parentPath(item.hpath) === parentPathValue)
    .map((item) => ({
      id: item.id,
      path: item.hpath,
      title: pageTitleFromPath(item.hpath),
      summary: item.content || "",
      updated: item.updated || today()
    }));
}

function wikiLink(title) {
  return `[[${String(title || "").replace(/[\[\]]/g, "").trim()}]]`;
}

function escapeBlockRefTitle(title) {
  return String(title || "")
    .replace(/"/g, "'")
    .replace(/\r?\n/g, " ")
    .trim();
}

function blockRef(id, title = "") {
  if (!id) {
    return wikiLink(title);
  }
  const escaped = escapeBlockRefTitle(title);
  return escaped ? `((${id} "${escaped}"))` : `((${id}))`;
}

function blockLink(id, title) {
  return blockRef(id, title);
}

function linkedPathLine({ id = "", path = "", title = "", summary = "", updated = "" }) {
  const finalTitle = title || pageTitleFromPath(path);
  return [
    `- ${blockLink(id, finalTitle)} | path: \`${path}\`${updated ? ` | updated: ${updated}` : ""}`,
    summary ? `  summary: ${summary}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function relatedSectionLines(items, fallback) {
  if (!Array.isArray(items) || items.length === 0) {
    return [`- ${fallback}`];
  }
  return items.map((item) =>
    linkedPathLine({
      id: item.id || "",
      path: item.path || "",
      title: item.title || pageTitleFromPath(item.path || ""),
      summary: item.summary || "",
      updated: item.updated || ""
    })
  );
}

function parentPath(docPath) {
  const parts = String(docPath || "").split("/").filter(Boolean);
  if (parts.length <= 1) {
    return "/";
  }
  return `/${parts.slice(0, -1).join("/")}`;
}

function pathStartsWithAny(pathValue, roots) {
  return roots.some((root) => pathValue === root || pathValue.startsWith(`${root}/`));
}

function isRawContainerPath(pathValue) {
  return RAW_CONTAINER_PATHS.has(String(pathValue || ""));
}

function isExcludedRawPath(pathValue) {
  const normalized = String(pathValue || "");
  return RAW_EXCLUDED_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
}

function isTrueRawDocPath(pathValue) {
  const normalized = String(pathValue || "");
  if (!pathStartsWithAny(normalized, RAW_ROOTS)) {
    return false;
  }
  if (isRawContainerPath(normalized)) {
    return false;
  }
  if (isExcludedRawPath(normalized)) {
    return false;
  }
  return true;
}

function buildPathIndex(rows) {
  const index = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!row?.hpath || index.has(row.hpath)) {
      continue;
    }
    index.set(row.hpath, {
      id: row.id || "",
      path: row.hpath,
      title: pageTitleFromPath(row.hpath),
      summary: row.content || "",
      updated: row.updated || today()
    });
  }
  return index;
}

function resolvePathMeta(path, pathIndex, explicitTitle = "") {
  const normalizedPath = String(path || "").startsWith("/") ? String(path) : `/${String(path || "")}`;
  const row = pathIndex?.get?.(normalizedPath);
  return {
    id: row?.id || "",
    path: normalizedPath,
    title: explicitTitle || row?.title || pageTitleFromPath(normalizedPath),
    summary: row?.summary || "",
    updated: row?.updated || ""
  };
}

function pathRef(path, pathIndex, explicitTitle = "") {
  const meta = resolvePathMeta(path, pathIndex, explicitTitle);
  return blockLink(meta.id, meta.title);
}

function pathLine(path, pathIndex, explicitTitle = "", explicitSummary = "", explicitUpdated = "") {
  const meta = resolvePathMeta(path, pathIndex, explicitTitle);
  return linkedPathLine({
    id: meta.id,
    path: meta.path,
    title: meta.title,
    summary: explicitSummary || meta.summary,
    updated: explicitUpdated || meta.updated
  });
}

function rewriteInternalWikiLinks(markdown, linkMap, pathIndex = null) {
  const lines = String(markdown || "").split(/\r?\n/);
  let inFence = false;
  return lines
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) {
        return line;
      }
      return line.replace(/\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]/g, (match, rawTarget, rawLabel) => {
        const target = String(rawTarget || "").trim();
        const display = String(rawLabel || rawTarget || "").trim();
        const mapped = lookupLinkMeta(target, linkMap, pathIndex) || lookupLinkMeta(display, linkMap, pathIndex);
        if (!mapped) {
          return match;
        }
        return blockLink(mapped.id, mapped.title || display || target);
      });
    })
    .join("\n");
}

function normalizeVisibleBlockRefs(markdown) {
  return String(markdown || "").replace(/`?\(\(\)\)`?/g, "相关入口");
}

function normalizeMarkdownNewlines(markdown) {
  return String(markdown || "").replace(/\r\n/g, "\n");
}

function stripImageMarkdown(markdown) {
  return String(markdown || "")
    .replace(/!\[[^\]]*]\([^)\n]+\)/g, "")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitVirtualPath(virtualPath) {
  return String(virtualPath || "")
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);
}

function stemFromMarkdownFile(filename) {
  return String(filename || "").replace(/\.md$/i, "");
}

function canonicalHPathFromVirtualPath(virtualPath) {
  const segments = splitVirtualPath(virtualPath);
  if (segments.length === 0) {
    throw new Error("virtualPath is required");
  }
  const last = segments[segments.length - 1];
  if (!/\.md$/i.test(last)) {
    throw new Error(`virtualPath must point to a markdown file: ${virtualPath}`);
  }
  const stem = stemFromMarkdownFile(last);
  const parentSegments = segments.slice(0, -1);
  if (parentSegments.length === 0) {
    return `/${stem}`;
  }
  if (parentSegments[parentSegments.length - 1] === stem) {
    return `/${parentSegments.join("/")}`;
  }
  return `/${[...parentSegments, stem].join("/")}`;
}

function virtualMarkdownPathFromHPath(hpath) {
  const normalized = `/${String(hpath || "").replace(/^\/+/, "")}`;
  const title = pageTitleFromPath(normalized);
  if (normalized === "/") {
    return `${title}.md`;
  }
  return `${normalized.slice(1)}/${title}.md`;
}

function buildVirtualTreeItems(rows) {
  return rows.map((row) => {
    const virtualPath = virtualMarkdownPathFromHPath(row.hpath);
    const parentVirtualPath = splitVirtualPath(virtualPath).slice(0, -1).join("/");
    return {
      id: row.id,
      hpath: row.hpath,
      title: pageTitleFromPath(row.hpath),
      summary: row.content || "",
      updated: row.updated || "",
      virtualPath,
      parentVirtualPath
    };
  });
}

function renderVirtualTreeText(rootLabel, items) {
  const lines = [rootLabel];
  const dirs = new Set();
  for (const item of items) {
    const parts = splitVirtualPath(item.virtualPath);
    let prefix = "";
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      if (!isFile) {
        const dirPath = parts.slice(0, i + 1).join("/");
        if (!dirs.has(dirPath)) {
          lines.push(`${"-".repeat((i + 1) * 3)}${part}`);
          dirs.add(dirPath);
        }
      } else {
        lines.push(`${"-".repeat((i + 1) * 3)}${part}`);
      }
      prefix = `${prefix}/${part}`;
    }
  }
  return lines.join("\n");
}

function pathDepth(pathValue) {
  return String(pathValue || "/").split("/").filter(Boolean).length;
}

function isSameNameTreeAnchor(dirPath) {
  const normalized = String(dirPath || "").replace(/\\/g, "/").replace(/\/+$/, "");
  if (!normalized) {
    return false;
  }
  const dirName = normalized.split("/").filter(Boolean).pop();
  if (!dirName) {
    return false;
  }
  return true;
}

function normalizePathInput(pathValue) {
  return String(pathValue || "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}

function safeJsonClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function headingTitle(markdown) {
  const lines = normalizeMarkdownNewlines(markdown).split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#\s+/.test(trimmed)) {
      return trimmed.replace(/^#\s+/, "").trim();
    }
  }
  return "";
}

function normalizeExportedMarkdown(markdown, expectedTitle = "") {
  const normalized = normalizeMarkdownNewlines(markdown).trim();
  if (!normalized) {
    return expectedTitle ? `# ${expectedTitle}\n` : "";
  }

  const lines = normalized.split("\n");
  const autoTitle = String(expectedTitle || "").trim();
  const firstHeadingIndex = lines.findIndex((line) => /^#\s+/.test(line.trim()));
  if (autoTitle && firstHeadingIndex >= 0) {
    const firstHeading = lines[firstHeadingIndex].replace(/^#\s+/, "").trim();
    const secondHeadingIndex = lines.findIndex((line, index) => index > firstHeadingIndex && /^#\s+/.test(line.trim()));
    const firstSlug = slugify(firstHeading);
    const expectedSlug = slugify(autoTitle);
    if (firstHeading && firstSlug === expectedSlug && secondHeadingIndex > firstHeadingIndex) {
      const strippedLines = lines.filter((_, index) => index !== firstHeadingIndex);
      return `${strippedLines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
    }
  }

  return normalized.endsWith("\n") ? normalized : `${normalized}\n`;
}

function normalizeImportedMarkdown(markdown, expectedTitle = "") {
  const normalized = normalizeMarkdownNewlines(markdown).trim();
  if (!normalized) {
    return expectedTitle ? `# ${expectedTitle}\n` : "";
  }

  if (!expectedTitle) {
    return `${normalized}\n`;
  }

  const firstHeading = headingTitle(normalized);
  if (!firstHeading) {
    return `# ${expectedTitle}\n\n${normalized}\n`;
  }

  if (firstHeading.toLowerCase() === String(expectedTitle).trim().toLowerCase()) {
    return `${normalized}\n`;
  }

  return `${normalized}\n`;
}

function classifyLinkTarget(target) {
  const normalized = String(target || "").trim();
  if (!normalized) {
    return { kind: "empty", normalized: "" };
  }
  if (/^\(\([^)]+\)\)$/.test(normalized)) {
    return { kind: "block-ref", normalized };
  }
  if (/^https?:\/\//i.test(normalized)) {
    return { kind: "external-url", normalized };
  }
  if (/^\/.+/.test(normalized)) {
    return { kind: "canonical-path", normalized };
  }
  return { kind: "title", normalized };
}

function rewriteCanonicalPathLinks(markdown, linkMap, pathIndex = null) {
  const lines = normalizeMarkdownNewlines(markdown).split("\n");
  let inFence = false;
  return lines
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) {
        return line;
      }
      return line.replace(/\[([^\]]+)\]\((\/[^)\s]+)\)/g, (match, label, rawTarget) => {
        const target = String(rawTarget || "").trim();
        const mapped = lookupLinkMeta(target, linkMap, pathIndex);
        if (!mapped) {
          return match;
        }
        return blockLink(mapped.id, label || mapped.title || target);
      });
    })
    .join("\n");
}

function enforceLinkPolicy(markdown, linkMap, pathIndex = null) {
  const issues = [];
  const rawMarkdown = normalizeMarkdownNewlines(markdown);
  const lines = rawMarkdown.split("\n");
  let inFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }

    const wikiMatches = line.matchAll(/\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]/g);
    for (const match of wikiMatches) {
      const rawTarget = match[1] || "";
      const rawLabel = match[2] || "";
      const classified = classifyLinkTarget(rawTarget);
      if (
        classified.kind === "canonical-path" &&
        !lookupLinkMeta(classified.normalized, linkMap, pathIndex) &&
        !pathIndex?.has?.(classified.normalized)
      ) {
        issues.push({
          line: index + 1,
          kind: "unresolved-canonical-path",
          target: classified.normalized,
          display: rawLabel || rawTarget
        });
      }
      if (
        classified.kind === "title" &&
        !lookupLinkMeta(classified.normalized, linkMap, pathIndex) &&
        !lookupLinkMeta(rawLabel || "", linkMap, pathIndex)
      ) {
        issues.push({
          line: index + 1,
          kind: "unresolved-wiki-link",
          target: classified.normalized,
          display: rawLabel || rawTarget
        });
      }
    }
  }

  let normalized = rewriteCanonicalPathLinks(rawMarkdown, linkMap, pathIndex);
  normalized = rewriteInternalWikiLinks(normalized, linkMap, pathIndex);
  normalized = normalizeVisibleBlockRefs(normalized);

  return {
    markdown: normalized,
    issues
  };
}

function summarizeMarkdownDiff(beforeText, afterText) {
  const before = normalizeMarkdownNewlines(beforeText || "");
  const after = normalizeMarkdownNewlines(afterText || "");
  if (before === after) {
    return {
      changed: false,
      beforeLines: before ? before.split(/\r?\n/).length : 0,
      afterLines: after ? after.split(/\r?\n/).length : 0,
      preview: "No content change."
    };
  }

  const beforeLines = before.split(/\r?\n/);
  const afterLines = after.split(/\r?\n/);
  let firstDiff = 0;
  while (
    firstDiff < beforeLines.length &&
    firstDiff < afterLines.length &&
    beforeLines[firstDiff] === afterLines[firstDiff]
  ) {
    firstDiff += 1;
  }

  const beforePreview = beforeLines.slice(firstDiff, firstDiff + 5).join("\n");
  const afterPreview = afterLines.slice(firstDiff, firstDiff + 5).join("\n");
  return {
    changed: true,
    beforeLines: beforeLines.filter(Boolean).length,
    afterLines: afterLines.filter(Boolean).length,
    firstDiffLine: firstDiff + 1,
    preview: [
      `Before @ line ${firstDiff + 1}:`,
      beforePreview || "(empty)",
      "",
      `After @ line ${firstDiff + 1}:`,
      afterPreview || "(empty)"
    ].join("\n")
  };
}

function summarizeTreeDiff(plans) {
  const normalizedPlans = Array.isArray(plans) ? plans : [];
  const changed = normalizedPlans.filter((item) => item?.diff?.changed);
  const created = normalizedPlans.filter((item) => item?.mode === "create");
  const updated = normalizedPlans.filter((item) => item?.mode === "update");
  const unchanged = normalizedPlans.length - changed.length;
  return {
    fileCount: normalizedPlans.length,
    changedCount: changed.length,
    createdCount: created.length,
    updatedCount: updated.length,
    unchangedCount: unchanged,
    changedVirtualPaths: changed.map((item) => item.virtualPath)
  };
}

function lookupLinkMeta(target, linkMap, pathIndex = null) {
  const normalized = String(target || "").trim().replace(/\\/g, "/");
  if (!normalized) {
    return null;
  }
  const candidateKeys = [
    normalized,
    normalized.replace(/^\/+/, ""),
    normalized.startsWith("/") ? normalized : `/${normalized}`,
    normalized.toLowerCase(),
    normalized.replace(/^\/+/, "").toLowerCase(),
    normalized.startsWith("/") ? normalized.slice(1) : normalized
  ];
  for (const key of candidateKeys) {
    if (linkMap.has(key)) {
      return linkMap.get(key);
    }
  }
  if (pathIndex?.has?.(normalized)) {
    return pathIndex.get(normalized);
  }
  const withoutLeading = normalized.replace(/^\/+/, "");
  if (pathIndex?.has?.(`/${withoutLeading}`)) {
    return pathIndex.get(`/${withoutLeading}`);
  }
  if (pathIndex?.has?.(withoutLeading)) {
    return pathIndex.get(withoutLeading);
  }
  return null;
}

export class WikiOps {
  constructor({ siyuan, embeddings, config }) {
    this.siyuan = siyuan;
    this.embeddings = embeddings;
    this.config = config;
  }

  async listNotebooks() {
    return await this.siyuan.listNotebooks();
  }

  async wikiSelect({ wikiName = "", notebookId = "" }) {
    const registry = await this.readRegistry();
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName, registry);
    const notebooks = await this.siyuan.listNotebooks();
    const notebook = notebooks.find((item) => item.id === resolvedNotebook);
    const registryEntry = registry.entries.find((item) => item.notebookId === resolvedNotebook);

    await this.updateRegistry({
      wikiName: registryEntry?.wikiName || notebook?.name || wikiName || resolvedNotebook,
      description: registryEntry?.description || "",
      notebookId: resolvedNotebook,
      notebookName: notebook?.name || registryEntry?.notebookName || "",
      lastAccessed: nowIso(),
      lastMaintained: registryEntry?.lastMaintained || "",
      status: "active"
    });

    return {
      ok: true,
      action: "wiki_select",
      wikiName: registryEntry?.wikiName || wikiName || notebook?.name || "",
      notebookId: resolvedNotebook,
      notebookName: notebook?.name || "",
      registryPath: registry.path,
      message: `Active wiki resolved to ${notebook?.name || resolvedNotebook}`
    };
  }

  async wikiListKnowledgeBases() {
    const registry = await this.readRegistry();
    return {
      ok: true,
      action: "wiki_list_knowledge_bases",
      registryPath: registry.path,
      count: registry.entries.length,
      items: registry.entries
    };
  }

  async wikiRegisterKnowledgeBase({
    wikiName,
    description = "",
    notebookId = "",
    notebookName = "",
    aliases = []
  }) {
    if (!wikiName) {
      throw new Error("wikiName is required");
    }
    const resolvedNotebookId = notebookId || (await this.resolveNotebookId("", wikiName).catch(() => ""));
    const notebooks = resolvedNotebookId ? await this.siyuan.listNotebooks() : [];
    const notebook = notebooks.find((item) => item.id === resolvedNotebookId);
    const registry = await this.updateRegistry({
      wikiName,
      description,
      notebookId: resolvedNotebookId,
      notebookName: notebook?.name || notebookName || "",
      aliases: Array.isArray(aliases) ? aliases : [],
      lastAccessed: nowIso(),
      lastMaintained: nowIso(),
      status: "registered"
    });
    return {
      ok: true,
      action: "wiki_register_knowledge_base",
      wikiName,
      notebookId: resolvedNotebookId,
      registryPath: registry.path,
      entries: registry.entries
    };
  }

  async wikiNaturalLanguageRoute({ request = "", defaultNotebookId = "", defaultWikiName = "" }) {
    const text = String(request || "").trim();
    if (!text) {
      throw new Error("request is required");
    }

    const registry = await this.readRegistry();
    const lowered = text.toLowerCase();
    const compactRequest = lowered.replace(/[\s\-_]+/g, "");
    const entries = registry.entries.map((entry) => ({
      ...entry,
      aliases: Array.isArray(entry.aliases) ? entry.aliases : []
    }));

    const requestTokens = normalizedTokens(lowered);
    let bestEntry = null;
    let bestScore = -1;
    for (const entry of entries) {
      const candidates = [entry.wikiName, entry.notebookName, ...(entry.aliases || [])].filter(Boolean);
      let score = 0;
      for (const candidate of candidates) {
        const loweredCandidate = String(candidate).toLowerCase();
        const compactCandidate = loweredCandidate.replace(/[\s\-_]+/g, "");
        if (lowered.includes(loweredCandidate)) {
          score = Math.max(score, loweredCandidate.length + (candidate === entry.wikiName ? 5 : 0));
        }
        if (compactCandidate && compactRequest.includes(compactCandidate)) {
          score = Math.max(score, compactCandidate.length + (candidate === entry.wikiName ? 6 : 4));
        }
        const candidateTokens = normalizedTokens(loweredCandidate);
        const overlap = candidateTokens.filter((token) => requestTokens.includes(token)).length;
        if (overlap > 0) {
          score = Math.max(score, overlap * 8 + (candidate === entry.wikiName ? 4 : 0));
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestEntry = entry;
      }
    }

    const actionHints = [
      ["切换", "wiki_select"],
      ["switch", "wiki_select"],
      ["选择", "wiki_select"],
      ["创建", "wiki_bootstrap"],
      ["新建", "wiki_bootstrap"],
      ["create", "wiki_bootstrap"],
      ["初始化", "wiki_bootstrap"],
      ["导入", "wiki_ingest_text"],
      ["ingest", "wiki_ingest_text"],
      ["写入", "wiki_ingest_text"],
      ["归档", "wiki_archive_conclusion"],
      ["archive", "wiki_archive_conclusion"],
      ["总结", "wiki_archive_conclusion"],
      ["查询", "wiki_query"],
      ["查", "wiki_query"],
      ["query", "wiki_query"],
      ["搜索", "wiki_query"],
      ["lint", "wiki_lint"],
      ["审计", "wiki_lint"],
      ["检查", "wiki_lint"],
      ["compile", "wiki_compile_topic"],
      ["编译", "wiki_compile_topic"],
      ["整理", "wiki_compile_topic"]
    ];

    const suggestedTool =
      actionHints.find(([hint]) => lowered.includes(hint))?.[1] ||
      (bestEntry ? "wiki_select" : "wiki_query");

    const resolvedWikiName = bestEntry?.wikiName || defaultWikiName || "";
    const resolvedNotebookId = bestEntry?.notebookId || defaultNotebookId || "";

    return {
      ok: true,
      action: "wiki_natural_language_route",
      request: text,
      suggestedTool,
      matchedKnowledgeBase: bestEntry || null,
      resolvedWikiName,
      resolvedNotebookId,
      ambiguity: !bestEntry || bestScore <= 0,
      candidates: entries.map((entry) => ({
        wikiName: entry.wikiName,
        notebookId: entry.notebookId,
        aliases: entry.aliases || []
      }))
    };
  }

  async health() {
    const version = await this.siyuan.checkStatus();
    return {
      ok: true,
      version,
      siyuanUrl: this.config.siyuan.url
    };
  }

  async wikiBootstrap({ wikiName, description = "", force = false }) {
    if (!wikiName) {
      throw new Error("wikiName is required");
    }

    const notebookName = String(wikiName).trim();
    const notebook = await this.ensureNotebook(notebookName);
    await this.siyuan.openNotebook(notebook.id);

    const structure = this.getTargetStructure({ isHubWiki: false });
    const created = [];
    for (const item of structure) {
      const markdown = this.defaultMarkdownForPath(item, {
        wikiName,
        notebookName,
        description
      });
      const result = await this.ensureDocAtPath(notebook.id, item, markdown, force);
      created.push(result);
    }

    const docsResult = {
      docs: [],
      skipped: true,
      reason: "Design docs and skill source docs are now local-first. They are not auto-synced during bootstrap."
    };
    const indexesResult = await this.wikiRefreshIndexes({ notebookId: notebook.id, wikiName });
    const samplesResult = {
      ok: true,
      action: "seed_example_content",
      notebookId: notebook.id,
      skipped: true,
      reason: "Bootstrap sample wiki pages are disabled. Real wiki pages should be compiled from imported raw material.",
      paths: []
    };
    const logResult = await this.wikiAppendLog({
      notebookId: notebook.id,
      operation: "bootstrap",
      description: `Initialized wiki ${wikiName}`
    });

    const registry = await this.updateRegistry({
      wikiName,
      description,
      notebookId: notebook.id,
      notebookName,
      lastAccessed: nowIso(),
      lastMaintained: nowIso(),
      status: "active"
    });

    return {
      ok: true,
      action: "wiki_bootstrap",
      wikiName,
      notebookName,
      notebookId: notebook.id,
      registryPath: registry.path,
      createdDocs: created.map((item) => ({
        path: item.path,
        id: item.id,
        created: item.created
      })),
      docsUpdated: [],
      indexesUpdated: indexesResult.indexes.map((item) => item.path),
      samplePaths: samplesResult.paths,
      logPath: logResult.path
    };
  }

  async wikiManageDocs({ notebookId = "", force = false }) {
    return {
      ok: true,
      action: "wiki_manage_docs",
      notebookId: notebookId || "",
      skipped: true,
      reason: "Design docs and skill source docs are maintained locally first and are no longer auto-synced into the live wiki.",
      docs: []
    };
  }

  async wikiManageDocByPath({ notebookId = "", wikiName = "", docPath = "", force = true }) {
    return {
      ok: true,
      action: "wiki_manage_doc_by_path",
      notebookId: notebookId || "",
      path: docPath || "",
      skipped: true,
      reason: "Managed design docs are local-first. Upload them only after the local design matures."
    };
  }

  async wikiEnsurePage({ notebookId = "", wikiName = "", path = "", title = "", markdown = "", force = false }) {
    if (!path) {
      throw new Error("path is required");
    }
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const normalizedPath = `/${String(path).replace(/^\/+/, "")}`;
    const content =
      String(markdown || "").trim() ||
      [`# ${title || pageTitleFromPath(normalizedPath)}`, "", ""].join("\n");
    const result = await this.ensureDocAtPath(resolvedNotebook, normalizedPath, content, force);
    return {
      ok: true,
      action: "wiki_ensure_page",
      notebookId: resolvedNotebook,
      path: result.path,
      id: result.id,
      created: result.created
    };
  }

  async wikiDeletePage({ notebookId = "", wikiName = "", path = "" }) {
    if (!path) {
      throw new Error("path is required");
    }
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const normalizedPath = `/${String(path).replace(/^\/+/, "")}`;
    const ids = await this.siyuan.getIdsByHPath(resolvedNotebook, normalizedPath);
    if (!Array.isArray(ids) || ids.length === 0) {
      return {
        ok: true,
        action: "wiki_delete_page",
        notebookId: resolvedNotebook,
        path: normalizedPath,
        deleted: false
      };
    }
    for (const id of ids) {
      await this.siyuan.removeDocById(id);
    }
    return {
      ok: true,
      action: "wiki_delete_page",
      notebookId: resolvedNotebook,
      path: normalizedPath,
      deleted: true
    };
  }

  async wikiReplaceSection({ notebookId = "", wikiName = "", path = "", heading = "", markdown = "" }) {
    if (!path || !heading) {
      throw new Error("path and heading are required");
    }
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const normalizedPath = `/${String(path).replace(/^\/+/, "")}`;
    const ids = await this.siyuan.getIdsByHPath(resolvedNotebook, normalizedPath);
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error(`Page not found: ${normalizedPath}`);
    }
    const id = ids[0];
    const current = await this.safeExportMarkdown(id);
    const next = this.replaceMarkdownSection(current, heading, markdown);
    await this.siyuan.updateBlock(id, next);
    return {
      ok: true,
      action: "wiki_replace_section",
      notebookId: resolvedNotebook,
      path: normalizedPath,
      id
    };
  }

  async wikiAppendUnderHeading({ notebookId = "", wikiName = "", path = "", heading = "", markdown = "" }) {
    if (!path || !heading) {
      throw new Error("path and heading are required");
    }
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const normalizedPath = `/${String(path).replace(/^\/+/, "")}`;
    const ids = await this.siyuan.getIdsByHPath(resolvedNotebook, normalizedPath);
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error(`Page not found: ${normalizedPath}`);
    }
    const id = ids[0];
    const current = await this.safeExportMarkdown(id);
    const next = this.appendMarkdownUnderHeading(current, heading, markdown);
    await this.siyuan.updateBlock(id, next);
    return {
      ok: true,
      action: "wiki_append_under_heading",
      notebookId: resolvedNotebook,
      path: normalizedPath,
      id
    };
  }

  async wikiStatus({ wikiName = "", notebookId = "" }) {
    const registry = await this.readRegistry();
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName, registry);
    const notebooks = await this.siyuan.listNotebooks();
    const notebook = notebooks.find((item) => item.id === resolvedNotebook);
    const registryEntry = registry.entries.find((item) => item.notebookId === resolvedNotebook);
    const paths = [
      "/结构约定",
      "/总索引",
      "/操作日志",
      "/收件箱",
      "/原始资料",
      "/实体",
      "/概念",
      "/对比",
      "/问答归档"
    ];

    const checks = [];
    for (const path of paths) {
      const ids = await this.siyuan.getIdsByHPath(resolvedNotebook, path);
      checks.push({
        path,
        exists: Array.isArray(ids) && ids.length > 0,
        id: Array.isArray(ids) && ids.length > 0 ? ids[0] : ""
      });
    }

    return {
      ok: true,
      action: "wiki_status",
      wikiName: registryEntry?.wikiName || wikiName || notebook?.name || "",
      notebookId: resolvedNotebook,
      notebookName: notebook?.name || "",
      registryPath: registry.path,
      registryEntry,
      today: today(),
      checks
    };
  }

  async wikiRefreshIndexes({ notebookId = "", wikiName = "" }) {
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const notebooks = await this.siyuan.listNotebooks();
    const notebook = notebooks.find((item) => item.id === resolvedNotebook);
    const indexTargets = [
      { path: "/收件箱", root: "/收件箱/", title: "收件箱", summary: "待处理资料入口" },
      { path: "/原始资料", root: "/原始资料/", title: "原始资料", summary: "不可变原始资料注册表" },
      { path: "/实体", root: "/实体/", title: "实体", summary: "实体页集合" },
      { path: "/概念", root: "/概念/", title: "概念", summary: "概念、主题与综述页" },
      { path: "/对比", root: "/对比/", title: "对比", summary: "对比分析页" },
      { path: "/问答归档", root: "/问答归档/", title: "问答归档", summary: "沉淀后的问答与结论" }
    ];

    const treeRows = await this.listWikiDocsBySql(resolvedNotebook);
    const pathIndex = buildPathIndex(treeRows);
    const indexes = [];

    const structureDoc = await this.ensureDocAtPath(
      resolvedNotebook,
      "/结构约定",
      [
        "# 结构约定",
        "",
        "## 知识库元信息",
        "",
        `- 名称: ${notebook?.name || wikiName || ""}`,
        `- notebook_name: ${notebook?.name || ""}`,
        "- 原始资料策略: 不可变",
        "- 编译策略: 增量维护",
        "- Agent 负责 compile/query/lint 的推理与总结",
        "- MCP 只负责稳定的读写、索引和校验原语",
        "",
        "## Wiki 导航",
        "",
        `- 总索引: ${pathRef("/总索引", pathIndex, "总索引")} | \`/总索引\``,
        `- 收件箱入口: ${pathRef("/收件箱", pathIndex, "收件箱")} | \`/收件箱\``,
        `- 原始资料入口: ${pathRef("/原始资料", pathIndex, "原始资料")} | \`/原始资料\``,
        "",
        "## 内部结构",
        "",
        "- 根文件: 结构约定、总索引、操作日志",
        "- 主分区: 收件箱、原始资料、实体、概念、对比、问答归档",
        ""
      ].join("\n"),
      true
    );
    indexes.push(structureDoc);

    const logDoc = await this.ensureDocAtPath(
      resolvedNotebook,
      "/操作日志",
      [
        "# 操作日志",
        "",
        `- index: ${pathRef("/总索引", pathIndex, "总索引")} | \`/总索引\``,
        ""
      ].join("\n"),
      true
    );
    indexes.push(logDoc);

    for (const target of indexTargets) {
      const rows = treeRows
        .filter((item) => item.hpath.startsWith(target.root))
        .filter((item) => item.hpath !== target.path)
        .filter((item) => parentPath(item.hpath) === target.path)
        .map((item) => ({
          id: item.id,
          file: item.hpath,
          title: pageTitleFromPath(item.hpath),
          summary: item.content || "",
          tags: "",
          updated: item.updated || today()
        }));
      const markdown = buildDirectoryIndex({
        title: target.title,
        summary: target.summary,
        sections: [
          {
            title: "Navigation",
            lines: [
              pathLine("/总索引", pathIndex, "总索引"),
              pathLine("/结构约定", pathIndex, "结构约定")
            ]
          }
        ],
        rows
      });
      const result = await this.ensureDocAtPath(resolvedNotebook, target.path, markdown, true);
      indexes.push(result);
    }

    const rootRows = [
      resolvePathMeta("/结构约定", pathIndex, "结构约定"),
      resolvePathMeta("/总索引", pathIndex, "总索引"),
      resolvePathMeta("/操作日志", pathIndex, "操作日志"),
      resolvePathMeta("/收件箱", pathIndex, "收件箱"),
      resolvePathMeta("/原始资料", pathIndex, "原始资料"),
      resolvePathMeta("/实体", pathIndex, "实体"),
      resolvePathMeta("/概念", pathIndex, "概念"),
      resolvePathMeta("/对比", pathIndex, "对比"),
      resolvePathMeta("/问答归档", pathIndex, "问答归档")
    ];

    const rootIndex = await this.ensureDocAtPath(
      resolvedNotebook,
      "/总索引",
      buildDirectoryIndex({
        title: "知识库总索引",
        summary: "知识库根目录与主分区的总览",
        sections: [
          {
            title: "Wiki Navigation",
            lines: [
              pathLine("/结构约定", pathIndex, "结构约定"),
              pathLine("/收件箱", pathIndex, "收件箱")
            ]
          }
        ],
        rows: rootRows.map((item) => ({
          id: item.id,
          file: item.path,
          title: item.title,
          summary: item.summary || "Root entry",
          updated: item.updated || today()
        }))
      }),
      true
    );

    indexes.unshift(rootIndex);

    return {
      ok: true,
      action: "wiki_refresh_indexes",
      notebookId: resolvedNotebook,
      indexes: indexes.map((item) => ({
        path: item.path,
        id: item.id,
        created: item.created
      }))
    };
  }

  async wikiRefreshIndexByPath({ notebookId = "", wikiName = "", indexPath = "" }) {
    if (!indexPath) {
      throw new Error("indexPath is required");
    }
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const normalizedPath = `/${String(indexPath).replace(/^\/+/, "")}`;
    await this.wikiRefreshIndexes({ notebookId: resolvedNotebook, wikiName });
    const ids = await this.siyuan.getIdsByHPath(resolvedNotebook, normalizedPath);
    return {
      ok: true,
      action: "wiki_refresh_index_by_path",
      notebookId: resolvedNotebook,
      path: normalizedPath,
      id: Array.isArray(ids) && ids.length > 0 ? ids[0] : ""
    };
  }

  async wikiAppendLog({ notebookId = "", wikiName = "", operation, description }) {
    if (!operation) {
      throw new Error("operation is required");
    }
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const logId = await this.ensureDocAtPath(
      resolvedNotebook,
      "/操作日志",
      "# 操作日志\n",
      false
    );

    const logLine = [buildLogEntry(operation, description || ""), `- time: ${nowIso()}`].join("\n");
    const current = await this.safeExportMarkdown(logId.id);
    const nextMarkdown = `${current.trim()}\n\n${logLine}\n`;
    await this.siyuan.updateBlock(logId.id, nextMarkdown);

    return {
      ok: true,
      action: "wiki_append_log",
      notebookId: resolvedNotebook,
      path: "/操作日志",
      id: logId.id
    };
  }

  async wikiIngestText({
    notebookId = "",
    wikiName = "",
    rawType = "notes",
    title,
    text,
    source = "MANUAL",
    tags = []
  }) {
    if (!title) {
      throw new Error("title is required");
    }
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const safeType = slugify(rawType || "notes") || "notes";
    const safeTitle = slugify(title) || "note";
    const typeMap = {
      articles: "文章",
      papers: "论文",
      repos: "仓库",
      notes: "笔记",
      data: "数据"
    };
    const cnType = typeMap[safeType] || "笔记";
    const path = `/原始资料/${cnType}/${safeTitle}`;
    const markdown = [
      "---",
      `title: "${title}"`,
      `source: "${source}"`,
      `type: "${rawType}"`,
      `ingested: "${today()}"`,
      `tags: [${tags.map((tag) => `"${tag}"`).join(", ")}]`,
      "---",
      "",
      text || ""
    ].join("\n");
    const result = await this.ensureDocAtPath(resolvedNotebook, path, markdown, false);
    await this.wikiRefreshIndexes({ notebookId: resolvedNotebook });
    await this.wikiAppendLog({
      notebookId: resolvedNotebook,
      operation: "ingest_text",
      description: `Stored raw ${rawType} ${title}`
    });

    return {
      ok: true,
      action: "wiki_ingest_text",
      notebookId: resolvedNotebook,
      rawType,
      title,
      tags,
      path: result.path,
      id: result.id
    };
  }

  async wikiIngestBatch({
    notebookId = "",
    wikiName = "",
    records = [],
    appendLog = true
  }) {
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const normalizedRecords = Array.isArray(records) ? records : [];
    if (normalizedRecords.length === 0) {
      throw new Error("records must contain at least one raw payload");
    }

    const results = [];
    for (const record of normalizedRecords) {
      const ingestResult = await this.wikiIngestText({
        notebookId: resolvedNotebook,
        rawType: record.rawType || "notes",
        title: record.title,
        text: record.markdown || record.text || "",
        source: record.source || "BATCH_IMPORT",
        tags: Array.isArray(record.tags) ? record.tags : []
      });
      results.push({
        title: record.title,
        path: ingestResult.path,
        id: ingestResult.id,
        rawType: ingestResult.rawType,
        source: record.source || "BATCH_IMPORT"
      });
    }

    if (appendLog) {
      await this.wikiAppendLog({
        notebookId: resolvedNotebook,
        operation: "ingest_batch",
        description: `Stored ${results.length} raw source item(s) via batch ingest`
      });
    }

    return {
      ok: true,
      action: "wiki_ingest_batch",
      notebookId: resolvedNotebook,
      count: results.length,
      items: results
    };
  }

  async wikiIngestImportBundle({
    notebookId = "",
    wikiName = "",
    importRoot = "",
    paths = [],
    bundlePath = "",
    confirm = false
  }) {
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const importSpec = await this.loadImportBundle({ importRoot, paths, bundlePath });
    const resolvedPlan = await this.buildImportPlan(importSpec, resolvedNotebook);

    if (!confirm) {
      return {
        ok: true,
        action: "wiki_ingest_import_bundle",
        notebookId: resolvedNotebook,
        confirmRequired: true,
        bundle: resolvedPlan.bundleSummary,
        plans: resolvedPlan.plans
      };
    }

    const applied = [];
    for (const plan of resolvedPlan.runtimePlans) {
      if (plan.mode === "tree_upload") {
        for (const file of plan.files) {
          const result = await this.ensureDocAtPath(resolvedNotebook, file.hpath, file.markdown, true);
          applied.push({
            sourcePath: file.sourcePath,
            hpath: result.path,
            id: result.id,
            mode: "tree_upload",
            created: result.created
          });
        }
        continue;
      }

      if (plan.mode === "raw_batch") {
        const ingestResult = await this.wikiIngestBatch({
          notebookId: resolvedNotebook,
          records: plan.records,
          appendLog: false
        });
        applied.push({
          sourcePath: plan.sourcePath,
          mode: "raw_batch",
          count: ingestResult.count,
          items: ingestResult.items
        });
      }
    }

    await this.wikiAppendLog({
      notebookId: resolvedNotebook,
      operation: "ingest_import_bundle",
      description: `Imported ${applied.length} bundle group(s) via path-driven import`
    });

    return {
      ok: true,
      action: "wiki_ingest_import_bundle",
      notebookId: resolvedNotebook,
      confirmRequired: false,
      applied
    };
  }

  async loadImportBundle({ importRoot = "", paths = [], bundlePath = "" }) {
    const fs = await import("node:fs/promises");
    const pathModule = await import("node:path");
    const path = pathModule.default ?? pathModule;

    if (bundlePath) {
      const content = await fs.readFile(bundlePath, "utf8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed?.records) && parsed.records.length > 0) {
        return {
          mode: "raw_batch",
          importRoot,
          inputs: parsed.inputs || [bundlePath],
          files: [],
          treeDirectories: [],
          batchDirectories: [],
          records: parsed.records
        };
      }
      return parsed;
    }

    const inputs = Array.isArray(paths) ? paths.filter(Boolean) : [];
    if (inputs.length === 0) {
      throw new Error("paths or bundlePath is required");
    }

    const normalizedInputs = inputs.map((item) => path.resolve(String(item)));
    const statEntries = [];
    for (const item of normalizedInputs) {
      const stat = await fs.stat(item);
      statEntries.push({ path: item, stat });
    }

    const directories = statEntries.filter((item) => item.stat.isDirectory()).map((item) => item.path);
    const filesOnly = statEntries.filter((item) => item.stat.isFile()).map((item) => item.path);

    const normalizedFilesOnly = filesOnly.filter((filePath) => path.extname(filePath).toLowerCase() === ".md");
    const fileSet = new Set(normalizedFilesOnly);
    const treeDirectories = [];
    const batchDirectories = [];

    for (const dirPath of directories) {
      const dirName = path.basename(dirPath);
      const anchor = path.join(dirPath, `${dirName}.md`);
      const anchorExists = await fs
        .access(anchor)
        .then(() => true)
        .catch(() => false);
      if (anchorExists) {
        treeDirectories.push(dirPath);
      } else {
        batchDirectories.push(dirPath);
      }
    }

    for (const dirPath of batchDirectories) {
      const markdownFiles = await this.collectMarkdownFilesInDirectory(dirPath, path);
      for (const markdownFile of markdownFiles) {
        fileSet.add(markdownFile);
      }
    }

    for (const dirPath of treeDirectories) {
      const markdownFiles = await this.collectTreeMarkdownFiles(dirPath, path);
      for (const markdownFile of markdownFiles) {
        fileSet.add(markdownFile);
      }
    }

    const uniqueFiles = Array.from(fileSet).sort();
    return {
      mode: treeDirectories.length > 0 && batchDirectories.length === 0 && normalizedFilesOnly.length === 0 ? "tree_upload" : "raw_batch",
      importRoot,
      inputs: normalizedInputs,
      files: uniqueFiles,
      treeDirectories,
      batchDirectories
    };
  }

  async collectMarkdownFilesInDirectory(directoryPath, pathModule) {
    const fs = await import("node:fs/promises");
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
        files.push(pathModule.join(directoryPath, entry.name));
      }
    }
    return files;
  }

  async collectTreeMarkdownFiles(directoryPath, pathModule) {
    const fs = await import("node:fs/promises");
    const files = [];
    const stack = [directoryPath];
    while (stack.length > 0) {
      const current = stack.pop();
      const entries = await fs.readdir(current, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = pathModule.join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(fullPath);
          continue;
        }
        if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
          files.push(fullPath);
        }
      }
    }
    return files;
  }

  async buildImportPlan(importSpec, resolvedNotebook) {
    const fs = await import("node:fs/promises");
    const pathModule = await import("node:path");
    const path = pathModule.default ?? pathModule;
    const plans = [];
    if (Array.isArray(importSpec?.files) && importSpec.files.some((item) => item && typeof item === "object" && item.virtualPath)) {
      const treeCandidates = [];
      for (const file of importSpec.files) {
        const virtualPath = String(file?.virtualPath || "").trim();
        if (!virtualPath) {
          continue;
        }
        let markdown = String(file?.markdown || "");
        const sourcePath = String(file?.originFile || file?.sourcePath || "").trim();
        if (!markdown && sourcePath) {
          markdown = await fs.readFile(sourcePath, "utf8");
        }
        treeCandidates.push({
          sourcePath,
          hpath: canonicalHPathFromVirtualPath(virtualPath),
          markdown: normalizeImportedMarkdown(markdown, pageTitleFromPath(canonicalHPathFromVirtualPath(virtualPath)))
        });
      }

      if (treeCandidates.length === 0) {
        throw new Error("tree upload bundle contains no markdown files");
      }

      plans.push({
        mode: "tree_upload",
        sourcePath: Array.isArray(importSpec.inputs) ? importSpec.inputs[0] || "" : "",
        files: treeCandidates
      });

      return {
        bundleSummary: {
          importRoot: importSpec.importRoot || "",
          inputs: importSpec.inputs || [],
          mode: importSpec.mode || "tree_upload",
          filesCount: treeCandidates.length,
          planCount: 1
        },
        plans: [
          {
            mode: "tree_upload",
            sourcePath: Array.isArray(importSpec.inputs) ? importSpec.inputs[0] || "" : "",
            files: treeCandidates.map((file) => ({
              sourcePath: file.sourcePath,
              hpath: file.hpath
            }))
          }
        ],
        runtimePlans: plans
      };
    }

    if (Array.isArray(importSpec?.records) && importSpec.records.length > 0) {
      plans.push({
        mode: "raw_batch",
        sourcePath: Array.isArray(importSpec.inputs) ? importSpec.inputs[0] || "" : "",
        records: safeJsonClone(importSpec.records)
      });
      return {
        bundleSummary: {
          importRoot: importSpec.importRoot || "",
          inputs: importSpec.inputs || [],
          mode: importSpec.mode || "raw_batch",
          filesCount: 0,
          recordCount: importSpec.records.length,
          planCount: 1
        },
        plans: [
          {
            mode: "raw_batch",
            sourcePath: Array.isArray(importSpec.inputs) ? importSpec.inputs[0] || "" : "",
            records: importSpec.records.map((record) => ({
              title: record.title,
              source: record.source || ""
            }))
          }
        ],
        runtimePlans: plans
      };
    }

    const files = Array.isArray(importSpec?.files) ? importSpec.files : [];
    const baseRoot = String(importSpec?.importRoot || "").trim();
    const rootPath = baseRoot ? path.resolve(baseRoot) : "";
    const treeDirectories = Array.isArray(importSpec?.treeDirectories) ? importSpec.treeDirectories : [];
    const batchDirectories = Array.isArray(importSpec?.batchDirectories) ? importSpec.batchDirectories : [];

    if (files.length === 0) {
      throw new Error("import bundle contains no markdown files");
    }

    const treeCandidates = [];
    const rawCandidates = [];

    for (const absolutePath of files) {
      const markdown = await fs.readFile(absolutePath, "utf8");
      const fileName = path.basename(absolutePath);
      const stem = fileName.replace(/\.md$/i, "");
      const dirPath = path.dirname(absolutePath);
      const relativeFromRoot = rootPath && absolutePath.startsWith(rootPath)
        ? path.relative(rootPath, absolutePath).replace(/\\/g, "/")
        : path.basename(absolutePath);
      const sameNameTree = treeDirectories.some((dir) => {
        const resolvedDir = path.resolve(dir);
        return absolutePath.startsWith(`${resolvedDir}${path.sep}`) || absolutePath === path.join(resolvedDir, `${path.basename(resolvedDir)}.md`);
      });

      if (sameNameTree) {
        const targetHPath = `/${relativeFromRoot.replace(/\.md$/i, "")}`;
        treeCandidates.push({
          sourcePath: absolutePath,
          hpath: targetHPath,
          markdown: normalizeImportedMarkdown(markdown, pageTitleFromPath(targetHPath))
        });
      } else {
        rawCandidates.push({
          title: stem,
          rawType: "notes",
          markdown,
          source: `LOCAL_FILE:${absolutePath}`,
          tags: [pathModule.basename(dirPath)]
        });
      }
    }

    if (treeCandidates.length > 0 && rawCandidates.length > 0) {
      plans.push({
        mode: "tree_upload",
        sourcePath: baseRoot || importSpec.inputs?.[0] || "",
        files: treeCandidates
      });
      plans.push({
        mode: "raw_batch",
        sourcePath: baseRoot || importSpec.inputs?.[0] || "",
        records: rawCandidates
      });
    } else if (treeCandidates.length > 0) {
      plans.push({
        mode: "tree_upload",
        sourcePath: baseRoot || importSpec.inputs?.[0] || "",
        files: treeCandidates
      });
    } else {
      plans.push({
        mode: "raw_batch",
        sourcePath: baseRoot || importSpec.inputs?.[0] || "",
        records: rawCandidates
      });
    }

    return {
      bundleSummary: {
        importRoot: importSpec.importRoot || "",
        inputs: importSpec.inputs || [],
        mode: importSpec.mode || "",
        filesCount: files.length,
        planCount: plans.length
      },
      plans: plans.map((plan) => ({
        mode: plan.mode,
        sourcePath: plan.sourcePath,
        files: (plan.files || []).map((file) => ({
          sourcePath: file.sourcePath,
          hpath: file.hpath
        })),
        records: (plan.records || []).map((record) => ({
          title: record.title,
          source: record.source
        }))
      })),
      runtimePlans: plans
    };
  }

  async wikiArchiveConclusion({
    notebookId = "",
    wikiName = "",
    category = "queries",
    title,
    question = "",
    answer = "",
    sources = [],
    caveats = [],
    tags = []
  }) {
    if (!title) {
      throw new Error("title is required");
    }

    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const categoryMap = {
      queries: "/问答归档",
      concepts: "/概念",
      entities: "/实体",
      comparisons: "/对比",
      topics: "/概念",
      references: "/概念/参考",
      theses: "/概念/论题"
    };
    const targetDir = categoryMap[category] || "/问答归档";
    const safeTitle = slugify(title) || "archive";
    const path = `${targetDir}/${safeTitle}`;
    const sourceLines = sources.length ? sources.map((item) => `- ${item}`) : ["- none"];
    const caveatLines = caveats.length ? caveats.map((item) => `- ${item}`) : ["- none"];
    const markdown = [
      "---",
      `title: "${title}"`,
      `category: "${category}"`,
      `created: "${today()}"`,
      `updated: "${today()}"`,
      `tags: [${tags.map((tag) => `"${tag}"`).join(", ")}]`,
      'confidence: "medium"',
      `summary: "${answer ? String(answer).slice(0, 160).replace(/"/g, "'") : ""}"`,
      "---",
      "",
      "# Question",
      "",
      question || "N/A",
      "",
      "# Answer",
      "",
      answer || "N/A",
      "",
      "# Sources",
      "",
      ...sourceLines,
      "",
      "# Caveats",
      "",
      ...caveatLines,
      ""
    ].join("\n");

    const result = await this.ensureDocAtPath(resolvedNotebook, path, markdown, true);
    await this.wikiRefreshIndexes({ notebookId: resolvedNotebook });
    await this.wikiAppendLog({
      notebookId: resolvedNotebook,
      operation: "archive_conclusion",
      description: `Archived ${category} page ${title}`
    });

    return {
      ok: true,
      action: "wiki_archive_conclusion",
      notebookId: resolvedNotebook,
      category,
      path: result.path,
      id: result.id
    };
  }

  async wikiQuery({ notebookId = "", wikiName = "", query }) {
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const docs = await this.listQueryDocsBySql(resolvedNotebook);
    const lowered = String(query || "").toLowerCase();
    const lexicalMatches = docs
      .filter((item) => {
        const hay = `${item.hpath || ""} ${item.content || ""}`.toLowerCase();
        return lowered && hay.includes(lowered);
      })
      .slice(0, 20)
      .map((item) => ({
        id: item.id,
        path: item.hpath,
        snippet: item.content || "",
        matchType: "lexical"
      }));

    const semanticMatches = await this.embeddings.searchNotebook(
      resolvedNotebook,
      docs,
      query,
      this.config.embeddings.topK
    );

    const merged = uniqueBy(
      [
        ...semanticMatches.map((item) => ({
          ...item,
          matchType: "semantic"
        })),
        ...lexicalMatches
      ],
      "id"
    );

    return {
      ok: true,
      action: "wiki_query",
      notebookId: resolvedNotebook,
      query,
      matches: merged,
      retrievalMode: this.embeddings.enabled ? "semantic+lexical" : "lexical",
      note: this.embeddings.enabled
        ? "Query reads maintained wiki pages only. Raw sources are excluded from retrieval and only participate during ingest or lint-style maintenance."
        : "Query reads maintained wiki pages only. Raw sources are excluded and should only be read during ingest or lint-style maintenance."
    };
  }

  async wikiFindRelated({ notebookId = "", wikiName = "", query = "", path = "", limit = 8 }) {
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const docs = await this.listQueryDocsBySql(resolvedNotebook);
    const lowered = String(query || path || "").toLowerCase();
    const ranked = docs
      .map((item) => {
        const hay = `${item.hpath || ""} ${item.content || ""}`.toLowerCase();
        let score = 0;
        if (path && item.hpath === path) {
          score += 100;
        }
        if (lowered && hay.includes(lowered)) {
          score += 10;
        }
        const terms = lowered.split(/[\s\-_/]+/).filter(Boolean);
        for (const term of terms) {
          if (hay.includes(term)) {
            score += 2;
          }
        }
        return {
          id: item.id,
          path: item.hpath,
          snippet: item.content || "",
          score
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, Number(limit) || 8);

    const semanticMatches = await this.embeddings.searchNotebook(
      resolvedNotebook,
      docs,
      query || path,
      Number(limit) || this.config.embeddings.topK
    );
    const merged = uniqueBy(
      [
        ...semanticMatches.map((item) => ({
          ...item,
          score: Math.max(item.semanticScore || 0, 0),
          matchType: "semantic"
        })),
        ...ranked.map((item) => ({
          ...item,
          matchType: "lexical"
        }))
      ],
      "id"
    )
      .sort((a, b) => (b.semanticScore || b.score || 0) - (a.semanticScore || a.score || 0))
      .slice(0, Number(limit) || 8);

    return {
      ok: true,
      action: "wiki_find_related",
      notebookId: resolvedNotebook,
      query,
      path,
      matches: merged,
      retrievalMode: this.embeddings.enabled ? "semantic+lexical" : "lexical"
    };
  }

  async wikiReadTree({ notebookId = "", wikiName = "", rootPath = "/", depth = 3 }) {
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const normalizedRoot = String(rootPath || "/").startsWith("/") ? String(rootPath || "/") : `/${String(rootPath || "")}`;
    const maxDepth = Number(depth) > 0 ? Number(depth) : 3;
    const rows = await this.listLiveWikiDocs(resolvedNotebook);
    const rootLevel = normalizedRoot === "/" ? 0 : normalizedRoot.split("/").filter(Boolean).length;
    const items = buildVirtualTreeItems(
      rows
        .filter((row) => {
          if (normalizedRoot === "/") {
            return true;
          }
          return row.hpath === normalizedRoot || row.hpath.startsWith(`${normalizedRoot}/`);
        })
        .filter((row) => {
          const level = row.hpath.split("/").filter(Boolean).length;
          return Math.max(level - rootLevel, 0) <= maxDepth;
        })
        .sort((a, b) => a.hpath.localeCompare(b.hpath, "zh-CN"))
    ).map((item) => ({
      id: item.id,
      hpath: item.hpath,
      virtualPath: item.virtualPath,
      title: item.title,
      summary: item.summary,
      updated: item.updated
    }));

    return {
      ok: true,
      action: "wiki_read_tree",
      notebookId: resolvedNotebook,
      rootPath: normalizedRoot,
      depth: maxDepth,
      items,
      treeText: renderVirtualTreeText(notebookId || wikiName || "wiki", items)
    };
  }

  async wikiReadMarkdownBatch({
    notebookId = "",
    wikiName = "",
    includeRaw = true,
    includeMaintained = true,
    includeStructure = true,
    rootPath = "/",
    limit = 400
  }) {
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const normalizedRoot = String(rootPath || "/").startsWith("/") ? String(rootPath || "/") : `/${String(rootPath || "")}`;
    const rows = await this.listLiveWikiDocs(resolvedNotebook);
    const filtered = rows
      .filter((row) => {
        if (normalizedRoot === "/") {
          return true;
        }
        return row.hpath === normalizedRoot || row.hpath.startsWith(`${normalizedRoot}/`);
      })
      .filter((row) => {
        const pathValue = row.hpath || "";
        if (includeRaw && isTrueRawDocPath(pathValue)) {
          return true;
        }
        if (includeMaintained && pathStartsWithAny(pathValue, MAINTAINED_ROOTS)) {
          return true;
        }
        if (includeStructure && ["/结构约定", "/总索引", "/操作日志", "/收件箱", "/原始资料"].includes(pathValue)) {
          return true;
        }
        return false;
      })
      .slice(0, Number(limit) > 0 ? Number(limit) : 400);

    const virtualItems = buildVirtualTreeItems(filtered);
    const docs = [];
    const linkMap = this.buildLinkMap(rows);
    const pathIndex = buildPathIndex(rows);
    for (const item of virtualItems) {
      const markdown = await this.safeExportMarkdown(item.id);
      const normalizedMarkdown = normalizeExportedMarkdown(
        enforceLinkPolicy(stripImageMarkdown(markdown), linkMap, pathIndex).markdown,
        item.title
      );
      docs.push({
        id: item.id,
        hpath: item.hpath,
        virtualPath: item.virtualPath,
        title: item.title,
        updated: item.updated,
        markdown: normalizedMarkdown
      });
    }

    return {
      ok: true,
      action: "wiki_read_markdown_batch",
      notebookId: resolvedNotebook,
      rootPath: normalizedRoot,
      includeRaw,
      includeMaintained,
      includeStructure,
      count: docs.length,
      treeText: renderVirtualTreeText(notebookId || wikiName || "wiki", virtualItems),
      docs
    };
  }

  async wikiReadPage({
    notebookId = "",
    wikiName = "",
    path = "",
    includeImages = false
  }) {
    if (!path) {
      throw new Error("path is required");
    }
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const normalizedPath = `/${String(path).replace(/^\/+/, "")}`;
    const ids = await this.siyuan.getIdsByHPath(resolvedNotebook, normalizedPath);
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error(`Page not found: ${normalizedPath}`);
    }
    const markdown = await this.safeExportMarkdown(ids[0]);
    const rows = await this.listLiveWikiDocs(resolvedNotebook);
    const linkMap = this.buildLinkMap(rows);
    const pathIndex = buildPathIndex(rows);
    const normalizedMarkdown = normalizeExportedMarkdown(
      enforceLinkPolicy(includeImages ? String(markdown || "") : stripImageMarkdown(markdown), linkMap, pathIndex).markdown,
      pageTitleFromPath(normalizedPath)
    );
    return {
      ok: true,
      action: "wiki_read_page",
      notebookId: resolvedNotebook,
      hpath: normalizedPath,
      markdown: normalizedMarkdown
    };
  }

  async wikiListUncompiledRaw({
    notebookId = "",
    wikiName = ""
  }) {
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const docs = await this.listLiveWikiDocs(resolvedNotebook);
    const rawDocs = docs.filter((item) => pathStartsWithAny(item.hpath || "", RAW_ROOTS));
    const trueRawDocs = docs.filter((item) => isTrueRawDocPath(item.hpath || ""));
    const maintainedDocs = docs.filter((item) => pathStartsWithAny(item.hpath || "", MAINTAINED_ROOTS));
    const items = trueRawDocs
      .filter((item) => {
        const rawName = pageTitleFromPath(item.hpath || "");
        return !maintainedDocs.some((page) => String(page.content || "").includes(rawName));
      })
      .map((item) => ({
        id: item.id,
        hpath: item.hpath,
        title: pageTitleFromPath(item.hpath),
        summary: item.content || "",
        updated: item.updated || ""
      }));

    return {
      ok: true,
      action: "wiki_list_uncompiled_raw",
      notebookId: resolvedNotebook,
      count: items.length,
      items
    };
  }

  async wikiPrepareCompileBundle({
    notebookId = "",
    wikiName = "",
    query = "",
    explicitRawPaths = [],
    rawTypes = [],
    recentLimit = 5,
    semanticLimit = 8,
    rootPath = "/原始资料"
  }) {
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const normalizedRoot = String(rootPath || "/原始资料").startsWith("/")
      ? String(rootPath || "/原始资料")
      : `/${String(rootPath || "原始资料")}`;
    const typeMap = {
      articles: "文章",
      papers: "论文",
      repos: "仓库",
      notes: "笔记",
      data: "数据",
      "文章": "文章",
      "论文": "论文",
      "仓库": "仓库",
      "笔记": "笔记",
      "数据": "数据"
    };
    const requestedTypeRoots = Array.isArray(rawTypes) && rawTypes.length > 0
      ? rawTypes
          .map((item) => typeMap[String(item || "").trim()] || typeMap[slugify(item || "")])
          .filter(Boolean)
          .map((item) => `/原始资料/${item}`)
      : [];

    const allRawDocs = (await this.listRawDocsBySql(resolvedNotebook))
      .filter((item) => item.hpath === normalizedRoot || item.hpath.startsWith(`${normalizedRoot}/`))
      .filter((item) => {
        if (requestedTypeRoots.length === 0) {
          return true;
        }
        return requestedTypeRoots.some((root) => item.hpath === root || item.hpath.startsWith(`${root}/`));
      });

    const selected = new Map();
    const missingExplicitPaths = [];

    for (const rawPath of Array.isArray(explicitRawPaths) ? explicitRawPaths : []) {
      const normalizedPath = `/${String(rawPath || "").replace(/^\/+/, "")}`;
      const row = allRawDocs.find((item) => item.hpath === normalizedPath);
      if (!row) {
        missingExplicitPaths.push(normalizedPath);
        continue;
      }
      selected.set(row.hpath, {
        row,
        reasons: ["explicit"],
        semanticScore: 0
      });
    }

    const recentRows = [...allRawDocs]
      .sort((a, b) => String(b.updated || "").localeCompare(String(a.updated || "")))
      .slice(0, Number(recentLimit) > 0 ? Number(recentLimit) : 5);
    for (const row of recentRows) {
      const existing = selected.get(row.hpath);
      if (existing) {
        existing.reasons = Array.from(new Set([...existing.reasons, "recent"]));
      } else {
        selected.set(row.hpath, {
          row,
          reasons: ["recent"],
          semanticScore: 0
        });
      }
    }

    if (query) {
      const semanticMatches = await this.embeddings.searchNotebook(
        resolvedNotebook,
        allRawDocs,
        query,
        Number(semanticLimit) > 0 ? Number(semanticLimit) : this.config.embeddings.topK
      );
      const scoreByPath = new Map(semanticMatches.map((item) => [item.path, item.semanticScore || 0]));
      for (const match of semanticMatches) {
        const row = allRawDocs.find((item) => item.hpath === match.path);
        if (!row) {
          continue;
        }
        const existing = selected.get(row.hpath);
        if (existing) {
          existing.reasons = Array.from(new Set([...existing.reasons, "semantic"]));
          existing.semanticScore = Math.max(existing.semanticScore || 0, scoreByPath.get(row.hpath) || 0);
        } else {
          selected.set(row.hpath, {
            row,
            reasons: ["semantic"],
            semanticScore: scoreByPath.get(row.hpath) || 0
          });
        }
      }
    }

    const docs = [];
    for (const item of selected.values()) {
      const markdown = await this.safeExportMarkdown(item.row.id);
      docs.push({
        id: item.row.id,
        hpath: item.row.hpath,
        title: pageTitleFromPath(item.row.hpath),
        updated: item.row.updated || "",
        reasons: item.reasons,
        semanticScore: item.semanticScore || 0,
        markdown: stripImageMarkdown(markdown)
      });
    }

    docs.sort((a, b) => {
      const reasonWeight = (value) =>
        (value.reasons.includes("explicit") ? 100 : 0) +
        (value.reasons.includes("semantic") ? 10 : 0) +
        (value.reasons.includes("recent") ? 1 : 0);
      const byWeight = reasonWeight(b) - reasonWeight(a);
      if (byWeight !== 0) {
        return byWeight;
      }
      const byScore = (b.semanticScore || 0) - (a.semanticScore || 0);
      if (byScore !== 0) {
        return byScore;
      }
      return String(b.updated || "").localeCompare(String(a.updated || ""));
    });

    return {
      ok: true,
      action: "wiki_prepare_compile_bundle",
      notebookId: resolvedNotebook,
      query,
      rootPath: normalizedRoot,
      rawTypes: requestedTypeRoots,
      recentLimit: Number(recentLimit) > 0 ? Number(recentLimit) : 5,
      semanticLimit: Number(semanticLimit) > 0 ? Number(semanticLimit) : this.config.embeddings.topK,
      missingExplicitPaths,
      count: docs.length,
      docs
    };
  }

  async wikiWriteMarkdownFromTree({
    notebookId = "",
    wikiName = "",
    files = [],
    confirm = false
  }) {
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const normalizedFiles = Array.isArray(files) ? files : [];
    if (normalizedFiles.length === 0) {
      throw new Error("files must contain at least one markdown file payload");
    }

    const rows = await this.listLiveWikiDocs(resolvedNotebook);
    const linkMap = this.buildLinkMap(rows);
    const pathIndex = buildPathIndex(rows);
    const plans = [];
    for (const file of normalizedFiles) {
      const virtualPath = String(file?.virtualPath || "").trim();
      const rawMarkdown = String(file?.markdown || "");
      if (!virtualPath) {
        throw new Error("Each file entry must include virtualPath");
      }
      const hpath = canonicalHPathFromVirtualPath(virtualPath);
      const title = pageTitleFromPath(hpath);
      const prepared = enforceLinkPolicy(normalizeImportedMarkdown(rawMarkdown, title), linkMap, pathIndex);
      const existingIds = await this.siyuan.getIdsByHPath(resolvedNotebook, hpath);
      const existingId = Array.isArray(existingIds) && existingIds.length > 0 ? existingIds[0] : "";
      const before = existingId
        ? normalizeExportedMarkdown(
            enforceLinkPolicy(stripImageMarkdown(await this.safeExportMarkdown(existingId)), linkMap, pathIndex).markdown,
            title
          )
        : "";
      const diff = summarizeMarkdownDiff(before, prepared.markdown);
      plans.push({
        virtualPath,
        hpath,
        mode: existingId ? "update" : "create",
        id: existingId,
        diff,
        markdown: prepared.markdown,
        linkIssues: prepared.issues
      });
    }

    if (!confirm) {
      return {
        ok: true,
        action: "wiki_write_markdown_from_tree",
        notebookId: resolvedNotebook,
        confirmRequired: true,
        diffSummary: summarizeTreeDiff(plans),
        plans: plans.map((item) => ({
          virtualPath: item.virtualPath,
          hpath: item.hpath,
          mode: item.mode,
          id: item.id,
          diff: item.diff,
          linkIssues: item.linkIssues
        }))
      };
    }

    const applied = [];
    for (const plan of plans) {
      const result = await this.ensureDocAtPath(resolvedNotebook, plan.hpath, plan.markdown, true);
      applied.push({
        virtualPath: plan.virtualPath,
        hpath: result.path,
        id: result.id,
        mode: plan.mode,
        created: result.created,
        linkIssues: plan.linkIssues
      });
    }

    return {
      ok: true,
      action: "wiki_write_markdown_from_tree",
      notebookId: resolvedNotebook,
      confirmRequired: false,
      diffSummary: summarizeTreeDiff(plans),
      applied
    };
  }

  async wikiExportTree({
    notebookId = "",
    wikiName = "",
    rootPath = "/",
    depth = 3,
    outputPath = ""
  }) {
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const normalizedRoot = String(rootPath || "/").startsWith("/") ? String(rootPath || "/") : `/${String(rootPath || "")}`;
    const maxDepth = Number(depth) > 0 ? Number(depth) : 3;
    const rows = await this.listLiveWikiDocs(resolvedNotebook);
    const rootLevel = normalizedRoot === "/" ? 0 : pathDepth(normalizedRoot);
    const items = buildVirtualTreeItems(
      rows
        .filter((row) => {
          if (normalizedRoot === "/") {
            return true;
          }
          return row.hpath === normalizedRoot || row.hpath.startsWith(`${normalizedRoot}/`);
        })
        .filter((row) => {
          const level = pathDepth(row.hpath);
          return Math.max(level - rootLevel, 0) <= maxDepth;
        })
        .sort((a, b) => a.hpath.localeCompare(b.hpath, "zh-CN"))
    ).map((item) => ({
      id: item.id,
      hpath: item.hpath,
      virtualPath: item.virtualPath,
      title: item.title,
      summary: item.summary,
      updated: item.updated
    }));

    const linkMap = this.buildLinkMap(rows);
    const pathIndex = buildPathIndex(rows);
    const files = [];
    for (const item of items) {
      const markdown = await this.safeExportMarkdown(item.id);
      const normalizedMarkdown = normalizeExportedMarkdown(
        enforceLinkPolicy(stripImageMarkdown(markdown), linkMap, pathIndex).markdown,
        item.title
      );
      files.push({
        virtualPath: item.virtualPath,
        hpath: item.hpath,
        title: item.title,
        markdown: normalizedMarkdown
      });
    }

    const payload = {
      ok: true,
      action: "wiki_export_tree",
      notebookId: resolvedNotebook,
      rootPath: normalizedRoot,
      depth: maxDepth,
      count: files.length,
      mode: "tree_export",
      treeText: renderVirtualTreeText(wikiName || resolvedNotebook || "wiki", items),
      files
    };

    if (outputPath) {
      const fs = await import("node:fs/promises");
      const pathModule = await import("node:path");
      const path = pathModule.default ?? pathModule;
      const normalizedOutput = path.resolve(outputPath);
      await fs.mkdir(path.dirname(normalizedOutput), { recursive: true });
      await fs.writeFile(normalizedOutput, JSON.stringify(payload, null, 2), "utf8");
      payload.outputPath = normalizedOutput;
    }

    return payload;
  }

  async wikiCompileFromRaw(args = {}) {
    return {
      ok: false,
      action: "wiki_compile_from_raw",
      deprecated: true,
      message:
        "Compile reasoning must be done by the current agent, not by MCP. Use wiki_read_markdown_batch or wiki_read_page to read raw and maintained markdown, then write results back with wiki_write_markdown_from_tree, wiki_ensure_page, wiki_replace_section, or wiki_archive_conclusion.",
      guidance: {
        readTools: ["wiki_read_markdown_batch", "wiki_read_page", "wiki_read_tree", "wiki_list_uncompiled_raw"],
        writeTools: ["wiki_write_markdown_from_tree", "wiki_ensure_page", "wiki_replace_section", "wiki_append_under_heading", "wiki_archive_conclusion"],
        receivedArgs: args
      }
    };
  }

  async wikiCompileTopic(args = {}) {
    return {
      ok: false,
      action: "wiki_compile_topic",
      deprecated: true,
      message:
        "Topic compile reasoning must be done by the current agent, not by MCP. Read the relevant raw markdown with wiki_read_markdown_batch or wiki_read_page, synthesize locally in the agent, then write back via wiki_write_markdown_from_tree or other page-write tools.",
      guidance: {
        readTools: ["wiki_read_markdown_batch", "wiki_read_page", "wiki_read_tree", "wiki_find_related"],
        writeTools: ["wiki_write_markdown_from_tree", "wiki_ensure_page", "wiki_replace_section", "wiki_archive_conclusion"],
        receivedArgs: args
      }
    };
  }

  async wikiCompareSources({ notebookId = "", wikiName = "", paths = [] }) {
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    if (!Array.isArray(paths) || paths.length < 2) {
      throw new Error("paths must contain at least two wiki paths");
    }

    const compared = [];
    for (const path of paths) {
      const ids = await this.siyuan.getIdsByHPath(resolvedNotebook, path);
      if (!Array.isArray(ids) || ids.length === 0) {
        compared.push({ path, exists: false, summary: "", abstract: "", caveats: "", contradictions: "", openQuestions: "" });
        continue;
      }
      const content = await this.safeExportMarkdown(ids[0]);
      const abstract = extractSection(content, "Abstract");
      const caveats = extractSection(content, "Caveats");
      const contradictions = extractSection(content, "Contradictions");
      const openQuestions = extractSection(content, "Open Questions");
      compared.push({
        path,
        exists: true,
        summary: content.split(/\r?\n/).slice(0, 12).join("\n"),
        abstract: abstract || "",
        caveats: caveats || "",
        contradictions: contradictions || "",
        openQuestions: openQuestions || ""
      });
    }

    const existing = compared.filter((item) => item.exists);
    const caveatCount = existing.filter((item) => item.caveats).length;
    const contradictionCount = existing.filter((item) => item.contradictions).length;
    const openQuestionCount = existing.filter((item) => item.openQuestions).length;
    let verdict = "Sources are partially comparable.";
    if (contradictionCount > 1) {
      verdict = "Multiple sources expose contradiction signals; compare conclusions carefully.";
    } else if (caveatCount > 0 || openQuestionCount > 0) {
      verdict = "Comparison is usable, but some sources carry caveats or unresolved questions.";
    } else if (existing.length >= 2) {
      verdict = "Sources look structurally aligned with no explicit caution signals extracted.";
    }

    const comparison = {
      sharedPaths: compared.filter((item) => item.exists).map((item) => item.path),
      differingSignals: compared
        .filter((item) => item.exists)
        .map((item) => ({
          path: item.path,
          hasCaveats: Boolean(item.caveats),
          hasContradictions: Boolean(item.contradictions),
          hasOpenQuestions: Boolean(item.openQuestions)
        })),
      verdict
    };

    return {
      ok: true,
      action: "wiki_compare_sources",
      notebookId: resolvedNotebook,
      compared,
      comparison
    };
  }

  async wikiCheckIndex({ notebookId = "", wikiName = "" }) {
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const docs = await this.listWikiDocsBySql(resolvedNotebook);
    const existingSet = new Set(docs.map((item) => item.hpath));
    const rootPages = new Set([
      "/总索引",
      "/收件箱",
      "/原始资料",
      "/实体",
      "/概念",
      "/对比",
      "/问答归档"
    ]);
    const indexDocs = docs.filter((item) => item.hpath === "/总索引" || rootPages.has(item.hpath));
    const pages = docs.filter((item) => item.hpath !== "/总索引");
    const issues = [];

    for (const page of pages) {
      const parent = page.hpath.slice(0, page.hpath.lastIndexOf("/")) || "/";
      if (parent !== "/" && !existingSet.has(parent)) {
        issues.push({
          type: "missing_parent_page",
          page: page.hpath,
          expectedParent: parent
        });
      }
    }

    for (const indexDoc of indexDocs) {
      const markdown = await this.safeExportMarkdown(indexDoc.id);
      const listed = markdown
        .split(/\r?\n/)
        .filter((line) => /^\|\s*\//.test(line) || /^\-\s+\(\([^)]+\)\)\s+\|\s+path:\s+`?\//.test(line) || /^\-\s+\[\[[^\]]+\]\]\s+\|\s+path:\s+`?\//.test(line))
        .map((line) => {
          if (line.startsWith("|")) {
            return line.split("|")[1]?.trim();
          }
          const match = line.match(/path:\s+`([^`]+)`/);
          return match?.[1] || "";
        })
        .filter((item) => item && item !== "/_none_");
      const missingListed = listed.filter((item) => !existingSet.has(item));
      if (missingListed.length > 0) {
        issues.push({
          type: "dangling_index_entry",
          indexPath: indexDoc.hpath,
          entries: missingListed
        });
      }
    }

    return {
      ok: true,
      action: "wiki_check_index",
      notebookId: resolvedNotebook,
      indexCount: indexDocs.length,
      pageCount: pages.length,
      issues
    };
  }

  async wikiLint({ notebookId = "", wikiName = "" }) {
    const resolvedNotebook = await this.resolveNotebookId(notebookId, wikiName);
    const docs = await this.listLiveWikiDocs(resolvedNotebook);
    const rawDocs = docs.filter((item) => pathStartsWithAny(item.hpath || "", RAW_ROOTS));
    const maintainedDocs = docs.filter((item) => pathStartsWithAny(item.hpath || "", MAINTAINED_ROOTS));
    const requiredPaths = [
      "/结构约定",
      "/总索引",
      "/操作日志",
      "/收件箱",
      "/原始资料",
      "/实体",
      "/概念",
      "/对比",
      "/问答归档"
    ];
    const existing = new Set(docs.map((item) => item.hpath));
    const missingRequired = requiredPaths.filter((path) => !existing.has(path));
    const orphanCandidates = docs
      .filter((item) => item.hpath !== "/总索引")
      .filter((item) => {
        const parent = item.hpath.slice(0, item.hpath.lastIndexOf("/")) || "/";
        return parent !== "/" && !existing.has(parent);
      })
      .map((item) => item.hpath);

    const uncompiledRawCandidates = rawDocs
      .filter((item) => {
        const rawName = pageTitleFromPath(item.hpath || "");
        return !maintainedDocs.some((page) => String(page.content || "").includes(rawName));
      })
      .map((item) => item.hpath);

    return {
      ok: true,
      action: "wiki_lint",
      notebookId: resolvedNotebook,
      checks: [
        "index completeness",
        "orphan pages",
        "missing backlinks",
        "dangling references",
        "contradictory claims",
        "raw material coverage"
      ],
      issues: {
        missingRequired,
        orphanCandidates: uniqueBy(
          orphanCandidates.map((path) => ({ path })),
          "path"
        ).map((item) => item.path),
        uncompiledRawCandidates
      }
    };
  }

  getTargetStructure({ isHubWiki = false } = {}) {
    const base = [
      "/结构约定",
      "/总索引",
      "/操作日志",
      "/收件箱",
      "/原始资料",
      "/原始资料/文章",
      "/原始资料/论文",
      "/原始资料/仓库",
      "/原始资料/笔记",
      "/原始资料/数据",
      "/实体",
      "/概念",
      "/概念/参考",
      "/概念/论题",
      "/对比",
      "/问答归档"
    ];
    return base;
  }

  defaultMarkdownForPath(path, { wikiName, notebookName, description }) {
    if (path === "/结构约定") {
      return [
        "# 结构约定",
        "",
        "## 知识库元信息",
        "",
        `- 名称: ${wikiName}`,
        `- notebook_name: ${notebookName}`,
        `- 说明: ${description || ""}`,
        `- 创建日期: ${today()}`,
        "- 原始资料策略: 不可变",
        "- 编译策略: 增量维护",
        "- Query 只读取维基面: 实体、概念、对比、问答归档，以及必要的结构页",
        "- 原始资料只在导入和自检时读取",
        "",
        "## Wiki 导航",
        "",
        `- 总索引: ${pathRef("/总索引")} | \`/总索引\``,
        `- 收件箱入口: ${pathRef("/收件箱")} | \`/收件箱\``,
        `- 原始资料入口: ${pathRef("/原始资料")} | \`/原始资料\``,
        "",
        "## 内部结构",
        "",
        "- 根文件: 结构约定、总索引、操作日志",
        "- 主分区: 收件箱、原始资料、实体、概念、对比、问答归档",
        ""
      ].join("\n");
    }

    if (path === "/操作日志") {
      return [
        "# 操作日志",
        "",
        `- index: ${pathRef("/总索引")} | \`/总索引\``,
        ""
      ].join("\n");
    }

    if (path === "/总索引" || ["/收件箱", "/原始资料", "/实体", "/概念", "/对比", "/问答归档"].includes(path)) {
      const title = path === "/总索引" ? "知识库总索引" : pageTitleFromPath(path);
      return buildDirectoryIndex({
        title,
        summary: `${path} 的主入口页`,
        rows: []
      });
    }

    return [
      `# ${path.split("/").pop()}`,
      "",
      `- parent page: ${pathRef(parentPath(path))} | \`${parentPath(path)}\``,
      `- hub page: ${pathRef("/总索引")} | \`/总索引\``,
      ""
    ].join("\n");
  }

  async resolveNotebookId(notebookId = "", wikiName = "", registry = null) {
    if (notebookId) {
      return notebookId;
    }

    if (this.config.siyuan.defaultNotebook) {
      return this.config.siyuan.defaultNotebook;
    }

    const resolvedRegistry = registry || (await this.readRegistry());
    if (wikiName) {
      const wanted = slugify(wikiName);
      const registryMatch = resolvedRegistry.entries.find(
        (item) =>
          slugify(item.wikiName) === wanted ||
          slugify(item.notebookName) === wanted
      );
      if (registryMatch?.notebookId) {
        return registryMatch.notebookId;
      }
    }

    const notebooks = await this.siyuan.listNotebooks();
    if (wikiName) {
      const wanted = slugify(wikiName);
      const match = notebooks.find((item) => slugify(item.name) === wanted);
      if (match) {
        return match.id;
      }
    }

    const activeEntry = resolvedRegistry.entries.find((item) => item.status === "active");
    if (activeEntry?.notebookId) {
      return activeEntry.notebookId;
    }

    if (notebooks.length === 1) {
      return notebooks[0].id;
    }

    throw new Error("Unable to resolve target notebook");
  }

  async ensureNotebook(name) {
    const notebooks = await this.siyuan.listNotebooks();
    const existing = notebooks.find((item) => slugify(item.name) === slugify(name));
    if (existing) {
      return existing;
    }

    const created = await this.siyuan.createNotebook(name);
    if (created?.id) {
      return created;
    }

    const refreshed = await this.siyuan.listNotebooks();
    const match = refreshed.find((item) => slugify(item.name) === slugify(name));
    if (!match) {
      throw new Error(`Failed to create notebook ${name}`);
    }
    return match;
  }

  async ensureDocAtPath(notebookId, path, markdown, overwrite) {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const existingIds = await this.siyuan.getIdsByHPath(notebookId, normalized);
    if (Array.isArray(existingIds) && existingIds.length > 0) {
      const id = existingIds[0];
      if (overwrite) {
        await this.siyuan.updateBlock(id, markdown);
        return { id, path: normalized, created: false };
      }
      return { id, path: normalized, created: false };
    }

    const id = await this.siyuan.createDoc(notebookId, normalized, markdown);
    return { id, path: normalized, created: true };
  }

  async safeExportMarkdown(id) {
    try {
      const result = await this.siyuan.exportMarkdownContent(id);
      return result?.content || "# Log\n";
    } catch (_error) {
      return "# Log\n";
    }
  }

  async listWikiDocsBySql(notebookId) {
    const escaped = notebookId.replace(/'/g, "''");
    const rows = await this.siyuan.sql(
      `select id, hpath, content, updated from blocks where box = '${escaped}' and type = 'd' order by hpath asc;`
    );
    return Array.isArray(rows) ? rows : [];
  }

  async listLiveWikiDocs(notebookId) {
    const rows = await this.listWikiDocsBySql(notebookId);
    const liveRows = [];
    for (const row of rows) {
      if (!row?.hpath) {
        continue;
      }
      const ids = await this.siyuan.getIdsByHPath(notebookId, row.hpath).catch(() => []);
      if (!Array.isArray(ids) || ids.length === 0) {
        continue;
      }
      const matchedId = ids.includes(row.id) ? row.id : ids[0];
      liveRows.push({
        ...row,
        id: matchedId
      });
    }
    return uniqueBy(liveRows, "hpath");
  }

  async listQueryDocsBySql(notebookId) {
    const rows = await this.listLiveWikiDocs(notebookId);
    return rows.filter((item) => pathStartsWithAny(item.hpath || "", QUERY_VISIBLE_ROOTS));
  }

  async listRawDocsBySql(notebookId) {
    const rows = await this.listLiveWikiDocs(notebookId);
    return rows.filter((item) => isTrueRawDocPath(item.hpath || ""));
  }

  getRegistryNotebookName() {
    return "llm-wiki-registry";
  }

  getRegistryPath() {
    return "/注册表";
  }

  async ensureRegistryNotebook() {
    const notebook = await this.ensureNotebook(this.getRegistryNotebookName());
    await this.siyuan.openNotebook(notebook.id);
    await this.ensureDocAtPath(
      notebook.id,
      this.getRegistryPath(),
      this.renderRegistryMarkdown([]),
      false
    );
    return notebook;
  }

  async readRegistry() {
    const notebook = await this.ensureRegistryNotebook();
    const path = this.getRegistryPath();
    const ids = await this.siyuan.getIdsByHPath(notebook.id, path);
    const id = Array.isArray(ids) && ids.length > 0 ? ids[0] : "";
    const markdown = id ? await this.safeExportMarkdown(id) : this.renderRegistryMarkdown([]);
    const entries = this.normalizeRegistryEntries(this.parseRegistryMarkdown(markdown));
    return {
      notebookId: notebook.id,
      path,
      id,
      entries,
      markdown
    };
  }

  async updateRegistry(entry) {
    const registry = await this.readRegistry();
    const entries = this.normalizeRegistryEntries([...registry.entries]);
    const key = entry.notebookId || entry.wikiName;
    const index = entries.findIndex(
      (item) => item.notebookId === entry.notebookId || slugify(item.wikiName) === slugify(entry.wikiName)
    );

    if (index >= 0) {
      entries[index] = {
        ...entries[index],
        ...entry
      };
    } else {
      entries.push({
        wikiName: entry.wikiName,
        description: entry.description || "",
        notebookId: entry.notebookId || "",
        notebookName: entry.notebookName || "",
        aliases: Array.isArray(entry.aliases) ? entry.aliases : [],
        status: entry.status || "active",
        lastAccessed: entry.lastAccessed || "",
        lastMaintained: entry.lastMaintained || ""
      });
    }

    const normalizedEntries = this.normalizeRegistryEntries(
      entries.map((item) => ({
        ...item,
        status: item.notebookId === key || item.notebookId === entry.notebookId ? "active" : "registered"
      }))
    );
    const markdown = this.renderRegistryMarkdown(normalizedEntries);
    const doc = await this.ensureDocAtPath(registry.notebookId, registry.path, markdown, true);

    return {
      notebookId: registry.notebookId,
      path: registry.path,
      id: doc.id,
      entries: normalizedEntries
    };
  }

  renderRegistryMarkdown(entries) {
    const cleanEntries = this.normalizeRegistryEntries(entries);
    const rows = cleanEntries.length
      ? cleanEntries
          .map(
            (item) =>
              `| ${item.wikiName} | ${item.description || ""} | ${(item.aliases || []).join(", ")} | ${item.notebookId || ""} | ${item.notebookName || ""} | ${item.status || ""} | ${item.lastAccessed || ""} | ${item.lastMaintained || ""} |`
          )
          .join("\n")
      : "| _none_ | No registered wiki yet |  |  |  |  |  |  |";

    return [
      "# 注册表",
      "",
      `Last updated: ${nowIso()}`,
      "",
      "## 知识库入口",
      "",
      ...(cleanEntries.length
        ? cleanEntries.map((item) => `- ${wikiLink(item.wikiName)} | notebook: \`${item.notebookName || item.notebookId}\` | aliases: ${(item.aliases || []).join(", ") || "none"}`)
        : ["- _none_"]),
      "",
      "| Wiki Name | Description | Aliases | Notebook ID | Notebook Name | Status | Last Accessed | Last Maintained |",
      "|---|---|---|---|---|---|---|---|",
      rows,
      ""
    ].join("\n");
  }

  normalizeRegistryEntries(entries) {
    const deduped = new Map();
    for (const rawEntry of Array.isArray(entries) ? entries : []) {
      const wikiName = String(rawEntry?.wikiName || "").trim();
      const notebookId = String(rawEntry?.notebookId || "").trim();
      const notebookName = String(rawEntry?.notebookName || "").trim();
      const normalizedName = wikiName.replace(/\uFFFD/g, "").trim();
      if (!normalizedName || /^[_*]?none[_*]?$/i.test(normalizedName)) {
        continue;
      }
      const key = notebookId || slugify(normalizedName) || normalizedName;
      const existing = deduped.get(key);
      const aliases = Array.from(
        new Set([...(existing?.aliases || []), ...((Array.isArray(rawEntry?.aliases) ? rawEntry.aliases : []).map((item) => String(item || "").trim()).filter(Boolean))])
      );
      const candidate = {
        wikiName: normalizedName,
        description: String(rawEntry?.description || existing?.description || "").trim(),
        aliases,
        notebookId: notebookId || existing?.notebookId || "",
        notebookName: notebookName || existing?.notebookName || normalizedName,
        status: rawEntry?.status === "active" || existing?.status === "active" ? "active" : "registered",
        lastAccessed: String(rawEntry?.lastAccessed || existing?.lastAccessed || "").trim(),
        lastMaintained: String(rawEntry?.lastMaintained || existing?.lastMaintained || "").trim()
      };
      deduped.set(key, candidate);
    }

    const rows = Array.from(deduped.values());
    let activeAssigned = false;
    return rows.map((item) => {
      if (!activeAssigned && item.status === "active") {
        activeAssigned = true;
        return item;
      }
      return {
        ...item,
        status: activeAssigned ? "registered" : item.status
      };
    });
  }

  parseRegistryMarkdown(markdown) {
    const lines = String(markdown || "").split(/\r?\n/);
    const rows = [];
    for (const line of lines) {
      if (!line.startsWith("|")) {
        continue;
      }
      if (line.includes("Wiki Name") || line.includes("---")) {
        continue;
      }
      const parts = line
        .split("|")
        .slice(1, -1)
        .map((part) => part.trim());
      if (parts.length < 8 || /^[_*]?none[_*]?$/i.test(parts[0])) {
        continue;
      }
      rows.push({
        wikiName: parts[0],
        description: parts[1],
        aliases: parts[2]
          ? parts[2]
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        notebookId: parts[3],
        notebookName: parts[4],
        status: parts[5],
        lastAccessed: parts[6],
        lastMaintained: parts[7]
      });
    }
    return rows;
  }

  stripFrontmatter(markdown) {
    const text = String(markdown || "");
    if (!text.startsWith("---")) {
      return text;
    }
    const end = text.indexOf("\n---", 3);
    if (end < 0) {
      return text;
    }
    return text.slice(end + 4).trim();
  }

  escapeSummary(text) {
    return String(text || "").replace(/"/g, "'").slice(0, 180);
  }

  replaceMarkdownSection(currentMarkdown, heading, replacementMarkdown) {
    const normalizedHeading = String(heading || "").trim();
    const lines = String(currentMarkdown || "").split(/\r?\n/);
    const replacementLines = String(replacementMarkdown || "").split(/\r?\n/);
    const start = lines.findIndex((line) => line.trim() === `## ${normalizedHeading}` || line.trim() === `# ${normalizedHeading}`);
    if (start < 0) {
      return `${String(currentMarkdown || "").trim()}\n\n## ${normalizedHeading}\n\n${String(replacementMarkdown || "").trim()}\n`;
    }
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i += 1) {
      if (/^#\s+/.test(lines[i]) || /^##\s+/.test(lines[i])) {
        end = i;
        break;
      }
    }
    const nextLines = [
      ...lines.slice(0, start + 1),
      "",
      ...replacementLines,
      "",
      ...lines.slice(end)
    ];
    return nextLines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
  }

  appendMarkdownUnderHeading(currentMarkdown, heading, additionMarkdown) {
    const normalizedHeading = String(heading || "").trim();
    const lines = String(currentMarkdown || "").split(/\r?\n/);
    const additionLines = String(additionMarkdown || "").split(/\r?\n/);
    const start = lines.findIndex((line) => line.trim() === `## ${normalizedHeading}` || line.trim() === `# ${normalizedHeading}`);
    if (start < 0) {
      return `${String(currentMarkdown || "").trim()}\n\n## ${normalizedHeading}\n\n${String(additionMarkdown || "").trim()}\n`;
    }
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i += 1) {
      if (/^#\s+/.test(lines[i]) || /^##\s+/.test(lines[i])) {
        end = i;
        break;
      }
    }
    const nextLines = [
      ...lines.slice(0, end),
      "",
      ...additionLines,
      "",
      ...lines.slice(end)
    ];
    return nextLines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
  }

  buildLinkMap(rows) {
    const pathIndex = buildPathIndex(rows);
    const linkMap = new Map();
    for (const [path, meta] of pathIndex.entries()) {
      linkMap.set(path, meta);
      linkMap.set(pageTitleFromPath(path), meta);
      linkMap.set(`/${pageTitleFromPath(path)}`, meta);
      linkMap.set(meta.title, meta);
    }
    return linkMap;
  }
}
