---
title: "Agent 治理"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [governance, safety, security, agent]
aliases: [agent-governance, agent-security, agent-safety]
confidence: medium
summary: "Agent 治理是管理自主 AI Agent 行为边界、权限和风险的框架和工具集。"
---

# Agent 治理

随着 AI Agent 能力增强（→ [[Computer Use Agent]]），治理问题变得日益紧迫。

## 为什么需要治理

传统 LLM 只做文本生成，风险有限。Agent 能：

- 执行代码
- 操作文件系统
- 调用外部 API
- 操作 GUI → [[Computer Use Agent]]
- 管理资金（→ [[TradingAgents]]）

这些能力带来了真实的风险。

## Microsoft Agent Governance Toolkit

**仓库**: github.com/microsoft/agent-governance-toolkit
**Star**: 3.5K（快速增长）
**机构**: Microsoft

覆盖 OWASP Agentic Top 10 的全部 10 个风险类别：

1. **身份与访问控制**：零信任架构，Agent 需要显式权限
2. **工具调用审计**：记录所有工具调用的输入输出
3. **沙箱执行**：Agent 代码在隔离环境中运行
4. **权限最小化**：Agent 只获得完成任务所需的最小权限
5. **人机交互**：高风险操作需要人工确认
6. **数据保护**：防止 Agent 泄露敏感数据
7. **供应链安全**：验证 MCP Server 等工具来源
8. **行为监控**：实时监控 Agent 行为，异常时中断
9. **回滚能力**：Agent 操作可撤销
10. **合规审计**：满足监管要求的审计日志

## OWASP Agentic Top 10

OWASP 于 2025 年底发布的 Agent 安全风险清单，涵盖：

- Prompt 注入攻击
- 工具滥用
- 权限提升
- 数据泄露
- 供应链攻击

## 本项目的治理实践

SiYuan LLM Wiki 在 MCP Server 中内置了多层治理：

- `SIYUAN_DELETE_SAFE_MODE`：默认禁止删除
- `SIYUAN_DELETE_REQUIRE_CONFIRMATION`：删除需确认
- `SIYUAN_PERMISSION_MODE`：白名单权限控制
- `SIYUAN_NOTEBOOK_ALLOWLIST`：笔记本级访问控制

## See Also

- [[Agent 框架]] — Agent 能力的快速增长带来治理需求
- [[Computer Use Agent]] — 最高风险的 Agent 能力
- [[MCP 协议]] — 工具调用的标准化也带来标准化治理的需求

## Sources

- raw/articles/agent-governance-2026.md
