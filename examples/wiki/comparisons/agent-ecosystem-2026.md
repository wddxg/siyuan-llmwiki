---
title: "2026 年 AI Agent 生态全景"
category: reference
created: 2026-05-30
updated: 2026-05-30
tags: [ecosystem, agent, landscape, 2026]
confidence: medium
summary: "2026 年 AI Agent 生态呈爆发式增长，形成了从基础设施到应用的完整技术栈。"
---

# 2026 年 AI Agent 生态全景

## 技术栈分层

```
┌─────────────────────────────────────────────────────┐
│                    应用层                             │
│  TradingAgents · GPT-Researcher · CodeGraph         │
│  UI-TARS · 学术研究 · 知识管理                       │
├─────────────────────────────────────────────────────┤
│                   编排层                              │
│  Ruflo · LangGraph · CrewAI · AutoGen               │
├─────────────────────────────────────────────────────┤
│                  协议层                               │
│  MCP（工具） · AG-UI（前端） · A2A（Agent间）        │
├─────────────────────────────────────────────────────┤
│                 基础设施层                            │
│  AgentMemory · Context7 · 向量数据库                  │
│  沙箱 · 可观测性 · 治理                               │
├─────────────────────────────────────────────────────┤
│                  模型层                               │
│  Claude · GPT-4o · Gemini · LLaMA · Mistral         │
└─────────────────────────────────────────────────────┘
```

## 月增 Star 排行（2026 年 5 月）

| 项目 | 类型 | Star | 月增 |
|------|------|------|------|
| [[TradingAgents]] | 应用 | 81K | +26.7K |
| [[Ruflo]] | 编排 | 56.7K | - |
| Context7 | 基础设施 | 56.4K | - |
| [[CodeGraph]] | 应用 | 34.5K | Trending#1 |
| [[CopilotKit]] | 前端 | 31.9K | - |
| GPT-Researcher | 应用 | 27.4K | - |
| AgentMemory | 基础设施 | 20K | - |
| [[UI-TARS]] | 应用 | 35.8K | - |
| CUA | 基础设施 | 17.4K | - |

## 三大趋势

### 1. 协议标准化

MCP、AG-UI、A2A 三大协议分别标准化了 Agent 的工具调用、前端通信和跨 Agent 通信。

→ [[MCP 协议]]

### 2. Computer Use 爆发

Agent 从"只读文本"进化到"看屏幕操作电脑"。

→ [[Computer Use Agent]]

### 3. 记忆与治理

Agent 能力越强，记忆和治理需求越迫切。

→ [[Agent 记忆系统]] / [[Agent 治理]]

## 对 LLM Wiki 的影响

这些趋势对知识管理 Agent 意味着：

1. **MCP 标准化**：知识库可以通过 MCP 被任何 Agent 访问
2. **Computer Use**：Agent 可以直接操作思源笔记 GUI
3. **记忆系统**：Wiki 本身就是 Agent 的长期记忆 → [[LLM 知识库构建]]
4. **治理**：知识库操作需要权限控制和审计

## See Also

- [[MCP 协议]] — 生态的连接标准
- [[Agent 框架对比]] — 编排层的具体比较
- [[LLM 知识库构建]] — Agent 生态中的知识管理

## Sources

- raw/articles/agent-ecosystem-2026.md
- raw/articles/agent-trends-may-2026.md
