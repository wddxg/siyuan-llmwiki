---
title: "什么时候用 RAG 什么时候用微调"
category: query
created: 2026-05-30
updated: 2026-05-30
tags: [rag, fine-tuning, decision-guide]
confidence: high
summary: "RAG 适合知识频繁更新的场景，微调适合改变模型行为模式的场景，两者可结合使用。"
---

# 什么时候用 RAG，什么时候用微调

## Question

在构建 AI 应用时，应该如何决定使用 RAG 还是微调？

## Answer

### 用 RAG 的信号

- 你的知识频繁变化（产品文档、政策、新闻）
- 你需要可追溯的来源引用
- 你没有大量标注数据
- 你需要处理海量文档（百万级）
- 你对延迟不太敏感

→ [[RAG]]

### 用微调的信号

- 你需要改变模型的输出风格（专业术语、格式）
- 你需要内化特定领域的推理模式
- 你对延迟敏感（不想每次检索）
- 你有足够的高质量标注数据（1K+）
- 你的知识相对稳定

→ [[微调]]

### 混合使用的最佳实践

最常见的生产方案是 RAG + 微调的组合：

1. **微调 embedding 模型**：用领域数据微调 embedding，提升检索质量 → [[Embedding 模型对比]]
2. **微调 LLM + RAG**：微调使模型更好地理解和利用检索结果
3. **Wiki 模式**：Agent 编译维护知识库，查询时直接读取 → [[LLM 知识库构建]]

→ [[RAG vs Fine-tuning]] — 详细的对比分析

## Sources

- raw/articles/rag-vs-finetuning-decision-guide.md
