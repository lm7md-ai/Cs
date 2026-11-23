#!/usr/bin/env python3
"""CORE v1.1 builder — inlines core.css + sprite + content + data + core.js into ONE html file."""
import hashlib, json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
CORE = ROOT / 'core'
OUT  = pathlib.Path('/home/user/CS2015/final')   # مجلد الإخراج النهائي الوحيد لكل الوحدات

TPL = """<!DOCTYPE html>
<html lang="ar" dir="rtl" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<style id="core-css">
{css}
</style>
<style id="views-css">
{vcss}
</style>
</head>
<body data-module="{mid}">
{sprite}
{content}
<script>
{data}
</script>
<script id="views-js">
{vjs}
</script>
<script id="core-js">
{js}
</script>
</body>
</html>
"""

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def build(mid):
    mdir = ROOT / 'modules' / mid
    css  = (CORE/'core.css').read_text(encoding='utf-8')
    js   = (CORE/'core.js').read_text(encoding='utf-8')
    spr  = (CORE/'sprite.html').read_text(encoding='utf-8')
    cont = (mdir/'content.html').read_text(encoding='utf-8')
    data = (mdir/'data.js').read_text(encoding='utf-8')
    meta = json.loads((mdir/'meta.json').read_text(encoding='utf-8'))
    vcss = vjs = ''
    for v in meta.get('views', []):
        vc = CORE/('views-%s.css' % v); vj = CORE/('views-%s.js' % v)
        if vc.exists(): vcss += vc.read_text(encoding='utf-8')
        if vj.exists(): vjs  += vj.read_text(encoding='utf-8')
    html = TPL.format(title=meta['title'], desc=meta['desc'], css=css, vcss=vcss, sprite=spr,
                      content=cont, data=data, vcss2='', vjs=vjs, js=js, mid=mid)
    OUT.mkdir(exist_ok=True)
    p = OUT / meta['file']
    p.write_text(html, encoding='utf-8')
    # --- self-checks -------------------------------------------------
    ext = re.findall(r'(?<![-\w])(?:src|href)="(?!#)([^"]+)"', html)
    bad = [u for u in ext if not u.startswith('#')]
    slides = re.findall(r'data-slide="(\d+)"', html)
    uniq = sorted(set(int(s) for s in slides))
    rng = meta['pages']
    if isinstance(rng, dict):
        pages = list(range(rng['range'][0], rng['range'][1]+1)) if 'range' in rng else list(rng['list'])
    elif isinstance(rng, int):
        pages = [rng]
    else:
        pages = list(range(rng[0], rng[1]+1))
    missing  = [i for i in pages if i not in uniq]
    outside  = [i for i in uniq if i not in pages]
    print(f"built  {p}  {p.stat().st_size:,} B")
    print(f"slides {pages[0]}..{pages[-1]} (declared {len(pages)}): covered {len([i for i in pages if i in uniq])}/{len(pages)}  missing={missing}  outside_range={outside}")
    print(f"views inlined: {meta.get('views', []) or 'none'}")
    print(f"external refs : {bad if bad else 'none'}")
    print(f"core.css sha  : {sha(CORE/'core.css')[:16]}  ({len(css):,} ch)")
    print(f"core.js  sha  : {sha(CORE/'core.js')[:16]}  ({len(js):,} ch)")
    print(f"html     sha  : {hashlib.sha256(p.read_bytes()).hexdigest()[:16]}")
    return p

if __name__ == '__main__':
    for mid in (sys.argv[1:] or ['m01']):
        build(mid)
