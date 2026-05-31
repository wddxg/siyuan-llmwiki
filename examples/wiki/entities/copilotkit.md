---
title: "CopilotKit"
category: entity
created: 2026-05-30
updated: 2026-05-30
tags: [frontend, agent-ui, protocol, react]
aliases: [copilot-kit, ag-ui-protocol]
confidence: medium
summary: "CopilotKit 是 Agent 的前端基础设施，推出 AG-UI 协议标准化 Agent 与前端的通信。"
---

# CopilotKit

**仓库**: github.com/CopilotKit/CopilotKit
**Star**: 31.9K
**语言**: TypeScript

CopilotKit 定义自己为"Agent 和生成式 UI 的前端技术栈"，提供 React/Angular 组件让开发者快速构建 Agent 驱动的用户界面。

## 核心产品

1. **CopilotKit UI**：嵌入式聊天窗口、侧边栏、浮动面板等 React 组件
2. **CopilotKit Runtime**：Agent 后端运行时，支持 tool use、上下文感知
3. **AG-UI Protocol**：Agent ↔ 前端的标准化通信协议

## AG-UI Protocol

AG-UI（Agent-to-GUI）是 CopilotKit 推出的开放协议，定义了：

- Agent 如何向前端推送状态更新
- 前端如何向 Agent 发送用户交互事件
- 工具调用结果的流式传输
- 多 Agent 场景下的 UI 协调

类似于 [[MCP 协议]] 标准化了 Agent ↔ 工具的通信，AG-UI 标准化了 Agent ↔ 前端的通信。

## 为什么重要

当前 Agent 生态的主要痛点之一是前端集成：每个 Agent 框架都有自己的 UI 接入方式。AG-UI 试图统一这个层面。

| 协议 | 标准化的内容 |
|------|------------|
| [[MCP 协议]] | Agent ↔ 工具/数据 |
| AG-UI | Agent ↔ 前端/UI |
| A2A | Agent ↔ Agent |

## 适用场景

- 为现有应用添加 AI 助手
- 构建 Agent 驱动的 SaaS 产品
- 多 Agent 系统的可视化管理

## See Also

- [[MCP 协议]] — Agent 工具调用的标准化
- [[Agent 框架]] — CopilotKit 作为 Agent 的 UI 层
- [[Agent 框架对比]] — 框架生态中的 UI 能力

## Sources

- raw/articles/copilotkit-ag-ui-2026.md
