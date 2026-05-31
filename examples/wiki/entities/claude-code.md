---
title: "Claude Code"
category: entity
created: 2026-05-30
updated: 2026-05-30
tags: [coding-agent, cli, anthropic, claude]
aliases: [claude-code-cli, claude-code-agent]
confidence: high
summary: "Claude Code 是 Anthropic 推出的命令行 AI 编程助手，原生支持 MCP 协议和多 Agent 编排。"
---

# Claude Code

Claude Code 是 [[Anthropic]] 推出的命令行 AI 编程 Agent，是 2026 年最活跃的编程 Agent 生态。

## 核心特性

1. **命令行原生**：在终端中直接运行，与开发者工作流无缝集成
2. **MCP 原生支持**：通过 MCP 协议连接任意工具和数据源 → [[MCP 协议]]
3. **多文件编辑**：理解项目上下文，跨文件修改
4. **Agent 编排**：支持子 Agent 并行工作、工作流编排
5. **Skill 系统**：可安装和复用技能包

## 生态爆发（2026）

Claude Code 催生了一个庞大的生态：

| 项目 | Stars | 功能 |
|------|-------|------|
| andrej-karpathy-skills | 162K | Karpathy 的 Claude Code 技能包 |
| mattpocock/skills | 112K | 工程师实用技能 |
| academic-research-skills | 25K | 学术研究流水线 |
| [[Context7]] | 56K | 实时文档 MCP |
| [[CodeGraph]] | 35K | 代码知识图谱 |
| [[Ruflo]] | 57K | 多 Agent 编排 |

→ [[2026 年 AI Agent 生态全景]] — Claude Code 是生态中心

## 与其他编程 Agent 的对比

| 维度 | Claude Code | Cursor | GitHub Copilot |
|------|-------------|--------|---------------|
| 交互方式 | 命令行 | IDE | IDE 插件 |
| MCP 支持 | 原生 | 有限 | 不支持 |
| 多 Agent | 支持 | 不支持 | 不支持 |
| 模型 | Claude | 多模型 | GPT-4o |
| 生态 | Skill + MCP | 配置 | 有限 |

## 与本项目的关系

SiYuan LLM Wiki 的 MCP Server 可以直接被 Claude Code 连接，让它成为知识库管理 Agent。

## See Also

- [[Anthropic]] — Claude Code 的开发方
- [[MCP 协议]] — Claude Code 的工具调用标准
- [[Agent 框架]] — Claude Code 在 Agent 生态中的位置
- [[Ruflo]] — Claude Code 的多 Agent 编排平台

## Sources

- raw/articles/claude-code-ecosystem-2026.md
