---
title: "Agent 框架对比"
category: reference
created: 2026-05-30
updated: 2026-05-30
tags: [comparison, agent, framework]
aliases: [agent-framework-comparison]
confidence: medium
summary: "主流 Agent 框架在抽象层级、易用性和灵活性上存在显著差异。"
---

# Agent 框架对比

## 框架矩阵

| 框架 | 抽象层级 | 学习曲线 | 灵活性 | 生态 | 适用场景 |
|------|---------|---------|--------|------|---------|
| LangChain/LangGraph | 高 | 陡 | 中 | 最大 | 快速原型 → [[LangChain]] |
| Claude Agent SDK | 中 | 平 | 高 | 中 | Claude 生态 |
| CrewAI | 中 | 平 | 中 | 中 | 多 Agent 协作 |
| AutoGen | 中 | 中 | 高 | 中 | 对话式 Agent |
| OpenAI Assistants | 低 | 平 | 低 | 中 | OpenAI 生态 |
| 自建 | 低 | 陡 | 最高 | 无 | 完全控制 |

## 选择建议

### 快速上手 → LangChain

优点：集成最多，社区最大，教程最丰富。
缺点：抽象过重，版本迭代快。

### Claude 生态 → Claude Agent SDK

优点：原生支持 MCP 协议，tool use 体验好。
缺点：绑定 Claude 模型。

### 多 Agent → CrewAI

优点：多角色协作的抽象很直观。
缺点：调试复杂 Agent 团队比较困难。

### 完全控制 → 自建

优点：无黑盒，完全理解每一步。
缺点：需要自己实现工具调用、记忆、规划等基础设施。

## MCP 协议的重要性

[[Anthropic]] 推出的 MCP 协议正在成为 Agent 工具调用的标准：

- 框架无关：任何支持 MCP 的 Agent 都能使用 MCP Server
- 工具可复用：一个 MCP Server 可被多个 Agent 使用
- 生态增长：越来越多的工具提供 MCP 接口

本项目就是一个 MCP Server 的实例。

## See Also

- [[Agent 框架]] — Agent 的核心概念
- [[LangChain]] — 最流行的框架
- [[Chain of Thought]] — Agent 推理的基础

## Sources
- raw/articles/agent-framework-comparison-2026.md
