---
title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks — 要点摘录"
source: "arXiv:2005.11401"
type: papers
ingested: 2026-05-30
tags: [rag, retrieval, knowledge]
summary: "Meta AI 提出的 RAG 模型，将检索与生成结合，开创了知识增强生成范式。"
---

# Retrieval-Augmented Generation (RAG)

**作者**: Lewis, Perez, Piktus, Petroni, Karpukhin, Goyal, Küttler, Lewis, Yih, Rocktäschel, Riedel, Kiela
**年份**: 2020
**机构**: Facebook AI Research (Meta AI)

## 问题

预训练语言模型存在两个固有局限：
1. 无法准确获取和操纵知识
2. 隐式知识难以更新

## 方法

将预训练的 seq2seq 模型（BART）与密集向量检索（DPR）结合：

```
输入 → DPR 检索相关文档 → BART 基于检索结果生成输出
```

### RAG-Sequence

对检索到的文档，分别生成完整输出，然后加权聚合。

### RAG-Token

对每个输出 token，独立选择最相关的文档。

## 关键发现

1. RAG 模型在开放域 QA 上超过了纯参数模型
2. 检索的知识可以实时更新，无需重新训练
3. RAG 生成的回答更具事实性，减少幻觉
4. 隐式学习了"何时检索"和"检索什么"

## 局限

- 检索质量是瓶颈
- 对检索文档的利用方式较简单
- 不擅长需要多步推理的问题

## 影响

RAG 成为知识密集型 NLP 任务的标准方案，推动了向量数据库和 embedding 技术的快速发展。
