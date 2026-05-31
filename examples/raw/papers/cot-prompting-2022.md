---
title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models — 要点摘录"
source: "arXiv:2201.11903"
type: papers
ingested: 2026-05-30
tags: [chain-of-thought, reasoning, prompting]
summary: "Google Brain 提出的 CoT 提示技术，通过引导 LLM 展示推理步骤来提升复杂问题解答质量。"
---

# Chain-of-Thought Prompting

**作者**: Wei, Wang, Schuurmans, Bosma, Ichter, Xia, Chi, Le, Zhou
**年份**: 2022
**机构**: Google Brain

## 核心发现

在 few-shot 提示中加入中间推理步骤，可以显著提升 LLM 在数学、常识推理和符号操作任务上的表现。

## 方法

传统提示：
```
Q: Roger has 5 tennis balls. He buys 2 cans of 3. How many does he have now?
A: 11
```

CoT 提示：
```
Q: Roger started with 5 balls. 2 cans of 3 = 6 balls. 5 + 6 = 11.
A: 11
```

## 实验结果

- PaLM 540B 在 GSM8K（小学数学）上：标准提示 17.9% → CoT 58.1%
- 在 MultiArith 上：标准提示 22.2% → CoT 79.9%
- 效果随模型规模增大而增强（涌现能力）

## 关键发现

1. CoT 是大模型的涌现能力，小模型（<10B）效果不明显
2. 推理链的正确性比格式更重要
3. CoT 对需要多步推理的任务帮助最大
4. 简单任务上 CoT 帮助不大

## 影响

启发了后续一系列推理增强技术：Self-Consistency、Tree of Thought、以及 o1/o3 等推理模型。
