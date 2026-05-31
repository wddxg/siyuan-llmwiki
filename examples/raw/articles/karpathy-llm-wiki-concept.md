---
title: "Karpathy 的 LLM Wiki 概念"
source: "https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f"
type: articles
ingested: 2026-05-30
tags: [llm-wiki, knowledge-management, karpathy]
summary: "Andrej Karpathy 提出用 LLM 编译和维护 Wiki 知识库的方案，知识不再每次从零检索。"
---

# Karpathy 的 LLM Wiki 概念

## 核心观点

Andrej Karpathy 提出了一种全新的知识管理范式：

> Raw documents are source code. You are the compiler. The wiki is the executable.

（原始文档是源代码，LLM 是编译器，Wiki 是可执行产物。）

## 与传统 RAG 的区别

传统 RAG（检索增强生成）：
- 每次查询从零检索
- 知识不复合增长
- 无法建立素材间的关联

LLM Wiki 模式：
- **编译一次，持续维护**
- 知识不断复合增长
- 自动建立交叉引用
- 有结构、有索引、可审计

## Wiki 结构

Karpathy 建议的结构：

```
wiki/
├── raw/           ← 原始素材（不可变）
├── concepts/      ← 概念页
├── entities/      ← 实体页
├── comparisons/   ← 对比页
└── queries/       ← 问答归档
```

## Agent 角色

LLM Agent 扮演两个角色：
1. **编译器**：将原始素材转化为 wiki 页面
2. **查询引擎**：基于 wiki 内容回答问题

## 关键原则

1. 原始素材不可变
2. Wiki 页面应能 30 秒内扫读
3. 每个页面至少引用一个其他页面
4. 索引是导航，不是内容
5. 综合分析反映全部素材

## 本项目的实践

本项目基于 Karpathy 的概念，用思源笔记作为底层存储，通过 MCP Server 实现标准化的 wiki 操作接口。
