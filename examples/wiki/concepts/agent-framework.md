---
title: "Agent 框架"
category: topic
created: 2026-05-30
updated: 2026-05-30
tags: [agent, framework, tool-use, autonomous]
aliases: [ai-agent, llm-agent, autonomous-agent]
confidence: high
summary: "Agent 框架让 LLM 能自主使用工具、规划任务和执行多步操作。"
---

# Agent 框架

AI Agent 是能自主感知环境、做出决策、执行动作的 LLM 系统。Agent 框架提供了构建这类系统的标准化抽象。

## 核心概念

### Tool Use（工具调用）

Agent 通过函数调用与外部世界交互：

- 搜索引擎
- 代码执行器
- API 调用
- 文件读写
- 数据库查询

LLM 决定调用什么工具、传什么参数，框架负责执行和返回结果。

### Planning（规划）

Agent 将复杂任务分解为子任务：

- **ReAct**：推理（Reason）+ 行动（Act）交替 → [[Chain of Thought]]
- **Plan-and-Execute**：先制定完整计划，再逐步执行
- **Reflexion**：执行后反思，改进策略

### Memory（记忆）

- **短期记忆**：当前对话上下文 → [[上下文窗口]]
- **长期记忆**：跨会话的持久化存储（向量数据库、文件系统）
- **工作记忆**：当前任务的中间状态

## 主流框架

| 框架 | 语言 | 特点 |
|------|------|------|
| LangChain / LangGraph | Python/JS | 最大生态 → [[LangChain]] |
| CrewAI | Python | 多 Agent 协作 |
| AutoGen | Python | 微软，对话式 Agent |
| Claude Agent SDK | Python | Anthropic 官方 |
| OpenAI Assistants API | API | OpenAI 官方 |

→ [[Agent 框架对比]] — 详细比较

## MCP：标准化工具协议

Model Context Protocol（MCP）由 [[Anthropic]] 提出，为 Agent 工具调用提供标准化协议：

- 客户端-服务器架构
- 工具发现和调用标准化
- 支持多种传输方式（HTTP、stdio）

本项目的核心就是一个 MCP Server。

## See Also

- [[Agent 框架对比]] — 框架选择指南
- [[LangChain]] — 最流行的 Agent 框架
- [[Chain of Thought]] — Agent 的推理基础
- [[RAG]] — Agent 常用的工具之一
- [[MCP 协议]] — Agent 工具调用的标准化协议
- [[Computer Use Agent]] — Agent 操作 GUI 的能力
- [[Agent 记忆系统]] — Agent 的长期记忆
- [[Agent 治理]] — Agent 行为的管理框架

## Sources

- raw/articles/ai-agent-frameworks-2026.md
- raw/papers/react-agent-2022.md
