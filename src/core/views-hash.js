/* VIEWS-HASH v2 START:js */
/* طبقة عرض للتجزئة: مِعمل الباقي (p7) ومِعمل الطرق الأربع (p9). لا تعدّل CORE. */
(function(){
"use strict";
const CSH = window.CSH = window.CSH || {};
const $ = (s,r)=>(r||document).querySelector(s);
const mod = (a,b)=> ((a%b)+b)%b;

/* ---- code helper: مجموع رموز الحروف (نفس الدالة المستخدمة في نص الوحدة) ---- */
CSH.code = function(s){
  const t = String(s).toLowerCase();
  let n = 0; const parts = [];
  for(const ch of t){ n += ch.codePointAt(0); parts.push(ch.codePointAt(0)); }
  return {n, parts, text: String(s)};
};

/* ---- مِعمل الباقي: k = q·M + r (p7) ---- */
CSH.modCalc = function(hostId){
  const host = document.getElementById(hostId); if(!host) return;
  host.innerHTML = `
    <div class="act">
      <div class="act-h"><span class="act-k">Tool <b>${host.dataset.num||'2.1.1'}</b></span><h3>مِعمل الباقي: من المفتاح إلى الخانة</h3></div>
      <div class="mc">
        <form onsubmit="return false">
          <div><label class="fl">المفتاح (نص)</label><input type="text" class="k" value="omar" dir="ltr" style="max-width:150px"></div>
          <div><label class="fl">M (عدد الخانات)</label><input type="number" class="m" value="8" min="2" max="97"></div>
          <button class="btn go" type="button">احسب</button>
        </form>
        <div class="out" aria-live="polite"></div>
      </div>
    </div>`;
  const out = $('.out', host), kin = $('input.k', host), min = $('input.m', host), go = $('button.go', host);
  function run(){
    const M = Math.max(2, Math.min(97, parseInt(min.value,10)||8));
    const c = CSH.code(kin.value || 'omar');
    const r = mod(c.n, M), q = Math.floor(c.n / M);
    out.innerHTML =
`key   = '${c.text}'          ← stage 1: hash code
code  = ${c.parts.join(' + ')} = ${c.n}
index = ${c.n} % ${M} = ${r}        (${c.n} = ${M} × ${q} + ${r})
chosen slot: [${r}]   — always in 0 … ${M-1}`;
  }
  const used = ()=>{ host.dataset.used='1'; host.dispatchEvent(new CustomEvent('csh-used',{bubbles:true,detail:'modcalc'})); };
  go && go.addEventListener('click', ()=>{ run(); used(); });
  kin && kin.addEventListener('keydown', e=>{ if(e.key==='Enter'){ run(); used(); } });
  min && min.addEventListener('change', ()=>{ run(); used(); });
  run();
};

/* ---- مِعمل الطرق الأربع (p9) ---- */
CSH.methodLab = function(hostId){
  const host = document.getElementById(hostId); if(!host) return;
  host.innerHTML = `
    <div class="act">
      <div class="act-h"><span class="act-k">Tool <b>${host.dataset.num||'2.3.1'}</b></span><h3>مِعمل الطرق الأربع</h3></div>
      <p class="sm muted" style="margin:0 0 var(--s2)">الطريقة نفسها على مفتاحك — كل نتيجة تُضغط بـ <span class="mono" dir="ltr">% M</span>.</p>
      <form onsubmit="return false" style="display:flex;gap:10px;align-items:end;flex-wrap:wrap">
        <div><label class="fl">k (عدد صحيح)</label><input type="number" class="k" value="123456" dir="ltr" style="max-width:150px"></div>
        <div><label class="fl">M</label><input type="number" class="m" value="11" min="2" max="997"></div>
        <div><label class="fl">A (لطريقة الضرب)</label><input type="number" class="a" value="0.618" step="0.001" min="0.01" max="0.99" style="max-width:110px"></div>
        <button class="btn go" type="button">احسب</button>
      </form>
      <div class="m4"></div>
      <div class="mc"><div class="out" aria-live="polite"></div></div>
    </div>`;
  const cards = $('.m4', host), out = $('.out', host);
  const kin=$('input.k',host), min=$('input.m',host), ain=$('input.a',host), go=$('button.go',host);
  function run(){
    const k = Math.trunc(parseFloat(kin.value)||0);
    const M = Math.max(2, Math.min(997, parseInt(min.value,10)||11));
    const A = Math.min(0.99, Math.max(0.01, parseFloat(ain.value)||0.618));
    const div = mod(k, M);
    const sq = Math.abs(k*k);
    const digits = String(sq);
    const mid = digits.length>=4 ? digits.slice(Math.floor(digits.length/2)-1, Math.floor(digits.length/2)+1) : digits.slice(0,1);
    const midV = parseInt(mid,10)||0;
    const s = String(Math.abs(k));
    let foldSum = 0, parts = [];
    for(let i=0;i<s.length;i+=2){ const p = parseInt(s.slice(i, i+2),10); parts.push(p); foldSum += p; }
    const mult = Math.floor(M * ((k*A) % 1));
    const cell = (t,f,v)=>`<div class="cell"><h4>${t}</h4><span class="v">${v}</span><span class="f">${f}</span></div>`;
    cards.innerHTML =
      cell('Division', `h = k mod M`, div) +
      cell('Mid-square', `${sq} → “${mid}”`, mod(midV, M)) +
      cell('Folding', `${parts.join(' + ')} = ${foldSum}`, mod(foldSum, M)) +
      cell('Multiplication', `⌊${M}·(${k}·${A} mod 1)⌋`, mult);
    out.innerHTML = `k = ${k},  M = ${M},  A = ${A}\n` +
      `division      : ${k} mod ${M} = ${div}\n` +
      `mid-square    : ${sq} → mid “${mid}” → ${midV} mod ${M} = ${mod(midV,M)}\n` +
      `folding       : ${parts.join(' + ')} = ${foldSum} → ${foldSum} mod ${M} = ${mod(foldSum,M)}\n` +
      `multiplication: ⌊${M}·(${k}·${A} mod 1)⌋ = ${mult}`;
  }
  const used = ()=>{ host.dataset.used='1'; host.dispatchEvent(new CustomEvent('csh-used',{bubbles:true,detail:'methodlab'})); };
  go && go.addEventListener('click', ()=>{ run(); used(); });
  [kin,min,ain].forEach(el=> el && el.addEventListener('change', ()=>{ run(); used(); }));
  run();
};
})();
/* VIEWS-HASH v2 END:js */
