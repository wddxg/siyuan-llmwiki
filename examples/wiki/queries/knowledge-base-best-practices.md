---
title: "用 LLM 构建知识库的最佳实践"
category: query
created: 2026-05-30
updated: 2026-05-30
tags: [knowledge-base, best-practices, llm-wiki]
confidence: high
summary: "构建 LLM 知识库的关键是保持原始素材不可变、建立交叉引用、增量维护。"
---

# 用 LLM 构建知识库的最佳实践

## Question

如何用 LLM Agent 构建一个可维护、可增长的知识库？

## Answer

### 核心原则

1. **原始素材不可变**：一旦入库，不修改原始内容。修正和补充写在 wiki 页面中
2. **增量编译**：新素材只影响相关页面，不全量重建
3. **交叉引用**：每个页面至少引用一个其他页面，避免孤立
4. **索引先行**：先读索引定位，再读页面内容

→ [[LLM 知识库构建]]

### 推荐结构

```
知识库/
├── 索引/导航
├── 原始资料/     ← 不可变
├── 实体/         ← 人物、组织、工具
├── 概念/         ← 技术、方法、主题
├── 对比/         ← 并排分析
└── 结论/         ← 沉淀的问答
```

### Agent 工作流

**摄入**：判断类型 → 写入原始资料 → 分析实体/概念 → 生成 wiki 页面 → 更新索引

**查询**：读索引 → 读相关页面 → 跨页面综合 → 带来源的回答

**自检**：检查结构完整性 → 孤立页面 → 缺失引用 → 未编译素材

### 常见陷阱

- ❌ 原始素材被编译覆盖
- ❌ 只有目录没有内容互链
- ❌ 每次查询都从零检索（传统 RAG 的问题）→ [[RAG]]
- ❌ 整页刷新而非增量修改

### 工具选择

- **存储**：[[思源笔记]]（支持块级编辑和双链）
- **协议**：MCP（标准化 Agent 工具调用）
- **Agent**：Claude Code / Cursor / Codex

## Sources

- raw/articles/karpathy-llm-wiki-concept.md
- raw/articles/knowledge-base-best-practices.md
