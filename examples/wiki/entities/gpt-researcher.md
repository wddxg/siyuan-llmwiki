---
title: "GPT-Researcher"
category: entity
created: 2026-05-30
updated: 2026-05-30
tags: [research-agent, autonomous, open-source]
aliases: [gpt-researcher-agent]
confidence: medium
summary: "GPT-Researcher 是最流行的自主深度研究 Agent，能自动搜索、阅读和综合多个来源。"
---

# GPT-Researcher

**仓库**: github.com/assafelovic/gpt-researcher
**Star**: 27.4K
**语言**: Python

GPT-Researcher 是最早也最成熟的自主研究 Agent 之一。

## 核心流程

```
用户提出研究问题
  ↓
分解为 5-8 个子问题
  ↓
并行搜索（Web + 学术 + 新闻）
  ↓
阅读和提取关键信息
  ↓
交叉验证和去重
  ↓
生成结构化研究报告
```

## 关键特性

1. **多源搜索**：同时搜索网页、学术论文、新闻
2. **并行处理**：多个子问题并行研究，加速完成
3. **来源验证**：交叉验证不同来源的信息
4. **报告生成**：输出结构化的 Markdown 报告，带完整引用

## 使用方式

```python
from gpt_researcher import GPTResearcher

researcher = GPTResearcher(query="LLM agent frameworks comparison 2026")
report = await researcher.conduct_research()
```

## 与深度研究 Agent 的关系

→ [[深度研究 Agent]] — GPT-Researcher 是这个领域的代表项目

GPT-Researcher 的研究报告可以作为 [[LLM 知识库构建]] 的输入素材。

## See Also

- [[深度研究 Agent]] — 研究 Agent 的整体生态
- [[RAG]] — 研究 Agent 的检索基础
- [[LLM 知识库构建]] — 研究成果的持久化

## Sources

- raw/articles/gpt-researcher-2026.md
