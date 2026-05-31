---
title: "Ruflo"
category: entity
created: 2026-05-30
updated: 2026-05-30
tags: [agent-orchestration, multi-agent, claude, swarm]
aliases: [ruflo-platform, ruflo-agents]
confidence: medium
summary: "Ruflo 是 Claude 生态中最热门的多 Agent 编排平台，支持 Swarm 调度和自主工作流。"
---

# Ruflo

**仓库**: github.com/ruvnet/ruflo
**Star**: 56.7K（2026 年 5 月，月增长领先）
**语言**: TypeScript

Ruflo 定位为"Claude 的首席 Agent 编排平台"，提供多 Agent Swarm 部署、自主工作流编排和对话式 AI 系统构建能力。

## 核心能力

1. **多 Agent Swarm**：同时调度多个 Agent 实例，各自认领不同角色和任务
2. **自主工作流**：定义 DAG 或状态机式的任务流水线，Agent 自动推进
3. **对话式 AI 编排**：管理多轮对话的上下文、记忆和工具调用
4. **Claude 深度集成**：原生支持 Claude API 的 tool use、extended thinking 等特性

## 与其他编排框架的区别

| 维度 | Ruflo | [[LangChain]] / LangGraph | CrewAI |
|------|-------|--------------------------|--------|
| 重点 | Claude 生态 | 通用 LLM | 多 Agent 对话 |
| Swarm 支持 | 原生 | 需要自建 | 内置 |
| 自主程度 | 高（自驱任务） | 中（链式调用） | 中（角色分配） |
| 部署方式 | 平台化 | 库 + 自部署 | 库 + 自部署 |

## 技术架构

Ruflo 的 Swarm 调度器将大任务分解为子任务，分配给多个 Agent 实例并行或串行执行。每个 Agent 有独立的上下文窗口（→ [[上下文窗口]]）和工具集，通过共享状态协调。

## 适用场景

- 大规模代码重构（多文件并行修改）
- 研究任务（多角度并行调研）
- 自动化运维（监控 → 诊断 → 修复）

## See Also

- [[Agent 框架对比]] — 整体框架生态对比
- [[Claude Code]] — Ruflo 主要服务的 Agent 平台
- [[MCP 协议]] — Ruflo 的工具调用标准

## Sources

- raw/articles/ruflo-agent-orchestration-2026.md
