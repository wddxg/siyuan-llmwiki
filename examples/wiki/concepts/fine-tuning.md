---
title: "微调"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [fine-tuning, training, peft, lora]
aliases: [fine-tuning, lora, peft, 参数高效微调]
confidence: high
summary: "微调是在预训练模型基础上，用特定领域数据进一步训练以适配下游任务的技术。"
---

# 微调

微调（Fine-tuning）是将通用预训练模型适配到特定任务的关键技术。

## 微调类型

### 全量微调（Full Fine-tuning）

更新模型所有参数。效果最好但成本极高：

- 7B 模型需要 ~56GB 显存（bf16）
- 70B 模型需要多卡并行

### 参数高效微调（PEFT）

只更新少量参数，大幅降低成本：

| 方法 | 原理 | 可训练参数占比 |
|------|------|--------------|
| **LoRA** | 在权重矩阵旁插入低秩分解矩阵 | 0.1%-1% |
| **QLoRA** | 4-bit 量化 + LoRA | <0.5% |
| **Prefix Tuning** | 在输入前添加可训练前缀向量 | <0.1% |
| **Adapter** | 在 Transformer 层间插入小型网络 | 1%-5% |

LoRA 和 QLoRA 是当前最流行的方案。

## 微调数据

高质量微调数据是关键：

- **指令微调**：`(instruction, input, output)` 三元组
- **对话微调**：多轮对话格式
- **偏好数据**：`(prompt, chosen, rejected)` 用于 DPO/RLHF → [[RLHF]]

数据质量 >> 数据数量。1000 条高质量数据可能优于 10 万条低质量数据。

## 微调 vs RAG

→ [[RAG vs Fine-tuning]] — 详细的对比分析

## 微调流程

```
准备数据 → 选择基座模型 → 配置 LoRA/PEFT → 训练 → 评估 → 部署
```

常用工具：Hugging Face TRL/PEFT、Axolotl、LLaMA-Factory → [[Hugging Face]]

## See Also

- [[RAG vs Fine-tuning]] — 两种知识注入方式
- [[RLHF]] — 人类反馈的微调
- [[Hugging Face]] — 微调工具生态
- [[提示工程]] — 微调的替代方案

## Sources

- raw/papers/lora-2021.md
- raw/articles/peft-explained-2026.md
