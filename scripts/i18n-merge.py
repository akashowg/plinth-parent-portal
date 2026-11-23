"""Merge translation work files into catalogs, with checks.
Work files: lib/i18n/work/<lang>.<n>.json  →  {"<index>": "<translation>", ...}
Checks: index exists, translation non-empty, same {placeholders} as English, same count of \\n, no Latin-only
copy of the English (unless the English is a brand/code such as "PLINTH"), and the right script for the language.
Run: python3 scripts/i18n-merge.py
"""
import glob, json, re, sys, os
SRC = json.load(open("lib/i18n/source.json"))
SCRIPT = {"bn": r"[ঀ-৿]", "mr": r"[ऀ-ॿ]", "te": r"[ఀ-౿]", "ta": r"[஀-௿]",
          "gu": r"[઀-૿]", "ur": r"[؀-ۿ]", "kn": r"[ಀ-೿]", "or": r"[଀-୿]", "ml": r"[ഀ-ൿ]"}
PH = re.compile(r"\{[a-z]+\}")
problems = 0
for lang, sc in SCRIPT.items():
    cat = [None] * len(SRC)
    for f in sorted(glob.glob(f"lib/i18n/work/{lang}.*.json")):
        data = json.load(open(f))
        for k, v in data.items():
            i = int(k)
            if i >= len(SRC):
                print(f"{f}: index {i} out of range"); problems += 1; continue
            en = SRC[i]
            if not isinstance(v, str) or not v.strip():
                print(f"{lang}[{i}] empty"); problems += 1; continue
            if sorted(PH.findall(en)) != sorted(PH.findall(v)):
                print(f"{lang}[{i}] placeholders differ: {PH.findall(en)} vs {PH.findall(v)}"); problems += 1; continue
            if en.count("\n") != v.count("\n"):
                print(f"{lang}[{i}] line breaks differ"); problems += 1; continue
            letters = re.sub(r"PLINTH|HDI|Network|WhatsApp|Claude|Anthropic|AI|IT|IP|WITHDRAW|PE|CBSE|[^A-Za-z]", "", en)
            if letters and not re.search(sc, v):
                print(f"{lang}[{i}] not in the {lang} script: {v[:60]}"); problems += 1; continue
            cat[i] = v
    done = sum(1 for x in cat if x)
    json.dump(cat, open(f"lib/i18n/catalogs/{lang}.json", "w"), ensure_ascii=False, indent=0)
    print(f"{lang}: {done}/{len(SRC)}")
sys.exit(1 if problems else 0)
