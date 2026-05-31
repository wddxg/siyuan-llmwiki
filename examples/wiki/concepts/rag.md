---
title: "RAG（检索增强生成）"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [rag, retrieval, knowledge-management]
aliases: [retrieval-augmented-generation, 检索增强生成]
confidence: high
summary: "RAG 通过检索外部知识来增强 LLM 的回答，是最常见的知识注入方式。"
---

# RAG（检索增强生成）

RAG（Retrieval Augmented Generation）由 Meta AI 研究团队在 2020 年提出，解决了 LLM 的知识时效性和幻觉问题。

## 工作原理

```
用户提问
  ↓
检索器（Retriever）从知识库中找到相关文档片段
  ↓
将检索结果 + 原始问题拼接成 prompt
  ↓
LLM 基于检索结果生成回答
```

## 关键组件

### 文档处理

1. **分块（Chunking）**：将长文档切分成适当大小的片段
   - 固定大小切分（512/1024 token）
   - 语义切分（按段落、章节）
   - 递归切分（LangChain 默认方式）

2. **Embedding**：将文本转换为向量 → [[Embedding]]

3. **索引**：存储到向量数据库 → [[向量数据库]]

### 检索策略

- **稠密检索**：基于 embedding 余弦相似度
- **稀疏检索**：BM25 等传统关键词匹配
- **混合检索**：结合稠密 + 稀疏 → [[Embedding 模型对比]]
- **重排序（Reranking）**：用交叉编码器对候选结果重新排序

### 生成增强

- 将检索到的 k 个文档片段插入 prompt
- LLM 基于这些片段生成回答
- 回答中标注来源引用

## RAG 的局限

1. **检索质量**是瓶颈——检索不到相关内容，LLM 也无法回答
2. **分块策略**影响很大但缺乏通用最优解
3. **多跳推理**困难：需要综合多个文档才能回答的问题
4. **上下文窗口**限制了能注入的文档数量 → [[上下文窗口]]

## 与 Wiki 模式的对比

Karpathy 提出的 LLM Wiki 模式认为：RAG 的"每次查询从零检索"效率低下，更好的方式是**编译一次、持续维护**。

→ [[LLM 知识库构建]] — Wiki 模式如何改进 RAG

## See Also

- [[LLM 知识库构建]] — RAG 的替代方案
- [[向量数据库]] — RAG 的存储层
- [[Embedding]] — RAG 的向量化基础
- [[RAG vs Fine-tuning]] — 两种知识注入方式的对比
- [[深度研究 Agent]] — RAG 的高级应用形式
- [[上下文窗口]] — 限制了 RAG 的注入量

## Sources

- raw/papers/rag-meta-2020.md
- raw/articles/rag-explained-2026.md
- raw/articles/karpathy-llm-wiki-concept.md
