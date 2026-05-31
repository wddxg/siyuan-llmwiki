---
title: "Token"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [token, tokenizer, llm-basics]
aliases: [tokens, tokenization, 分词]
confidence: high
summary: "Token 是 LLM 处理文本的最小单元，决定了模型的输入输出计量方式。"
---

# Token

Token 是 LLM 读写文本的基本单位。一个 token 不等于一个字或一个词。

## 分词方式

### BPE（Byte Pair Encoding）

GPT 系列和大多数 LLM 使用的分词方法：

1. 从单个字符开始
2. 统计最频繁的相邻字符对
3. 合并为新 token
4. 重复直到达到词表大小

### SentencePiece

LLaMA 和多语言模型常用，支持无空格语言（中文、日文）。

## Token 与文字的对应关系

| 语言 | 大致比例 |
|------|---------|
| 英文 | 1 token ≈ 4 个字符 ≈ 0.75 个单词 |
| 中文 | 1 个汉字 ≈ 1-2 个 token |
| 代码 | 1 token ≈ 2-3 个字符 |

## Token 的经济意义

LLM API 按 token 计费：

- 输入 token（prompt）：通常较便宜
- 输出 token（completion）：通常较贵
- 长上下文模型可能有阶梯定价

→ [[上下文窗口]] — token 数量的上限

## 分词器训练

分词器在预训练前确定，之后不可更改。词表大小通常为：

- GPT-4：100K tokens
- LLaMA 3：128K tokens
- 中文优化模型可能包含更多中文 token

## See Also

- [[上下文窗口]] — token 数量的限制
- [[Embedding]] — token 的向量表示
- [[Transformer 架构]] — token 是 Transformer 的输入单元
- [[提示工程]] — token 是 prompt 的计量单位

## Sources

- raw/articles/token-explained-2026.md
- raw/papers/bpe-tokenization.md
