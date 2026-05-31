---
title: "Agent 协议对比"
category: reference
created: 2026-05-30
updated: 2026-05-30
tags: [comparison, protocol, mcp, ag-ui, a2a]
confidence: medium
summary: "MCP、AG-UI、A2A 三大协议分别标准化了 Agent 的工具调用、前端通信和跨 Agent 通信。"
---

# Agent 协议对比

## 三大协议

| 维度 | MCP | AG-UI | A2A |
|------|-----|-------|-----|
| 提出者 | [[Anthropic]] | [[CopilotKit]] | Google |
| 标准化 | Agent ↔ 工具 | Agent ↔ 前端 | Agent ↔ Agent |
| 传输 | HTTP / stdio | WebSocket / SSE | HTTP |
| 核心能力 | 工具发现和调用 | 状态推送和交互 | 任务委托和协调 |
| 成熟度 | 高（生态爆发） | 中（快速增长） | 低（刚发布） |

## MCP：Agent ↔ 工具

MCP 解决了"Agent 如何发现和使用工具"的问题。

→ [[MCP 协议]]

**关键特性**：
- 工具注册和发现
- 结构化参数和返回值
- 资源访问标准化
- 权限控制

**生态**：最成熟，Chrome DevTools、GitHub、n8n 等已接入。

## AG-UI：Agent ↔ 前端

AG-UI 解决了"Agent 如何驱动用户界面"的问题。

→ [[CopilotKit]]

**关键特性**：
- 流式状态推送
- 用户交互事件转发
- 工具调用结果渲染
- 多 Agent UI 协调

**价值**：统一了不同 Agent 框架的前端接入方式。

## A2A：Agent ↔ Agent

A2A 解决了"不同 Agent 如何互相委托任务"的问题。

**关键特性**：
- Agent 能力描述（类似 MCP 的工具描述）
- 任务委托和结果返回
- 跨平台 Agent 互操作

**现状**：刚发布，生态尚在建设中。

## 三者互补

```
用户 ←→ 前端（AG-UI） ←→ Agent A（MCP） ←→ 工具
                         ↕ A2A
                         Agent B（MCP） ←→ 工具
```

三个协议不是竞争关系，而是覆盖了 Agent 通信的三个正交维度。

## 对本项目的影响

SiYuan LLM Wiki 使用 MCP 协议，意味着：

- 任何支持 MCP 的 Agent 都能操作知识库
- 未来可通过 AG-UI 接入前端界面
- 可通过 A2A 与其他 Agent 系统协作

## See Also

- [[MCP 协议]] — 最成熟的 Agent 协议
- [[CopilotKit]] — AG-UI 的提出者
- [[Agent 框架]] — 协议之上的编排层

## Sources

- raw/articles/agent-protocols-2026.md
