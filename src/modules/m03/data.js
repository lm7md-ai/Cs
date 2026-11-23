/* بيانات وحدة M03 — الشرائح 12 · 13 · 14 · 25 · 26 */
(function(){
const M = {};
M.id = 'm03';
const mod = (a,b)=> ((a%b)+b)%b;
const pick = a => a[Math.floor(Math.random()*a.length)];
const $ = s=>document.querySelector(s);
const $$ = (s,r)=>Array.from((r||document).querySelectorAll(s));
function chainTable(Mt, keys){
  const t = Array.from({length:Mt},()=>[]); const cols=[];
  keys.forEach(k=>{ const i=mod(k,Mt); if(t[i].length) cols.push({k,slot:i}); t[i].push(k); });
  return {t, cols, longest: Math.max(0,...t.map(c=>c.length))};
}
function comparisons(Mt, keys, target){
  const {t} = chainTable(Mt, keys);
  const chain = t[mod(target,Mt)];
  const idx = chain.indexOf(target);
  return idx === -1 ? 0 : idx+1;
}
const LAMBDA = (n,Mt)=> n/Mt;

M.sections = [
  {id:'s31'},{id:'s32', acts:['anim:chain']},
  {id:'s33'},{id:'s34', acts:['pa:3.4.1']},
  {id:'s35', acts:['anim:rehash','tool:gauge']},
  {id:'s36', acts:['ca:1']},
  {id:'s37', acts:['quiz']}
];

/* ================= ANIMATION 1: نمو السلسلة ================= */
M.anims = { chain: { steps: [
  {cap:'المفتاح <b>5</b>: نبدأ بالخانة، لا بالقائمة.', lbl:{q5:'5'}, css:[{id:'q5',t:1}],
   watch:{k:'5',h:'—',c:'—',n:'0'}, fx:['draw:ch-a1','draw:ch-a2']},
  {cap:'<b>5 % 7</b> = 5 — العدّاد يرتفع أولًا.', fx:['count:ch-cu:5'], set:[{id:'ch-cu',text:'5'}],
   watch:{h:'5'}},
  {cap:'الخانة 5 فارغة ← 5 هو أول عنصر في السلسلة. طولها 1.', pos:{q5:'k5'}, fx:['pulse:k5:ok'],
   set:[{id:'ch-cv',text:'5'}], hot:['k5'], watch:{c:'5',n:'1'}},
  {cap:'المفتاح التالي <b>12</b>: خانته المحسوبة أيضًا 5.', lbl:{q12:'12'}, css:[{id:'q12',t:1}],
   set:[{id:'ch-kv',text:'12'}], watch:{k:'12'}},
  {cap:'<b>12 % 7</b> … احسب الباقي أولًا.', fx:['count:ch-cu:12'], set:[{id:'ch-cu',text:'12'}], watch:{h:'12'}},
  {cap:'الباقي <b>5</b>: الخانة مشغولة ← لا نغيّر الخانة، بل نُضيف إلى السلسلة. طولها 2.',
   fx:['count:ch-cu:5','shake:k5'], set:[{id:'ch-cu',text:'5'}], pos:{q5:'k5',q12:'k5'},
   set2:null, lbl:{q12:'12'}, hot:['k5'], watch:{h:'5',c:'5 · 12',n:'2'}},
  {cap:'المفتاح <b>33</b>: <b>33 % 7</b> …', lbl:{q33:'33'}, css:[{id:'q33',t:1}],
   set:[{id:'ch-kv',text:'33'}], pos:{q5:'k5',q12:'k5'}, fx:['count:ch-cu:33'], watch:{k:'33',h:'33'}},
  {cap:'الباقي 5 مرة أخرى ← سلسلة من ثلاثة: <b>5 · 12 · 33</b>. البحث عن 33 يكلّف 3 مقارنات.',
   fx:['count:ch-cu:5'], set:[{id:'ch-cu',text:'5'},{id:'ch-cv',text:'5 · 12 · 33'}],
   pos:{q5:'k5',q12:'k5',q33:'k5'}, hot:['k5'], watch:{h:'5',c:'5 · 12 · 33',n:'3'}}
]}};

/* ================= ANIMATION 2: إعادة التجزئة ================= */
M.anims['rehash'] = { steps: [
  {cap:'الجدول القديم: <b>M = 5</b> وأربعة مفاتيح. λ = 4/5 = <b>0.8</b>.', css:[{id:'r7',t:1},{id:'r12',t:1},{id:'r23',t:1},{id:'r9',t:1}],
   watch:{m:'5',l:'0.80',k:'—',s:'—'}},
  {cap:'<b>0.8 &gt; 0.75</b> ← نكبّر: M = 2·5 + 1 = <b>11</b>. المفاتيح لم تُحذف، لكن خاناتها القديمة لم تعد صالحة.',
   watch:{m:'11',l:'0.80'}},
  {cap:'<b>7</b>: 7 % 11 = <b>7</b>. انتقل من الخانة 2 إلى 7.', pos:{r7:'n7',r12:'o2',r23:'o3',r9:'o4'},
   fx:['pulse:n7:ok'], hot:['n7'], watch:{k:'7',s:'7'}},
  {cap:'<b>12</b>: 12 % 11 = <b>1</b>. لاحظ: لن يبقى في الخانة 2.', pos:{r7:'n7',r12:'n1',r23:'o3',r9:'o4'},
   fx:['pulse:n1:ok'], hot:['n1'], watch:{k:'12',s:'1'}},
  {cap:'<b>23</b>: 23 % 11 = <b>1</b> أيضًا ← تصادم في الجدول الجديد، فتصير السلسلة 12 · 23.', pos:{r7:'n7',r12:'n1',r23:'n1',r9:'o4'},
   fx:['shake:n1'], hot:['n1'], watch:{k:'23',s:'1'}},
  {cap:'<b>9</b>: 9 % 11 = <b>9</b>. آخر مفتاح.', pos:{r7:'n7',r12:'n1',r23:'n1',r9:'n9'},
   fx:['pulse:n9:ok'], hot:['n9'], watch:{k:'9',s:'9'}},
  {cap:'λ بعد التوسيع = 4/11 ≈ <b>0.36</b> — عاد الجدول إلى المنطقة المريحة.', pos:{r7:'n7',r12:'n1',r23:'n1',r9:'n9'},
   watch:{m:'11',l:'0.36'}},
  {cap:'التكلفة: إعادة الإدراج <b>O(n)</b> لكنها نادرة ← متوسط الإدخال يبقى O(1) موزَّعًا. ولو نسخت الخانات كما هي لضاع كل مفتاح (فخّ Lab 6 الثاني).',
   pos:{r7:'n7',r12:'n1',r23:'n1',r9:'n9'}, watch:{l:'0.36'}}
]};

/* ================= PARTICIPATION ================= */
M.pas = [
  {num:'3.4.1', sec:'s34', after:'host-pa1', title:'تحقّق: λ وقرار التوسيع', items:[
    {q:'جدول فيه <span class="mono" dir="ltr">n = 9</span> و<span class="mono" dir="ltr">M = 7</span>. ما λ (بمنزلة عشرية واحدة)؟',
     opts:['0.78','1.3','7','1.5'], a:1, why:'λ = 9/7 ≈ 1.286 ← 1.3. وهو معامل الحِمل لا عدد المفاتيح.'},
    {q:'<span class="mono" dir="ltr">n = 4</span> و<span class="mono" dir="ltr">M = 5</span> — هل نوسّع بالسلسلة؟',
     opts:['لا، λ = 0.8 لكن الحد 0.9','نعم، لأن λ = 0.8 > 0.75','لا، لأن λ = 0.5','نعم، لأن 4 عدد زوجي'], a:1,
     why:'عتبة السلسلة 0.75، و0.8 يتجاوزها ← نوسّع إلى 2·5+1 = 11 فيصبح λ = 4/11 ≈ 0.36.'},
    {q:'بعد التوسيع من 5 إلى 11، ما خانة المفتاح 12؟',
     opts:['2 (كالمعتاد)','1','12','0'], a:1, why:'12 % 11 = 1. ولو نسخنا الخانة كما هي لبقي في 2 فأصبح لا يُوجد.'}
  ]}
];

/* ================= CHALLENGE ================= */
M.ca = { num:'3.5.1', title:'λ · السلسلة · إعادة التجزئة', levels:[
  ()=>{ const Mt=pick([8,10,12,16]); const lim=(Mt*3)/4; // عتبة 0.75
        return {kind:'num', q:`جدول سلسلة <span class="mono" dir="ltr">M = ${Mt}</span> وعتبة التوسيع 0.75. ما <b>أكبر عدد مفاتيح</b> يبقى عندها λ ≤ 0.75؟`,
                a: Math.floor(lim), hint:`احسب 0.75 × ${Mt} وخُذ الجزء الصحيح.`, why:`0.75 × ${Mt} = ${lim} ← أقصى عدد ${Math.floor(lim)} مفتاحًا (λ = ${(Math.floor(lim)/Mt).toFixed(2)}).`}; },
  ()=>{ const Mt=pick([5,7,9,11]);
        return {kind:'num', q:`جدول <span class="mono" dir="ltr">M = ${Mt}</span> تجاوز عتبته. إلى أي مقاس نوسّعه كما في الشريحة 26؟`,
                a: 2*Mt+1, hint:'الصيغة 2·M + 1.', why:`2 × ${Mt} + 1 = ${2*Mt+1}.`}; },
  ()=>{ const Mt=pick([5,7]); const base=pick([1,3,6]); const keys=[0,1,2].map(i=>base+Mt*i);
        const c=chainTable(Mt,keys);
        return {kind:'num', q:`في <span class="mono" dir="ltr">M = ${Mt}</span> أدخلنا <span class="mono" dir="ltr">${keys.join(', ')}</span> (كلها لها الخانة نفسها). كم يبلغ <b>طول السلسلة</b>؟`,
                a: c.t[mod(base,Mt)].length, hint:'كلها في سلسلة واحدة؛ الطول = عدد المفاتيح.', why:`الخانة ${mod(base,Mt)} تحمل ${keys.join(' · ')} ← الطول ${keys.length}.`}; },
  ()=>{ const keys=[1,5,7,12,20,29,9,22,33]; const target=pick([33,22,29,12,5]);
        return {kind:'num', q:`جدول الشريحة 13 (<span class="mono" dir="ltr">M = 7</span>) وفيه <span class="mono" dir="ltr">1, 5, 7, 12, 20, 29, 9, 22, 33</span>. كم <b>مقارنة</b> يحتاج البحث عن <span class="mono" dir="ltr">${target}</span>؟`,
                a: comparisons(7, keys, target), hint:`ابدأ من الخانة ${mod(target,7)} وامشِ على السلسلة بالترتيب.`,
                why:`${target} % 7 = ${mod(target,7)}، وسلسلتها ${chainTable(7,keys).t[mod(target,7)].join(' → ')} ← ${comparisons(7,keys,target)} مقارنات.`}; },
  ()=>{ const M0=pick([5,7]); const M1=2*M0+1; const k=pick([9,12,23,7,20,33]);
        return {kind:'num', q:`بعد التوسيع من <span class="mono" dir="ltr">M = ${M0}</span> إلى ${M1}، ما خانة المفتاح <span class="mono" dir="ltr">${k}</span> في الجدول الجديد؟`,
                a: mod(k,M1), hint:`${k} % ${M1}`, why:`${k} % ${M1} = ${mod(k,M1)} (كانت ${mod(k,M0)} في القديم).`}; }
]};

/* ================= QUIZ ================= */
M.quiz = [
 {topic:'السلسلة', q:'في السلسلة، ماذا يحدث عند تصادم مفتاحين؟',
  opts:['يُرفض الثاني','يُضاف الثاني إلى قائمة الخانة نفسها','يُنقل الأول إلى خانة أخرى','يُعاد حساب الدالة'], a:1,
  why:'الشريحة 12: كل خانة تحمل قائمة ALL keys whose home slot it is.'},
 {topic:'السلسلة', q:'أي عملية تمسح <b>سلسلة واحدة</b> فقط؟',
  opts:['<span class="mono" dir="ltr">get(k)</span>','مسح الجدول كله','<span class="mono" dir="ltr">len(map)</span>','بحث ثنائي'], a:0,
  why:'get تبدأ من _index(key) وتمسح تلك السلسلة؛ مسح الجدول كله هو الفخ الأول من Lab 6.'},
 {topic:'السلسلة', q:'ما أطول سلسلة في تتبّع الشريحة 13 (M = 7)؟',
  opts:['1','2','3','9'], a:2, why:'الخانة 1 فيها 1 · 29 · 22 ← 3، وكذلك الخانة 5 فيها 5 · 12 · 33.'},
 {topic:'السلسلة', q:'<span class="mono" dir="ltr">search(4)</span> في ذلك الجدول يكلّف:',
  opts:['0 مقارنات لأن الخانة 4 فارغة','مقارنة واحدة','4 مقارنات','9 مقارنات'], a:0,
  why:'4 % 7 = 4، والخانة فارغة ← لا شيء يُقارن.'},
 {topic:'السلسلة', q:'أسوأ حالة لجدول سلسلة فيه n مفتاحًا:',
  opts:['O(1)','O(log n)','O(n)','O(n²)'], a:2, why:'إن وقعت كل المفاتيح في سلسلة واحدة بدالة سيّئة ← مسح O(n).'},
 {topic:'معامل الحِمل', q:'λ = 9/7 تقريبًا:',
  opts:['0.78','1.29','7','9'], a:1, why:'λ = n/M = 9/7 ≈ 1.29، وهو متوسط طول السلسلة.'},
 {topic:'معامل الحِمل', q:'أي λ يوصف بأنه «النقطة المثلى» في الشريحة 25؟',
  opts:['0.25','0.5','0.75','1.5'], a:2, why:'12 مفتاحًا في 16 خانة ← 0.75 sweet spot.'},
 {topic:'إعادة التجزئة', q:'من <span class="mono" dir="ltr">M = 5</span>، ما المقاس الجديد كما في الشريحة 26؟',
  opts:['6','10','11','12'], a:2, why:'2·5 + 1 = 11.'},
 {topic:'إعادة التجزئة', q:'لماذا نُعيد إدراج كل مفتاح بدل نسخ الخانات؟',
  opts:['لأن النسخ أبطأ','لأن hash(k) % M يتغيّر بتغيّر M','لأن الخانات تُحذف تلقائيًا','لأن السلاسل تُقلب'], a:1,
  why:'الخانة دالة في M؛ النسخ المباشر يترك المفاتيح في خانات لا يمكن البحث فيها.'},
 {topic:'إعادة التجزئة', q:'بعد 5 → 11 مع 4 مفاتيح، λ تصبح:',
  opts:['0.80','0.55','0.36','0.20'], a:2, why:'4/11 ≈ 0.36 — وهذا سبب التوسيع: العودة إلى منطقة مريحة.'}
];

/* ================= TOOL: مقياس الحِمل ================= */
M.tools = [{id:'gauge'}];
M.mount = [function(){
  const host = document.getElementById('host-gauge'); if(!host) return;
  host.innerHTML = `
    <div class="act" id="gauge">
      <div class="act-h"><span class="act-k">Tool <b>3.5.2</b></span><h3>مقياس الحِمل وإعادة التجزئة</h3></div>
      <div class="toolrow">
        <div><label class="fl" for="gN">n — عدد المفاتيح</label><input type="range" id="gN" min="0" max="24" value="4" step="1"></div>
        <div><label class="fl" for="gM">M — عدد الخانات</label><input type="range" id="gM" min="4" max="24" value="5" step="1"></div>
        <button class="btn" type="button" id="gRehash">أعِد التجزئة (2M+1)</button>
        <button class="btn ghost" type="button" id="gReset">تصفير</button>
      </div>
      <p class="mono" id="gVal" style="margin:var(--s2) 0 6px">λ = 0.80</p>
      <div class="bar"><i id="gBar"></i></div>
      <p class="sm muted" id="gMsg" aria-live="polite"></p>
    </div>`;
  const n=$('#gN'), m=$('#gM'), bar=$('#gBar'), val=$('#gVal'), msg=$('#gMsg');
  function paint(){
    const N=+n.value, Mt=+m.value, l = N/Mt;
    val.textContent = `λ = ${N} / ${Mt} = ${l.toFixed(2)}`;
    bar.style.width = Math.min(100, l*100)+'%';
    if(l > 0.75){
      msg.className='sm fb show bad';
      msg.innerHTML = `λ تجاوز 0.75 ← السلاسل تطول. زر «أعِد التجزئة» يجعل M = ${2*Mt+1} فيصبح λ = ${(N/(2*Mt+1)).toFixed(2)}.`;
    } else {
      msg.className='sm muted';
      msg.textContent = l <= 0.25 ? 'منطقة سريعة لكن الجدول مهدر إلى حد كبير.' : 'داخل المنطقة المريحة (λ ≤ 0.75).';
    }
  }
  ['input','change'].forEach(ev=>{ n.addEventListener(ev,paint); m.addEventListener(ev,paint); });
  $('#gRehash').addEventListener('click', ()=>{
    const Mt=+m.value, t=2*Mt+1; m.max = Math.max(+m.max, t); m.value = t; paint();
    const st = window.CS && window.CS.ST;
    if(st && !st.tool.gauge){ st.tool.gauge=true; window.CS.save(); }
  });
  $('#gReset').addEventListener('click', ()=>{ n.value=4; m.value=5; paint(); });
  paint();
}];

/* ================= SELF TESTS (تُحسب) ================= */
const KEYS13 = [1,5,7,12,20,29,9,22,33];
M.selftests = [
  {name:'search(33) comparisons', got:()=> comparisons(7, KEYS13, 33), want:3, slide:'13'},
  {name:'search(4) comparisons',  got:()=> comparisons(7, KEYS13, 4),  want:0, slide:'13'},
  {name:'λ = 9/7',                got:()=> LAMBDA(9,7).toFixed(1),     want:'1.3', slide:'13'},
  {name:'longest chain (M=7)',    got:()=> chainTable(7,KEYS13).longest, want:3, slide:'13'},
  {name:'new M after resize (5 → ?)', got:()=> 2*5+1, want:11, slide:'26'},
  {name:'λ before resize (4/5)',  got:()=> LAMBDA(4,5).toFixed(2),    want:'0.80', slide:'26'},
  {name:'λ after resize (4/11)',  got:()=> LAMBDA(4,11).toFixed(2),   want:'0.36', slide:'26'}
];

M.checklist = [
  'أشرح السلسلة (قائمة في كل خانة) وأفرّقها عن العنونة المفتوحة.',
  'أحسب <span class="mono" dir="ltr">λ = n/M</span> وأقرّر: هل نوسّع؟ (عتبة 0.75 للسلسلة).',
  'أعرف أن التوسيع يعيد إدراج كل مفتاح لأن <span class="mono" dir="ltr">hash(k) % M</span> يتغيّر.',
  'أعدّ المقارنات في سلسلة بالترتيب، وأعرف أن الخانة الفارغة = 0 مقارنات.',
  'أتجنّب فخّي <span class="mono" dir="ltr">Lab 6</span>: مسح كل الخانات في <span class="mono" dir="ltr">get()</span>، ونسخ الخانة <span class="mono" dir="ltr">i → i</span> عند التوسيع.'
];

window.MODULE = M;
})();
