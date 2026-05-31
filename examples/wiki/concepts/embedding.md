---
title: "Embedding"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [embedding, vector, representation-learning]
aliases: [embedding-model, text-embedding, 向量化]
confidence: high
summary: "Embedding 是将文本转换为数值向量的技术，是语义搜索和 RAG 的基础。"
---

# Embedding

Embedding 将文本映射到高维向量空间，使得语义相似的文本在向量空间中距离接近。

## 工作原理

```
"机器学习很有趣" → [0.12, -0.34, 0.56, ...] （768/1024/1536 维）
"深度学习很有意思" → [0.11, -0.33, 0.55, ...] （相近！）
"今天天气很好" → [0.78, 0.12, -0.45, ...] （较远）
```

## 主流 Embedding 模型

| 模型 | 维度 | 特点 |
|------|------|------|
| OpenAI text-embedding-3-large | 3072 | 商业模型标杆 |
| Cohere embed-v4 | 1024 | 多语言优秀 |
| BGE-M3 | 1024 | 开源多语言 |
| Jina Embeddings v3 | 1024 | 开源，长文本 |
| Gemini Embedding | 768 | Google 生态 |

→ [[Embedding 模型对比]] — 详细评测

## 相似度度量

- **余弦相似度**：最常用，衡量方向相似性
- **点积**：归一化后等价于余弦
- **欧氏距离**：衡量绝对距离

## 应用场景

1. **语义搜索**：用自然语言查询文档 → [[RAG]]
2. **聚类**：将相似文档自动分组
3. **分类**：用 embedding 训练分类器
4. **推荐**：基于 embedding 相似度推荐内容
5. **异常检测**：离群点检测

## 存储

Embedding 向量存储在向量数据库中 → [[向量数据库]]

## See Also

- [[向量数据库]] — embedding 的存储和检索
- [[RAG]] — embedding 最重要的应用
- [[Embedding 模型对比]] — 如何选择 embedding 模型
- [[Token]] — embedding 的输入粒度

## Sources

- raw/articles/embedding-explained-2026.md
