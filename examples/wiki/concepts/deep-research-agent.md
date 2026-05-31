---
title: "深度研究 Agent"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [research-agent, deep-research, autonomous]
aliases: [deep-research, research-agent, gpt-researcher]
confidence: medium
summary: "深度研究 Agent 能自主搜索、阅读、综合多个来源的信息，生成结构化的研究报告。"
---

# 深度研究 Agent

深度研究 Agent 是 AI Agent 最成熟的应用场景之一，能自主完成"搜索 → 阅读 → 综合 → 写作"的完整研究流程。

## 代表项目

### GPT-Researcher（27K stars）

**仓库**: github.com/assafelovic/gpt-researcher

最早的自主研究 Agent 之一。流程：

```
用户问题 → 分解子问题 → 并行搜索 → 阅读网页 → 交叉验证 → 生成报告
```

### Local Deep Research（8K stars）

**仓库**: github.com/LearningCircuit/local-deep-research

支持本地 LLM（Ollama、llama.cpp）的深度研究 Agent：

- 支持 10+ 搜索引擎（Google、arXiv、PubMed 等）
- SimpleQA 基准 95% 准确率
- 隐私友好：可用完全本地模型

### Academic Research Skills（25K stars）

**仓库**: github.com/Imbad0202/academic-research-skills

为 Claude Code 定制的学术研究技能包：

```
研究 → 写作 → 审阅 → 修订 → 定稿
```

## 研究 Agent 的典型架构

1. **规划器**：将问题分解为 3-5 个子问题
2. **搜索器**：并行搜索多个来源
3. **阅读器**：提取和理解搜索结果
4. **验证器**：交叉验证事实
5. **写作者**：综合生成报告

## 与 LLM Wiki 的关系

研究 Agent 的输出可以作为 LLM Wiki 的输入：

```
研究 Agent → 生成报告 → 摄入 LLM Wiki → 编译为 wiki 页面
```

→ [[LLM 知识库构建]] — 研究成果的持久化

## 核心挑战

- **信息质量**：搜索结果可能包含错误信息
- **时效性**：信息可能已过时
- **成本**：深度研究消耗大量 token
- **幻觉**：Agent 可能在报告中"编造"不存在的来源

## See Also

- [[LLM 知识库构建]] — 研究成果的存储和维护
- [[RAG]] — 研究 Agent 的检索技术基础
- [[Chain of Thought]] — 研究推理的核心技术

## Sources

- raw/articles/deep-research-agents-2026.md
