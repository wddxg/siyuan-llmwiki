# 快速开始

## 前提条件

- [Docker](https://docs.docker.com/get-docker/) 和 Docker Compose
- 支持 MCP 的 AI Agent（Claude Code、Cursor 等）

## 第一步：克隆仓库

```bash
git clone https://github.com/sxh-1999/siyuan-llmwiki.git
cd siyuan-llmwiki
```

## 第二步：配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，至少修改以下两项：

```env
SIYUAN_ACCESS_AUTH_CODE=your-secure-code
SIYUAN_TOKEN=your-api-token
```

`SIYUAN_TOKEN` 在下一步获取。

## 第三步：启动服务

```bash
docker compose up -d
```

这会启动两个容器：
- `siyuan`：思源笔记，端口 6806
- `siyuan-llmwiki-mcp`：MCP Server，端口 31710

## 第四步：获取 API Token

1. 打开浏览器访问 `http://localhost:6806`
2. 输入你在 `.env` 中设置的 `SIYUAN_ACCESS_AUTH_CODE`
3. 进入 设置 → 关于 → API Token
4. 复制 Token，更新 `.env` 中的 `SIYUAN_TOKEN`
5. 重启 MCP 容器：`docker compose restart siyuan-llmwiki-mcp`

## 第五步：连接 Agent

### Claude Code

在项目目录创建 `.mcp.json`：

```json
{
  "mcpServers": {
    "siyuan-llmwiki": {
      "url": "http://localhost:31710/mcp"
    }
  }
}
```

### Cursor

在 Cursor Settings → MCP Servers 中添加：

```
URL: http://localhost:31710/mcp
```

### 其他 Agent

任何支持 MCP Streamable HTTP 的 Agent 都可以连接。

## 第六步：初始化知识库

告诉 Agent：

```
帮我创建一个叫 ai-research 的知识库
```

Agent 会调用 `wiki_bootstrap` 创建完整的 Wiki 结构。

## 第七步：导入素材

### 从本地文件导入

把 Markdown 文件放到 `data/imports/`，然后告诉 Agent：

```
把 data/imports 里的内容导入到 ai-research 知识库
```

### 从 URL 导入

```
帮我把这篇文章摄入知识库：https://example.com/article
```

### 批量导入

```bash
python tools/prepare_raw_batch.py --input ./my-papers/ --output batch.json
```

然后通过 MCP 的 `wiki_ingest_batch` 工具导入。

## 下一步

- [Agent 配置指南](agent-setup.md) — 更多 Agent 使用技巧
- [MCP 工具详解](mcp-tools.md) — 所有 MCP 工具的参数和用法
- [Wiki 概念说明](wiki-concepts.md) — 理解 Wiki 的设计理念
