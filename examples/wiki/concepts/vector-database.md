---
title: "向量数据库"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [vector-database, embedding, retrieval]
aliases: [vector-db, vector-store, 向量存储]
confidence: high
summary: "向量数据库是存储和检索高维向量的专用数据库，是 RAG 和语义搜索的基础设施。"
---

# 向量数据库

向量数据库专门用于存储 embedding 向量并支持高效的近似最近邻（ANN）检索。

## 核心操作

1. **写入**：将文本的 embedding 向量存入数据库
2. **检索**：给定查询向量，找到最相似的 top-k 向量
3. **过滤**：结合元数据过滤（标签、时间、类型等）

## 主流产品

| 产品 | 类型 | 特点 |
|------|------|------|
| **Qdrant** | 独立服务 | Rust 实现，高性能，丰富过滤 |
| **Chroma** | 嵌入式 | 轻量，适合原型 |
| **Pinecone** | 托管服务 | 全托管，零运维 |
| **Weaviate** | 独立服务 | 支持混合搜索 |
| **Milvus** | 独立服务 | 大规模分布式 |
| **pgvector** | PostgreSQL 扩展 | 利用现有 PG 基础设施 |
| **SQLite-VSS** | SQLite 扩展 | 轻量嵌入式 |

## 检索方法

- **HNSW**：分层可导航小世界图，最常用的 ANN 算法
- **IVF**：倒排文件索引
- **PQ**：乘积量化，压缩向量降低内存

## 在 RAG 中的应用

→ [[RAG]] — 向量数据库是 RAG 检索层的核心

```
文档 → 分块 → Embedding → 写入向量数据库
查询 → Embedding → 检索 top-k → 送入 LLM
```

## 局限性

- 语义检索 ≠ 精确匹配，关键词查询可能失败
- 需要与传统搜索引擎（BM25）结合使用
- 向量维度和数据量增长时，内存和延迟压力增大

## See Also

- [[Embedding]] — 向量数据库的输入格式
- [[RAG]] — 向量数据库的主要应用场景
- [[Embedding 模型对比]] — 影响检索质量的关键
- [[Agent 记忆系统]] — 向量数据库用于 Agent 长期记忆

## Sources

- raw/articles/vector-database-landscape-2026.md
- raw/papers/hnsw-algorithm.md
