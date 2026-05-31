---
title: "Embedding 模型对比"
category: reference
created: 2026-05-30
updated: 2026-05-30
tags: [comparison, embedding, model-evaluation]
aliases: [embedding-comparison]
confidence: medium
summary: "主流 Embedding 模型在维度、多语言支持、长文本处理等方面各有差异。"
---

# Embedding 模型对比

## 主流模型对比

| 模型 | 维度 | 最大长度 | 多语言 | 开源 | MTEB 得分 |
|------|------|---------|--------|------|----------|
| OpenAI text-embedding-3-large | 3072 | 8191 | 是 | 否 | ~64 |
| OpenAI text-embedding-3-small | 1536 | 8191 | 是 | 否 | ~62 |
| Cohere embed-v4 | 1024 | 512 | 优秀 | 否 | ~66 |
| BGE-M3 (BAAI) | 1024 | 8192 | 优秀 | 是 | ~63 |
| Jina Embeddings v3 | 1024 | 8192 | 是 | 是 | ~65 |
| GTE-Qwen2 | 1536 | 8192 | 优秀 | 是 | ~63 |
| Gemini Embedding | 768 | 2048 | 是 | 否 | ~64 |

## 选择指南

### 优先考虑

1. **语言需求**：中文场景优先 BGE-M3、GTE-Qwen2、Jina
2. **是否需要自部署**：开源自部署选 BGE-M3 或 GTE-Qwen2
3. **维度与性能权衡**：768 维足够大多数场景，3072 维在精度上有边际提升
4. **长文本**：需要处理长文档时选支持 8K+ 的模型

### 成本考虑

- 闭源 API：按 token 计费，简单但持续付费
- 开源自部署：需要 GPU，但大规模时更划算

## MTEB 基准

MTEB（Massive Text Embedding Benchmark）是标准评测基准，包含检索、分类、聚类等任务。

注意：MTEB 得分是综合指标，特定领域可能需要针对性测试。

## 对 RAG 的影响

→ [[RAG]] — embedding 模型选择直接影响检索质量

建议：在自己的数据上做 A/B 测试，MTEB 排名不等于在你的场景中表现最好。

## See Also

- [[Embedding]] — embedding 的基本概念
- [[向量数据库]] — embedding 的存储层
- [[RAG]] — embedding 的主要应用场景

## Sources

- raw/articles/embedding-model-benchmark-2026.md
- raw/papers/mteb-benchmark.md
