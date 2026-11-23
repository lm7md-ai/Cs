#!/usr/bin/env python3
"""CORE v1.1 + VIEWS verifier.
Base core (css/js/sprite) must stay byte-identical across modules.
Each module declares its slide range; coverage is checked *inside* that range only.
Views blocks are versioned separately and are allowed to change without touching base hashes.
"""
import hashlib, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CORE = ROOT/'core'
FINAL = pathlib.Path('/home/user/CS2015/final')
MAN  = CORE/'manifest.v1.1.json'
sha  = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
ok = True
def line(t, good, extra=''):
    global ok; ok = ok and good
    print(f"{'PASS' if good else 'FAIL'}  {t}{(' — '+extra) if extra else ''}")

man = json.loads(MAN.read_text())
print('CORE', man['core'], '· base files must never change\n')

# 1) base hashes
for name in ('core.css','core.js','sprite.html'):
    line(f'base {name} matches manifest', sha(CORE/name) == man['files'][name]['sha256'],
         sha(CORE/name)[:16])

# 2) views blocks
for v, info in man.get('views', {}).items():
    for f in info['files']:
        p = CORE/f
        line(f'views-{v}: {f} matches manifest', p.exists() and sha(p) == info['files'][f]['sha256'],
             sha(p)[:16] if p.exists() else 'missing')

# 3) per-module guarantees
for mid, info in man['modules'].items():
    f = FINAL/info['file']
    if not f.exists():
        line(f'{mid}: built file exists', False, str(f)); continue
    html = f.read_text(encoding='utf-8')
    line(f'{mid}: sha256 matches manifest', hashlib.sha256(f.read_bytes()).hexdigest() == info['sha256'],
         hashlib.sha256(f.read_bytes()).hexdigest()[:16])
    line(f'{mid}: base core.css inlined byte-identically', (CORE/'core.css').read_text(encoding='utf-8') in html)
    line(f'{mid}: base core.js inlined byte-identically',  (CORE/'core.js').read_text(encoding='utf-8') in html)
    line(f'{mid}: icon sprite inlined byte-identically',   (CORE/'sprite.html').read_text(encoding='utf-8') in html)
    for v in info.get('views', []):
        vc = CORE/f'views-{v}.css'; vj = CORE/f'views-{v}.js'
        got_c = (not vc.exists()) or vc.read_text(encoding='utf-8') in html
        got_j = (not vj.exists()) or vj.read_text(encoding='utf-8') in html
        line(f'{mid}: views-{v} inlined byte-identically', got_c and got_j)
    ext = [u for u in re.findall(r'(?<![-\w])(?:src|href)="(?!#)([^"]+)"', html) if not u.startswith('#')]
    line(f'{mid}: zero external requests', not ext, str(ext[:4]))
    line(f'{mid}: no <link>/<img>/@import', not re.search(r'<link|<img|@import|url\((?!#)', html))
    pages = info['pages']
    got = sorted({int(x) for x in re.findall(r'data-slide="(\d+)"', html)})
    missing = [i for i in pages if i not in got]
    outside = [i for i in got if i not in pages]
    line(f"{mid}: declared slides {pages} fully covered", not missing, f"{len([i for i in pages if i in got])}/{len(pages)}")
    line(f'{mid}: no slides outside declared set', not outside, str(outside))
    body = re.sub(r'<script.*?</script>','',html,flags=re.S); body = re.sub(r'<style.*?</style>','',body,flags=re.S)
    txt = re.sub(r'<[^>]+>','',body)
    allow = set('→←·—–≈≤≥≠×÷±°λΛαΣ²³½%…«»‘’“”')
    bad = {}
    for ch in txt:
        o = ord(ch)
        if o < 128 or ch in allow: continue
        if 0x0600 <= o <= 0x06FF or 0xFB50 <= o <= 0xFDFF or 0xFE70 <= o <= 0xFEFF: continue
        if 0x1F000 <= o <= 0x1FAFF or 0x2600 <= o <= 0x27BF or 0x2190 <= o <= 0x21FF \
           or 0x25A0 <= o <= 0x25FF or 0x2B00 <= o <= 0x2BFF or o == 0xFE0F:
            bad[ch] = bad.get(ch,0)+1
    line(f'{mid}: emoji/text-glyph count = 0', not bad, str(bad) if bad else '0')
    for s in ['أظهر الحل','إخفاء الحل','مواضيعك الأضعف','راجع الأخطاء فقط','تحقق من فهمك',
              'ملاحظة على الشريحة','لماذا هذا المثال؟','Animation','Participation Activity','Challenge Activity']:
        line(f'{mid}: string «{s}»', s in html)
    line(f'{mid}: RTL lang/dir on <html>', 'lang="ar" dir="rtl"' in html)
    line(f'{mid}: code background #1E222A', '1E222A' in html.upper())

line('core markers present in css', 'CORE v1.1 START:css' in (CORE/'core.css').read_text())
line('core markers present in js',  'CORE v1.1 START:js'  in (CORE/'core.js').read_text())
for v, info in man.get('views', {}).items():
    ver = str(info.get('version', '1'))
    line(f'views-{v} markers present (v{ver})',
         (CORE/f'views-{v}.css').read_text().count(f'VIEWS-{v.upper()} v{ver}')>=1
         and (CORE/f'views-{v}.js').read_text().count(f'VIEWS-{v.upper()} v{ver}')>=1)
print('\nRESULT:', 'ALL CHECKS PASS' if ok else 'FAILURES PRESENT')
sys.exit(0 if ok else 1)
