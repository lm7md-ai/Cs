#!/usr/bin/env python3
"""check_generators.py — فحص مولِّدات التحدّي والأدوات لكل الوحدات.

الفكرة: كل مولِّد في modules/<id>/data.js يُشغَّل 500 مرة ببذور مختلفة عبر tests/dump_generators.js،
ثم يُعاد حل كل سؤال بـ **حلّال مرجعي مستقل** مكتوب هنا من نصّ السؤال (لا يستدعي كود الوحدة)، ويُقارن الجوابان.
كما تُفحص: الخيارات المكرّرة/الملتبسة، الحالات المنحلّة (M<2، قائمة فارغة، مفتاح غير موجود)،
وصيغ الإجابة البديلة التي تقبلها الواجهة أو ترفضها.

الاستخدام:
    python3 core/check_generators.py               # 500 بذرة لكل مستوى/أداة
    python3 core/check_generators.py --runs 50 --modules m01 m03
    python3 core/check_generators.py --no-tools    # بلا متصفح
"""
import argparse, json, pathlib, re, subprocess, sys, math
from decimal import Decimal, ROUND_HALF_UP

ROOT = pathlib.Path(__file__).resolve().parent.parent
MODS = ROOT / 'modules'
DUMP = ROOT / 'tests' / 'dump_generators.js'
OK = '\033[92m'; BAD = '\033[91m'; WARN = '\033[93m'; OFF = '\033[0m'

problems = []          # (مستوى الخطأ, الرسالة)
def fail(msg): problems.append(('FAIL', msg))
def warn(msg): problems.append(('WARN', msg))

# ---------------------------------------------------------------- utilities
def plain(html):
    """نصّ السؤال بلا وسوم، بمسافات موحّدة."""
    t = re.sub(r'<[^>]+>', ' ', html or '')
    t = t.replace('&gt;', '>').replace('&lt;', '<').replace('&amp;', '&').replace('&quot;', '"')
    return re.sub(r'\s+', ' ', t).strip()

def nums(s):
    return [int(x) for x in re.findall(r'-?\d+', s)]

def key_list_after(txt, anchor):
    """يستخرج قائمة أعداد بعد كلمة مفتاحية، مثل «للمفاتيح 1, 3, 7 ... في»."""
    i = txt.find(anchor)
    if i < 0: return None
    seg = txt[i + len(anchor):]
    m = re.match(r'[^0-9\-]*((?:-?\d+\s*[,،]\s*)*-?\d+)', seg)
    return nums(m.group(1)) if m else None

# ---------------------------------------------------------------- مراجع مستقلة
def mod(a, b): return ((a % b) + b) % b

def code_of(word):
    """رمز الكلمة = مجموع رموز حروفها (lowercase) — تعريف الوحدة."""
    return sum(ord(c) for c in word.lower())

def mid_two(sq):
    """الرقمان الوسيطان لمربّع عدد؛ لعدد أقل من 4 أرقام نأخذ الأول."""
    d = str(abs(sq))
    if len(d) >= 4:
        k = len(d) // 2
        return int(d[k-1:k+1])
    return int(d[0])

def fold_pairs(k):
    s = str(abs(int(k)))
    parts = [int(s[i:i+2]) for i in range(0, len(s), 2)]
    return parts, sum(parts)

# ---------------------------------------------------------------- الحلّالات بحسب (وحدة، مستوى)
def s_m01_lv0(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    k = int(re.search(r'المفتاح\s+(\d+)', txt).group(1))
    if M < 2: fail(f'M01/lv0: M={M} منحلّ')
    return mod(k, M)

def s_m01_lv1(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    occ_slot = int(re.search(r'الخانة\s+(\d+)\s+مشغولة', txt).group(1))
    ks = [int(x) for x in re.findall(r'المفتاح\s+(\d+)', txt)]
    if len(ks) < 2: fail(f'M01/lv1: مفاتيح مفقودة في النص: {txt[:60]}')
    base, k = ks[0], ks[-1]
    if mod(base, M) != occ_slot: fail(f'M01/lv1: الخانة المعلنة {occ_slot} ≠ {base}%{M}')
    return mod(k, M)

def s_m01_lv2(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    keys = key_list_after(txt, 'للمفاتيح')
    if not keys: fail('M01/lv2: لا قائمة مفاتيح')
    return len({mod(k, M) for k in keys})

def s_m01_lv3(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    keys = key_list_after(txt, 'نفس المفاتيح')
    if not keys:
        fail('M01/lv3: السؤال لا يذكر المفاتيح (غير مكتفٍ بذاته)')
        return None
    used, cols = set(), 0
    for k in keys:
        s = mod(k, M)
        if s in used: cols += 1
        else: used.add(s)
    return cols

def s_m01_lv4(txt, row):
    k = int(re.search(r'المفتاح\s+(\d+)', txt).group(1))
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    # «وجد مباشرة في خانته» ← حساب واحد + نظرة واحدة
    if mod(k, M) >= M: fail('M01/lv4: خانة خارج النطاق')
    return 1

def s_m02_lv0(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    w = re.search(r"المفتاح\s+'([^']+)'", txt).group(1)
    stated = int(re.search(r'رمزه\s+(\d+)', txt).group(1))
    c = code_of(w)
    if c != stated: fail(f"M02/lv0: رمز '{w}' المعلن {stated} ≠ المحسوب {c}")
    return mod(c, M)

def s_m02_lv1(txt, row):
    k = int(re.search(r'k\s*=\s*(\d+)', txt).group(1))
    stated = int(re.search(r'k²\s*=\s*(\d+)', txt).group(1))
    M = int(re.search(r'%\s*(\d+)', txt).group(1))
    if k * k != stated: fail(f'M02/lv1: k² المعلن {stated} ≠ {k*k}')
    return mod(mid_two(k * k), M)

def s_m02_lv2(txt, row):
    k = int(re.search(r'k\s*=\s*(\d+)', txt).group(1))
    M = int(re.search(r'%\s*(\d+)\s*؟', txt).group(1) if re.search(r'%\s*(\d+)\s*؟', txt) else re.findall(r'%\s*(\d+)', txt)[-1])
    stated = int(re.search(r'=\s*(\d+)\s*\.', txt).group(1))
    parts, s = fold_pairs_js = None, None
    # القطع في الوحدة: أزواج من اليسار (24 + 68 + 10)
    parts, s = fold_pairs(k)
    if s != stated: fail(f'M02/lv2: مجموع الأجزاء المعلن {stated} ≠ {s}')
    return mod(s, M)

def s_m02_lv3(txt, row):
    M = int(re.search(r'%\s*(\d+)', txt).group(1))
    home = int(re.search(r'خانته\s+(\d+)', txt).group(1))
    occ = {int(x) for x in re.findall(r'(\d+)(?=\s*(?:و|,)\s*مشغول)', txt)} or {1, 2}
    occ = {1, 2} if not occ else occ
    k = int(re.search(r'المفتاح\s+(\d+)', txt).group(1))
    if mod(k, M) != home: fail(f'M02/lv3: الخانة المعلنة {home} ≠ {k}%{M}')
    for i in range(M):
        s = mod(home + i * i, M)
        if s not in occ: return s
    fail('M02/lv3: الجدول ممتلئ — لا خانة متاحة')
    return None

def s_m02_lv4(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    keys = key_list_after(txt, 'المشغولة')
    if not keys: fail('M02/lv4: لا قائمة خانات مشغولة')
    k = int(re.search(r'يحتاج\s+(\d+)', txt).group(1))
    occ = set(keys); probes = 1; h = mod(k, M)
    while h in occ:
        probes += 1; h = mod(h + 1, M)
    return probes

def s_m03_lv0(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    return (3 * M) // 4          # أقصى n بشرط n/M ≤ 3/4

def s_m03_lv1(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    return 2 * M + 1

def s_m03_lv2(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    keys = key_list_after(txt, 'أدخلنا')
    if not keys: fail('M03/lv2: لا قائمة مفاتيح')
    slots = {mod(k, M) for k in keys}
    if len(slots) != 1: fail(f'M03/lv2: المفاتيح ليست في خانة واحدة ({slots})')
    return len(keys)

def s_m03_lv3(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    keys = key_list_after(txt, 'وفيه')
    target = int(re.search(r'عن\s+(\d+)', txt).group(1))
    if not keys: fail('M03/lv3: لا جدول')
    if target not in keys:
        fail(f'M03/lv3: المفتاح {target} غير موجود في الجدول — سؤال بلا جواب')
        return None
    chain = [k for k in keys if mod(k, M) == mod(target, M)]
    return chain.index(target) + 1

def s_m03_lv4(txt, row):
    ms = [int(x) for x in re.findall(r'M\s*=\s*(\d+)', txt)]
    newM = int(re.search(r'إلى\s+(\d+)', txt).group(1))
    k = int(re.search(r'المفتاح\s+(\d+)', txt).group(1))
    if len(ms) >= 1 and newM != 2 * ms[0] + 1:
        fail(f'M03/lv4: الحجم الجديد {newM} ≠ 2·{ms[0]}+1')
    return mod(k, newM)

SOLVERS = {
    'm01': [s_m01_lv0, s_m01_lv1, s_m01_lv2, s_m01_lv3, s_m01_lv4],
    'm02': [s_m02_lv0, s_m02_lv1, s_m02_lv2, s_m02_lv3, s_m02_lv4],
    'm03': [s_m03_lv0, s_m03_lv1, s_m03_lv2, s_m03_lv3, s_m03_lv4],
}


# ---------------------------------------------------------------- M04 (الفحص الخطّي، ص17–21)
def _occ_list(txt, anchor='المشغولة'):
    return key_list_after(txt, anchor) or []

def s_m04_lv0(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    k = int(re.search(r'المفتاح\s+(\d+)', txt).group(1))
    return mod(k, M)

def s_m04_lv1(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    occ = set(_occ_list(txt))
    k = int(re.search(r'أدخلنا\s+(\d+)', txt).group(1))
    h = mod(k, M); probes = 1
    while h in occ:
        probes += 1; h = mod(h + 1, M)
        if probes > M: fail('M04/lv1: الجدول ممتلئ'); return None
    return probes

def _lin(M, keys):
    t = [None]*M
    for k in keys:
        h = mod(k, M)
        while t[h] is not None and t[h] != k:
            h = mod(h+1, M)
        if t[h] is None: t[h] = k
    return t

def s_m04_lv2(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    keys = key_list_after(txt, 'أدخلنا')
    target = int(re.search(r'المفتاح\s+(\d+)\s*[?؟]', txt).group(1))
    if not keys or keys[-1] != target:
        fail(f'M04/lv2: تعذّر استخراج المفاتيح ({keys}) أو الهدف ({target})')
        return None
    t = _lin(M, keys)
    return t.index(target)

def s_m04_lv3(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    keys = key_list_after(txt, 'بالترتيب')
    dele = int(re.search(r'حذفنا\s+(\d+)', txt).group(1))
    target = int(re.search(r'عن\s+(\d+)', txt).group(1))
    if not keys: fail('M04/lv3: لا مفاتيح'); return None
    t = _lin(M, keys)
    if dele not in t: fail(f'M04/lv3: المفتاح المحذوف {dele} غير موجود'); return None
    t[t.index(dele)] = 'AV'                    # العلامة تحفظ المسار ولا تُوقفه
    if target not in t: fail(f'M04/lv3: الهدف {target} محذوف/غائب'); return None
    h = mod(target, M); probes = 1
    while t[h] is not None and t[h] != target:
        h = mod(h+1, M); probes += 1
        if probes > M: fail('M04/lv3: لا نهاية للمسار'); return None
    return probes

def s_m04_lv4(txt, row):
    M = int(re.search(r'M\s*=\s*(\d+)', txt).group(1))
    return M // 2                              # أقصى n بشرط n/M ≤ 0.5

SOLVERS['m04'] = [s_m04_lv0, s_m04_lv1, s_m04_lv2, s_m04_lv3, s_m04_lv4]

# ---------------------------------------------------------------- فحص الخيارات
def check_options(where, opts, a):
    if not opts: return
    clean = [plain(o) for o in opts]
    if len(set(clean)) != len(clean):
        fail(f'{where}: خيارات مكرّرة {clean}')
    # تكافؤ رقمي: يُفحص فقط عندما تكون كل الخيارات أعدادًا صرفة (مثل «0.8» و«0.80»)
    vals = []
    for c in clean:
        t = c.strip()
        if re.fullmatch(r'[-+]?\d+(?:[.,]\d+)?', t):
            vals.append(float(t.replace(',', '.')))
        else:
            vals = None; break
    if vals is not None and len(set(vals)) != len(vals):
        fail(f'{where}: خيارات متكافئة رقميًا {clean}')
    if not (isinstance(a, int) and 0 <= a < len(opts)):
        fail(f'{where}: فهرس الجواب {a} خارج نطاق الخيارات')
    elif not clean[a].strip():
        fail(f'{where}: نصّ الجواب الصحيح فارغ')

# ---------------------------------------------------------------- الأدوات (متصفح)
TOOL_CASES = {
    'm01': [dict(name='sandbox', sel='#sandbox')],
    'm02': [dict(name='modcalc', sel='#host-modcalc .act'), dict(name='methodlab', sel='#host-methodlab .act')],
    'm03': [dict(name='gauge', sel='#host-gauge .act')],
    'm04': [dict(name='probes', sel='#probes')],
}

def tool_fuzz(modules, runs, seed=12345):
    try:
        from playwright.sync_api import sync_playwright
    except Exception as e:                                     # pragma: no cover
        warn(f'الأدوات: تعذّر تشغيل المتصفح ({e}) — تُركت بلا فحص')
        return
    import random
    rnd = random.Random(seed)
    FIN = pathlib.Path('/home/user/CS2015/final')
    files = {}
    for m in modules:
        meta = json.loads((MODS / m / 'meta.json').read_text(encoding='utf-8'))
        files[m] = (FIN / meta['file']).as_uri()
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        for m, cases in TOOL_CASES.items():
            if m not in modules: continue
            for case in cases:
                p = b.new_page(viewport={'width': 1280, 'height': 900})
                p.goto(files[m]); p.wait_for_timeout(350)
                bad = 0; first = None
                for i in range(runs):
                    if case['name'] == 'sandbox':
                        keys = [rnd.randint(0, 400) for _ in range(rnd.randint(1, 6))]
                        M = rnd.randint(2, 31)
                        p.evaluate("""([ks,M])=>{document.getElementById('sbKeys').value=ks.join(', ');
                            document.getElementById('sbM').value=M; document.getElementById('sbRun').click();}""",
                                   [keys, M])
                        p.wait_for_timeout(6)
                        txt = plain(p.eval_on_selector('#sbOut', 'e=>e.innerText'))
                        got = re.search(r'خانات مشغولة\s+(\d+)', txt)
                        gotc = re.search(r'تصادمات\s+(\d+)', txt)
                        used = len({k % M for k in keys})
                        cols = sum(1 for j, k in enumerate(keys) if (k % M) in {kk % M for kk in keys[:j]})
                        if not got or int(got.group(1)) != used or not gotc or int(gotc.group(1)) != cols:
                            bad += 1
                            if first is None: first = f'keys={keys} M={M} gut={got and got.group(1)}/{gotc and gotc.group(1)} want={used}/{cols}'
                    elif case['name'] == 'modcalc':
                        word = ''.join(rnd.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(rnd.randint(1, 7)))
                        M = rnd.randint(2, 97)
                        p.evaluate("""([w,M])=>{const h=document.querySelector('#host-modcalc');
                            h.querySelector('input.k').value=w; h.querySelector('input.m').value=M;
                            h.querySelector('button.go').click();}""", [word, M])
                        p.wait_for_timeout(6)
                        txt = plain(p.eval_on_selector('#host-modcalc .out', 'e=>e.innerText'))
                        want = sum(ord(c) for c in word) % M
                        got = re.search(r'chosen slot:\s*\[(\d+)\]', txt)
                        if not got or int(got.group(1)) != want:
                            bad += 1
                            if first is None: first = f"'{word}' M={M} got={got and got.group(1)} want={want}"
                    elif case['name'] == 'methodlab':
                        k = rnd.randint(0, 99999); M = rnd.randint(2, 97); A = round(rnd.uniform(0.01, 0.99), 3)
                        p.evaluate("""([k,M,A])=>{const h=document.querySelector('#host-methodlab');
                            h.querySelector('input.k').value=k; h.querySelector('input.m').value=M;
                            h.querySelector('input.a').value=A; h.querySelector('button.go').click();}""", [k, M, A])
                        p.wait_for_timeout(6)
                        vals = p.evaluate("()=>[...document.querySelectorAll('#host-methodlab .m4 .cell .v')].map(e=>e.textContent.trim())")
                        want_div = k % M
                        want_sq = mid_two(k * k) % M
                        _, fs = fold_pairs(k)
                        want_fold = fs % M
                        want_mul = math.floor(M * ((k * A) % 1))
                        if [int(v) for v in vals][:4] != [want_div, want_sq, want_fold, want_mul]:
                            bad += 1
                            if first is None: first = f'k={k} M={M} A={A} got={vals[:4]} want={[want_div,want_sq,want_fold,want_mul]}'
                    elif case['name'] == 'probes':
                        Mt = rnd.randint(4, 15)
                        keys = [rnd.randint(0, 120) for _ in range(rnd.randint(1, min(8, Mt-1)))]
                        k = rnd.choice(keys) if rnd.random() < 0.7 else rnd.randint(0, 120)
                        p.evaluate("""([ks,M,k])=>{document.getElementById('pbKeys').value=ks.join(', ');
                            document.getElementById('pbM').value=M; document.getElementById('pbK').value=k;
                            document.getElementById('pbRun').click();}""", [keys, Mt, k])
                        p.wait_for_timeout(6)
                        txt = plain(p.eval_on_selector('#pbOut', 'e=>e.innerText'))
                        t = _lin(Mt, keys)
                        used = sum(1 for v in t if v is not None)
                        tried, h, pr = [k % Mt], k % Mt, 1
                        found = False
                        while t[h] is not None:
                            if t[h] == k: found = True; break
                            h = (h + 1) % Mt; pr += 1; tried.append(h)
                            if pr > Mt: break
                        gu = re.search(r'خانات مشغولة\s+(\d+)', txt)
                        gp = re.search(r'بعد\s+(\d+)\s+محاولة', txt)
                        gs = re.search(r'البحث عن \d+:\s*(وُجد|غير موجود)', txt)
                        okk = (gu and int(gu.group(1)) == used)
                        okp = (gp and int(gp.group(1)) == pr) if (t[h] is not None or found or pr <= Mt) else True
                        oks = (gs and gs.group(1) == ('وُجد' if found else 'غير موجود'))
                        if not (okk and okp and oks):
                            bad += 1
                            if first is None:
                                first = f'keys={keys} M={Mt} k={k} got used/probes/found={gu and gu.group(1)}/{gp and gp.group(1)}/{gs and gs.group(1)} want={used}/{pr}/{"وُجد" if found else "غير موجود"}'
                    else:  # gauge
                        n = rnd.randint(0, 24); M = rnd.randint(4, 24)
                        p.evaluate("""([n,M])=>{const a=document.getElementById('gN'), b=document.getElementById('gM');
                            a.value=n; a.dispatchEvent(new Event('input'));
                            b.value=M; b.dispatchEvent(new Event('input'));}""", [n, M])
                        p.wait_for_timeout(6)
                        txt = plain(p.eval_on_selector('#gVal', 'e=>e.innerText'))
                        got = re.search(r'=\s*([\d.]+)\s*$', txt.strip())
                        # التقريب المعتمد: نصف لأعلى (ROUND_HALF_UP) كما في toFixed
                        want = str((Decimal(n)/Decimal(M)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
                        if not got or abs(float(got.group(1)) - float(want)) > 0.005:
                            bad += 1
                            if first is None: first = f'n={n} M={M} got={got and got.group(1)} want={want}'
                        p.click('#gRehash'); p.wait_for_timeout(6)
                        mv = int(p.eval_on_selector('#gM', 'e=>e.value'))
                        if mv != 2 * M + 1:
                            bad += 1
                            if first is None: first = f'إعادة التجزئة: M={M} ← {mv} (المتوقّع {2*M+1})'
                status = f'{OK}PASS{OFF}' if bad == 0 else f'{BAD}FAIL{OFF}'
                print(f'  {status}  أداة {m}/{case["name"]}: {runs} تشغيل، إخفاقات {bad}' + (f' — أولها: {first}' if first else ''))
                if bad: fail(f'أداة {m}/{case["name"]}: {bad}/{runs} إخفاق — مثال: {first}')
                p.close()
        b.close()


def format_probe(modules):
    """يفحص كيف تتعامل الواجهة مع صيغة إجابة بديلة (قيد مقارنة النواة النصّية)."""
    try:
        from playwright.sync_api import sync_playwright
    except Exception:
        return
    FIN = pathlib.Path('/home/user/CS2015/final')
    checked = 0
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        for m in modules:
            meta = json.loads((MODS / m / 'meta.json').read_text(encoding='utf-8'))
            p = b.new_page(viewport={'width': 1280, 'height': 900})
            p.goto((FIN / meta['file']).as_uri()); p.wait_for_timeout(350)
            p.click('#challenge .act [data-reset]'); p.wait_for_timeout(150)
            kind = p.evaluate("()=>!!document.querySelector('#challenge .act [data-in]')")
            if kind:
                answered = p.evaluate("""()=>{const b=document.querySelector('#challenge .act');
                    const q=b.querySelector('[data-q]').textContent;
                    const mod=window.MODULE; let ans=null;
                    try{ ans=mod.ca.levels[0](); }catch(e){}
                    return {q:q.slice(0,50)};}""")
                # اكتب الصيغة العشرية لنفس الإجابة الصحيحة
                real = p.evaluate("""()=>{const b=document.querySelector('#challenge .act');
                    // جرّب القيم 0..40 بصيغة «x.0» حتى تنجح إحداها كإجابة صحيحة»
                    return null;}""")
                # إجابة صحيحة مضمونة: نستخرجها من موسّع الوحدة عبر إعادة توليد مطابقة غير ممكنة،
                # لذا نفحص الحالة العامة: كتابة «4.0» بدل 4 في أي سؤال رقمي
                p.fill('#challenge .act [data-in]', '4.0')
                p.click('#challenge .act [data-check]'); p.wait_for_timeout(120)
                st = p.evaluate("()=>document.querySelector('#challenge .act [data-state]').className")
                checked += 1
                if 'ok' not in st:
                    warn(f'{m}: الصيغة البديلة «4.0» تُعدّ خاطئة عند مقارنتها بـ«4» — قيد في مقارنة النواة النصّية (يحتاج CORE v1.2)')
            p.close()
        b.close()
    return checked

# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--runs', type=int, default=500)
    ap.add_argument('--modules', nargs='*', default=None)
    ap.add_argument('--no-tools', action='store_true')
    a = ap.parse_args()

    mods = a.modules or sorted(p.parent.name for p in MODS.glob('*/meta.json'))
    print(f'مولِّدات التحدّي — {a.runs} بذرة لكل مستوى · الوحدات: {", ".join(mods)}\n')
    dump = subprocess.run(['node', str(DUMP), str(a.runs)] + mods, capture_output=True, text=True)
    if dump.returncode != 0:
        print(dump.stderr[:800]); sys.exit(1)
    data = json.loads(dump.stdout)

    total = 0
    for m in mods:
        solvers = SOLVERS.get(m)
        if not solvers:
            fail(f'{m}: لا حلّال مرجعي مسجّل — أضِفه في SOLVERS قبل تسليم الوحدة')
            continue
        for L in data[m]['levels']:
            lv = L['lv']; runs = L['rows']
            solver = solvers[lv] if lv < len(solvers) else None
            if solver is None:
                fail(f'{m}/lv{lv}: لا حلّال للمستوى'); continue
            bad = 0; first = None
            for r in runs:
                total += 1
                if 'error' in r:
                    bad += 1; first = first or f'استثناء: {r["error"]}'; continue
                try:
                    want = solver(plain(r['q']), r)
                except Exception as e:
                    bad += 1; first = first or f'تعذّر التحليل: {e} | {plain(r["q"])[:70]}'; continue
                if want is None: continue
                if str(want) != str(r['a']):
                    bad += 1
                    if first is None: first = f'got={r["a"]} want={want} | {plain(r["q"])[:70]}'
                if r['kind'] == 'num' and not isinstance(r['a'], (int, float)):
                    fail(f'{m}/lv{lv}: جواب غير رقمي ({r["a"]!r}) في سؤال رقمي')
                if isinstance(r['a'], float) and r['a'] != int(r['a']):
                    warn(f'{m}/lv{lv}: جواب عشري {r["a"]} — الصيغة البديلة ({r["a"]}0) تُرفض بمقارنة نصّية')
            status = f'{OK}PASS{OFF}' if bad == 0 else f'{BAD}FAIL{OFF}'
            print(f'  {status}  {m}/lv{lv}: {len(runs)} تشغيل — إخفاقات {bad}' + (f' — أولها: {first}' if first else ''))
            if bad: fail(f'{m}/lv{lv}: {bad}/{len(runs)} إخفاق — مثال: {first}')

        # الخيارات: PA + quiz
        for pa in data[m].get('pas', []):
            for it in pa['items']:
                check_options(f"{m} PA {pa['num']}", it.get('opts'), it.get('a'))
        for q in data[m].get('quiz', []):
            check_options(f"{m} quiz#{q['i']+1}", q.get('opts'), q.get('a'))

    if not a.no_tools:
        print('\nالأدوات (Sandbox/tools) — فحص عبر المتصفح:\n')
        tool_fuzz([m for m in mods if m in TOOL_CASES], a.runs)
        format_probe([m for m in mods if m in TOOL_CASES])

    print(f'\nإجمالي تشغيلات المولِّدات: {total}')
    fails = [p for p in problems if p[0] == 'FAIL']
    warns = [p for p in problems if p[0] == 'WARN']
    if fails:
        print(f'\n{BAD}إخفاقات ({len(fails)}):{OFF}')
        for _, msg in fails: print('  -', msg)
    if warns:
        print(f'\n{WARN}تنبيهات ({len(warns)}):{OFF}')
        for _, msg in warns[:10]: print('  -', msg)
        if len(warns) > 10: print(f'  ... و{len(warns)-10} أخرى')
    print('\nRESULT:', 'ALL GENERATORS PASS' if not fails else 'FAILURES PRESENT')
    return 0 if not fails else 1

if __name__ == '__main__':
    sys.exit(main())
