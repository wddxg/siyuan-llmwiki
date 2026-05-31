---
title: "Computer Use Agent"
category: concept
created: 2026-05-30
updated: 2026-05-30
tags: [computer-use, gui-agent, vision, autonomous]
aliases: [computer-use, gui-automation, screen-agent]
confidence: medium
summary: "Computer Use Agent 通过视觉理解直接操作桌面/浏览器 GUI，是 Agent 能力的重大突破。"
---

# Computer Use Agent

Computer Use Agent 让 AI 像人一样"看屏幕、动鼠标"，直接操作任意应用程序。

## 技术原理

```
屏幕截图 → 多模态 LLM 理解 → 生成操作指令 → 执行鼠标/键盘操作 → 再次截图验证
```

### 关键组件

1. **视觉感知**：多模态模型理解屏幕截图中的元素、文本、布局
2. **任务规划**：将高层指令分解为 GUI 操作步骤
3. **操作执行**：精确的鼠标坐标点击、键盘输入、拖拽
4. **反馈循环**：截图验证操作结果，失败时调整策略

## 主要实现

| 项目 | 机构 | 特点 |
|------|------|------|
| Claude Computer Use | [[Anthropic]] | 商业级，高精度 |
| [[UI-TARS]] | ByteDance | 开源，多平台 |
| CUA | 社区 | 开源基础设施 |
| Browser Use | 社源 | 浏览器专用 |

→ [[UI-TARS]] — 最热的开源实现

## 应用场景

1. **自动化测试**：替代传统 Selenium 测试，不需要定位元素
2. **RPA**：操作企业内部系统（ERP、CRM 等）
3. **数据采集**：操作浏览器采集需要登录的数据
4. **辅助操作**：帮用户完成复杂的软件操作流程

## 核心挑战

- **坐标精度**：屏幕分辨率和 DPI 差异导致点击偏移
- **延迟**：每步操作需要截图 → 推理 → 执行，延迟较高
- **可靠性**：复杂操作链的错误累积
- **安全性**：Agent 有完整的桌面操作权限，需要沙箱隔离 → [[Agent 治理]]

## 与传统自动化的对比

| 维度 | Selenium/Playwright | Computer Use Agent |
|------|---------------------|-------------------|
| 需要元素定位 | 是（CSS/XPath） | 否（视觉理解） |
| 适应 UI 变化 | 差（选择器失效） | 强（理解意图） |
| 处理未知应用 | 不支持 | 支持 |
| 速度 | 快 | 较慢 |
| 可靠性 | 高 | 中 |

## See Also

- [[UI-TARS]] — 开源 Computer Use 实现
- [[Agent 框架]] — Computer Use 的 Agent 基础设施
- [[Agent 治理]] — Computer Use 的安全问题

## Sources

- raw/articles/computer-use-agents-2026.md
