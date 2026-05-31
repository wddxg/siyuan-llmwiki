function today() {
  return new Date().toISOString().slice(0, 10);
}

function titleFromPath(filePath) {
  const normalized = String(filePath || "").split("/").filter(Boolean);
  return normalized[normalized.length - 1] || "未命名页面";
}

function blockRef(row) {
  const title = row.title || titleFromPath(row.file);
  if (row.id) {
    return `((${row.id} "${title}"))`;
  }
  return `[[${title}]]`;
}

export function buildDirectoryIndex({ title, summary, rows, sections = [] }) {
  const contents = rows.length
    ? rows
        .map((row) =>
          [
            `- ${blockRef(row)} | path: \`${row.file}\` | updated: ${row.updated || today()}`,
            `  summary: ${row.summary || "Managed doc"}`,
            row.tags ? `  tags: ${row.tags}` : ""
          ]
            .filter(Boolean)
            .join("\n")
        )
        .join("\n")
    : "- _none_ | path: `/_none_` | updated: " + today() + "\n  summary: Empty";

  const table = rows.length
    ? rows
        .map(
          (row) =>
            `| ${row.file} | ${row.title || titleFromPath(row.file)} | ${row.summary || "Managed doc"} | ${row.tags || ""} | ${row.updated || today()} |`
        )
        .join("\n")
    : `| /_none_ | Empty | Empty |  | ${today()} |`;

  const sectionBlocks = sections.length
    ? sections.flatMap((section) => [
        `## ${section.title}`,
        "",
        ...(section.lines && section.lines.length ? section.lines : ["- _none_"]),
        ""
      ])
    : [];

  return [
    `# ${title}`,
    "",
    `> ${summary}`,
    "",
    `Last updated: ${today()}`,
    "",
    ...sectionBlocks,
    "",
    "## Linked Entries",
    "",
    contents,
    "",
    "## Table View",
    "",
    "| File | Title | Summary | Tags | Updated |",
    "|------|-------|---------|------|---------|",
    table,
    ""
  ].join("\n");
}

export function buildLogEntry(operation, description) {
  return `## [${today()}] ${operation} | ${description}`;
}
