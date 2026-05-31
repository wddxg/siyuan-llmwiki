---
title: "TradingAgents"
category: entity
created: 2026-05-30
updated: 2026-05-30
tags: [trading, multi-agent, finance, llm]
aliases: [tauric-trading-agents]
confidence: medium
summary: "TradingAgents 是 Tauric Research 开源的多 Agent LLM 金融交易框架，月增 26K star。"
---

# TradingAgents

**仓库**: github.com/TauricResearch/TradingAgents
**Star**: 81K（2026 年 5 月，月增 +26,772）
**语言**: Python

TradingAgents 是当前最火的 AI 交易 Agent 框架，用多个 LLM Agent 模拟真实交易团队的分工协作。

## 架构设计

```
市场数据 → 分析师 Agent（基本面/技术面/情绪面）
         → 研究员 Agent（综合研判）
         → 交易员 Agent（执行决策）
         → 风控 Agent（风险管理）
         → 投资组合管理
```

每个 Agent 有独立的角色、工具和决策逻辑，通过消息传递协调。

## Agent 角色分工

| 角色 | 职责 | 工具 |
|------|------|------|
| 基本面分析师 | 分析财报、公司数据 | 数据 API |
| 技术分析师 | K 线、指标分析 | 图表工具 |
| 情绪分析师 | 社交媒体、新闻情绪 | NLP 工具 |
| 研究员 | 综合各分析师意见 | 无 |
| 交易员 | 制定交易计划 | 交易 API |
| 风控 | 评估风险、设定止损 | 风控模型 |

## 技术亮点

1. **多 Agent 协作**：模拟真实投资团队的决策流程 → [[Agent 框架]]
2. **多数据源整合**：实时新闻、财报、社交媒体、技术指标
3. **回测系统**：历史数据验证策略有效性
4. **风险管理**：独立的风控 Agent 防止过度交易

## 局限与风险

- LLM 的推理不一定优于量化模型
- 实时交易延迟问题
- 市场非理性时 Agent 可能做出错误判断
- 需要可靠的行情数据源

## 为什么火爆

2026 年 AI Agent 在金融领域的应用爆发。TradingAgents 提供了一个开箱即用的框架，降低了 AI 交易的入门门槛。

## See Also

- [[Agent 框架]] — Agent 的核心概念
- [[Agent 框架对比]] — 与其他框架的比较
- [[Chain of Thought]] — Agent 推理的基础

## Sources

- raw/articles/trading-agents-2026.md
