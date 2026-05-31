# MCP 工具详解

本 MCP Server 暴露了 25+ 个工具，分为以下几类：

## 知识库管理

### `wiki_bootstrap`

初始化一个完整的 Wiki 知识库结构。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `wikiName` | string | 是 | 知识库名称 |
| `description` | string | 否 | 知识库描述 |
| `force` | boolean | 否 | 覆盖已有页面 |

### `wiki_select`

选择目标知识库。

| 参数 | 类型 | 说明 |
|------|------|------|
| `wikiName` | string | 知识库名称 |
| `notebookId` | string | 思源笔记本 ID |

### `wiki_list_knowledge_bases`

列出所有已注册的知识库。无需参数。

### `wiki_register_knowledge_base`

注册新的知识库。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `wikiName` | string | 是 | 知识库名称 |
| `description` | string | 否 | 描述 |
| `notebookId` | string | 否 | 笔记本 ID |
| `aliases` | string[] | 否 | 别名列表 |

## 素材摄入

### `wiki_ingest_text`

导入单条素材。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 是 | 素材标题 |
| `text` | string | 否 | 正文内容 |
| `rawType` | string | 否 | 类型：articles/papers/repos/notes/data |
| `source` | string | 否 | 来源标注 |
| `tags` | string[] | 否 | 标签列表 |

### `wiki_ingest_batch`

批量导入素材。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `records` | object[] | 是 | 素材数组 |
| `appendLog` | boolean | 否 | 是否追加日志 |

### `wiki_ingest_import_bundle`

路径驱动的导入包。支持单文件、目录、预构建 JSON 包。

## 读取操作

### `wiki_read_tree`

读取知识库的目录树。

| 参数 | 类型 | 说明 |
|------|------|------|
| `rootPath` | string | 根路径，默认 `/` |
| `depth` | number | 最大深度，默认 3 |

### `wiki_read_page`

读取单个页面的 Markdown 内容。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `path` | string | 是 | 页面路径 |
| `includeImages` | boolean | 否 | 是否包含图片 |

### `wiki_read_markdown_batch`

批量读取页面。用于编译前的数据准备。

## 写入操作

### `wiki_ensure_page`

创建或覆盖单个页面。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `path` | string | 是 | 页面路径 |
| `markdown` | string | 否 | 页面内容 |
| `force` | boolean | 否 | 覆盖已有 |

### `wiki_replace_section`

替换页面中一个章节的内容。

### `wiki_append_under_heading`

在指定章节下追加内容。

### `wiki_write_markdown_from_tree`

批量写入页面。先返回 diff 计划，confirm=true 时执行。

## 检索与查询

### `wiki_query`

检索知识库。支持词法和语义检索。

### `wiki_find_related`

查找关联页面。

### `wiki_prepare_compile_bundle`

准备编译素材包（最近新增 + 语义相关 + 指定路径）。

### `wiki_list_uncompiled_raw`

列出尚未被 wiki 页面覆盖的原始素材。

## 审计与维护

### `wiki_lint`

结构健康检查：缺页、孤立页、缺失引用、未编译素材。

### `wiki_check_index`

索引一致性检查。

### `wiki_compare_sources`

对比多个页面的内容。

### `wiki_export_tree`

导出子树为可移植的 Markdown 树。

### `wiki_archive_conclusion`

归档结论到问答归档区。
