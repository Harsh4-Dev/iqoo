#!/usr/bin/env python3
"""
Render a Markdown document to a print-ready PDF.

    python tools/md2pdf.py ARCHITECTURE.md docs/EduQoo-Architecture.pdf \
        --title "EduQoo — Architecture" \
        --subtitle "Technical reference for the Android application"

Uses the Markdown package for the HTML and headless Chrome/Edge for the PDF,
so there is no native toolchain to install. Output is A4, black on white,
no colour beyond a single muted accent for rules and table headers.
"""

import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path

import markdown

# --------------------------------------------------------------------------
# Print stylesheet. Deliberately plain: this is a document, not a web page.
# --------------------------------------------------------------------------
CSS = """
@page {
  size: A4;
  margin: 20mm 18mm 18mm 18mm;
}

:root {
  --ink:    #1a1d1e;
  --muted:  #5d6469;
  --rule:   #d9dee0;
  --accent: #23403a;
  --codebg: #f5f7f7;
}

* { box-sizing: border-box; }

html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

body {
  margin: 0;
  background: #fff;
  color: var(--ink);
  font-family: "Segoe UI", -apple-system, "Helvetica Neue", Arial, sans-serif;
  font-size: 10.2pt;
  line-height: 1.62;
  -webkit-font-smoothing: antialiased;
}

/* ---------- title block ---------- */
.cover { margin-bottom: 26pt; padding-bottom: 16pt; border-bottom: 2px solid var(--accent); }
.cover h1 {
  margin: 0 0 6pt;
  font-size: 26pt; font-weight: 700; letter-spacing: -.6pt; line-height: 1.15;
  color: var(--ink); border: 0; padding: 0;
}
.cover .sub { margin: 0 0 14pt; font-size: 12pt; color: var(--muted); font-weight: 400; }
.cover .meta {
  font-size: 8.4pt; color: var(--muted);
  text-transform: uppercase; letter-spacing: .09em;
}
.cover .meta span + span::before { content: "·"; margin: 0 7pt; color: var(--rule); }

/* ---------- headings ---------- */
h1, h2, h3, h4 {
  color: var(--ink); font-weight: 700; letter-spacing: -.2pt;
  break-after: avoid; page-break-after: avoid;
}
h1 {
  font-size: 17pt; margin: 26pt 0 10pt;
  padding-bottom: 5pt; border-bottom: 1px solid var(--rule);
}
h2 {
  font-size: 13.5pt; margin: 20pt 0 8pt;
  padding-bottom: 4pt; border-bottom: 1px solid var(--rule);
}
h3 { font-size: 11.2pt; margin: 15pt 0 5pt; }
h4 { font-size: 10.2pt; margin: 12pt 0 4pt; color: var(--muted); }

p { margin: 0 0 8pt; orphans: 2; widows: 2; }

a { color: var(--ink); text-decoration: none; border-bottom: .5pt solid var(--rule); }

strong { font-weight: 700; }
em { font-style: italic; }

/* ---------- lists ---------- */
ul, ol { margin: 0 0 9pt; padding-left: 17pt; }
li { margin-bottom: 3pt; }
li > ul, li > ol { margin-top: 3pt; margin-bottom: 2pt; }

/* ---------- code ---------- */
code {
  font-family: Consolas, "SF Mono", "Cascadia Mono", "Courier New", monospace;
  font-size: 8.8pt;
  background: var(--codebg);
  padding: 1pt 3pt;
  border-radius: 2pt;
}
pre {
  background: var(--codebg);
  border: .5pt solid var(--rule);
  border-left: 2.5pt solid var(--accent);
  border-radius: 2pt;
  padding: 9pt 11pt;
  margin: 0 0 11pt;
  overflow: visible;
  white-space: pre;
  break-inside: avoid; page-break-inside: avoid;
}
pre code {
  background: none; padding: 0; font-size: 8.1pt; line-height: 1.42;
}

/* ---------- tables ---------- */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 12pt;
  font-size: 9.2pt;
  break-inside: auto; page-break-inside: auto;
}
thead { display: table-header-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
th {
  text-align: left;
  background: var(--codebg);
  color: var(--accent);
  font-weight: 700;
  font-size: 8.4pt;
  text-transform: uppercase;
  letter-spacing: .06em;
  padding: 6pt 8pt;
  border-bottom: 1pt solid var(--accent);
}
td {
  padding: 6pt 8pt;
  border-bottom: .5pt solid var(--rule);
  vertical-align: top;
}
td code { font-size: 8.2pt; }

/* ---------- rules and quotes ---------- */
hr { border: 0; border-top: 1px solid var(--rule); margin: 18pt 0; }
blockquote {
  margin: 0 0 10pt; padding: 2pt 0 2pt 12pt;
  border-left: 2pt solid var(--rule); color: var(--muted);
}

/* ---------- running footer, repeated on every page ---------- */
.footer {
  position: fixed;
  bottom: -12mm; left: 0; right: 0;
  font-size: 7.6pt; color: var(--muted);
  border-top: .5pt solid var(--rule);
  padding-top: 4pt;
  display: flex; justify-content: space-between;
}
"""

HTML = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{title}</title>
<style>{css}</style></head>
<body>
<div class="footer"><span>{title}</span><span>{footer_right}</span></div>
<header class="cover">
  <h1>{title}</h1>
  {sub}
  <div class="meta">{meta}</div>
</header>
{body}
</body></html>
"""


# --------------------------------------------------------------------------
# Box-drawing characters are not reliably monospaced across PDF fonts — the
# same fallback problem that skews them on the web. Inside <pre> only, swap
# them for ASCII of identical width so diagrams line up in any renderer.
# The Markdown source is left alone; it renders fine on GitHub.
# --------------------------------------------------------------------------
BOX = {
    "─": "-", "│": "|",
    "┌": "+", "┐": "+", "└": "+", "┘": "+",
    "├": "+", "┤": "+", "┬": "+", "┴": "+", "┼": "+",
    "►": ">", "▼": "v", "▲": "^",
    "→": ">", "←": "<", "↓": "v", "↑": "^",
}
BOX_TABLE = str.maketrans(BOX)


def asciify_pre(html: str) -> str:
    """Apply the swap to the contents of every <pre> block, nothing else."""
    return re.sub(
        r"(<pre[^>]*>)(.*?)(</pre>)",
        lambda m: m.group(1) + m.group(2).translate(BOX_TABLE) + m.group(3),
        html,
        flags=re.S,
    )


def find_browser() -> str:
    env = os.environ.get("MD2PDF_BROWSER")
    if env and Path(env).exists():
        return env
    candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    for c in candidates:
        if Path(c).exists():
            return c
    for name in ("google-chrome", "chromium", "chromium-browser", "msedge"):
        found = shutil.which(name)
        if found:
            return found
    sys.exit("No Chrome or Edge found. Set MD2PDF_BROWSER to a browser executable.")


def strip_leading_h1(md_text: str) -> tuple[str, str | None]:
    """The cover block carries the title, so drop a duplicate leading '# '."""
    lines = md_text.split("\n")
    for i, line in enumerate(lines):
        if line.strip():
            if line.startswith("# "):
                return "\n".join(lines[i + 1:]).lstrip("\n"), line[2:].strip()
            break
    return md_text, None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    ap.add_argument("--title")
    ap.add_argument("--subtitle", default="")
    ap.add_argument("--meta", default="")
    args = ap.parse_args()

    src = Path(args.src)
    raw = src.read_text(encoding="utf-8")
    body_md, found_title = strip_leading_h1(raw)
    title = args.title or found_title or src.stem

    html_body = markdown.markdown(
        body_md,
        extensions=["tables", "fenced_code", "sane_lists", "attr_list"],
        output_format="html5",
    )

    html_body = asciify_pre(html_body)

    meta = args.meta or " ".join(
        f"<span>{p}</span>" for p in [
            "EduQoo",
            "iQOO Hackathon 2026 · Track 02",
            date.today().strftime("%d %B %Y"),
        ]
    )
    if "<span>" not in meta:
        meta = f"<span>{meta}</span>"

    doc = HTML.format(
        title=title,
        css=CSS,
        sub=f'<p class="sub">{args.subtitle}</p>' if args.subtitle else "",
        meta=meta,
        body=html_body,
        footer_right="github.com/Harsh4-Dev/iqoo",
    )

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / "page.html"
        page.write_text(doc, encoding="utf-8")
        browser = find_browser()
        cmd = [
            browser, "--headless", "--disable-gpu", "--no-sandbox",
            "--no-pdf-header-footer",
            "--run-all-compositor-stages-before-draw",
            "--virtual-time-budget=6000",
            f"--print-to-pdf={out.resolve()}",
            page.resolve().as_uri(),
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if not out.exists():
            # older builds spell the flag differently
            cmd[cmd.index("--no-pdf-header-footer")] = "--print-to-pdf-no-header"
            res = subprocess.run(cmd, capture_output=True, text=True)
        if not out.exists():
            sys.exit(f"PDF was not produced.\n{res.stdout}\n{res.stderr}")

    print(f"{out}  ({out.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
