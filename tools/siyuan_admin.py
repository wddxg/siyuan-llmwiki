#!/usr/bin/env python3
import argparse
import json
import sys
import urllib.request
from pathlib import Path


def call(base, token, path, payload):
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(
        base.rstrip("/") + path,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    if data.get("code") not in (0, None):
        raise RuntimeError(json.dumps(data, ensure_ascii=False))
    return data.get("data", data)


def list_notebooks(args):
    data = call(args.base, args.token, "/api/notebook/lsNotebooks", {})
    items = data.get("notebooks", data)
    for item in items:
        print(f"{item.get('id')}\t{item.get('name')}")


def list_docs(args):
    stmt = (
        "select id, hpath, content, updated from blocks "
        f"where box = '{args.notebook}' and type = 'd' order by hpath asc;"
    )
    rows = call(args.base, args.token, "/api/query/sql", {"stmt": stmt}) or []
    for row in rows:
        print(f"{row.get('id')}\t{row.get('hpath')}\t{row.get('updated')}\t{row.get('content')}")


def list_doc_paths(base, token, notebook):
    stmt = (
        "select hpath from blocks "
        f"where box = '{notebook}' and type = 'd' order by hpath asc;"
    )
    rows = call(base, token, "/api/query/sql", {"stmt": stmt}) or []
    return [row.get("hpath") for row in rows if row.get("hpath")]


def rename_notebook(args):
    result = call(
        args.base,
        args.token,
        "/api/notebook/renameNotebook",
        {"notebook": args.notebook, "name": args.name},
    )
    print(json.dumps(result, ensure_ascii=False))


def remove_notebook(args):
    result = call(
        args.base,
        args.token,
        "/api/notebook/removeNotebook",
        {"notebook": args.notebook},
    )
    print(json.dumps(result, ensure_ascii=False))


def get_ids(args):
    data = call(
        args.base,
        args.token,
        "/api/filetree/getIDsByHPath",
        {"notebook": args.notebook, "path": args.path},
    )
    print(json.dumps(data, ensure_ascii=False))


def export_md(args):
    data = call(
        args.base,
        args.token,
        "/api/export/exportMdContent",
        {"id": args.id},
    )
    print(data.get("content", ""))


def ensure_doc(args):
    content = Path(args.file).read_text(encoding="utf-8")
    ids = call(
        args.base,
        args.token,
        "/api/filetree/getIDsByHPath",
        {"notebook": args.notebook, "path": args.path},
    )
    if ids:
        result = call(
            args.base,
            args.token,
            "/api/block/updateBlock",
            {"id": ids[0], "data": content, "dataType": "markdown"},
        )
        print(json.dumps({"updated": True, "id": ids[0], "result": result}, ensure_ascii=False))
        return
    result = call(
        args.base,
        args.token,
        "/api/filetree/createDocWithMd",
        {"notebook": args.notebook, "path": args.path, "markdown": content},
    )
    print(json.dumps({"created": True, "result": result}, ensure_ascii=False))


def remove_doc(args):
    result = call(
        args.base,
        args.token,
        "/api/filetree/removeDoc",
        {"notebook": args.notebook, "path": args.path},
    )
    print(json.dumps(result, ensure_ascii=False))


def remove_doc_by_id(args):
    result = call(
        args.base,
        args.token,
        "/api/filetree/removeDocByID",
        {"id": args.id},
    )
    print(json.dumps(result, ensure_ascii=False))


def remove_doc_prefix(args):
    prefixes = [prefix.rstrip("/") for prefix in args.prefix]
    all_paths = list_doc_paths(args.base, args.token, args.notebook)
    targets = [
        path for path in all_paths
        if any(path == prefix or path.startswith(prefix + "/") for prefix in prefixes)
    ]
    targets.sort(key=lambda item: (item.count("/"), item), reverse=True)
    removed = []
    for path in targets:
        call(
            args.base,
            args.token,
            "/api/filetree/removeDoc",
            {"notebook": args.notebook, "path": path},
        )
        removed.append(path)
    print(json.dumps({"removed": removed, "count": len(removed)}, ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", required=True)
    parser.add_argument("--token", required=True)
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("list-notebooks").set_defaults(func=list_notebooks)

    p = sub.add_parser("list-docs")
    p.add_argument("--notebook", required=True)
    p.set_defaults(func=list_docs)

    p = sub.add_parser("rename-notebook")
    p.add_argument("--notebook", required=True)
    p.add_argument("--name", required=True)
    p.set_defaults(func=rename_notebook)

    p = sub.add_parser("remove-notebook")
    p.add_argument("--notebook", required=True)
    p.set_defaults(func=remove_notebook)

    p = sub.add_parser("get-ids")
    p.add_argument("--notebook", required=True)
    p.add_argument("--path", required=True)
    p.set_defaults(func=get_ids)

    p = sub.add_parser("export-md")
    p.add_argument("--id", required=True)
    p.set_defaults(func=export_md)

    p = sub.add_parser("ensure-doc")
    p.add_argument("--notebook", required=True)
    p.add_argument("--path", required=True)
    p.add_argument("--file", required=True)
    p.set_defaults(func=ensure_doc)

    p = sub.add_parser("remove-doc")
    p.add_argument("--notebook", required=True)
    p.add_argument("--path", required=True)
    p.set_defaults(func=remove_doc)

    p = sub.add_parser("remove-doc-by-id")
    p.add_argument("--id", required=True)
    p.set_defaults(func=remove_doc_by_id)

    p = sub.add_parser("remove-doc-prefix")
    p.add_argument("--notebook", required=True)
    p.add_argument("--prefix", action="append", required=True)
    p.set_defaults(func=remove_doc_prefix)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
