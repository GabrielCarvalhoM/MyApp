#!/usr/bin/env python3
"""Generate Resources/<lang>.lproj/Localizable.strings from copy.psv (key, pt-BR, en, es). Run: python3 -I Copy/gen_strings.py (package root)."""
import os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rows = []
for n, line in enumerate(open(os.path.join(root, "Copy", "copy.psv"), encoding="utf-8"), 1):
    line = line.rstrip("\n")
    if not line or line.startswith("#"): continue
    parts = line.split("|")
    if len(parts) != 4: sys.exit(f"copy.psv:{n}: expected 4 columns, got {len(parts)}")
    rows.append(parts)
keys = [r[0] for r in rows]
dup = {k for k in keys if keys.count(k) > 1}
if dup: sys.exit(f"duplicate keys: {sorted(dup)}")
esc = lambda s: s.replace("\\", "\\\\").replace('"', '\\"')
for i, lang in enumerate(["pt-BR", "en", "es"], 1):
    d = os.path.join(root, "Sources", "RepMileUI", "Resources", f"{lang}.lproj"); os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "Localizable.strings"), "w", encoding="utf-8") as f:
        f.write("/* Generated from Copy/copy.psv by Copy/gen_strings.py. Do not edit. */\n")
        for r in rows: f.write(f'"{esc(r[0])}" = "{esc(r[i])}";\n')
print(f"{len(rows)} keys x 3 languages")
