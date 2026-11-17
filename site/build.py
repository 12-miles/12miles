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
import struct

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
SITE_URL = "https://eaydi.com/"

# slug, nav label. The logo links home, so "Home" only appears in the mobile drawer.
NAV = [
    ("about", "About"),
    ("programmes", "Programmes"),
    ("impact", "Impact"),
    ("gallery", "Gallery"),
    ("get-involved", "Get involved"),
    ("contact", "Contact"),
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
    for slug, label in NAV:
        cur = ' aria-current="page"' if slug == current else ""
        out.append(f'      <li><a href="{slug}.html"{cur}>{label}</a></li>')
    return "\n".join(out)


def drawer_html(current):
    out = []
    for i, (slug, label) in enumerate([("index", "Home")] + NAV, start=1):
        cur = ' aria-current="page"' if slug == current else ""
        out.append(
            f'    <li><a href="{slug}.html"{cur}>{label}<span aria-hidden="true">{i:02d}</span></a></li>'
        )
    return "\n".join(out)


def jpeg_size(path):
    """Width and height of a JPEG, read from its header (no imaging library needed)."""
    with open(path, "rb") as f:
        data = f.read()
    i = 2
    while i < len(data):
        if data[i] != 0xFF:
            i += 1
            continue
        marker = data[i + 1]
        if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
            h, w = struct.unpack(">HH", data[i + 5:i + 9])
            return w, h
        i += 2 + struct.unpack(">H", data[i + 2:i + 4])[0]
    return None


IMG = re.compile(r"<img\b[^>]*>")


def enhance_images(html):
    """Give every photo explicit dimensions (no layout shift), async decoding,
    and a small/large srcset so phones do not download desktop-sized files."""

    def fix(m):
        tag = m.group(0)
        src = re.search(r'src="(assets/img/[^"]+\.jpg)"', tag)
        if not src:
            return tag
        path = ROOT / src.group(1)
        if not path.exists():
            return tag
        size = jpeg_size(path)
        extra = ""
        if size:
            tag = re.sub(r'\s(?:width|height)="\d+"', "", tag)
            extra += f' width="{size[0]}" height="{size[1]}"'
        if "decoding=" not in tag:
            extra += ' decoding="async"'
        thumb = ROOT / "assets/img/thumbs" / path.name
        if "srcset=" not in tag and "/thumbs/" not in src.group(1) and thumb.exists() and size:
            tw = jpeg_size(thumb)[0]
            extra += (
                f' srcset="assets/img/thumbs/{path.name} {tw}w, {src.group(1)} {size[0]}w"'
                ' sizes="(min-width: 900px) 600px, 92vw"'
            )
        return tag[:-1].rstrip() + extra + ">"

    return IMG.sub(fix, html)


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
            "{{SITE}}": SITE_URL,
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

        html = enhance_images(html)
        (ROOT / f"{slug}.html").write_text(html, encoding="utf-8")
        print(f"  built {slug}.html  ({len(html):,} bytes)")

    print(f"\nDone — {len(pages)} pages written to {ROOT}")


if __name__ == "__main__":
    main()
