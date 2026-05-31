---
title: "UI-TARS"
category: entity
created: 2026-05-30
updated: 2026-05-30
tags: [computer-use, multimodal, gui-agent, bytedance]
aliases: [ui-tars-desktop, bytedance-ui-tars]
confidence: medium
summary: "字节跳动开源的多模态 AI Agent 基础设施，通过视觉理解操作桌面 GUI。"
---

# UI-TARS

**仓库**: github.com/bytedance/UI-TARS-desktop
**Star**: 35.8K
**语言**: TypeScript
**机构**: ByteDance（字节跳动）

UI-TARS 是字节跳动推出的开源多模态 AI Agent 栈，核心能力是让 AI "看懂"屏幕并操作 GUI。

## 核心技术

1. **视觉理解**：多模态模型直接理解屏幕截图，不需要 DOM/API
2. **GUI 操作**：通过鼠标点击、键盘输入、拖拽等方式操作任意应用
3. **任务规划**：将高层指令分解为 GUI 操作步骤
4. **错误恢复**：操作失败时自动重试或换策略

## 与 Computer Use 的关系

UI-TARS 和 [[Anthropic]] 的 Computer Use 功能类似，但 UI-TARS 是开源的：

| 维度 | UI-TARS | Claude Computer Use |
|------|---------|-------------------|
| 开源 | 是 | 否 |
| 模型 | 可替换 | 绑定 Claude |
| 平台 | 桌面 + Web | 浏览器为主 |
| 精度 | 中高 | 高 |

→ [[Computer Use Agent]]

## 应用场景

- **自动化测试**：替代 Selenium/Playwright 的视觉测试
- **RPA**：企业流程自动化
- **辅助操作**：帮助用户完成复杂软件操作
- **数据采集**：操作浏览器采集数据

## 技术栈

UI-TARS 桌面端基于 Electron 构建，集成了：
- 多模态模型推理（本地或云端）
- 屏幕截图和标注
- 操作录制和回放
- Agent 状态管理

## See Also

- [[Computer Use Agent]] — AI 操作电脑的整体生态
- [[多模态 LLM]] — UI-TARS 的视觉理解基础
- [[Agent 框架]] — UI-TARS 的 Agent 基础设施
- [[Anthropic]] — Claude Computer Use 的开发方

## Sources

- raw/articles/ui-tars-bytedance-2026.md
