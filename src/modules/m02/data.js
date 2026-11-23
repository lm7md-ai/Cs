/* بيانات وحدة M02 — الشرائح 7–11 (Hash p.7–11) */
(function(){
const M = {};
M.id = 'm02';
M.range = [7,11];
const mod = (a,b)=> ((a%b)+b)%b;
const pick = a => a[Math.floor(Math.random()*a.length)];
const codeOf = s => { let n=0; for(const ch of String(s).toLowerCase()) n += ch.codePointAt(0); return n; };
function linSlot(Mt,k,occ){ let i=0; while(i<Mt){ const s=mod(k+i,Mt); if(!occ.has(s)) return {s,i,probes:i+1}; i++; } return {s:-1,i:Mt,probes:Mt}; }
function quadSlot(Mt,k,occ){ let i=0; while(i<Mt){ const s=mod(k+i*i,Mt); if(!occ.has(s)) return {s,i,probes:i+1}; i++; } return {s:-1,i:Mt,probes:Mt}; }
function foldOf(k){ const s=String(Math.abs(k)); let sum=0, parts=[]; for(let i=0;i<s.length;i+=2){ const p=parseInt(s.slice(Math.max(0,s.length-i-2), s.length-i),10); parts.unshift(p); sum+=p; } return {sum,parts}; }
function midOf(k){ const d=String(Math.abs(k*k)); return d.length>=4 ? parseInt(d.slice(Math.floor(d.length/2)-1, Math.floor(d.length/2)+1),10) : parseInt(d,10); }

M.sections = [
  {id:'s21', acts:['anim:hashpipe','tool:modcalc']},
  {id:'s22', acts:['pa:2.2.1']},
  {id:'s23', acts:['tool:methodlab']},
  {id:'s24'},{id:'s25'},
  {id:'s26', acts:['ca:1']},
  {id:'s27', acts:['quiz']}
];

/* ---------- ANIMATION: المسار الكامل + تصادم sara ---------- */
M.anims = { hashpipe: { steps: [
  {cap:'المفتاح: <b>omar</b>. المرحلة الأولى تبدأ من نوع المفتاح، لا من رقمه.', lbl:{hc:'omar'}, css:[{id:'hc',t:1}],
   watch:{k:'omar',c:'0',i:'—',s:'1'}, fx:['draw:hp-a1','draw:hp-a2','draw:hp-a3']},
  {cap:'<b>hash code</b>: مجموع رموز الحروف — o=111, m=109, a=97, r=114 ← <b>431</b>.', pos:{hc:'hp-code'},
   fx:['count:hp-cv:431'], set:[{id:'hp-cv',text:'431'}], watch:{c:'431',s:'1'}},
  {cap:'المرحلة الثانية: <b>الضغط</b>. لا يمكن استخدام 431 فهرسًا في جدول من 8 خانات.', pos:{hc:'hp-code'},
   watch:{s:'2'}},
  {cap:'<b>431 % 8</b>: 8 × 53 = 424، والباقي <b>7</b>.', pos:{hc:'hp-mod'}, fx:['count:hp-r:7'],
   set:[{id:'hp-r',text:'7'},{id:'hp-iv',text:'—'}], watch:{i:'7'}},
  {cap:'الفهرس <b>7</b> دائمًا في المدى 0 … 7 مهما كبر الرمز.', pos:{hc:'hp-idx'},
   set:[{id:'hp-iv',text:'7'}], watch:{i:'7'}},
  {cap:'omar في الخانة 7. حسابان فقط، بلا مقارنة واحدة.', pos:{hc:'h7'}, fx:['pulse:h7:ok'], hot:['h7']},
  {cap:'كلمة أخرى: <b>sara</b> — 115+97+114+97 = <b>423</b>.', lbl:{hc:'sara'},
   set:[{id:'hp-kv',text:'sara'},{id:'hp-cv',text:'423'}], pos:{hc:'h7'}, watch:{k:'sara',c:'423',s:'1'}},
  {cap:'423 % 8 = <b>7</b> أيضًا (8 × 52 = 416). الخانة نفسها ← <b>تصادم</b>: المفتاحان يريدان 7. الحل في الوحدات التالية.',
   pos:{hc:'h7'}, fx:['shake:h7'], lbl:{hc:'sara · occupied'}, cls:{hc:'bad'}, hot:['h7'], watch:{i:'7'}}
]}};

/* ---------- PARTICIPATION ---------- */
M.pas = [
  {num:'2.2.1', sec:'s22', after:'host-pa1', title:'تحقّق: خصائص الدالة', items:[
    {q:'أي خاصية كُسرت حين تقع المفاتيح <span class="mono" dir="ltr">10, 20, 30, 40</span> كلها في الخانة 0 مع <span class="mono" dir="ltr">M = 10</span>؟',
     opts:['Fast','Deterministic','Spreads keys out'], a:2, why:'الحساب سريع وثابت، لكن التوزيع فشل لأن M يشارك البيانات عاملًا مشتركًا (10).'},
    {q:'<span class="mono" dir="ltr">123² = 15129</span> — رقمان وسيطان بطريقة mid-square؟',
     opts:['15','51','29','12'], a:1, why:'الأرقام الوسطى 51، ثم تُضغط بـ 51 % M.'},
    {q:'أي هذه <b>ليست</b> من خصائص الدالة الجيدة على الشريحة 8؟',
     opts:['Fast','Deterministic','تُرجع المفاتيح مرتّبة','Spreads keys out'], a:2,
     why:'التجزئة لا تُرتّب شيئًا؛ الترتيب يحتاج شجرة، وهذا مذكور في الشريحة 23.'}
  ]}
];

/* ---------- CHALLENGE ---------- */
M.ca = { num:'2.1.1', title:'من المفتاح إلى الخانة ثم السبر', levels:[
  ()=>{ const word = pick(['sara','noor','ali','raad']); const Mt = pick([8,11,13]);
        const c = codeOf(word);
        return {kind:'num', q:`<span class="mono" dir="ltr">M = ${Mt}</span>، ورمز الكلمة = مجموع رموز حروفها. المفتاح <span class="mono" dir="ltr">'${word}'</span> رمزه <span class="mono" dir="ltr">${c}</span> — ما فهرسه؟`,
                a: mod(c,Mt), hint:`${c} % ${Mt}: اقسم ثم خُذ الباقي.`, why:`${c} = ${Mt}×${Math.floor(c/Mt)} + ${mod(c,Mt)} ← الفهرس ${mod(c,Mt)}.`}; },
  ()=>{ const Mt=pick([7,11,13]); const k=pick([123,456,789,1234,5555]);
        const m = midOf(k);
        return {kind:'num', q:`بطريقة <b>mid-square</b>: <span class="mono" dir="ltr">k = ${k}</span>، و<span class="mono" dir="ltr">k² = ${k*k}</span>. الرقمان الوسيطان ثم <span class="mono" dir="ltr">% ${Mt}</span> — ما الناتج؟`,
                a: mod(m,Mt), hint:`خذ الرقمين في وسط ${k*k} ثم % ${Mt}.`, why:`${k*k} → “${String(k*k).slice(Math.floor(String(k*k).length/2)-1, Math.floor(String(k*k).length/2)+1)}” ← ${m} % ${Mt} = ${mod(m,Mt)}.`}; },
  ()=>{ const k=pick([123456,987654,246810]); const Mt=pick([11,13]);
        const f = foldOf(k);
        return {kind:'num', q:`بطريقة <b>folding</b> (كل رقمين جزءًا): <span class="mono" dir="ltr">k = ${k}</span> → ${f.parts.join(' + ')} = ${f.sum}. ما <span class="mono" dir="ltr">${f.sum} % ${Mt}</span>؟`,
                a: mod(f.sum,Mt), hint:'اجمع الأجزاء ثم % M.', why:`${f.sum} % ${Mt} = ${mod(f.sum,Mt)}.`}; },
  ()=>{ const k=pick([21,31,41]); const occ=new Set([1,2]); const r=quadSlot(10,k,occ);
        return {kind:'num', q:`فحص تربيعي <span class="mono" dir="ltr">(h + i²) % 10</span>، والخانتان 1 و2 مشغولتان. المفتاح <span class="mono" dir="ltr">${k}</span> خانته 1 إلى أي خانة يذهب؟`,
                a: r.s, hint:'i=0 ← 1، i=1 ← 2، i=2 ← 1+4 = 5.', why:`1+0² ✗، 1+1² ✗، 1+2² = 5 ✓ بعد ${r.probes} محاولات.`}; },
  ()=>{ const k=pick([48,41,25]); const occ=new Set([8,9,0,1,2,3,5,6,7]);
        const r=linSlot(10,k,occ);
        return {kind:'num', q:`فحص خطّي <span class="mono" dir="ltr">M = 10</span>، الخانات المشغولة ${[...occ].sort((a,b)=>a-b).join(', ')}. كم <b>محاولة</b> يحتاج <span class="mono" dir="ltr">${k}</span>؟`,
                a: r.probes, hint:'عدّ الخانات من الخانة الأصلية، والمحاولة الناجحة تُحسب.', why:`${k} % 10 = ${mod(k,10)} ← ${r.probes} محاولات حتى الخانة ${r.s}.`}; }
]};

/* ---------- QUIZ (10 أسئلة على 7–11) ---------- */
M.quiz = [
 {topic:'مرحلتان', q:'ما المرحلتان في دالة التجزئة؟',
  opts:['ترتيب ثم بحث','hash code ثم ضغط بـ % M','مقارنة ثم إدراج','نسخ ثم توسيع'], a:1,
  why:'الشريحة 7: الرمز أولًا (عدد صحيح كبير)، ثم الضغط إلى 0 … M−1.'},
 {topic:'مرحلتان', q:'لماذا نضغط الرمز بـ <span class="mono" dir="ltr">% M</span>؟',
  opts:['لتصغير المفتاح','ليصبح فهرسًا في نطاق 0 … M−1','لتسريع الطباعة','لتجنّب التصادم تمامًا'], a:1,
  why:'الرمز قد يكون ضخمًا أو سالبًا؛ الباقي يضمن فهرسًا صالحًا، لكنه لا يمنع التصادم.'},
 {topic:'الجودة', q:'المفاتيح 10, 20, 30, 40 مع <span class="mono" dir="ltr">M = 10</span> كلها في 0. أي خاصية كُسرت؟',
  opts:['Fast','Deterministic','Spreads keys out','لا شيء'], a:2, why:'التوزيع؛ ولهذا نختار M أوليًا (11 ← 10, 9, 8, 7).'},
 {topic:'الجودة', q:'أي M يعطي توزيعًا أفضل للمفاتيح 10, 20, 30, 40؟',
  opts:['8','10','11','100'], a:2, why:'11 أولي ولا يشارك مضاعفات 10 عاملًا مشتركًا ← 10, 9, 8, 7.'},
 {topic:'الطرق', q:'بطريقة mid-square للمفتاح 123: ما الخطوة بعد التربيع؟',
  opts:['نأخذ أول رقمين','نأخذ الرقمين الوسطيين (51)','نجمع الأجزاء','نضرب في A'], a:1,
  why:'123² = 15129 ← “51” ثم 51 % M.'},
 {topic:'الطرق', q:'بطريقة folding للمفتاح 123456 (جزءان):',
  opts:['<span class="mono" dir="ltr">12 + 34 + 56 = 102</span>','<span class="mono" dir="ltr">1 + 2 + 3 = 6</span>','<span class="mono" dir="ltr">123 + 456 = 579</span>','<span class="mono" dir="ltr">12 × 34 × 56</span>'], a:0,
  why:'الشريحة 9: تُقسَّم إلى أجزاء متساوية 12 · 34 · 56 ثم تُجمع ← 102 % M.'},
 {topic:'التصادم', q:'لماذا التصادم حتمي؟',
  opts:['لأن بايثون بها خطأ','لأن عدد المفاتيح الممكنة أكبر من عدد الخانات','لأن M دائمًا زوجي','لأن الدالة غير حتمية'], a:1,
  why:'الشريحة 10: كثرة المفاتيح الممكنة تفرض تشارك الخانات؛ و23 تاريخًا في 365 خانة تكفي لتجاوز 50%.'},
 {topic:'السبر', q:'صيغة الفحص الخطّي هي:',
  opts:['<span class="mono" dir="ltr">(h(k) + i) mod M</span>','<span class="mono" dir="ltr">(h(k) + i²) mod M</span>','<span class="mono" dir="ltr">h(k) mod M</span>','<span class="mono" dir="ltr">(h₁ + i·h₂) mod M</span>'], a:0,
  why:'الخطّي يزيد 1 كل محاولة؛ التربيعي يزيد i²، والمزدوج يستخدم h₂، والسلسلة لا تزيد شيئًا.'},
 {topic:'السبر', q:'المفتاح يجد خانته الأصلية فارغة من أول محاولة. كم محاولة تُحسب؟',
  opts:['0','1','2','حسب حجم M'], a:1,
  why:'قاعدة الشريحة 11: العدّ يشمل المحاولة الناجحة، والبداية i = 0.'},
 {topic:'السبر', q:'أي استراتيجية تعطي خطوة مختلفة لكل مفتاح؟',
  opts:['Linear','Quadratic','Double hashing','Chaining'], a:2,
  why:'المزدوجة تستخدم h₂(k) فيختلف المسار بين مفتاحين لهما الخانة الأصلية نفسها — وهذا علاج التكدّس الثانوي.'}
];

/* ---------- tools (views-hash) ---------- */
M.tools = [{id:'modcalc'}, {id:'methodlab'}];
M.mount = [function(){
  if(window.CSH && CSH.modCalc) CSH.modCalc('host-modcalc');
  if(window.CSH && CSH.methodLab) CSH.methodLab('host-methodlab');
  ['host-modcalc','host-methodlab'].forEach(id=>{
    const host = document.getElementById(id); if(!host) return;
    host.addEventListener('csh-used', e=>{
      const st = window.CS && window.CS.ST; if(!st) return;
      const key = (e.detail==='methodlab') ? 'methodlab' : 'modcalc';
      if(!st.tool[key]){ st.tool[key] = true; window.CS.save(); }
    });
  });
}];

/* ---------- self tests (محسوبة) ---------- */
M.selftests = [
  {name:'mid-square(123) → middle digits', got:()=> midOf(123), want:51, slide:'9'},
  {name:'folding(123456) → sum', got:()=> foldOf(123456).sum, want:102, slide:'9'},
  {name:'25 % 7 (division)', got:()=> mod(25,7), want:4, slide:'9'},
  {name:'⌊10·(25·0.618 mod 1)⌋ (multiplication)', got:()=> Math.floor(10*((25*0.618)%1)), want:4, slide:'9'},
  {name:'10 % 11 · 20 % 11 · 30 % 11 · 40 % 11', got:()=> [10,20,30,40].map(k=>mod(k,11)).join(','), want:'10,9,8,7', slide:'8'},
  {name:'4206 % 8 (الشريحة 7 مقتطعة)', got:()=> mod(4206,8), want:6, slide:'7'},
  {name:"code('omar') = 111+109+97+114", got:()=> codeOf('omar'), want:431, slide:'7'}
];

M.checklist = [
  'أفصل بين <b>hash code</b> و<b>compression</b> وأشرح دور كل منهما.',
  'أذكر الخصائص الثلاث للدالة الجيدة وأشرح مثال M = 10 مقابل M = 11.',
  'أطبّق الطرق الأربع (division, mid-square, folding, multiplication) على مفتاح صغير.',
  'أشرح لماذا التصادم حتمي، وأفرّق بین السلسلة والعنونة المفتوحة.',
  'أعدّ المحاولات بشكل صحيح (المحاولة الناجحة تُحسب، i يبدأ من 0).'
];

window.MODULE = M;
})();
