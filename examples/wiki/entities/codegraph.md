---
title: "CodeGraph"
category: entity
created: 2026-05-30
updated: 2026-05-30
tags: [code-analysis, knowledge-graph, agent-context, indexing]
aliases: [codegraph-tool]
confidence: medium
summary: "CodeGraph 为 AI 编程 Agent 构建代码知识图谱，解决 Agent 对大型代码库理解不足的问题。"
---

# CodeGraph

**仓库**: github.com/colbymchenry/codegraph
**Star**: 34.5K（2026 年 5 月 Trending 第一）
**语言**: TypeScript

CodeGraph 解决了 AI 编程 Agent 的核心痛点：**对大型代码库缺乏全局理解**。

## 问题

当 Claude Code 或 Cursor 处理大型项目时：

- 只能看到局部文件，缺乏全局依赖关系
- 不理解模块间的调用链
- 无法预判修改的影响范围

## CodeGraph 的方案

将代码库预索引为**知识图谱**：

```
代码库 → 解析 AST → 提取符号/调用/依赖关系 → 构建知识图谱 → Agent 查询
```

### 索引内容

- 函数定义和调用关系
- 类继承和接口实现
- 模块导入/导出依赖
- 变量引用链
- 类型传播路径

### 支持的 Agent

Claude Code、Codex、Gemini CLI、Cursor、OpenCode、Kiro、Hermes Agent

## 与传统代码搜索的对比

| 维度 | grep/ripgrep | LSP | CodeGraph |
|------|-------------|-----|----------|
| 文本匹配 | 优 | 不支持 | 支持 |
| 语义理解 | 不支持 | 支持 | 支持 |
| 调用链追踪 | 不支持 | 局部 | 全局 |
| 跨语言 | 按语言 | 单语言 | 多语言 |
| Agent 友好 | 需解析 | 需适配 | 原生 |

## 技术原理

基于 Tree-sitter 解析器提取 AST，结合图数据库存储实体关系。Agent 查询时返回相关代码片段和上下文路径。

## 对 LLM 知识库的启发

CodeGraph 的思路与 [[LLM 知识库构建]] 类似：将原始素材（代码）预编译为结构化表示（知识图谱），Agent 查询时直接使用结构化知识而非原始文本。

## See Also

- [[LLM 知识库构建]] — 知识预编译的通用范式
- [[Agent 框架]] — CodeGraph 服务的 Agent 生态
- [[向量数据库]] — 代码索引的存储方案之一

## Sources

- raw/articles/codegraph-knowledge-graph-2026.md
