#!/usr/bin/env python3
"""Fix [[wiki links]] → ((id "title")) using exported markdown headings."""
import json, re, urllib.request

BASE = "http://localhost:6806"
TOKEN = "tw88oq87bdxgvng2"

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


def get_nb_id():
    nbs = api("/api/notebook/lsNotebooks", {}).get("notebooks", [])
    for nb in nbs:
        if nb["name"] == "LLM Wiki Demo":
            return nb["id"]
    raise RuntimeError("Notebook not found")


def extract_main_title(markdown):
    """Extract the main content heading (skip SiYuan frontmatter title)."""
    lines = markdown.split("\n")
    in_frontmatter = False
    frontmatter_count = 0
    for line in lines:
        stripped = line.strip()
        if stripped == "---":
            frontmatter_count += 1
            if frontmatter_count >= 2:
                in_frontmatter = False
                continue
            in_frontmatter = True
            continue
        if in_frontmatter:
            continue
        if stripped.startswith("# "):
            title = stripped[2:].strip()
            # Skip if it's a slug-style title (no Chinese chars, has hyphens)
            if re.match(r'^[a-z0-9\-]+$', title):
                continue
            return title
    return ""


def main():
    nb_id = get_nb_id()

    # 1. Get all docs
    rows = api("/api/query/sql", {
        "stmt": f"SELECT id, hpath FROM blocks WHERE box = '{nb_id}' AND type = 'd' ORDER BY hpath"
    }) or []
    print(f"Found {len(rows)} documents")

    # 2. Build title→id map by exporting each doc and extracting title
    title_to_id = {}
    doc_cache = {}  # id → exported markdown

    for r in rows:
        doc_id = r["id"]
        hpath = r["hpath"]
        try:
            result = api("/api/export/exportMdContent", {"id": doc_id})
            md = result.get("content", "")
        except Exception:
            md = ""
        doc_cache[doc_id] = md

        title = extract_main_title(md)
        if title:
            title_to_id[title] = doc_id

        # Also map hpath segment as fallback
        slug = hpath.split("/")[-1] if hpath else ""
        if slug and slug not in title_to_id:
            title_to_id[slug] = doc_id

        # Map YAML title field too
        yaml_match = re.search(r'^title:\s*"?([^"\n]+)"?\s*$', md, re.MULTILINE)
        if yaml_match:
            yaml_title = yaml_match.group(1).strip()
            if yaml_title and yaml_title not in title_to_id:
                title_to_id[yaml_title] = doc_id

    print(f"Title map: {len(title_to_id)} entries")
    # Show some example mappings
    for title, tid in list(title_to_id.items())[:8]:
        print(f"  {title} → {tid[:8]}...")

    # 3. Replace [[links]] in each doc
    total_replaced = 0
    docs_updated = 0

    for r in rows:
        doc_id = r["id"]
        hpath = r["hpath"]
        md = doc_cache.get(doc_id, "")

        if "[[" not in md:
            continue

        in_fence = False
        new_lines = []
        replaced_in_doc = 0

        for line in md.split("\n"):
            if re.match(r"^\s*```", line):
                in_fence = not in_fence
                new_lines.append(line)
                continue
            if in_fence:
                new_lines.append(line)
                continue

            def repl(m):
                nonlocal replaced_in_doc
                target = m.group(1).strip()
                label = (m.group(2) or target).strip()
                tid = title_to_id.get(target)
                if tid:
                    replaced_in_doc += 1
                    safe = label.replace('"', "'").replace("\n", " ")
                    return f'(({tid} "{safe}"))'
                return m.group(0)

            line = re.sub(r"\[\[([^[\]|]+?)(?:\|([^[\]]+?))?\]\]", repl, line)
            new_lines.append(line)

        if replaced_in_doc > 0:
            new_md = "\n".join(new_lines)
            api("/api/block/updateBlock", {"id": doc_id, "data": new_md, "dataType": "markdown"})
            total_replaced += replaced_in_doc
            docs_updated += 1
            print(f"  {hpath}: {replaced_in_doc} links → block refs")

    print(f"\nResult: {docs_updated} docs updated, {total_replaced} links converted")

    # 4. Rebuild index pages with real block refs
    print("\nRebuilding index pages...")

    hpath_to_id = {r["hpath"]: r["id"] for r in rows}
    total_idx_id = hpath_to_id.get("/总索引")

    def ref(did, title):
        return f'(({did} "{title.replace(chr(34), chr(39))}"))' if did else title

    # Collect entries per category
    categories = {
        "/实体": [], "/概念": [], "/对比": [], "/问答归档": []
    }
    for r in rows:
        hpath = r["hpath"]
        doc_id = r["id"]
        md = doc_cache.get(doc_id, "")
        title = extract_main_title(md) or hpath.split("/")[-1]
        sm = re.search(r'summary:\s*"([^"]*)"', md)
        summary = sm.group(1)[:80] if sm else ""

        for cat_path in categories:
            if hpath.startswith(cat_path + "/") and hpath != cat_path:
                categories[cat_path].append((doc_id, title, summary))

    # Rebuild each category index
    for cat_path, entries in categories.items():
        cat_id = hpath_to_id.get(cat_path)
        if not cat_id:
            continue
        cat_title = cat_path.lstrip("/")
        lines = [
            f"# {cat_title}",
            "",
            f"> {cat_title}页面集合（{len(entries)} 篇）",
            "",
            f"- {ref(total_idx_id, '返回总索引')}",
            "",
        ]
        for did, title, summary in entries:
            lines.append(f"- {ref(did, title)} — {summary}")
        api("/api/block/updateBlock", {"id": cat_id, "data": "\n".join(lines), "dataType": "markdown"})
        print(f"  {cat_path}: {len(entries)} entries")

    # Rebuild 总索引
    if total_idx_id:
        lines = [
            "# LLM Wiki Demo — 知识库总索引",
            "",
            "> 基于思源笔记的 AI 知识库示例",
            "",
            "Last updated: 2026-05-30",
            "",
            "## 导航",
            "",
            f"- {ref(hpath_to_id.get('/结构约定'), '结构约定')}",
            f"- {ref(hpath_to_id.get('/操作日志'), '操作日志')}",
            "",
        ]
        for cat_path, entries in categories.items():
            cat_id = hpath_to_id.get(cat_path)
            cat_title = cat_path.lstrip("/")
            lines += [
                f"## {cat_title} ({len(entries)})",
                "",
            ]
            for did, title, summary in entries:
                lines.append(f"- {ref(did, title)} — {summary}")
            lines.append("")

        api("/api/block/updateBlock", {"id": total_idx_id, "data": "\n".join(lines), "dataType": "markdown"})
        print("  /总索引 rebuilt")

    print("\n✓ Done! Open SiYuan and check the 链接 graph and backlinks panel.")


if __name__ == "__main__":
    main()
