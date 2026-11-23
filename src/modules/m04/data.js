/* بيانات وحدة M04 — الشرائح 17 · 18 · 19 · 20 · 21 (الفحص الخطّي) */
(function(){
const M = {};
M.id = 'm04';
M.sections = [
  {id:'s41', acts:['anim:probe']},
  {id:'s42', acts:['anim:cluster']},
  {id:'s43', acts:['pa:4.3.1','tool:probes']},
  {id:'s44'},
  {id:'s45'},
  {id:'s46', acts:['ca:1']},
  {id:'s47', acts:['quiz']}
];
const mod = (a,b)=> ((a%b)+b)%b;
const pick = a => a[Math.floor(Math.random()*a.length)];
const $ = s=>document.querySelector(s);
const $$ = (s,r)=>Array.from((r||document).querySelectorAll(s));

/* ---------- محرّك الفحص الخطّي (مرجع الوحدة، لا يُستخدم في الاختبارات المستقلّة) ---------- */
function linTable(Mt, keys){
  const t = new Array(Mt).fill(null);
  const probes = [], slots = [];
  keys.forEach(k=>{
    let h = mod(k, Mt), p = 1, tried = [h];
    while(t[h] !== null && t[h] !== k){ h = mod(h+1, Mt); p++; tried.push(h); }
    if(t[h] === null){ t[h] = k; }
    probes.push(p); slots.push(h);
  });
  return {t, probes, slots, used: t.filter(v=>v!==null).length};
}
function searchProbes(Mt, keys, target){
  const {t} = linTable(Mt, keys);
  let h = mod(target, Mt), p = 1, tried = [h];
  while(t[h] !== null && t[h] !== target){ h = mod(h+1, Mt); p++; tried.push(h); }
  return {found: t[h] === target, probes: p, tried};
}
const LAMBDA = (n,Mt)=> n/Mt;

/* ================= ANIMATION 1: إدخال 44 ثم البحث عنه (p18) ================= */
M.anims = { probe: { steps: [
  {cap:'المفتاح <b>44</b>: أول خطوة دائمًا حساب الخانة. <span class="mono" dir="ltr">44 % 11 = 0</span>.', lbl:{c44:'44'}, css:[{id:'c44',t:1}],
   hot:['q0'], set:[{id:'q0v',text:'22'}], watch:{k:'44',i:'0',s:'0',p:'1'}},
  {cap:'الخانة 0 فيها <b>22</b> ← ليست 44. لا نُزيح 22 ولا نُنشئ قائمة: نجرّب الخانة التالية.', fx:['shake:q0'],
   watch:{k:'44',i:'0',s:'0',p:'1'}},
  {cap:'<span class="mono" dir="ltr">i = 1</span> ← <span class="mono" dir="ltr">slot = (0 + 1) % 11 = 1</span>. الخانة 1 <b>فارغة</b> ← هنا يستقرّ 44.',
   pos:{c44:'q1'}, hot:['q1'], fx:['pulse:q1:ok'], set:[{id:'q1v',text:'44'}], watch:{k:'44',i:'1',s:'1',p:'2'}},
  {cap:'انتهى الإدخال بمحاولتين. الآن <b>البحث</b>: <span class="mono" dir="ltr">get(44)</span> يبدأ من الخانة 0 نفسها — لا يعرف أين وضعناه.',
   set:[{id:'q1v',text:'44'}], hot:['q0'], watch:{k:'44',i:'0',s:'0',p:'1'}},
  {cap:'الخانة 0: <b>22 ≠ 44</b> ← نُكمل إلى التالية. البحث يمشي على الطريق نفسه الذي مشى عليه الإدخال.', fx:['shake:q0'],
   watch:{k:'44',i:'0',s:'0',p:'1'}},
  {cap:'الخانة 1: <b>44 وُجد</b> ← محاولتان. وهذا هو معنى «توقّف عند المفتاح».', hot:['q1'], fx:['pulse:q1:ok'],
   watch:{k:'44',i:'1',s:'1',p:'2'}},
  {cap:'ولو كانت الخانة 1 <b>فارغة</b> لَتَوقّف البحث عندها وقال «غير موجود» فورًا — هذه هي قاعدة التوقّف الثانية.',
   watch:{k:'44',i:'1',s:'1',p:'2'}}
]}};

/* ================= ANIMATION 2: تكوّن الكتلة (p17 / p21) ================= */
M.anims['cluster'] = { steps: [
  {cap:'<b>12</b>: <span class="mono" dir="ltr">12 % 10 = 2</span> ← الخانة 2 فارغة ← يستقرّ فيها بعد محاولة واحدة.',
   lbl:{c12:'12'}, css:[{id:'c12',t:1}], pos:{c12:'k2'}, set:[{id:'k2v',text:'12'}], hot:['k2'], fx:['pulse:k2:ok'],
   watch:{k:'12',h:'2',p:'1',b:'2–2'}},
  {cap:'<b>22</b>: خانته 2 أيضًا. الخانة 2 مشغولة ← <span class="mono" dir="ltr">i = 1</span> ← الخانة 3.',
   lbl:{c22:'22'}, css:[{id:'c22',t:1}], pos:{c22:'k3'}, hot:['k2'], fx:['shake:k2'],
   set:[{id:'k3v',text:'22'}], watch:{k:'22',h:'2',p:'2',b:'2–3'}},
  {cap:'الكتلة صارت خانتين: <b>2 · 3</b>. كل مفتاح خانته 2 سيتخطّاهما الآن.', set:[{id:'k3v',text:'22'}],
   watch:{k:'22',h:'2',p:'2',b:'2–3'}},
  {cap:'<b>32</b>: 2 مشغولة ← 3 مشغولة ← 4 حرة. ثلاث محاولات.', lbl:{c32:'32'}, css:[{id:'c32',t:1}],
   pos:{c32:'k4'}, set:[{id:'k4v',text:'32'}], hot:['k4'], fx:['pulse:k4:ok'], watch:{k:'32',h:'2',p:'3',b:'2–4'}},
  {cap:'<b>42</b>: أربع محاولات حتى الخانة 5. لاحظ: الخانة الأصلية واحدة، والمسافة إلى الفراغ تتضاعف.', lbl:{c42:'42'},
   css:[{id:'c42',t:1}], pos:{c42:'k5'}, set:[{id:'k5v',text:'42'}], hot:['k5'], fx:['pulse:k5:ok'],
   watch:{k:'42',h:'2',p:'4',b:'2–5'}},
  {cap:'الجدول النهائي: كتلة متّصلة <b>2 · 3 · 4 · 5</b> بلا فراغ في وسطها.', hot:['k2','k3','k4','k5'],
   watch:{k:'42',h:'2',p:'4',b:'2–5'}},
  {cap:'المحاولات: 1 ثم 2 ثم 3 ثم 4 ← متوسط <span class="mono" dir="ltr">(1+2+3+4)/4 = 2.5</span>، مع أن كل المفاتيح تريد خانة واحدة.',
   watch:{k:'—',h:'2',p:'2.5',b:'2–5'}},
  {cap:'هذا هو <b>التجمّع الأولي</b>: الخانات المتتالية الممتلئة تجذب مزيدًا من التصادمات، فتنمو الكتلة من نفسها.', watch:{b:'2–5'}},
  {cap:'العلاج: أبقِ الجدول أقل من نصف ممتلئ (<span class="mono" dir="ltr">λ ≤ 0.5</span>) — هنا <span class="mono" dir="ltr">4/10 = 0.4</span> ومحاولات المفاتيح القادمة ستبدأ من 1.', watch:{b:'2–5'}}
]};

/* ================= PARTICIPATION (p17 + p20) ================= */
M.pas = [
  {num:'4.3.1', sec:'s43', after:'host-pa4', title:'تحقّق: المحاولات وعلامة AV', items:[
    {q:'في <span class="mono" dir="ltr">M = 10</span> أدخلنا <span class="mono" dir="ltr">12, 22, 32, 42</span> بالفحص الخطّي. كم محاولة احتاج المفتاح <span class="mono" dir="ltr">42</span>؟',
     opts:['2','3','4','5'], a:2, why:'2 مشغولة (12) ← 3 (22) ← 4 (32) ← 5 حرة: أربع محاولات.'},
    {q:'في جدول الشريحة 20 بعد حذف 44 (الخانة 1 صارت <span class="mono" dir="ltr">AV</span>)، كم محاولة يحتاج البحث عن <span class="mono" dir="ltr">66</span>؟',
     opts:['1','2','3','7'], a:2, why:'0 (22) ← 1 (AV نتجاوزها) ← 2 (66): ثلاث محاولات. لو كانت 1 فارغة لتوقّف البحث وقال «غير موجود» خطأً.'},
    {q:'جدول <span class="mono" dir="ltr">M = 10</span> فيه 4 مفاتيح. ما أقصى عدد مفاتيح إضافية يبقينا ضمن <span class="mono" dir="ltr">λ ≤ 0.5</span>؟',
     opts:['0','1','2','5'], a:1, why:'λ ≤ 0.5 يعني n ≤ 5؛ لدينا 4 ← يبقى مفتاح واحد فقط.'}
  ]}
];

/* ================= SELF TESTS (تُحسب) ================= */
const K19 = [11,13,15,17,25,37,38,40,41,48];
M.selftests = [
  {name:'probes for 48 (M=10)', got:()=> searchProbes(10,K19,48).probes, want:7, slide:'19'},
  {name:'slots tried for 48', got:()=> searchProbes(10,K19,48).tried.join(','), want:'8,9,0,1,2,3,4', slide:'19'},
  {name:'final slot of 12 (M=10)', got:()=> linTable(10,[12,22,32,42]).slots[0], want:2, slide:'17'},
  {name:'final slot of 42 (M=10)', got:()=> linTable(10,[12,22,32,42]).slots[3], want:5, slide:'17'},
  {name:'probes for 42 (M=10)', got:()=> linTable(10,[12,22,32,42]).probes[3], want:4, slide:'17'},
  {name:'λ for 10 keys in M=10', got:()=> LAMBDA(10,10).toFixed(2), want:'1.00', slide:'19'},
  {name:'get(44) probes (M=11)', got:()=> searchProbes(11,[18,41,22,59,32,31,44],44).probes, want:2, slide:'18'}
];

M.checklist = [
  'أشرح العنونة المفتوحة: مفتاح واحد في كل خانة، و<b>لا قوائم</b>.',
  'أكتب <span class="mono" dir="ltr">slot = (h(k) + i) % M</span> وأعدّ المحاولات باليد.',
  'أعرف قاعدتَي التوقّف في البحث: المفتاح أو أول خانة فارغة.',
  'أفسّر التجمّع الأولي وأربطه بقاعدة <span class="mono" dir="ltr">λ ≤ 0.5</span>.',
  'أحذف بعلامة <span class="mono" dir="ltr">AV</span> وأشرح ماذا يحدث لو أفرغت الخانة.'
];


/* ================= CHALLENGE (5 مستويات) ================= */
M.ca = { num:'4.5.1', title:'الفحص الخطّي · المحاولات · الحذف', levels:[
  ()=>{ const Mt=pick([10,11,13]); const k=pick([12,22,32,44,48,66,88,25]);
        return {kind:'num', q:`جدول <span class="mono" dir="ltr">M = ${Mt}</span> وقاعدة <span class="mono" dir="ltr">h(k) = k % ${Mt}</span>. ما <b>خانة المفتاح</b> <span class="mono" dir="ltr">${k}</span> قبل أي تصادم؟`,
                a: mod(k,Mt), hint:`اقسم ${k} على ${Mt} وخُذ الباقي.`, why:`${k} % ${Mt} = ${mod(k,Mt)} ← الخانة ${mod(k,Mt)}.`}; },
  ()=>{ const Mt=pick([10,11]); const base=pick([2,3,5]);
        const keys=[base, base+Mt, base+2*Mt].filter(k=>k<100);
        const k=pick(keys.slice(1));
        const before=linTable(Mt, keys.slice(0,keys.indexOf(k)));
        const occ=before.t.map((v,i)=>v!==null?i:null).filter(v=>v!==null).sort((a,b)=>a-b);
        const r=linTable(Mt, keys.slice(0,keys.indexOf(k)+1));
        const probes=r.probes[r.probes.length-1];
        return {kind:'num', q:`جدول <span class="mono" dir="ltr">M = ${Mt}</span> والخانات المشغولة <span class="mono" dir="ltr">${occ.join(', ')}</span>. أدخلنا <span class="mono" dir="ltr">${k}</span> بالفحص الخطّي. كم <b>محاولة</b> احتاج؟`,
                a: probes, hint:`ابدأ من ${mod(k,Mt)} وامشِ خانةً خانة حتى تجد فارغة.`,
                why:`${k} % ${Mt} = ${mod(k,Mt)}، ثم ${r.slots[r.slots.length-1] !== undefined ? 'حتى الخانة '+r.slots[r.slots.length-1] : ''} ← ${probes} محاولة.`}; },
  ()=>{ const Mt=pick([10,11]); const base=pick([2,4,7]);
        const keys=[base, base+Mt, base+2*Mt];
        const idx=pick([2,2,1]);
        const t=linTable(Mt, keys.slice(0, idx));
        const r=linTable(Mt, keys.slice(0, idx+1));
        return {kind:'num', q:`في <span class="mono" dir="ltr">M = ${Mt}</span> أدخلنا <span class="mono" dir="ltr">${keys.slice(0,idx+1).join(', ')}</span> بهذا الترتيب بالفحص الخطّي. في أي <b>خانة</b> يستقرّ المفتاح <span class="mono" dir="ltr">${keys[idx]}</span>؟`,
                a: r.slots[idx], hint:`كل المفاتيح لها الخانة ${mod(base,Mt)}؛ كل واحد يزحف خانة إضافية.`,
                why:`${mod(base,Mt)} مشغولة بالمفاتيح السابقة ← يستقرّ في ${r.slots[idx]}.`}; },
  ()=>{ const Mt=11; const keys=[22,44,66];
        const del=44; const target=pick([66,66,22]);
        const t=linTable(Mt, keys);
        const home=mod(target,Mt);
        let h=home, probes=1; const tried=[h];
        while(t.t[h]!==null && t.t[h]!==target){ h=mod(h+1,Mt); probes++; tried.push(h); }
        return {kind:'num', q:`جدول <span class="mono" dir="ltr">M = 11</span> فيه بالترتيب <span class="mono" dir="ltr">22, 44, 66</span>. حذفنا <span class="mono" dir="ltr">${del}</span> وتركنا علامة <span class="mono" dir="ltr">AV</span> في خانته. كم <b>محاولة</b> يحتاج البحث عن <span class="mono" dir="ltr">${target}</span>؟`,
                a: probes, hint:'علامة AV تُحسب محاولة وتُتجاوَز، ولا تُوقف البحث.',
                why:`${target} % 11 = ${home} ← المسار ${tried.join(' → ')} ← ${probes} محاولة.`}; },
  ()=>{ const Mt=pick([8,10,11,12,14]);
        return {kind:'num', q:`جدول عنونة مفتوحة <span class="mono" dir="ltr">M = ${Mt}</span> وعتبة <span class="mono" dir="ltr">λ ≤ 0.5</span>. ما <b>أكبر عدد مفاتيح</b> يبقى عندها ضمن العتبة؟`,
                a: Math.floor(Mt/2), hint:`احسب 0.5 × ${Mt} وخُذ الجزء الصحيح.`,
                why:`0.5 × ${Mt} = ${Mt/2} ← أقصى عدد ${Math.floor(Mt/2)} مفتاحًا (λ = ${(Math.floor(Mt/2)/Mt).toFixed(2)}).`}; }
]};

/* ================= QUIZ (10 أسئلة على 17–21) ================= */
M.quiz = [
 {topic:'العنونة المفتوحة', q:'ما الفرق الجوهري بين العنونة المفتوحة والسلسلة؟',
  opts:['السلسلة تحفظ أكثر من قيمة في الخانة، والعنونة المفتوحة مفتاح واحد لكل خانة','العنونة المفتوحة أسرع دائمًا','السلسلة لا تحتاج دالة تجزئة','العنونة المفتوحة تحفظ المفاتيح مرتّبة'],
  a:0, why:'مفتاح واحد في كل خانة مع العنونة المفتوحة؛ السلسلة تعلّق قائمة بكل خانة (الشريحة 18).'},
 {topic:'الفحص الخطّي', q:'صيغة الخانة في الفحص الخطّي:',
  opts:['<span class="mono" dir="ltr">(h(k) + i²) % M</span>','<span class="mono" dir="ltr">(h(k) + i) % M</span>','<span class="mono" dir="ltr">(h(k) · i) % M</span>','h(k) % i'], a:1,
  why:'نضيف 1 في كل محاولة: slot = (home + i) % M، i = 0, 1, 2, … (الشريحة 18).'},
 {topic:'التوقّف', q:'متى نتوقف في البحث بالفحص الخطّي؟',
  opts:['بعد M محاولات','عند المفتاح أو عند أول خانة فارغة','عند أول تصادم','عند نهاية المصفوفة فقط'], a:1,
  why:'المفتاح يعني «وُجد»، والخانة الفارغة تعني «غير موجود» — لا حاجة لمسح الجدول.'},
 {topic:'المحاولات', q:'في <span class="mono" dir="ltr">M = 10</span> أدخلنا 12, 22, 32, 42. كم محاولة احتاج 42؟',
  opts:['1','2','3','4'], a:3, why:'الخانات 2, 3, 4 مشغولة ← الخانة 5 حرة: أربع محاولات (الشريحة 17).'},
 {topic:'المحاولات', q:'لماذا احتاج المفتاح 48 سبع محاولات في جدول الشريحة 19؟',
  opts:['لأن 48 عدد كبير','لأن خانته 8 والخانات 8, 9, 0, 1, 2, 3 كانت مشغولة','لأن الجدول فارغ','لأن العدد 48 أولي'],
  a:1, why:'48 % 10 = 8، والمسار 8 → 9 → 0 → 1 → 2 → 3 → 4 = سبع محاولات (الشريحة 19).'},
 {topic:'التجمّع', q:'ما التجمّع الأولي (primary clustering)؟',
  opts:['تصادم مفتاحين فقط','كتلة متّصلة من الخانات الممتلئة تجذب مزيدًا من التصادمات','امتلاء الجدول كاملًا','خطأ في دالة التجزئة'],
  a:1, why:'الكتلة المتّصلة تلتقط كل مفتاح يهبط داخلها أو قبلها، فتطول المحاولات (الشرائح 17 و21).'},
 {topic:'التجمّع', q:'ما العلاج الموصى به للتجمّع مع العنونة المفتوحة؟',
  opts:['إبقاء λ ≤ 0.5','إبقاء λ ≈ 1','حذف المفاتيح','استخدام M كبير جدًا فقط'], a:0,
  why:'أقل من نصف امتلاء: نحو 1.5 محاولة للبحث الناجح و2.5 للفاشل (Knuth, الشريحة 19).'},
 {topic:'الحذف', q:'لماذا لا يجوز إفراغ الخانة عند الحذف؟',
  opts:['لأن الحذف ممنوع','لأن الخانة الفارغة تُوقف البحث فيقول «غير موجود» لمفتاح موجود بعدها','لأن الذاكرة تُهدر','لأن λ يتغيّر'],
  a:1, why:'البحث يتوقف عند أول خانة فارغة؛ إفراغ الخانة يقطع المسار ويُفقد المفاتيح التالية (الشريحة 20).'},
 {topic:'علامة AV', q:'ما معنى علامة <span class="mono" dir="ltr">AV</span>؟',
  opts:['مفتاح جديد اسمه AV','خانة «كانت مستخدمة»: البحث يتجاوزها والإدخال قد يعيد استخدامها','خطأ في الجدول','قيمة فارغة دائمًا'], a:1,
  why:'AV تحفظ استمرارية المسار بعد الحذف، فلا ينقطع البحث قبل وقته (الشريحة 20).'},
 {topic:'المقارنة', q:'أي صفّ في جدول الشريحة 20 صحيح؟',
  opts:['السلسلة تسمح λ ≤ 0.5 والعنونة المفتوحة ≤ 0.9','الاثنان ≤ 0.5','السلسلة تسمح λ ≤ 0.9 (نحو 1) والعنونة المفتوحة ≤ 0.5','لا عتبة لأيّهما'],
  a:2, why:'السلسلة تتحمّل حِملًا أعلى، والعنونة المفتوحة تحتاج نصف جدول فارغ (الشريحة 20).'}
];

/* ================= TOOL 4.3.1: مِعمل الفحص الخطّي ================= */
M.tools = [{id:'probes'}];
M.mount = [function(){
  const host = document.getElementById('host-probes'); if(!host) return;
  host.innerHTML = `
    <div class="act" id="probes">
      <div class="act-h"><span class="act-k">Tool <b>4.3.1</b></span><h3>مِعمل الفحص الخطّي: المحاولات والمسار</h3></div>
      <div class="toolrow">
        <div><label class="fl" for="pbKeys">المفاتيح بالترتيب</label>
          <input type="text" id="pbKeys" value="11, 13, 15, 17, 25, 37, 38, 40, 41, 48" dir="ltr" style="max-width:300px"></div>
        <div><label class="fl" for="pbM">M</label>
          <input type="number" id="pbM" value="10" min="2" max="61"></div>
        <div><label class="fl" for="pbK">ابحث عن</label>
          <input type="number" id="pbK" value="48" min="0" max="99999"></div>
        <button class="btn" type="button" id="pbRun">احسب</button>
      </div>
      <div id="pbOut" style="margin-top:var(--s3)" aria-live="polite"></div>
    </div>`;
  const run = ()=>{
    const raw = (document.getElementById('pbKeys').value.match(/-?\d+/g)||[]).map(Number);
    const Mt = Math.max(2, Math.min(61, parseInt(document.getElementById('pbM').value,10)||10));
    const target = parseInt(document.getElementById('pbK').value,10);
    const out = document.getElementById('pbOut');
    if(!raw.length){ out.innerHTML = '<p class="fb show bad">أدخل مفتاحًا واحدًا على الأقل.</p>'; return; }
    const t = linTable(Mt, raw);
    const s = isNaN(target) ? null : searchProbes(Mt, raw, target);
    out.innerHTML = `
      <div class="tw"><table><caption>الجدول النهائى · M = ${Mt} · λ = ${(raw.length/Mt).toFixed(2)}</caption>
        <thead><tr>${t.t.map((v,i)=>`<th class="c">${i}</th>`).join('')}</tr></thead>
        <tbody><tr>${t.t.map(v=>`<td class="c ltr">${v===null?'—':v}</td>`).join('')}</tr></tbody></table></div>
      <div class="kv">
        <span>عدد المفاتيح <b>${raw.length}</b></span>
        <span>خانات مشغولة <b>${t.used} / ${Mt}</b></span>
        <span>أقصى محاولات إدخال <b>${Math.max(...t.probes)}</b></span>
        <span>متوسط المحاولات <b>${(t.probes.reduce((a,b)=>a+b,0)/t.probes.length).toFixed(2)}</b></span>
        ${s? `<span>البحث عن ${target}: <b>${s.found? 'وُجد' : 'غير موجود'}</b> بعد <b>${s.probes}</b> محاولة</span>
              <span class="mono">المسار: ${s.tried.join(' → ')}</span>`: ''}
      </div>`;
  };
  const btn = document.getElementById('pbRun');
  btn && btn.addEventListener('click', ()=>{
    run();
    const st = window.CS && window.CS.ST;
    if(st && !st.tool.probes){ st.tool.probes = true; window.CS.save(); }
  });
  run();
}];

window.MODULE = M;
})();
