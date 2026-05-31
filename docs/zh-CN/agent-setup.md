# Agent 配置指南

## 推荐 Agent

| Agent | 适合场景 | MCP 支持 |
|-------|---------|---------|
| **Claude Code** | 编程 + 知识管理 | 原生 MCP |
| **Cursor** | IDE 内使用 | MCP 配置 |
| **OpenAI Codex** | 通用任务 | 需适配 |
| **OpenClaw** | Skill 生态 | 原生 MCP |

## Claude Code 配置

### 项目级配置

在项目根目录创建 `.mcp.json`：

```json
{
  "mcpServers": {
    "siyuan-llmwiki": {
      "url": "http://localhost:31710/mcp"
    }
  }
}
```

### 全局配置

编辑 `~/.claude/settings.json`：

```json
{
  "mcpServers": {
    "siyuan-llmwiki": {
      "url": "http://localhost:31710/mcp"
    }
  }
}
```

## Agent Skill 安装

本仓库提供两个 Skill 文件：

### siyuan-skill

提供思源笔记的 CLI 操作能力（笔记本管理、文档操作、搜索等）。

### llm-wiki-skill

提供 LLM Wiki 的完整编排能力（知识库初始化、素材摄入、查询、审计等）。

## 推荐的 Agent 使用模式

### 摄入模式

```
用户：把这篇论文导入到 ai-research 知识库
Agent：
  1. wiki_select → 选择目标知识库
  2. 判断素材类型（论文）
  3. wiki_ingest_text → 写入原始资料
  4. 分析实体和概念
  5. wiki_ensure_page → 生成 wiki 页面
  6. wiki_refresh_indexes → 更新索引
  7. wiki_append_log → 记录操作
```

### 查询模式

```
用户：Transformer 架构的核心原理是什么？
Agent：
  1. wiki_select → 选择目标知识库
  2. wiki_query → 搜索 "Transformer"
  3. wiki_read_page → 读取相关页面
  4. 综合多个页面内容回答
  5. 标注来源页面
```

### 编译模式

```
用户：帮我编译最近导入的 5 篇论文
Agent：
  1. wiki_list_uncompiled_raw → 找到未编译素材
  2. wiki_read_markdown_batch → 批量读取
  3. 分析实体、概念、对比关系
  4. wiki_write_markdown_from_tree → 批量写入 wiki 页面
  5. wiki_refresh_indexes → 更新索引
```

## 常用 Prompt 模板

### 初始化

```
帮我创建一个叫 {name} 的知识库，主题是 {topic}。
```

### 导入

```
把 {source} 的内容导入到 {wiki} 知识库。
```

### 查询

```
在 {wiki} 中，{question}？
```

### 审计

```
对 {wiki} 知识库做一次 lint 检查，告诉我有什么问题。
```

### 编译

```
帮我把 {wiki} 中未编译的原始素材整理成 wiki 页面。
```
