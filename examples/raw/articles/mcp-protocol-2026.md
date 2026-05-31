---
title: "MCP 协议规范与生态"
source: "https://modelcontextprotocol.io/"
type: articles
ingested: 2026-05-30
tags: [mcp, protocol, agent, tool-use]
summary: "Model Context Protocol (MCP) 由 Anthropic 推出，为 AI Agent 的工具调用提供标准化协议。2026 年生态爆发。"
---

# Model Context Protocol (MCP)

## 概述

MCP 是一个开放协议，标准化了应用程序如何向 LLM 提供上下文。可以类比为"AI 应用的 USB-C 接口"——一个统一的连接标准。

## 架构

```
Host（宿主应用，如 Claude Code）
  ↕
MCP Client（协议客户端）
  ↕
MCP Server（工具/数据提供方）
```

### 核心原语

1. **Tools**：模型可以调用的函数
   - 有名称、描述、JSON Schema 参数
   - 模型决定何时调用，服务端执行
   - 可标记为只读或读写

2. **Resources**：模型可以读取的数据
   - URI 寻址（如 `siyuan-llmwiki://catalog/tools`）
   - MIME 类型标识
   - 由应用控制何时注入上下文

3. **Prompts**：可复用的提示模板
   - 参数化模板
   - 由用户选择何时使用

### 传输方式

- **Streamable HTTP**：远程服务，通过 HTTP POST，支持流式响应
- **stdio**：本地进程，通过标准输入输出通信

## 2026 年生态爆发

MCP 在 2026 年经历了爆发式增长：

- Chrome DevTools MCP (42K stars)
- GitHub MCP Server (30K stars)
- Context7 MCP (56K stars)
- n8n MCP (21K stars)
- 数百个社区 MCP Server

几乎所有主流 AI Agent 平台都已支持 MCP：Claude Code、Cursor、Windsurf、Copilot 等。

## 与其他协议的关系

- **AG-UI**：标准化 Agent ↔ 前端通信（CopilotKit 提出）
- **A2A**：标准化 Agent ↔ Agent 通信（Google 提出）
- MCP 专注于 Agent ↔ 工具/数据通信

三个协议互补，覆盖了 Agent 通信的三个维度。

## 安全考虑

MCP 的安全模型：
- 工具调用需要宿主应用授权
- 敏感操作需要用户确认
- Server 可以声明只读/读写语义
- 传输层可加密（HTTPS）
