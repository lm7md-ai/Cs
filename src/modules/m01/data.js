/* بيانات وحدة M01 — الشرائح 1–6 فقط (Hash p.1–6) */
(function(){
const M = {};
M.id = 'm01';
const mod = (a,b)=> ((a%b)+b)%b;
const pick = a => a[Math.floor(Math.random()*a.length)];
function chainOf(Mt,keys){
  const t = Array.from({length:Mt},()=>[]); const cols=[];
  keys.forEach(k=>{ const i=mod(k,Mt); if(t[i].length) cols.push(k); t[i].push(k); });
  return {t,cols,longest:Math.max(...t.map(c=>c.length)),used:t.filter(c=>c.length).length};
}
M.range = [1,6];

M.sections = [
  {id:'s11'},{id:'s12'},
  {id:'s13', acts:['pa:1.3.1']},
  {id:'s14', acts:['anim:pipe','tool:sandbox']},
  {id:'s15', acts:['ca:1']},
  {id:'s16', acts:['quiz']}
];

/* ---------- ANIMATION: المفتاح ← h(key) ← الخانة ثم تصادم ---------- */
M.anims = { pipe: { steps: [
  {line:2, cap:'المفتاح 1. لا نبحث عن مكانه، نحسبه.', lbl:{c1:'1'}, css:[{id:'c1',t:1}],
   watch:{k:'1',h:'—',i:'—',c:'0'}, fx:['draw:ar1','draw:ar2']},
  {line:2, cap:'<b>1 % 7</b> — الباقي 1. العدّاد يرتفع قبل أن تتحرك الشريحة.', fx:['count:cu:1'], pos:{c1:'n-h'}, set:[{id:'cu',text:'1'}], watch:{h:'1'}},
  {line:2, cap:'الباقي 1 ← الخانة 1. الشريحة تنتقل إلى الخانة.', pos:{c1:'p1'}, set:[{id:'niv',text:'1'}], watch:{i:'1'}},
  {line:2, cap:'المفتاح 1 في الخانة 1. الخانة الآن <b>مشغولة</b>.', pos:{c1:'p1'}, fx:['pulse:p1:ok'], hot:['p1']},
  {line:2, cap:'المفتاح التالي: <b>7</b>.', set:[{id:'keyv',text:'7'}], lbl:{c7:'7'}, css:[{id:'c7',t:1}],
   pos:{c1:'p1'}, watch:{k:'7',h:'—',i:'—'}},
  {line:2, cap:'<b>7 % 7</b> … الباقي لا يساوي 7 أبدًا.', fx:['count:cu:7'], pos:{c1:'p1'}, set:[{id:'cu',text:'7'}], watch:{h:'7'}},
  {line:2, cap:'7 يقبل القسمة على 7 تمامًا ← الباقي <b>0</b>.', fx:['count:cu:0'], pos:{c1:'p1'}, set:[{id:'cu',text:'0'}], watch:{h:'0'}},
  {line:2, cap:'7 في الخانة <b>0</b>.', pos:{c1:'p1',c7:'p0'}, fx:['pulse:p0:ok'], hot:['p0'],
   set:[{id:'niv',text:'0'}], watch:{i:'0'}},
  {line:2, cap:'المفتاح <b>25</b>.', set:[{id:'keyv',text:'25'}], lbl:{c25:'25'}, css:[{id:'c25',t:1}],
   pos:{c1:'p1',c7:'p0'}, watch:{k:'25',h:'—',i:'—'}},
  {line:2, cap:'<b>25 % 7</b> — العدّاد إلى 25.', fx:['count:cu:25'], pos:{c1:'p1',c7:'p0'}, set:[{id:'cu',text:'25'}], watch:{h:'25'}},
  {line:2, cap:'ثم الباقي: 7×3 = 21، والباقي <b>4</b>.', fx:['count:cu:4'], pos:{c1:'p1',c7:'p0'}, set:[{id:'cu',text:'4'}], watch:{h:'4'}},
  {line:2, cap:'25 في الخانة <b>4</b>.', pos:{c1:'p1',c7:'p0',c25:'p4'}, fx:['pulse:p4:ok'], hot:['p4'],
   set:[{id:'niv',text:'4'}], watch:{i:'4'}},
  {line:2, cap:'المفتاح الأخير في الشريحة: <b>15</b>.', set:[{id:'keyv',text:'15'}], lbl:{c15:'15'}, css:[{id:'c15',t:1}],
   pos:{c1:'p1',c7:'p0',c25:'p4'}, watch:{k:'15',h:'—',i:'—'}},
  {line:2, cap:'<b>15 % 7</b> …', fx:['count:cu:15'], pos:{c1:'p1',c7:'p0',c25:'p4'}, set:[{id:'cu',text:'15'}], watch:{h:'15'}},
  {line:2, cap:'7×2 = 14، والباقي <b>1</b> — الخانة 1 نفسها!', fx:['count:cu:1'], pos:{c1:'p1',c7:'p0',c25:'p4'}, set:[{id:'cu',text:'1'}], watch:{h:'1'}},
  {line:2, cap:'<b>تصادم:</b> الخانة 1 مشغولة بـ 1، والمفتاح 15 يريدها أيضًا. هذه هي الحالة التي تُحلّ في 1.7 وما بعدها.',
   pos:{c1:'p1',c7:'p0',c25:'p4',c15:'p1'}, fx:['shake:p1'], lbl:{c15:'15 · occupied'},
   cls:{c15:'bad'}, set:[{id:'niv',text:'1'}], watch:{c:'1',i:'1'}, hot:['p1']}
]}};

/* ---------- PARTICIPATION ACTIVITY (الشرائح 3–6) ---------- */
M.pas = [
  {num:'1.3.1', sec:'s16', after:'host-pa1', title:'تحقّق: الخريطة والقاعدة', items:[
    {q:'أي عملية في <span class="mono" dir="ltr">dict</span> تُرجع خطأً إن غاب المفتاح؟',
     opts:['<span class="mono" dir="ltr">map[k]</span>','<span class="mono" dir="ltr">k in map</span>','<span class="mono" dir="ltr">map.get(k)</span>'], a:0,
     why:'<span class="mono" dir="ltr">map[k]</span> ترفع KeyError؛ أما <span class="mono" dir="ltr">in</span> فتُرجع False، و<span class="mono" dir="ltr">get</span> تُرجع None أو القيمة الافتراضية.'},
    {q:'في جدول <span class="mono" dir="ltr">M = 7</span>، ما خانة المفتاح <span class="mono" dir="ltr">7</span>؟',
     opts:['7','0','6','1'], a:1, why:'7 % 7 = 0: الباقي صفر لأن 7 من مضاعفات المقاس.'},
    {q:'مع <span class="mono" dir="ltr">M = 7</span>، أي مفتاحين يتصادمان في جدول الشريحة 6؟',
     opts:['1 و 3','15 و 4','7 و 25','12 و 15'], a:1,
     why:'15 % 7 = 1 (والخانة 1 فيها 1)، و4 % 7 = 4 (والخانة 4 فيها 25) — وهما التصادمان الوحيدان في المثال.'}
  ]}
];

/* ---------- CHALLENGE (خمسة مستويات على الشرائح 3–6) ---------- */
M.ca = { num:'1.4.1', title:'الخانة الأصلية والتصادم', levels:[
  ()=>{ const Mt=pick([5,7,11,13]); const k=pick([3,4,12,15,25,7,20,31]);
        return {kind:'num', q:`جدول <span class="mono" dir="ltr">M = ${Mt}</span> وقاعدة <span class="mono" dir="ltr">h(k) = k % ${Mt}</span>. ما خانة المفتاح <span class="mono" dir="ltr">${k}</span>؟`,
                a: mod(k,Mt), hint:`اقسم ${k} على ${Mt} وخُذ الباقي.`, why:`${k} % ${Mt} = ${mod(k,Mt)} ← الخانة ${mod(k,Mt)}.`}; },
  ()=>{ const Mt=pick([7,11]); const base=pick([1,3,25]); const k=base+Mt*pick([1,2]);
        const home=mod(base,Mt);
        return {kind:'num', q:`الخانة <span class="mono" dir="ltr">${home}</span> مشغولة بالمفتاح <span class="mono" dir="ltr">${base}</span> في <span class="mono" dir="ltr">M = ${Mt}</span>. إلى أي خانة يريد المفتاح <span class="mono" dir="ltr">${k}</span> أن يذهب؟`,
                a: home, hint:`${k} = ${base} + ${Mt}×${(k-base)/Mt} ← له الباقي نفسه.`,
                why:`${k} % ${Mt} = ${home}: الحساب لا يعرف أن الخانة مشغولة — ولهذا يحدث التصادم.`}; },
  ()=>{ const keys=[1,3,7,25,15,4,12];
        const c=chainOf(7,keys);
        return {kind:'num', q:`للمفاتيح <span class="mono" dir="ltr">1, 3, 7, 25, 15, 4, 12</span> في <span class="mono" dir="ltr">M = 7</span>: كم <b>خانة مشغولة</b>؟`,
                a: c.used, hint:'عدّ الخانات المختلفة التي تصل إليها البواقي.', why:`الخانات المشغولة: ${c.t.map((v,i)=>v.length?i:null).filter(v=>v!==null).join(', ')} ← ${c.used} خانة.`}; },
  ()=>{ const keys=[1,3,7,25,15,4,12]; const c=chainOf(7,keys);
        return {kind:'num', q:`نفس المفاتيح <span class="mono" dir="ltr">1, 3, 7, 25, 15, 4, 12</span> في <span class="mono" dir="ltr">M = 7</span>: كم <b>تصادمًا</b> يحدث (مفتاح يجد خانته مشغولة)؟`,
                a: c.cols.length, hint:'كل مفتاح غير أول يهبط في خانة مشغولة يُحسب.', why:`المتصادمان: ${c.cols.join(', ')} ← ${c.cols.length} تصادم.`}; },
  ()=>{ const k=pick([7,25,15,4,12,3]);
        return {kind:'num', q:`في جدول الشريحة 6 (<span class="mono" dir="ltr">M = 7</span>)، كم <b>مقارنة/خطوة</b> يحتاج البحث عن المفتاح <span class="mono" dir="ltr">${k}</span> إن وُجد مباشرة في خانته؟`,
                a: 1, hint:'القاعدة: حساب واحد ثم خانة واحدة.', why:`${k} % 7 = ${mod(k,7)} ← خانة واحدة: خطوة واحدة فقط، وهذا معنى O(1).`}; }
]};

/* ---------- QUIZ (8 أسئلة على 1–6) ---------- */
M.quiz = [
 {topic:'لماذا التجزئة', q:'ما تكلفة البحث في قائمة مرتّبة بالبحث الثنائي، وتكلفة الإدخال فيها؟',
  opts:['O(1) و O(1)','O(log n) و O(n)','O(n) و O(log n)','O(log n) و O(log n)'], a:1,
  why:'البحث الثنائي O(log n)، لكن الإدخال في المنتصف يزحزح العناصر ← O(n).'},
 {topic:'الخريطة', q:'أي تعبير يرفع <span class="mono" dir="ltr">KeyError</span> إذا غاب المفتاح؟',
  opts:['<span class="mono" dir="ltr">k in map</span>','<span class="mono" dir="ltr">map.get(k)</span>','<span class="mono" dir="ltr">map[k]</span>','<span class="mono" dir="ltr">len(map)</span>'], a:2,
  why:'الوصول المباشر map[k] يرفع الخطأ؛ in تُرجع False، وget تُرجع None.'},
 {topic:'الفكرة', q:'ما الخطوتان في كل عملية على جدول تجزئة؟',
  opts:['رتّب ثم ابحث','احسب الخانة ثم اذهب إليها','امسح الخانات حتى تجد','قارن كل مفتاح بالهدف'], a:1,
  why:'i = h(key) ثم الذهاب إلى الخانة i مباشرة — بلا مسح (الشريحة 5).'},
 {topic:'الفكرة', q:'تعريف جدول التجزئة كما في الشريحة 5:',
  opts:['قائمة مرتبطة مرتّبة','مصفوفة من M خانة + دالة تجزئة','شجرة ثنائية متوازنة','مصفوفة مرتّبة + بحث ثنائي'], a:1,
  why:'Array of M slots + hash function، والتخزين في الخانة h(key).'},
 {topic:'حساب الخانة', q:'في <span class="mono" dir="ltr">M = 7</span>، ما خانة المفتاح 25؟',
  opts:['3','4','5','0'], a:1, why:'7×3 = 21 والباقي 4 ← الخانة 4.'},
 {topic:'حساب الخانة', q:'في <span class="mono" dir="ltr">M = 7</span>، ما خانة المفتاح 7؟',
  opts:['7','1','0','6'], a:2, why:'الباقي صفر لأن 7 من مضاعفات 7، فلا يمكن أن يكون الباقي 7.'},
 {topic:'التصادم', q:'في مثال الشريحة 6، أي مفتاحين يتصادمان؟',
  opts:['7 و 12','1 و 15','25 و 12','3 و 4'], a:1, why:'15 % 7 = 1 والخانة 1 فيها 1 ← تصادم؛ وكذلك 4 مع 25 في الخانة 4.'},
 {topic:'مثال محسوب', q:'البحث عن المفتاح 7 في مثال الشريحة 6 يكلف:',
  opts:['7 مقارنات','حسابًا واحدًا ونظرة واحدة','مسح نصف الجدول','O(n)'], a:1,
  why:'7 % 7 = 0 ← الخانة 0 ← Abdullah. هذه هي فكرة O(1) في المتوسط.'}
];

/* ---------- مِعمل صغير (أداة القسم 1.4) ---------- */
M.tools = [{id:'sandbox', btn:'sbRun'}];
M.mount = [function(){
  const host = document.getElementById('host-sandbox'); if(!host) return;
  host.innerHTML = `
    <div class="act" id="sandbox">
      <div class="act-h"><span class="act-k">Tool <b>1.4.2</b></span><h3>مِعمل صغير: احسب جدولك</h3></div>
      <div class="toolrow">
        <div><label class="fl" for="sbKeys">المفاتيح (مفصولة بفاصلة أو مسافة)</label>
          <input type="text" id="sbKeys" value="2, 9, 16, 4" dir="ltr" style="max-width:260px"></div>
        <div><label class="fl" for="sbM">M (عدد الخانات)</label>
          <input type="number" id="sbM" value="7" min="2" max="31"></div>
        <button class="btn" type="button" id="sbRun">احسب</button>
      </div>
      <div id="sbOut" style="margin-top:var(--s3)" aria-live="polite"></div>
    </div>`;
  const btn = document.getElementById('sbRun');
  function run(){
    const raw = (document.getElementById('sbKeys').value.match(/-?\d+/g)||[]).map(Number);
    const Mt = Math.max(2, Math.min(31, parseInt(document.getElementById('sbM').value,10)||7));
    const out = document.getElementById('sbOut');
    if(!raw.length){ out.innerHTML = '<p class="fb show bad">أدخل مفتاحًا واحدًا على الأقل.</p>'; return; }
    const {t,cols,used} = chainOf(Mt, raw);
    out.innerHTML = `
      <div class="tw"><table><caption>الجدول (سلسلة) · M = ${Mt}</caption>
        <thead><tr><th class="c">slot</th><th>chain</th><th class="c">طول</th></tr></thead><tbody>
        ${t.map((c,i)=>`<tr><td class="c ltr">${i}</td><td class="ltr">${c.length?c.join(' → '):'—'}</td><td class="c">${c.length}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="kv">
        <span>عدد المفاتيح <b>${raw.length}</b></span>
        <span>خانات مشغولة <b>${used} / ${Mt}</b></span>
        <span>تصادمات <b>${cols.length}</b> ${cols.length?'('+cols.join(', ')+')':''}</span>
        <span>λ <b>${(raw.length/Mt).toFixed(2)}</b></span>
      </div>`;
  }
  btn && btn.addEventListener('click', ()=>{
    run();
    const store = window.CS && window.CS.ST;
    if(store && !store.tool.sandbox){ store.tool.sandbox = true; window.CS.save(); }
  });
  run();
}];

/* ---------- فحوص ذاتية محسوبة (تُقارن بأرقام الشريحة 6) ---------- */
M.selftests = [
  {name:'h(7) with M=7', got:()=> mod(7,7), want:0, slide:'6'},
  {name:'h(25) with M=7', got:()=> mod(25,7), want:4, slide:'6'},
  {name:'h(15) with M=7', got:()=> mod(15,7), want:1, slide:'6'},
  {name:'h(4) with M=7', got:()=> mod(4,7), want:4, slide:'6'},
  {name:'slots used (7 keys, M=7)', got:()=> chainOf(7,[1,3,7,25,15,4,12]).used, want:5, slide:'6'},
  {name:'collisions (7 keys, M=7)', got:()=> chainOf(7,[1,3,7,25,15,4,12]).cols.length, want:2, slide:'6'}
];

M.checklist = [
  'أشرح لماذا البحث الثنائي لا يكفي (O(log n) بحثًا وO(n) إدخالًا).',
  'أسمّي عمليات الخريطة الخمس في بايثون وأعرف أيّها يرفع KeyError.',
  'أحسب <b>key % M</b> بلا آلة، وأعرف أن الباقي دائمًا أصغر من M.',
  'أشرح لماذا يقع مفتاحان في الخانة نفسها، وأن ذلك ليس خطأً في الكود.'
];

window.MODULE = M;
})();
