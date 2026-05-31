#!/usr/bin/env python3
"""Push all example wiki content into a fresh SiYuan notebook."""
import json
import sys
import urllib.request
from pathlib import Path

BASE = "http://localhost:6806"
TOKEN = "tw88oq87bdxgvng2"
WIKI_NAME = "LLM Wiki Demo"

def api(path, payload=None):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(payload or {}).encode(),
        headers={"Authorization": f"Token {TOKEN}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read())
    if data.get("code") not in (0, None):
        raise RuntimeError(json.dumps(data, ensure_ascii=False))
    return data.get("data", data)


def main():
    # 1. Remove all existing notebooks
    notebooks = api("/api/notebook/lsNotebooks", {}).get("notebooks", [])
    for nb in notebooks:
        print(f"Removing notebook: {nb['name']} ({nb['id']})")
        api("/api/notebook/removeNotebook", {"notebook": nb["id"]})

    # 2. Create new notebook
    result = api("/api/notebook/createNotebook", {"name": WIKI_NAME})
    nb_id = result["notebook"]["id"]
    print(f"Created notebook: {WIKI_NAME} ({nb_id})")
    api("/api/notebook/openNotebook", {"notebook": nb_id})

    # 3. Create structure pages
    structure = [
        ("/结构约定", f"# 结构约定\n\n## 知识库元信息\n\n- 名称: {WIKI_NAME}\n- 原始资料策略: 不可变\n- 编译策略: 增量维护\n\n## 内部结构\n\n- 根文件: 结构约定、总索引、操作日志\n- 主分区: 收件箱、原始资料、实体、概念、对比、问答归档\n"),
        ("/总索引", f"# 知识库总索引\n\n> {WIKI_NAME} 的主入口\n\nLast updated: 2026-05-30\n"),
        ("/操作日志", "# 操作日志\n\n## [2026-05-30] bootstrap | 初始化 LLM Wiki Demo 知识库\n"),
        ("/收件箱", "# 收件箱\n\n> 待处理资料入口\n"),
        ("/原始资料", "# 原始资料\n\n> 不可变原始资料注册表\n"),
        ("/原始资料/文章", "# 文章\n"),
        ("/原始资料/论文", "# 论文\n"),
        ("/原始资料/仓库", "# 仓库\n"),
        ("/原始资料/笔记", "# 笔记\n"),
        ("/原始资料/数据", "# 数据\n"),
        ("/实体", "# 实体\n\n> 实体页集合\n"),
        ("/概念", "# 概念\n\n> 概念、主题与综述页\n"),
        ("/概念/参考", "# 参考\n"),
        ("/概念/论题", "# 论题\n"),
        ("/对比", "# 对比\n\n> 对比分析页\n"),
        ("/问答归档", "# 问答归档\n\n> 沉淀后的问答与结论\n"),
    ]

    for path, md in structure:
        api("/api/filetree/createDocWithMd", {"notebook": nb_id, "path": path, "markdown": md})
        print(f"  Created: {path}")

    # 4. Push raw sources
    raw_dir = Path("D:/A/siyuan-llmwiki/examples/raw")
    raw_type_map = {"articles": "文章", "papers": "论文", "repos": "仓库", "notes": "笔记", "data": "数据"}
    raw_count = 0
    for type_dir in sorted(raw_dir.iterdir()):
        if not type_dir.is_dir():
            continue
        cn_type = raw_type_map.get(type_dir.name, type_dir.name)
        for md_file in sorted(type_dir.glob("*.md")):
            content = md_file.read_text(encoding="utf-8")
            slug = md_file.stem
            path = f"/原始资料/{cn_type}/{slug}"
            api("/api/filetree/createDocWithMd", {"notebook": nb_id, "path": path, "markdown": content})
            raw_count += 1
            print(f"  Raw: {path}")

    # 5. Push wiki pages
    wiki_dir = Path("D:/A/siyuan-llmwiki/examples/wiki")
    cat_map = {"entities": "实体", "concepts": "概念", "comparisons": "对比", "queries": "问答归档"}
    wiki_count = 0
    for cat_dir in sorted(wiki_dir.iterdir()):
        if not cat_dir.is_dir():
            continue
        cn_cat = cat_map.get(cat_dir.name, cat_dir.name)
        for md_file in sorted(cat_dir.glob("*.md")):
            content = md_file.read_text(encoding="utf-8")
            slug = md_file.stem
            path = f"/{cn_cat}/{slug}"
            api("/api/filetree/createDocWithMd", {"notebook": nb_id, "path": path, "markdown": content})
            wiki_count += 1
            print(f"  Wiki: {path}")

    print(f"\nDone! {raw_count} raw + {wiki_count} wiki = {raw_count + wiki_count} pages pushed.")


if __name__ == "__main__":
    main()
