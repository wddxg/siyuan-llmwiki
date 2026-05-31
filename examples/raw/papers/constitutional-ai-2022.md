---
title: "Constitutional AI: Harmlessness from AI Feedback — 要点摘录"
source: "arXiv:2212.08073"
type: papers
ingested: 2026-05-30
tags: [constitutional-ai, safety, alignment, anthropic]
summary: "Anthropic 提出的 Constitutional AI，用一组原则代替人类标注来对齐 AI 行为。"
---

# Constitutional AI

**作者**: Bai, Kadavath, Kundu, Askell, Kernion, Jones, Chen, Goldie, Mirhoseini, McKinnon, Chen, Olsson, Olah, Hernandez, Drain, Fort, Ganguli, Li, Tran-Johnson, Perez, Kerr, Mueller, Ladish, Landau, Ndousse, Lukosuite, Lovitt, Sellitto, Elhage, Schiefer, Lasenby, Conerly, Hatfield-Dodds, Drain, Amodei
**年份**: 2022
**机构**: Anthropic

## 问题

RLHF 依赖大量人类标注，成本高且存在标注者偏见。

## 方法

两阶段训练：

### 阶段 1：Supervised from Human Feedback (SL-CAI)

1. 让模型生成回答
2. 让模型根据"宪法原则"自我批评和修改
3. 用修改后的回答做监督微调

### 阶段 2：RL from AI Feedback (RLAIF)

1. 让模型根据宪法原则评估多个回答的好坏
2. 用 AI 偏好代替人类偏好训练奖励模型
3. 用 PPO 优化

## 宪法原则示例

- "选择最有帮助、最诚实、最无害的回答"
- "避免种族、性别、民族等方面的歧视"
- "不鼓励非法或有害行为"

## 关键结果

1. RLAIF 效果接近 RLHF，大幅减少人类标注需求
2. 模型更少表现出"讨好"行为
3. 安全性可通过修改宪法原则灵活调整

## 影响

成为 Claude 系列模型的核心安全框架，被广泛研究和引用。
