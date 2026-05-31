---
title: "上下文窗口"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [context-window, token-limit, llm-basics]
aliases: [context-length, context-window, 上下文长度]
confidence: high
summary: "上下文窗口是 LLM 一次能处理的最大 token 数量，决定了模型能"看到"多少信息。"
---

# 上下文窗口

上下文窗口（Context Window）是 LLM 的"工作记忆"大小。

## 各模型上下文长度

| 模型 | 上下文长度 | 备注 |
|------|-----------|------|
| GPT-4o | 128K | |
| Claude 3.5/4 | 200K | |
| Gemini 1.5 Pro | 1M+ | 目前最长 |
| LLaMA 3.1 | 128K | 开源最长之一 |
| Mistral Large | 128K | |

## 技术挑战

1. **注意力复杂度**：标准自注意力是 O(n²)，长度翻倍计算量翻四倍 → [[Transformer 架构]]
2. **Lost in the Middle**：模型倾向于关注输入的开头和结尾，忽略中间内容
3. **成本**：更长上下文 = 更多 token = 更高 API 费用
4. **训练数据**：需要长文档训练数据来充分利用长上下文

## 长上下文技术

- **RoPE 外推**：旋转位置编码的长度外推 → [[Transformer 架构]]
- **Flash Attention**：IO 感知的注意力实现，降低显存
- **Ring Attention**：分布式长序列注意力
- **Sliding Window**：滑窗注意力，Mistral 采用

## 对 RAG 的影响

长上下文窗口改变了 RAG 的策略：

- 传统 RAG：检索 top-3~5 片段（约 2K token）
- 长上下文 RAG：可以注入更多文档（50K+ token）
- 但更长 ≠ 更好：需要平衡信息密度和噪声

→ [[RAG]]

## See Also

- [[Token]] — 上下文窗口的计量单位
- [[Transformer 架构]] — 上下文长度的技术瓶颈
- [[RAG]] — 上下文窗口限制了 RAG 的注入量

## Sources

- raw/articles/context-window-2026.md
