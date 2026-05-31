---
title: "Agent 记忆系统"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [memory, agent, persistence, context]
aliases: [agent-memory, persistent-memory, long-term-memory]
confidence: medium
summary: "Agent 记忆系统解决了 LLM 的'失忆'问题，让 Agent 能跨会话保持知识和经验。"
---

# Agent 记忆系统

LLM 的上下文窗口（→ [[上下文窗口]]）限制了 Agent 的"工作记忆"。记忆系统让 Agent 拥有长期记忆。

## 记忆类型

| 类型 | 持久性 | 容量 | 用途 |
|------|--------|------|------|
| 工作记忆 | 当前推理步骤 | 极小 | 中间计算结果 |
| 对话记忆 | 单次会话 | 受上下文窗口限制 | 多轮对话 |
| 长期记忆 | 跨会话 | 无限 | 知识、偏好、经验 |
| 情景记忆 | 跨会话 | 无限 | 具体事件和交互 |

## 主流方案

### AgentMemory（20K stars）

**仓库**: github.com/rohitg00/agentmemory

"基于真实基准测试的 #1 AI 编程 Agent 持久记忆方案"。核心能力：

- 自动提取对话中的重要信息
- 结构化存储（实体、偏好、事实）
- 跨会话检索和注入
- 与 Claude Code、Cursor 等 Agent 深度集成

### Mem0

更通用的记忆层，支持多种 Agent 框架。

### 本项目的方案

SiYuan LLM Wiki 的知识库本身就是一种 Agent 记忆：

- **原始资料**：长期情景记忆
- **Wiki 页面**：结构化的语义记忆
- **操作日志**：事件记忆
- **交叉引用**：关联记忆

→ [[LLM 知识库构建]]

## 技术实现

### 记忆提取

```
对话/操作 → LLM 分析 → 提取关键信息 → 结构化存储
```

### 记忆检索

```
新任务 → 查询记忆 → 相关记忆注入上下文 → Agent 执行
```

检索方式：关键词匹配、语义相似度（→ [[Embedding]]）、时间衰减

### 记忆压缩

当记忆量超过上下文窗口时：
- 摘要压缩：用 LLM 总结旧记忆
- 重要度过滤：只保留高权重记忆
- 时间衰减：优先保留近期记忆

## 核心挑战

1. **噪声**：对话中的闲聊也被记住，需要过滤
2. **一致性**：不同时间学到的矛盾信息
3. **隐私**：记忆可能包含敏感信息
4. **检索质量**：注入不相关的记忆反而降低性能

## See Also

- [[上下文窗口]] — 记忆系统的物理限制
- [[LLM 知识库构建]] — Wiki 作为结构化记忆
- [[向量数据库]] — 记忆检索的基础设施
- [[Embedding]] — 记忆向量化的基础

## Sources

- raw/articles/agent-memory-systems-2026.md
