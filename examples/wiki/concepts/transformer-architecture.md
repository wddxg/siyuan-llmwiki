---
title: "Transformer 架构"
category: topic
created: 2026-05-30
updated: 2026-05-30
tags: [architecture, attention, deep-learning, foundational]
aliases: [transformer, self-attention, attention-mechanism]
confidence: high
summary: "Transformer 是现代大语言模型的基础架构，通过自注意力机制实现高效的序列建模。"
---

# Transformer 架构

Transformer 由 Vaswani 等人在 2017 年论文 "Attention Is All You Need" 中提出，彻底取代了 RNN/LSTM 成为序列建模的主流架构。

## 核心机制

### 自注意力（Self-Attention）

每个 token 与序列中所有其他 token 计算注意力权重：

```
Attention(Q, K, V) = softmax(QK^T / √d_k) V
```

- Q（Query）、K（Key）、V（Value）是输入的三种线性变换
- `√d_k` 缩放防止 softmax 饱和
- 时间复杂度 O(n²)，这是长序列处理的瓶颈 → [[上下文窗口]]

### 多头注意力（Multi-Head Attention）

将注意力分成多个"头"并行计算，每个头关注不同的关系模式。

### 位置编码（Positional Encoding）

Transformer 没有内在的序列顺序感知。通过位置编码注入位置信息：

- **正弦位置编码**：原始论文方案
- **RoPE**（旋转位置编码）：LLaMA、Qwen 等采用 → [[Meta AI]]
- **ALiBi**：线性偏置方案，Mistral 采用 → [[Mistral AI]]

## 架构变体

| 变体 | 代表模型 | 特点 |
|------|---------|------|
| Encoder-Only | BERT | 双向注意力，适合理解任务 |
| Decoder-Only | GPT、Claude、LLaMA | 因果注意力，适合生成任务 |
| Encoder-Decoder | T5、原始 Transformer | 编码理解 + 解码生成 |

当前 LLM 主流是 **Decoder-Only** 架构。

## Scaling Law

模型性能与以下因素呈幂律关系：

1. **参数量**（N）
2. **训练数据量**（D）
3. **计算量**（C）

最优分配：N 和 D 应该同步增长，C ∝ N × D。

## See Also

- [[上下文窗口]] — Transformer 的序列长度限制
- [[Token]] — Transformer 的输入单元
- [[Embedding]] — Token 的向量表示
- [[RLHF]] — 在 Transformer 基础上的人类对齐

## Sources

- raw/papers/attention-is-all-you-need.md
- raw/articles/transformer-architecture-explained.md
- raw/papers/scaling-laws-neural-lms.md
