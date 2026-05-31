#!/usr/bin/env python3
import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote


def slugify(text: str) -> str:
    value = re.sub(r"[^\w\u4e00-\u9fff-]+", "-", text.strip().lower(), flags=re.UNICODE)
    value = re.sub(r"-{2,}", "-", value).strip("-")
    return value or "raw-note"


def strip_images(markdown: str) -> tuple[str, list[str]]:
    found = []

    def repl(match):
        alt = match.group(1) or ""
        target = match.group(2) or ""
        found.append(target)
        if alt:
            return f"[图片已省略: {alt}]"
        return "[图片已省略]"

    cleaned = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", repl, markdown)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    return cleaned, found


def read_markdown_file(path: Path) -> str:
    for encoding in ("utf-8", "utf-8-sig", "gb18030"):
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    return path.read_text(encoding="utf-8", errors="ignore")


def first_heading(markdown: str) -> str:
    for line in markdown.splitlines():
        stripped = line.strip()
        if stripped.startswith("#"):
            return stripped.lstrip("#").strip()
    return ""


def classify_raw_type(path: Path) -> str:
    name = path.name.lower()
    if any(token in name for token in ("paper", "论文", "arxiv")):
        return "papers"
    if any(token in name for token in ("repo", "github", "仓库")):
        return "repos"
    if any(token in name for token in ("data", "csv", "json", "数据")):
        return "data"
    return "articles"


def build_record(path: Path, source_label: str) -> dict:
    original_markdown = read_markdown_file(path)
    cleaned_markdown, image_refs = strip_images(original_markdown)
    title = first_heading(original_markdown) or path.stem
    raw_type = classify_raw_type(path)
    sidecar_dir = path.with_suffix("")
    sidecar_files = []
    if sidecar_dir.exists() and sidecar_dir.is_dir():
        for item in sorted(sidecar_dir.iterdir()):
            if item.is_file():
                sidecar_files.append(item.name)

    return {
        "title": title,
        "rawType": raw_type,
        "source": source_label,
        "slug": slugify(path.stem),
        "originFile": str(path),
        "originDir": str(sidecar_dir) if sidecar_dir.exists() else "",
        "imageRefs": [unquote(item) for item in image_refs],
        "sidecarFiles": sidecar_files,
        "markdown": cleaned_markdown,
    }


def collect_markdown_files(input_path: Path) -> list[Path]:
    if input_path.is_file():
        return [input_path]
    return sorted(
        [
            item
            for item in input_path.iterdir()
            if item.is_file() and item.suffix.lower() == ".md"
        ],
        key=lambda item: item.name,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare local markdown files into raw-upload batch JSON.")
    parser.add_argument("--input", required=True, help="Markdown file or directory containing markdown files")
    parser.add_argument("--output", required=True, help="Output JSON batch file")
    parser.add_argument("--source-label", default="LOCAL_IMPORT", help="Provenance label stored in raw frontmatter")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        raise SystemExit(f"Input path not found: {input_path}")

    files = collect_markdown_files(input_path)
    if not files:
        raise SystemExit("No markdown files found to prepare.")

    records = [build_record(path, args.source_label) for path in files]
    output = {
        "generatedAt": Path(args.output).name,
        "sourceRoot": str(input_path),
        "count": len(records),
        "records": records,
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"ok": True, "output": str(output_path), "count": len(records)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
