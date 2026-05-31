---
title: "多模态 LLM"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [multimodal, vision, llm, architecture]
aliases: [multimodal-model, vision-language-model, vlm]
confidence: high
summary: "多模态 LLM 能同时处理文本、图像、音频和视频，是 Computer Use Agent 的技术基础。"
---

# 多模态 LLM

多模态 LLM 将多种输入模态（文本、图像、音频、视频）统一到一个模型中处理。

## 代表模型

| 模型 | 机构 | 模态 | 特点 |
|------|------|------|------|
| GPT-4o | [[OpenAI]] | 文本+图像+音频 | 原生多模态 |
| Claude 4 | [[Anthropic]] | 文本+图像 | 200K 上下文 |
| Gemini | [[Google DeepMind]] | 文本+图像+音频+视频 | 1M+ 上下文 |
| LLaMA 4 | [[Meta AI]] | 文本+图像 | 开源 |
| Qwen 2.5-VL | 阿里 | 文本+图像+视频 | 开源中文 |

## 技术路线

### 早期：分离式

```
图像 → 视觉编码器 → 特征向量 → 投影层 → LLM 输入
文本 → Tokenizer → Token IDs → LLM 输入
```

视觉编码器（如 CLIP ViT）独立训练，通过投影层与 LLM 对齐。

### 当前：原生多模态

GPT-4o、Gemini 等从预训练阶段就混合多模态数据，不需要独立的视觉编码器。

## 关键能力

1. **图像理解**：识别物体、读取文字、理解图表
2. **文档理解**：OCR、表格提取、版面分析
3. **视频理解**：时序推理、动作识别
4. **语音理解**：语音转文字、情感识别

## 在 Agent 中的应用

多模态 LLM 是 [[Computer Use Agent]] 的技术基础：

```
屏幕截图 → 多模态 LLM 理解 → 生成操作指令 → 执行
```

→ [[UI-TARS]] — 基于多模态 LLM 的 GUI Agent

## 与纯文本 LLM 的对比

| 维度 | 纯文本 LLM | 多模态 LLM |
|------|-----------|-----------|
| 输入 | 仅文本 | 文本+图像+音频 |
| 理解图表 | 不支持 | 支持 |
| 操作 GUI | 不支持 | 支持 |
| 推理能力 | 相当 | 相当 |
| 训练成本 | 较低 | 较高 |

## See Also

- [[Computer Use Agent]] — 多模态 LLM 的杀手级应用
- [[UI-TARS]] — 开源多模态 Agent
- [[Transformer 架构]] — 多模态 LLM 的基础架构
- [[上下文窗口]] — 多模态输入消耗更多 token

## Sources

- raw/articles/multimodal-llm-2026.md
