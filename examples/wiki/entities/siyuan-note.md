---
title: "思源笔记"
category: entity
created: 2026-05-30
updated: 2026-05-30
tags: [note-taking, knowledge-management, siyuan]
aliases: [siyuan-note, b3log-siyuan]
confidence: high
summary: "思源笔记是一款开源的本地优先知识管理工具，本项目基于其构建 LLM Wiki。"
---

# 思源笔记

思源笔记由 [B3log](https://b3log.org) 社区开发，是一款强调本地优先、块级编辑的个人知识管理系统。

## 核心特性

- **块级编辑**：每个段落、列表项、代码块都是独立的块
- **双链**：`((id "title"))` 和 `[[title]]` 语法支持双向链接
- **SQL 查询**：内置 SQL 引擎，可查询任意块属性
- **Markdown 导入导出**：标准 Markdown 兼容
- **多端同步**：支持 S3、WebDAV 等同步方案
- **Docker 部署**：官方提供 Docker 镜像

## API 能力

思源笔记提供完整的 HTTP API：

- 笔记本管理（创建、打开、配置）
- 文档树操作（创建、重命名、移动、删除）
- 块级操作（读取、更新、插入、删除）
- SQL 查询
- 导出 Markdown
- 属性管理

这些 API 是 MCP Server 与思源笔记交互的基础。

## 为什么选思源笔记做 LLM Wiki

1. **块级编辑**：Agent 可以精确修改页面中的某个章节，不必整页重写
2. **SQL 查询**：支持按路径、标签、更新时间等维度灵活检索
3. **双链引擎**：Wiki 的交叉引用天然支持
4. **本地优先**：数据在本地，不依赖云服务
5. **Docker 支持**：一行命令启动，适合自动化部署

## See Also

- [[LLM 知识库构建]] — 本项目的整体设计理念
- [[MCP 协议]] — Agent 与思源笔记的通信协议

## Sources

- raw/repos/siyuan-note-github.md
- raw/articles/siyuan-note-features.md
