---
title: "Attention Is All You Need — 要点摘录"
source: "arXiv:1706.03762"
type: papers
ingested: 2026-05-30
tags: [transformer, attention, foundational]
summary: "Vaswani et al. 提出的 Transformer 架构，用自注意力替代 RNN，开启大模型时代。"
---

# Attention Is All You Need

**作者**: Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin
**年份**: 2017
**机构**: Google Brain / Google Research

## 核心贡献

提出了 Transformer 架构，完全基于注意力机制，摒弃了 RNN 和 CNN。

## 关键设计

### 自注意力机制

```
Attention(Q, K, V) = softmax(QK^T / √d_k) V
```

- Query、Key、Value 三种线性变换
- 缩放因子 √d_k 防止点积过大导致 softmax 梯度消失

### 多头注意力

将 d_model 维分成 h 个头，每个头独立计算注意力，然后拼接：

```
MultiHead(Q,K,V) = Concat(head_1, ..., head_h) W^O
```

### 位置编码

使用正弦和余弦函数的固定位置编码：

```
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```

### 架构

- Encoder-Decoder 结构
- 6 层 encoder，6 层 decoder
- 每层包含多头自注意力 + 前馈网络
- 残差连接 + 层归一化

## 实验结果

- WMT 2014 英德翻译：28.4 BLEU（超过所有之前模型）
- 训练时间：3.5 天（8 GPU）
- 比 RNN 模型快数倍

## 影响

这篇论文奠定了现代 NLP 的基础。GPT、BERT、LLaMA 等所有现代 LLM 都基于 Transformer 架构。
