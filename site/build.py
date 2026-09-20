#!/usr/bin/env python3
"""
EAYDI site builder — OPTIONAL.

The site in the repo root is plain static HTML; you can edit those files
directly and ignore this script entirely. It exists only so the header,
navigation and footer stay identical across every page: edit site/base.html
plus a body fragment in site/pages/, run `python3 site/build.py`, and the
root .html files are regenerated.

No dependencies. Python 3.8+.
"""

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
SITE_URL = "https://eaydi.org/"

# slug, nav label, short drawer hint
NAV = [
    ("index", "Home", "01"),
    ("about", "About", "02"),
    ("programmes", "Programmes", "03"),
    ("impact", "Impact", "04"),
    ("gallery", "Gallery", "05"),
    ("contact", "Contact", "06"),
]

FRONT = re.compile(r"^<!--\s*(.*?)\s*-->\s*", re.S)


def parse(text):
    """Pull the leading HTML comment off a page fragment as key: value meta."""
    meta, body = {}, text
    m = FRONT.match(text)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip().lower()] = v.strip()
        body = text[m.end():]
    return meta, body.rstrip() + "\n"


def nav_html(current):
    out = []
    for slug, label, _ in NAV:
        cur = ' aria-current="page"' if slug == current else ""
        out.append(f'      <li><a href="{slug}.html"{cur}>{label}</a></li>')
    return "\n".join(out)


def drawer_html(current):
    out = []
    for slug, label, num in NAV:
        cur = ' aria-current="page"' if slug == current else ""
        out.append(
            f'    <li><a href="{slug}.html"{cur}>{label}<span>{num}</span></a></li>'
        )
    return "\n".join(out)


def main():
    base = (SITE / "base.html").read_text(encoding="utf-8")
    pages = sorted((SITE / "pages").glob("*.html"))
    if not pages:
        raise SystemExit("No page fragments found in site/pages/")

    for page in pages:
        slug = page.stem
        meta, body = parse(page.read_text(encoding="utf-8"))
        html = base
        for token, value in {
            "{{TITLE}}": meta.get("title", "EAYDI"),
            "{{DESC}}": meta.get("desc", ""),
            "{{OGIMG}}": meta.get("ogimg", "outreach-advocacy.jpg"),
            "{{CANON}}": SITE_URL + ("" if slug == "index" else slug + ".html"),
            "{{NAV}}": nav_html(meta.get("nav", slug)),
            "{{DRAWER}}": drawer_html(meta.get("nav", slug)),
            "{{BODY}}": body,
        }.items():
            html = html.replace(token, value)

        left = re.findall(r"\{\{[A-Z]+\}\}", html)
        if left:
            raise SystemExit(f"{slug}: unreplaced tokens {sorted(set(left))}")

        (ROOT / f"{slug}.html").write_text(html, encoding="utf-8")
        print(f"  built {slug}.html  ({len(html):,} bytes)")

    print(f"\nDone — {len(pages)} pages written to {ROOT}")


if __name__ == "__main__":
    main()
