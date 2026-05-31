---
title: "MCP 协议"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [mcp, protocol, agent, tool-use, standard]
aliases: [model-context-protocol, mcp-standard]
confidence: high
summary: "MCP（Model Context Protocol）是 Anthropic 推出的开放标准，统一了 Agent 与工具/数据的通信方式。"
---

# MCP 协议

MCP（Model Context Protocol）由 [[Anthropic]] 于 2024 年底发布，迅速成为 Agent 工具调用的事实标准。

## 核心设计

```
Agent（客户端） ←MCP→ MCP Server（工具提供方）
                  ↑
            标准化协议
```

### 三大能力

1. **Tools**：Agent 可调用的函数（读写文件、搜索、API 调用等）
2. **Resources**：Agent 可读取的数据源（文件、数据库、配置等）
3. **Prompts**：可复用的提示模板

### 传输方式

- **HTTP Streamable**：远程服务，通过 HTTP POST 调用
- **stdio**：本地进程，通过标准输入输出通信

## 生态爆发（2026）

MCP 生态在 2026 年呈指数增长：

| 类型 | 代表项目 | Stars |
|------|---------|-------|
| 开发工具 | Chrome DevTools MCP (42K) | |
| 平台集成 | GitHub MCP Server (30K) | |
| 工作流 | n8n MCP (21K) | |
| 知识管理 | 本项目（思源 LLM Wiki MCP） | |
| 编码辅助 | Serena (25K) | |

## 与其他协议的关系

| 协议 | 定位 | 标准化内容 |
|------|------|----------|
| **MCP** | Agent ↔ 工具 | 工具发现、调用、数据读取 |
| **AG-UI** | Agent ↔ 前端 | 状态推送、交互事件 |
| **A2A** | Agent ↔ Agent | 跨 Agent 通信 |

→ [[CopilotKit]] — AG-UI 协议的提出者

## 本项目的 MCP 实现

本项目（SiYuan LLM Wiki）就是一个 MCP Server 实例：

- 25+ 个工具，覆盖知识库的完整生命周期
- 支持 Streamable HTTP 传输
- 支持可选的语义检索（embedding）
- Agent 连接后即可操作思源笔记知识库

## See Also

- [[Anthropic]] — MCP 的提出者
- [[Agent 框架]] — MCP 在 Agent 生态中的位置
- [[思源笔记]] — 本项目 MCP Server 的底层存储

## Sources

- raw/articles/mcp-protocol-2026.md
- raw/articles/mcp-ecosystem-explosion-2026.md
