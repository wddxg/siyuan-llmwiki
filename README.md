<p align="center">
  <h1 align="center">SiYuan LLM Wiki</h1>
  <p align="center">
    基于思源笔记的 AI 知识库构建系统<br/>
    原始素材 → Agent 编译 → 结构化 Wiki → 持续维护
  </p>
</p>

<p align="center">
  <a href="https://github.com/wddxg/siyuan-llmwiki/actions"><img src="https://github.com/wddxg/siyuan-llmwiki/actions/workflows/pages.yml/badge.svg" alt="GitHub Pages"></a>
  <a href="https://wddxg.github.io/siyuan-llmwiki/"><img src="https://img.shields.io/badge/demo-GitHub%20Pages-blue" alt="Demo"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License"></a>
  <a href="https://b3log.org/siyuan/"><img src="https://img.shields.io/badge/SiYuan-3.6+-purple" alt="SiYuan"></a>
</p>

---

## 效果

<p align="center">
  <img src="docs-site/assets/graph-view.png" width="48%" alt="知识图谱">
  &nbsp;&nbsp;
  <img src="docs-site/assets/index-page.png" width="48%" alt="总索引">
</p>

<p align="center">
  <em>左：1,265 条双向链接形成的知识网络 &nbsp;&nbsp;|&nbsp;&nbsp; 右：结构化导航 + block ref 交叉引用</em>
</p>

## 30 秒理解

传统 RAG 每次查询从零检索，知识不复合。**LLM Wiki 模式**将知识编译一次、持续维护——交叉引用已经建好，矛盾已经标记，综合分析反映全部素材。

```
📄 原始素材 (MD/URL)
   ↓ Agent 摄入 + 编译
🗂️ 结构化 Wiki (实体 / 概念 / 对比 / 问答)
   ↓ Agent 查询
💬 带来源引用的综合回答
```

**分工**：MCP Server 负责读写原语，Agent 负责编译推理，思源笔记负责存储和双链。

## 快速开始

```bash
# 1. 启动
cp .env.example .env    # 编辑 Token
docker compose up -d

# 2. 连接 Agent
#    在 Claude Code / Cursor 中配置 MCP:
#    { "mcpServers": { "siyuan-llmwiki": { "url": "http://localhost:31710/mcp" } } }

# 3. 使用
#    告诉 Agent: "帮我创建一个叫 ai-research 的知识库"
#    告诉 Agent: "把这篇论文导入知识库"
```

启动后 → [http://localhost:6806](http://localhost:6806) 打开思源笔记，[http://localhost:31710/mcp](http://localhost:31710/mcp) 是 MCP 接口。

> 需要 macOS / Windows 本地运行？安装 [思源笔记](https://b3log.org/siyuan/download.html) + Node.js，运行 `cd mcp && npm install && npm start` 即可。

## 架构

```
┌──────────────────────────────────────────────┐
│              Agent (Claude Code / Cursor)     │
│    编译推理 · 查询综合 · 交叉引用 · 审计      │
└────────────────────┬─────────────────────────┘
                     │  MCP Streamable HTTP
┌────────────────────┴─────────────────────────┐
│           MCP Server (Node.js, 31 工具)       │
│  bootstrap · ingest · read · write · query    │
└────────────────────┬─────────────────────────┘
                     │  SiYuan HTTP API
┌────────────────────┴─────────────────────────┐
│          思源笔记 (Docker / 本地)              │
│     块级编辑 · 双链引擎 · SQL 查询 · 多端同步  │
└──────────────────────────────────────────────┘
```

## 知识库结构

```
<知识库>/
├── 结构约定 / 总索引 / 操作日志
├── 收件箱
├── 原始资料/           ← 不可变，只增不改
│   ├── 文章/  论文/  仓库/  笔记/  数据/
├── 实体                ← 人物、组织、产品
├── 概念/               ← 技术、方法论、主题
├── 对比                ← 并排分析
└── 问答归档            ← 沉淀的结论
```

## MCP 工具（31 个）

<details>
<summary>展开查看完整工具列表</summary>

| 工具 | 用途 | 类型 |
|------|------|------|
| `wiki_bootstrap` | 初始化知识库结构 | 写 |
| `wiki_select` | 选择目标知识库 | 读 |
| `wiki_list_knowledge_bases` | 列出已注册知识库 | 读 |
| `wiki_register_knowledge_base` | 注册知识库 | 写 |
| `wiki_natural_language_route` | 自然语言路由 | 读 |
| `wiki_status` | 知识库健康状态 | 读 |
| `wiki_ingest_text` | 导入单条素材 | 写 |
| `wiki_ingest_batch` | 批量导入 | 写 |
| `wiki_ingest_import_bundle` | 路径驱动导入 | 写 |
| `wiki_read_tree` | 读取目录树 | 读 |
| `wiki_read_page` | 读取单个页面 | 读 |
| `wiki_read_markdown_batch` | 批量读取 | 读 |
| `wiki_write_markdown_from_tree` | 批量写入 | 写 |
| `wiki_ensure_page` | 创建或覆盖页面 | 写 |
| `wiki_delete_page` | 删除页面 | 写 |
| `wiki_replace_section` | 替换章节 | 写 |
| `wiki_append_under_heading` | 章节下追加 | 写 |
| `wiki_query` | 检索（词法+语义） | 读 |
| `wiki_find_related` | 查找关联页面 | 读 |
| `wiki_prepare_compile_bundle` | 准备编译素材包 | 读 |
| `wiki_list_uncompiled_raw` | 未编译素材列表 | 读 |
| `wiki_archive_conclusion` | 归档结论 | 写 |
| `wiki_refresh_indexes` | 重建索引 | 写 |
| `wiki_lint` | 结构健康检查 | 读 |
| `wiki_check_index` | 索引一致性检查 | 读 |
| `wiki_compare_sources` | 对比多个页面 | 读 |
| `wiki_export_tree` | 导出子树 | 读 |
| `wiki_append_log` | 追加操作日志 | 写 |
| `wiki_refresh_index_by_path` | 按路径刷新索引 | 写 |
| `health` | 连接健康检查 | 读 |
| `list_notebooks` | 列出思源笔记本 | 读 |

</details>

## 示例内容

本仓库包含一套完整的 LLM/AI 领域样例 wiki，可以直接体验：

| 分类 | 数量 | 内容 |
|------|------|------|
| 实体 | 17 | OpenAI、Anthropic、Claude Code、LangChain、UI-TARS... |
| 概念 | 18 | Transformer、RAG、RLHF、MCP 协议、Agent 框架... |
| 对比 | 7 | GPT-4o vs Claude、RAG vs Fine-tuning、开源 vs 闭源... |
| 问答 | 5 | 如何选择 LLM、评估方法、知识库最佳实践... |
| 原始素材 | 9 | Attention Is All You Need、RAG、LoRA、CoT... |

在线浏览：[GitHub Pages Demo](https://wddxg.github.io/siyuan-llmwiki/)

## 部署方式

| 方式 | 命令 | 适用场景 |
|------|------|---------|
| Docker | `docker compose up -d` | 推荐，开箱即用 |
| 本地 | `cd mcp && npm install && npm start` | 开发调试 |
| NAS | Docker + SSH 隧道 | 远程访问 |

## 文档

| 文档 | 说明 |
|------|------|
| [快速开始](docs/zh-CN/quick-start.md) | 从零到跑通 |
| [Agent 配置](docs/zh-CN/agent-setup.md) | 各平台连接方式 |
| [MCP 工具详解](docs/zh-CN/mcp-tools.md) | 全部工具参数说明 |
| [Wiki 概念](docs/zh-CN/wiki-concepts.md) | 设计理念和工作流 |
| [示例说明](examples/README.md) | 样例内容结构 |

## Skills

| Skill | 说明 |
|-------|------|
| [llm-wiki-skill](skills/llm-wiki-skill.SKILL.md) | LLM Wiki 编排技能（初始化/摄入/编译/查询/审计） |
| [siyuan-skill](skills/siyuan-skill.SKILL.md) | 思源笔记 CLI 技能（来自 [dazexcl/siyuan-skill](https://github.com/dazexcl/siyuan-skill)） |

## 工具脚本

```bash
# 本地 Markdown → 批量导入 JSON
python tools/prepare_raw_batch.py --input ./papers/ --output batch.json

# 路径驱动导入包
python tools/prepare_import_bundle.py --path ./my-wiki/ --output bundle.json

# 思源笔记管理 CLI
python tools/siyuan_admin.py --base http://localhost:6806 --token xxx list-notebooks
```

---

## 致谢

本项目建立在以下工作之上：

- **[Karpathy/llm-wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)** — 核心理念："原始素材是源代码，LLM 是编译器，Wiki 是可执行产物"
- **[SiYuan Note](https://b3log.org/siyuan/)** — 底层存储引擎，块级编辑 + 双链 + SQL 查询
- **[Model Context Protocol](https://modelcontextprotocol.io/)** — Agent ↔ 工具通信的开放标准，由 [Anthropic](https://github.com/anthropics) 提出
- **[dazexcl/siyuan-skill](https://github.com/dazexcl/siyuan-skill)** — 思源笔记 CLI 技能

## License

[MIT](LICENSE)
