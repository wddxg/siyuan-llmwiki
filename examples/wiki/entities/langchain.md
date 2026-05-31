---
title: "LangChain"
category: entity
created: 2026-05-30
updated: 2026-05-30
tags: [framework, agent, open-source]
aliases: [langchain-framework]
confidence: high
summary: "LangChain 是最流行的 LLM 应用开发框架，提供链式调用、Agent 和 RAG 的标准化抽象。"
---

# LangChain

LangChain 由 Harrison Chase 于 2022 年创建，迅速成为 LLM 应用开发的事实标准框架。

## 核心概念

- **Chain**：将多个 LLM 调用串联成流水线
- **Agent**：让 LLM 自主决定使用哪些工具 → [[Agent 框架]]
- **Retriever**：标准化的文档检索接口 → [[向量数据库]]
- **Memory**：对话历史和上下文管理
- **Tool**：外部 API 和函数的标准化封装

## 生态系统

| 组件 | 用途 |
|------|------|
| LangChain Core | 核心抽象和运行时 |
| LangGraph | 有状态的 Agent 编排 |
| LangSmith | 可观测性和评估平台 |
| LangServe | 部署 LangChain 应用为 API |

## 优势与争议

**优势**：
- 抽象层降低了 LLM 应用的开发门槛
- 丰富的集成（100+ 数据源、50+ 向量数据库）
- 活跃的社区和快速迭代

**争议**：
- 抽象过重，简单场景反而增加复杂度
- 版本迭代过快，API 不稳定
- 性能开销在高并发场景下不可忽视 → [[Agent 框架对比]]

## See Also

- [[Agent 框架]] — Agent 编排的整体生态
- [[Agent 框架对比]] — LangChain vs 其他框架
- [[RAG]] — LangChain 最核心的应用场景

## Sources

- raw/articles/langchain-overview-2026.md
- raw/repos/langchain-github.md
