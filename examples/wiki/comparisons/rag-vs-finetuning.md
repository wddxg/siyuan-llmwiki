---
title: "RAG vs Fine-tuning"
category: reference
created: 2026-05-30
updated: 2026-05-30
tags: [comparison, rag, fine-tuning, knowledge-injection]
aliases: [rag-vs-finetuning]
confidence: high
summary: "RAG 和微调是两种主要的知识注入方式，适用于不同的场景和需求。"
---

# RAG vs Fine-tuning

## 核心区别

| 维度 | RAG | 微调 |
|------|-----|------|
| 原理 | 检索外部文档注入 prompt | 修改模型内部参数 |
| 知识更新 | 实时（改文档即可） | 需要重新训练 |
| 成本 | 棉（运行时检索成本） | 高（训练成本） |
| 可解释性 | 高（可追溯来源） | 低（知识固化在参数中） |
| 幻觉风险 | 较低（有来源约束） | 较高（可能"编造"） |
| 复杂推理 | 较弱（依赖检索质量） | 较强（知识内化） |

→ [[RAG]] / [[微调]]

## 何时用 RAG

- 知识频繁更新（新闻、产品信息）
- 需要可追溯的来源引用
- 预算有限，不想训练模型
- 知识量大（百万级文档）

## 何时用微调

- 需要改变模型的风格或行为模式
- 特定领域术语和格式要求
- 需要内化复杂推理模式
- 对延迟敏感（不想每次检索）

## 混合方案

最佳实践往往是两者结合：

1. **RAG + 微调 Embedding**：用领域数据微调 embedding 模型，提升检索质量
2. **微调 + RAG**：微调模型使其更好地利用检索结果
3. **Wiki 模式**：用 Agent 编译维护知识库，查询时直接读取 wiki 页面 → [[LLM 知识库构建]]

## See Also

- [[RAG]] — 检索增强生成详解
- [[微调]] — 参数微调详解
- [[LLM 知识库构建]] — 第三种方案

## Sources

- raw/articles/rag-vs-finetuning-2026.md
- raw/articles/knowledge-injection-methods.md
