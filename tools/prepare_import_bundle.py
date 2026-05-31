#!/usr/bin/env python3
import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import unquote


def slugify(text: str) -> str:
    value = re.sub(r"[^\w\u4e00-\u9fff-]+", "-", text.strip().lower(), flags=re.UNICODE)
    value = re.sub(r"-{2,}", "-", value).strip("-")
    return value or "raw-note"


def read_text(path: Path) -> str:
    for encoding in ("utf-8", "utf-8-sig", "gb18030"):
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    return path.read_text(encoding="utf-8", errors="ignore")


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
    return cleaned, [unquote(item) for item in found]


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


def build_raw_record(path: Path, source_label: str) -> dict:
    original = read_text(path)
    cleaned, image_refs = strip_images(original)
    sidecar_dir = path.with_suffix("")
    sidecar_files = []
    if sidecar_dir.exists() and sidecar_dir.is_dir():
        sidecar_files = sorted(item.name for item in sidecar_dir.iterdir() if item.is_file())
    return {
        "title": first_heading(original) or path.stem,
        "rawType": classify_raw_type(path),
        "source": source_label,
        "slug": slugify(path.stem),
        "originFile": str(path),
        "originDir": str(sidecar_dir) if sidecar_dir.exists() else "",
        "imageRefs": image_refs,
        "sidecarFiles": sidecar_files,
        "markdown": cleaned,
    }


def build_tree_file(path: Path, root_dir: Path) -> dict:
    markdown = read_text(path)
    relative = path.relative_to(root_dir.parent).as_posix()
    return {
        "virtualPath": relative,
        "originFile": str(path),
        "markdown": markdown,
    }


def collect_markdown_files(root: Path) -> list[Path]:
    return sorted(
        [item for item in root.rglob("*.md") if item.is_file()],
        key=lambda item: item.as_posix(),
    )


def detect_mode(paths: list[Path]) -> tuple[str, str]:
    if len(paths) == 1 and paths[0].is_dir():
        root = paths[0]
        anchor = root / f"{root.name}.md"
        if anchor.exists():
            return "tree_upload", "single directory with same-name markdown anchor"
        return "raw_batch", "single directory without same-name markdown anchor"

    all_markdown = []
    for path in paths:
        if path.is_dir():
            all_markdown.extend(collect_markdown_files(path))
        else:
            all_markdown.append(path)

    if all(item.suffix.lower() == ".md" for item in all_markdown):
        return "raw_batch", "multiple markdown files or directories flattened into raw batch"
    raise ValueError("Only markdown files or directories containing markdown files are supported.")


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare upload bundle from local markdown file paths.")
    parser.add_argument("--path", action="append", required=True, help="Markdown file or directory path; repeatable")
    parser.add_argument("--output", required=True, help="Output JSON bundle file")
    parser.add_argument("--source-label", default="LOCAL_IMPORT", help="Provenance label for raw ingest mode")
    args = parser.parse_args()

    paths = [Path(item) for item in args.path]
    for path in paths:
        if not path.exists():
            raise SystemExit(f"Path not found: {path}")

    mode, reason = detect_mode(paths)
    output = {
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "mode": mode,
        "modeReason": reason,
        "inputs": [str(path) for path in paths],
    }

    if mode == "tree_upload":
        root_dir = paths[0]
        output["files"] = [build_tree_file(item, root_dir) for item in collect_markdown_files(root_dir)]
    else:
        markdown_files = []
        for path in paths:
            if path.is_dir():
                markdown_files.extend(collect_markdown_files(path))
            elif path.suffix.lower() == ".md":
                markdown_files.append(path)
        output["records"] = [build_raw_record(item, args.source_label) for item in markdown_files]

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"ok": True, "output": str(output_path), "mode": mode}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
