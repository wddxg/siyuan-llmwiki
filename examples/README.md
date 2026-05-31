# 示例 Wiki 说明

本目录包含一组 LLM/AI 领域的样例 wiki 内容，展示 SiYuan LLM Wiki 系统的能力。

## 目录结构

```
examples/
├── raw/                    ← 原始素材（模拟摄入的论文和文章）
│   ├── articles/           ← 文章
│   │   └── karpathy-llm-wiki-concept.md
│   └── papers/             ← 论文摘录
│       ├── attention-is-all-you-need.md
│       ├── rag-meta-2020.md
│       ├── constitutional-ai-2022.md
│       ├── cot-prompting-2022.md
│       └── lora-2021.md
│
└── wiki/                   ← 编译后的 Wiki 页面
    ├── entities/           ← 实体页（9 篇）
    │   ├── openai.md
    │   ├── anthropic.md
    │   ├── andrej-karpathy.md
    │   ├── google-deepmind.md
    │   ├── langchain.md
    │   ├── hugging-face.md
    │   ├── mistral-ai.md
    │   ├── meta-ai.md
    │   └── siyuan-note.md
    ├── concepts/           ← 概念页（12 篇）
    │   ├── transformer-architecture.md
    │   ├── rag.md
    │   ├── prompt-engineering.md
    │   ├── fine-tuning.md
    │   ├── rlhf.md
    │   ├── chain-of-thought.md
    │   ├── vector-database.md
    │   ├── context-window.md
    │   ├── token.md
    │   ├── embedding.md
    │   ├── agent-framework.md
    │   └── llm-knowledge-base.md
    ├── comparisons/        ← 对比页（5 篇）
    │   ├── gpt4o-vs-claude.md
    │   ├── rag-vs-finetuning.md
    │   ├── open-vs-closed-source.md
    │   ├── embedding-models.md
    │   └── agent-frameworks.md
    └── queries/            ← 问答归档（5 篇）
        ├── how-to-choose-llm.md
        ├── rag-or-finetuning.md
        ├── evaluate-llm-quality.md
        ├── knowledge-base-best-practices.md
        └── ai-agent-future.md
```

## 这些样例展示了什么

### 1. 原始素材不可变

`raw/` 中的文件一旦入库不会被修改。它们是知识的"源代码"。

### 2. 交叉引用网络

每个 wiki 页面都通过 `[[页面标题]]` 语法引用其他页面，形成知识网络。

例如：`transformer-architecture.md` 引用了 `[[上下文窗口]]`、`[[Token]]`、`[[Embedding]]`、`[[RLHF]]` 等页面。

### 3. 来源追溯

每个 wiki 页面底部都有 `## Sources` 章节，列出编译所用的原始素材。

### 4. 分类清晰

- **实体**：具体的人物、组织、产品（8 个实体）
- **概念**：技术、方法论、主题（12 个概念）
- **对比**：并排分析（5 组对比）
- **问答**：沉淀的结论（5 篇问答）

### 5. 前置元数据

每个页面都有 YAML frontmatter，包含标题、分类、标签、置信度等信息。

## 在线演示

访问 [GitHub Pages](https://wddxg.github.io/siyuan-llmwiki/) 查看在线演示。
