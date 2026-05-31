---
title: "提示工程"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [prompt-engineering, llm-usage, techniques]
aliases: [prompt-engineering, prompting, 提示词工程]
confidence: high
summary: "提示工程是设计和优化 LLM 输入以获得最佳输出的技术和方法论。"
---

# 提示工程

提示工程（Prompt Engineering）是与 LLM 交互的核心技能，直接影响输出质量。

## 核心技术

### 基础技术

1. **零样本（Zero-shot）**：直接提问，不给示例
2. **少样本（Few-shot）**：在 prompt 中给出 2-5 个示例
3. **系统提示（System Prompt）**：设定角色、规则和约束

### 高级技术

4. **Chain of Thought（CoT）**：引导 LLM 逐步推理 → [[Chain of Thought]]
5. **Self-Consistency**：多次采样取多数投票
6. **ReAct**：推理 + 行动交替进行 → [[Agent 框架]]
7. **Tree of Thought**：树状搜索推理路径

### 结构化提示

8. **XML 标签**：用 XML 标签分隔指令、上下文、输出格式
9. **JSON Schema**：要求结构化 JSON 输出
10. **Markdown 模板**：用 Markdown 格式化输出

## 最佳实践

- **明确指令**：告诉 LLM 要做什么，而不是不要做什么
- **角色设定**：给 LLM 一个专业角色（"你是一个资深工程师"）
- **分步拆解**：复杂任务拆成多步
- **提供上下文**：相关信息越充分，回答越准确
- **指定格式**：明确期望的输出格式和长度

## 提示工程 vs 微调

| 维度 | 提示工程 | 微调 |
|------|---------|------|
| 成本 | 低（只改输入） | 高（需要训练） |
| 灵活性 | 高（随时可改） | 低（需要重新训练） |
| 效果上限 | 受限于模型能力 | 可以改变模型行为 |
| 适用场景 | 通用任务 | 特定领域 |

→ [[微调]]

## See Also

- [[Chain of Thought]] — 最重要的提示技术之一
- [[上下文窗口]] — 限制了 prompt 的长度
- [[Token]] — prompt 的计量单位
- [[微调]] — 当提示工程不够用时

## Sources

- raw/articles/prompt-engineering-guide-2026.md
- raw/papers/cot-prompting-2022.md
