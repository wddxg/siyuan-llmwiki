---
title: "RLHF"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [alignment, training, reinforcement-learning]
aliases: [reinforcement-learning-human-feedback, 人类反馈强化学习]
confidence: high
summary: "RLHF 是通过人类偏好反馈来对齐 LLM 行为的核心训练技术。"
---

# RLHF

RLHF（Reinforcement Learning from Human Feedback）是让 LLM 从"能说话"进化到"说好话"的关键技术。

## 训练流程

```
阶段 1：预训练 → 基础语言能力
阶段 2：监督微调（SFT） → 学会遵循指令
阶段 3：RLHF → 对齐人类偏好
```

### 阶段 3 详解

1. **收集偏好数据**：人类标注者对同一 prompt 的多个回答排序
2. **训练奖励模型（RM）**：学习人类偏好的评分函数
3. **PPO 优化**：用奖励模型作为信号，通过 PPO 算法优化 LLM

## DPO：简化的替代方案

Direct Preference Optimization（DPO）跳过了奖励模型训练，直接从偏好数据优化 LLM：

- 更简单、更稳定
- 效果与 RLHF 相当
- 越来越多模型采用 DPO 替代 PPO

## Constitutional AI

[[Anthropic]] 提出的替代方案：

- 用一组"宪法原则"代替人类标注
- AI 自我评估和修正
- 大幅减少对人类标注的依赖

## 应用场景

- ChatGPT 的对话质量 → [[OpenAI]]
- Claude 的安全性和有用性 → [[Anthropic]]
- 开源模型的对齐 → [[Meta AI]]（LLaMA 2 的 RLHF 训练）

## See Also

- [[微调]] — RLHF 是微调的一种特殊形式
- [[OpenAI]] — RLHF 的主要推动者
- [[Anthropic]] — Constitutional AI 的提出者

## Sources

- raw/papers/instructgpt-2022.md
- raw/papers/constitutional-ai-2022.md
- raw/articles/rlhf-explained-2026.md
