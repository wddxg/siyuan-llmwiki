---
title: "LLM 知识库构建"
category: topic
created: 2026-05-30
updated: 2026-05-30
tags: [knowledge-base, wiki, llm-wiki, karpathy]
aliases: [llm-wiki, knowledge-management, wiki-mode]
confidence: high
summary: "LLM 知识库构建是用 AI Agent 将原始素材编译成结构化、可维护 Wiki 的系统方法。"
---

# LLM 知识库构建

本页是本项目的核心理念说明。基于 [[Andrej Karpathy]] 提出的 LLM Wiki 概念。

## 传统 RAG 的问题

传统 RAG（→ [[RAG]]）每次查询都从零开始：

```
查询 → 检索 → 生成 → 回答 → （知识丢弃）
```

问题：
- 没有知识积累
- 无法发现素材间的关联
- 每次都消耗大量 token 做检索
- 综合分析能力弱

## Wiki 模式：编译一次，持续维护

```
原始素材 → Agent 编译 → Wiki 页面 → 持续增量维护
                ↑                    ↓
          新素材输入 ←──── 知识网络不断增长
```

**核心比喻**：原始素材是源代码，Agent 是编译器，Wiki 是可执行产物。

## 知识库结构

```
<知识库>/
├── 结构约定 / 总索引 / 操作日志
├── 原始资料/     ← 不可变，只增不改
├── 实体/         ← 人物、组织、产品
├── 概念/         ← 主题、技术、方法论
├── 对比/         ← 并排分析
└── 问答归档/     ← 沉淀后的结论
```

## Agent 工作流

### Ingest（摄入）

```
用户给素材 → 判断类型 → 写入原始资料区 → 自动分析实体/概念 → 生成/更新 wiki 页面 → 建立交叉引用
```

一份素材可能触发 5-10 个页面的更新——这就是知识的**复合增长**。

### Query（查询）

```
用户提问 → 读索引 → 读相关页面 → 跨页面综合 → 带来源引用的回答
```

Query 只读 wiki 页面，不读原始文件。

### Lint（自检）

```
检查结构完整性 → 孤立页面 → 缺失引用 → 未编译素材 → 矛盾检测
```

## 本项目的实现

本项目用 [[思源笔记]] 作为底层存储，通过 MCP Server 暴露标准化接口：

1. **MCP Server**：提供 wiki_bootstrap、wiki_ingest_*、wiki_read_*、wiki_write_*、wiki_query、wiki_lint 等工具
2. **Agent**：连接 MCP Server，执行编译推理
3. **思源笔记**：提供块级编辑、双链引擎、SQL 查询

## 与传统知识管理的对比

| 维度 | 传统笔记 | RAG | LLM Wiki |
|------|---------|-----|----------|
| 知识积累 | 手动维护 | 无积累 | 自动编译维护 |
| 交叉引用 | 手动链接 | 无 | Agent 自动建立 |
| 综合分析 | 人工完成 | 单次检索 | 跨页面综合 |
| 一致性检查 | 人工 | 无 | Agent lint |
| 维护成本 | 高 | 低 | 中（Agent 代劳） |

## See Also

- [[RAG]] — Wiki 模式的替代方案
- [[Andrej Karpathy]] — 概念提出者
- [[思源笔记]] — 本项目的底层存储
- [[Agent 框架]] — 驱动 Wiki 编译的 Agent 技术

## Sources

- raw/articles/karpathy-llm-wiki-concept.md
- raw/articles/llm-wiki-implementation-2026.md
- raw/notes/wiki-vs-rag-comparison.md
