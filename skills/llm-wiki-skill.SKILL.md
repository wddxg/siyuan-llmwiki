---
name: "llm-wiki"
description: "当用户提到「知识库」「Wiki」「新建知识库」「导入素材」「摄入」「知识查询」「知识库审计」「一致性检查」「编译」「归档」时使用此 Skill。"
skillType: "orchestration"
category: research
tags: [wiki, knowledge-base, mcp, siyuan]
---

# LLM Wiki Skill

在思源笔记中构建持久化、可复合增长的知识库。

基于 Karpathy 的 LLM Wiki 方案：原始素材是源代码，Agent 是编译器，Wiki 是可执行产物。

## 前置条件

1. 思源笔记已启动（Docker 或本地）
2. MCP Server 已运行（`docker compose up -d` 或 `npm start`）
3. Agent 已连接 MCP Server

## 会话启动协议（每次对话必执行）

```
1. wiki_list_knowledge_bases    — 查看已有知识库
2. wiki_select                  — 选择目标知识库
3. wiki_status                  — 检查知识库健康状态
4. wiki_read_tree               — 读取目录树
```

## 核心操作

### 1. 初始化知识库

用户说「创建知识库」「新建 Wiki」时：

```
wiki_bootstrap → 输入 wikiName, description
```

自动创建完整结构：结构约定、总索引、操作日志、收件箱、原始资料（文章/论文/仓库/笔记/数据）、实体、概念、对比、问答归档。

### 2. Ingest（摄入素材）

用户提供 URL、文本、文件时：

```
判断素材类型
  → wiki_ingest_text（单条）或 wiki_ingest_batch（批量）
  → 分析关键实体和概念
  → wiki_ensure_page（生成/更新 wiki 页面）
  → 建立交叉引用
  → wiki_refresh_indexes
  → wiki_append_log
```

**防重复**：每次创建/更新前，先 wiki_query 检查是否已存在。

### 3. Compile（编译）

将原始素材转化为 wiki 页面：

```
wiki_list_uncompiled_raw        — 找到未编译素材
wiki_prepare_compile_bundle     — 准备编译素材包
wiki_read_markdown_batch        — 批量读取
  ↓ Agent 本地分析
提取实体、概念、对比关系
  ↓
wiki_write_markdown_from_tree   — 批量写入 wiki 页面
wiki_refresh_indexes            — 更新索引
```

一份素材可能触发 5-10 个页面更新——知识的复合增长。

### 4. Query（查询）

用户提问时：

```
wiki_query                      — 搜索相关页面
wiki_read_page / wiki_read_markdown_batch — 读取内容
  ↓ Agent 综合分析
生成带来源引用的回答
  ↓ 值得保留时
wiki_archive_conclusion         — 归档到问答区
```

**硬规则**：Query 只读 wiki 页面，不读原始文件。

### 5. Lint（审计）

用户说「检查知识库」「审计」时：

```
wiki_lint                       — 结构健康检查
wiki_check_index                — 索引一致性检查
```

检查：缺页、孤立页、缺失引用、未编译素材、内容矛盾。

## 关键原则

1. **原始素材不可变**：入库后不修改，修正写在 wiki 页面中
2. **增量维护**：能改一段就不重写整页
3. **交叉引用**：每个页面至少引用一个其他页面
4. **先读索引**：先定位再读取，不盲目扫描
5. **原子编辑优先**：wiki_ensure_page / wiki_replace_section / wiki_append_under_heading

## MCP 工具速查

| 操作 | 工具 |
|------|------|
| 选择知识库 | wiki_select |
| 初始化 | wiki_bootstrap |
| 导入素材 | wiki_ingest_text / wiki_ingest_batch |
| 读取页面 | wiki_read_page / wiki_read_tree |
| 写入页面 | wiki_ensure_page / wiki_write_markdown_from_tree |
| 替换章节 | wiki_replace_section |
| 追加内容 | wiki_append_under_heading |
| 搜索 | wiki_query / wiki_find_related |
| 编译准备 | wiki_prepare_compile_bundle / wiki_list_uncompiled_raw |
| 审计 | wiki_lint / wiki_check_index |
| 对比 | wiki_compare_sources |
| 归档结论 | wiki_archive_conclusion |
| 导出 | wiki_export_tree |
| 日志 | wiki_append_log |
