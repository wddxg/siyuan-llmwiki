---
title: "Context7"
category: entity
created: 2026-05-30
updated: 2026-05-30
tags: [context, documentation, mcp, developer-tools]
aliases: [context7-platform]
confidence: medium
summary: "Context7 为 LLM 和 AI 代码编辑器提供最新的代码文档上下文，通过 MCP 协议接入。"
---

# Context7

**仓库**: github.com/upstash/context7
**Star**: 56.4K
**机构**: Upstash

Context7 解决了 AI 编程助手的一个关键问题：**过时的文档**。

## 问题

LLM 的训练数据有截止日期。当开发者使用新版本的库时：

- LLM 推荐的 API 可能已废弃
- 代码示例可能不再适用
- 新特性 LLM 完全不知道

## Context7 的方案

```
AI Agent 查询 → Context7 MCP Server → 获取最新文档 → 注入 Agent 上下文
```

### 核心能力

1. **实时文档**：持续抓取和更新开源项目的文档
2. **MCP 接入**：通过 MCP 协议标准化提供给 Agent
3. **智能匹配**：根据代码上下文匹配最相关的文档片段
4. **版本感知**：区分不同版本的文档

## 与 MCP 的关系

Context7 是 MCP 生态中最成功的基础设施之一：

```
Agent (Claude Code / Cursor)
  ↓ MCP
Context7 MCP Server
  ↓
最新文档数据库
```

→ [[MCP 协议]] — Context7 的接入标准

## 类似项目

| 项目 | 侧重 | 方式 |
|------|------|------|
| Context7 | 实时文档 | MCP Server |
| CodeGraph | 代码结构 | 知识图谱 |
| AgentMemory | 跨会话记忆 | 持久存储 |

→ [[CodeGraph]] — 代码知识图谱方案
→ [[Agent 记忆系统]] — Agent 记忆方案

## 为什么火爆

56K stars 说明 AI 编程助手的"上下文准确性"是开发者最痛的痛点之一。

## See Also

- [[MCP 协议]] — Context7 的接入标准
- [[CodeGraph]] — 代码知识图谱方案
- [[上下文窗口]] — Agent 上下文的物理限制

## Sources

- raw/articles/context7-documentation-mcp-2026.md
