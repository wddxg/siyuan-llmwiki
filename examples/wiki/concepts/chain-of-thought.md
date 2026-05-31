---
title: "Chain of Thought"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [reasoning, prompting, technique]
aliases: [cot, 思维链, chain-of-thought]
confidence: high
summary: "Chain of Thought 通过引导 LLM 展示推理步骤来提升复杂问题的解答质量。"
---

# Chain of Thought

Chain of Thought（CoT，思维链）由 Google Brain 团队在 2022 年提出，是提升 LLM 推理能力的关键技术。

## 核心思想

让 LLM 在给出最终答案前，先展示中间推理步骤：

```
普通提示：Q: 3×7+2=? A: 23

CoT 提示：Q: 3×7+2=? 
A: 先算 3×7=21，再算 21+2=23。答案是 23。
```

## 变体

1. **Zero-shot CoT**：在 prompt 末尾加 "Let's think step by step"
2. **Few-shot CoT**：给出带推理步骤的示例
3. **Self-Consistency**：多次采样 CoT 推理，取多数投票
4. **Tree of Thought**：树状搜索多个推理路径

## 为什么有效

- 将复杂问题分解为简单步骤
- 每步都可以被模型正确执行
- 中间步骤提供了"工作记忆"
- 类似人类的草稿纸效应

## 在推理模型中的应用

OpenAI 的 o1/o3 系列和 DeepSeek-R1 将 CoT 推理内置到了模型训练中：

- 模型自动进行长链推理
- 不需要用户手动提示
- 在数学和编程任务上大幅提升

→ [[提示工程]] — CoT 是提示工程的核心技术

## See Also

- [[提示工程]] — CoT 的上位概念
- [[Agent 框架]] — CoT 在 Agent 中的应用（ReAct 模式）
- [[深度研究 Agent]] — CoT 在研究推理中的应用
- [[RLHF]] — CoT 推理能力通过训练增强

## Sources

- raw/papers/cot-prompting-2022.md
- raw/articles/reasoning-models-2026.md
