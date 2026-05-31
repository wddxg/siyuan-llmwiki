import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const TOOL_DEFINITIONS = [
  [
    "health",
    "Check MCP bridge health and SiYuan connectivity.",
    "health",
    true,
    {}
  ],
  [
    "list_notebooks",
    "List visible SiYuan notebooks.",
    "listNotebooks",
    true,
    {}
  ],
  [
    "wiki_select",
    "Resolve and activate a wiki notebook from registry metadata.",
    "wikiSelect",
    false,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id")
    }
  ],
  [
    "wiki_list_knowledge_bases",
    "List registered knowledge bases from the global registry.",
    "wikiListKnowledgeBases",
    true,
    {}
  ],
  [
    "wiki_register_knowledge_base",
    "Register or update a knowledge base entry in the global registry.",
    "wikiRegisterKnowledgeBase",
    false,
    {
      wikiName: z.string().describe("Knowledge base display name"),
      description: z.string().optional().describe("Short description"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      notebookName: z.string().optional().describe("Notebook display name"),
      aliases: z.array(z.string()).optional().describe("Alternative names used in natural language")
    }
  ],
  [
    "wiki_natural_language_route",
    "Infer target knowledge base and intended wiki action from natural language.",
    "wikiNaturalLanguageRoute",
    true,
    {
      request: z.string().describe("Natural-language instruction or question"),
      defaultNotebookId: z.string().optional().describe("Fallback notebook id"),
      defaultWikiName: z.string().optional().describe("Fallback wiki name")
    }
  ],
  [
    "wiki_bootstrap",
    "Initialize a full LLM Wiki notebook structure in SiYuan.",
    "wikiBootstrap",
    false,
    {
      wikiName: z.string().describe("Wiki name to initialize"),
      description: z.string().optional().describe("Optional wiki description"),
      force: z.boolean().optional().describe("Overwrite managed docs and indexes when present")
    }
  ],
  [
    "wiki_ensure_page",
    "Create or overwrite one explicit wiki page without refreshing unrelated pages.",
    "wikiEnsurePage",
    false,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Target notebook id"),
      path: z.string().describe("Canonical wiki path such as /概念/example"),
      title: z.string().optional().describe("Optional title used when creating a blank page"),
      markdown: z.string().optional().describe("Explicit markdown content"),
      force: z.boolean().optional().describe("Overwrite existing page content")
    }
  ],
  [
    "wiki_delete_page",
    "Delete one explicit wiki page by canonical path.",
    "wikiDeletePage",
    false,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Target notebook id"),
      path: z.string().describe("Canonical wiki path to delete")
    }
  ],
  [
    "wiki_replace_section",
    "Replace one heading section inside a page instead of rewriting the whole page.",
    "wikiReplaceSection",
    false,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Target notebook id"),
      path: z.string().describe("Canonical wiki path"),
      heading: z.string().describe("Heading text to replace"),
      markdown: z.string().describe("Replacement markdown content under that heading")
    }
  ],
  [
    "wiki_append_under_heading",
    "Append markdown under one heading inside a page.",
    "wikiAppendUnderHeading",
    false,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Target notebook id"),
      path: z.string().describe("Canonical wiki path"),
      heading: z.string().describe("Heading text to append under"),
      markdown: z.string().describe("Markdown content to append")
    }
  ],
  [
    "wiki_status",
    "Summarize notebook health, required pages, and registry state.",
    "wikiStatus",
    true,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id")
    }
  ],
  [
    "wiki_refresh_indexes",
    "Rebuild core directory index pages for the current wiki.",
    "wikiRefreshIndexes",
    false,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id")
    }
  ],
  [
    "wiki_refresh_index_by_path",
    "Refresh one index-like page by canonical path.",
    "wikiRefreshIndexByPath",
    false,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      indexPath: z.string().describe("Canonical path such as /总索引 or /原始资料/笔记/0504-LLMWIKI-设计")
    }
  ],
  [
    "wiki_append_log",
    "Append a structured operation record to the wiki maintenance log.",
    "wikiAppendLog",
    false,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      operation: z.string().describe("Short operation code"),
      description: z.string().describe("Human-readable description")
    }
  ],
  [
    "wiki_ingest_text",
    "Write raw text material into the immutable raw area with metadata.",
    "wikiIngestText",
    false,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      rawType: z.string().optional().describe("Raw subdirectory type, for example notes or links"),
      title: z.string().describe("Display title of the raw note"),
      text: z.string().optional().describe("Raw body text to store"),
      source: z.string().optional().describe("Provenance label"),
      tags: z.array(z.string()).optional().describe("Optional tag list")
    }
  ],
  [
    "wiki_ingest_batch",
    "Batch-upload locally cleaned raw markdown records into the immutable raw area.",
    "wikiIngestBatch",
    false,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      records: z.array(z.object({
        title: z.string().describe("Display title of the raw note"),
        rawType: z.string().optional().describe("Raw type such as articles, papers, repos, notes, data"),
        markdown: z.string().optional().describe("Cleaned markdown body to upload"),
        text: z.string().optional().describe("Plain-text fallback body"),
        source: z.string().optional().describe("Provenance label"),
        tags: z.array(z.string()).optional().describe("Optional tag list")
      })).describe("Locally cleaned raw payloads to ingest"),
      appendLog: z.boolean().optional().describe("Append one batch ingest log entry after upload")
    }
  ],
  [
    "wiki_ingest_import_bundle",
    "Ingest a path-driven import bundle. Use it for one or more markdown files or one directory with tree semantics. Returns a dry-run plan unless confirm=true.",
    "wikiIngestImportBundle",
    false,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      importRoot: z.string().optional().describe("Local import root or one target markdown file; if omitted, paths are resolved in the bundle"),
      paths: z.array(z.string()).optional().describe("Local markdown files or directories to import"),
      bundlePath: z.string().optional().describe("Prebuilt bundle JSON path"),
      confirm: z.boolean().optional().describe("Apply the plan immediately instead of returning only a diff summary")
    }
  ],
  [
    "wiki_export_tree",
    "Export one notebook subtree into a portable markdown tree bundle.",
    "wikiExportTree",
    true,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      rootPath: z.string().optional().describe("Root hpath to export, default /"),
      depth: z.number().int().positive().optional().describe("Maximum descendant depth to include"),
      outputPath: z.string().optional().describe("Optional JSON output path under the MCP export directory")
    }
  ],
  [
    "wiki_archive_conclusion",
    "Write a conclusion or verdict page into the query or output area.",
    "wikiArchiveConclusion",
    false,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      category: z.string().optional().describe("Output category such as queries or comparisons"),
      title: z.string().describe("Conclusion page title"),
      question: z.string().optional().describe("Question being answered"),
      answer: z.string().optional().describe("Main conclusion"),
      sources: z.array(z.string()).optional().describe("Source hpaths"),
      caveats: z.array(z.string()).optional().describe("Caveat lines"),
      tags: z.array(z.string()).optional().describe("Optional tag list")
    }
  ],
  [
    "wiki_query",
    "Search the current wiki for matching pages and snippets.",
    "wikiQuery",
    true,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      query: z.string().describe("Search phrase")
    }
  ],
  [
    "wiki_find_related",
    "Find related notes, topics, queries, and docs for a term or path.",
    "wikiFindRelated",
    true,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      query: z.string().optional().describe("Free-text query"),
      path: z.string().optional().describe("Existing hpath to pivot from"),
      limit: z.number().int().positive().optional().describe("Maximum related hits")
    }
  ],
  [
    "wiki_read_tree",
    "Read the wiki as a note-is-folder tree where each folder has a same-name markdown note.",
    "wikiReadTree",
    true,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      rootPath: z.string().optional().describe("Root hpath to read, default /"),
      depth: z.number().int().positive().optional().describe("Maximum descendant depth to include")
    }
  ],
  [
    "wiki_read_page",
    "Read one markdown page by canonical hpath. Images can be stripped for fast agent reading.",
    "wikiReadPage",
    true,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      path: z.string().describe("Canonical hpath such as /总索引 or /原始资料/文章/example"),
      includeImages: z.boolean().optional().describe("Keep markdown image syntax in output")
    }
  ],
  [
    "wiki_read_markdown_batch",
    "Batch-read markdown pages from one wiki for agent-run compile, query, or lint. Returns markdown only, with images stripped by default.",
    "wikiReadMarkdownBatch",
    true,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      includeRaw: z.boolean().optional().describe("Include raw source pages"),
      includeMaintained: z.boolean().optional().describe("Include maintained wiki pages"),
      includeStructure: z.boolean().optional().describe("Include structure pages such as 总索引 and 结构约定"),
      rootPath: z.string().optional().describe("Limit batch read to one subtree"),
      limit: z.number().int().positive().optional().describe("Maximum number of markdown pages to return")
    }
  ],
  [
    "wiki_prepare_compile_bundle",
    "Select raw markdown for an agent-run compile pass: recent additions, semantic neighbors, and explicit raw paths.",
    "wikiPrepareCompileBundle",
    true,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      query: z.string().optional().describe("Current compile theme, question, or topic for semantic matching"),
      explicitRawPaths: z.array(z.string()).optional().describe("Raw hpaths the agent explicitly wants to include this round"),
      rawTypes: z.array(z.string()).optional().describe("Optional raw type filter such as notes, articles, papers, repos, data"),
      recentLimit: z.number().int().positive().optional().describe("How many most-recent raw pages to include"),
      semanticLimit: z.number().int().positive().optional().describe("How many semantic neighbors to include"),
      rootPath: z.string().optional().describe("Optional raw subtree root, default /原始资料")
    }
  ],
  [
    "wiki_list_uncompiled_raw",
    "List raw source pages that do not yet appear to have maintained-page coverage.",
    "wikiListUncompiledRaw",
    true,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id")
    }
  ],
  [
    "wiki_write_markdown_from_tree",
    "Write a batch of markdown files back into the wiki using note-is-folder path semantics. Returns a diff plan first unless confirm=true.",
    "wikiWriteMarkdownFromTree",
    false,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      files: z.array(z.object({
        virtualPath: z.string().describe("Tree-style markdown file path such as 总索引.md or 原始资料/文章/abc/abc.md"),
        markdown: z.string().describe("Full markdown content to write")
      })).describe("Markdown file payloads to create or update"),
      confirm: z.boolean().optional().describe("Apply the plan immediately instead of returning only a diff summary")
    }
  ],
  [
    "wiki_compare_sources",
    "Compare multiple pages and surface shared findings, caveats, and contradictions.",
    "wikiCompareSources",
    true,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id"),
      paths: z.array(z.string()).min(2).describe("At least two hpaths to compare")
    }
  ],
  [
    "wiki_lint",
    "Audit a wiki notebook for missing required structure and orphan candidates.",
    "wikiLint",
    true,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id")
    }
  ],
  [
    "wiki_check_index",
    "Inspect index hierarchy consistency across the wiki directory structure.",
    "wikiCheckIndex",
    true,
    {
      wikiName: z.string().optional().describe("Human-readable wiki name"),
      notebookId: z.string().optional().describe("Explicit SiYuan notebook id")
    }
  ]
].map(([name, description, method, readOnly, inputSchema]) => ({
  name,
  description,
  method,
  readOnly,
  inputSchema
}));

function resultToToolPayload(result) {
  return {
    structuredContent: result,
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2)
      }
    ]
  };
}

export function buildToolCatalog() {
  return TOOL_DEFINITIONS.map(({ name, description, readOnly }) => ({
    name,
    description,
    readOnly
  }));
}

export function createMcpApp({ wiki, config }) {
  async function handleRequest(req, res) {
    const server = new McpServer(
      {
        name: "siyuan-llmwiki-mcp",
        version: "0.1.0"
      },
      {
        capabilities: {
          logging: {},
          tools: {},
          resources: {}
        }
      }
    );

    for (const tool of TOOL_DEFINITIONS) {
      server.registerTool(
        tool.name,
        {
          description: tool.description,
          inputSchema: tool.inputSchema,
          annotations: { readOnlyHint: tool.readOnly }
        },
        async (args) => {
          const result = await wiki[tool.method](args || {});
          return resultToToolPayload(result);
        }
      );
    }

    server.resource(
      "tool-catalog",
      "siyuan-llmwiki://catalog/tools",
      {
        mimeType: "application/json",
        description: "Machine-readable list of exposed MCP tools."
      },
      async () => ({
        contents: [
          {
            uri: "siyuan-llmwiki://catalog/tools",
            mimeType: "application/json",
            text: JSON.stringify(buildToolCatalog(), null, 2)
          }
        ]
      })
    );

    server.resource(
      "runtime-config",
      "siyuan-llmwiki://system/runtime",
      {
        mimeType: "application/json",
        description: "Runtime server and SiYuan endpoint configuration summary."
      },
      async () => ({
        contents: [
          {
            uri: "siyuan-llmwiki://system/runtime",
            mimeType: "application/json",
            text: JSON.stringify(
              {
                server: {
                  host: config.server.host,
                  port: config.server.port
                },
                siyuan: {
                  url: config.siyuan.url,
                  defaultNotebook: config.siyuan.defaultNotebook,
                  permissionMode: config.siyuan.permissionMode,
                  notebookAllowlist: config.siyuan.notebookAllowlist
                }
              },
              null,
              2
            )
          }
        ]
      })
    );

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });

    let cleanedUp = false;
    const cleanup = async () => {
      if (cleanedUp) {
        return;
      }
      cleanedUp = true;
      await transport.close().catch(() => {});
      await server.close().catch(() => {});
    };

    res.on("finish", () => {
      cleanup().catch(() => {});
    });

    res.on("close", () => {
      cleanup().catch(() => {});
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: error.message || "Internal server error"
          },
          id: null
        });
      }
    }
  }

  return {
    toolCatalog: buildToolCatalog(),
    handleRequest
  };
}
