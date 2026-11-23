/* CORE v1.1 START:js */
/* =========================================================================
   CS2015 · CORE v1.1 — محرّك مشترك (motion / PA / CA / quiz / completion)
   يعتمد على window.MODULE الذي يوفّره ملف محتوى الوحدة.
   ========================================================================= */
(function(){
"use strict";
const $  = (s,r)=> (r||document).querySelector(s);
const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));
const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const DUR = {move:480, fast:240, hold:600};
const EASE = 'cubic-bezier(.2,.8,.2,1)';
const KEY = 'cs2015.' + (document.body.dataset.module || 'x') + '.';
const LS = {
  get(k,d){ try{ const v=localStorage.getItem(k); return v===null?d:JSON.parse(v); }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} }
};
const M = window.MODULE || {};
const ST = Object.assign({pa:{},anim:{},tool:{},ca:{lv:0,passed:[]},quiz:false,seen:[]}, LS.get(KEY+'state',{}));
const save = ()=>{ LS.set(KEY+'state', ST); paintProgress(); };
function icon(name, cls){ return `<svg class="ic ${cls||''}" aria-hidden="true"><use href="#i-${name}"/></svg>`; }

/* ---------------- theme + font ---------------- */
(function theme(){
  const t = LS.get('cs2015.theme','light');
  document.documentElement.setAttribute('data-theme', t);
  const fs = LS.get('cs2015.fs', 17.2);
  document.documentElement.style.setProperty('--fs', fs+'px');
  const b = $('#themeBtn');
  const paint = ()=>{ if(!b) return; b.innerHTML = icon(document.documentElement.getAttribute('data-theme')==='dark'?'sun':'moon');
    b.setAttribute('aria-label', document.documentElement.getAttribute('data-theme')==='dark'?'الوضع الفاتح':'الوضع الداكن'); };
  paint();
  b && b.addEventListener('click', ()=>{
    const nx = document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',nx); LS.set('cs2015.theme',nx); paint();
  });
  const step = d=>{
    let cur = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fs'))||17.2;
    cur = Math.min(22, Math.max(14, cur+d));
    document.documentElement.style.setProperty('--fs', cur.toFixed(1)+'px'); LS.set('cs2015.fs',cur);
  };
  const a=$('#fsPlus'), m=$('#fsMinus');
  a && a.addEventListener('click',()=>step(1));
  m && m.addEventListener('click',()=>step(-1));
})();

/* ---------------- motion primitives ---------------- */
const stageRectOf = el => el.getBoundingClientRect();
function anim(el, frames, opt){
  if(!el) return null;
  if(RM){ const last=frames[frames.length-1]; if(last && last.transform) el.style.transform = last.transform; if(last && last.opacity!=null) el.style.opacity=last.opacity; return null; }
  try{ return el.animate(frames, Object.assign({duration:DUR.move, easing:EASE, fill:'none'}, opt||{})); }catch(e){ return null; }
}
function placeChip(chip, targetEl, animate){
  const stage = chip.closest('.stage'); if(!stage || !targetEl) return;
  const s = stageRectOf(stage), r = stageRectOf(targetEl);
  const x = r.left - s.left + r.width/2 - chip.offsetWidth/2;
  const dy = parseInt(chip.dataset.dy||'0',10) || 0;
  const y = r.top  - s.top  + r.height/2 - chip.offsetHeight/2 + 7 + dy;
  const to = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  const from = chip.style.transform || 'translate(0px, 0px)';
  if(animate && !RM){ anim(chip, [{transform:from},{transform:to}], {duration:DUR.move}); }
  chip.style.transform = to;
}
function flash(el, cls, ms){
  if(!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  setTimeout(()=>el.classList.remove(cls), ms||DUR.hold);
}
function countTo(el, to, dur){
  if(!el) return;
  const from = parseInt(el.dataset.v||'0',10);
  el.dataset.v = String(to);
  if(RM){ el.textContent = String(to); return; }
  const t0 = performance.now();
  const tick = t=>{
    const p = Math.min(1,(t-t0)/(dur||420));
    const v = Math.round(from + (to-from)*(p<.5? 2*p*p : 1-Math.pow(-2*p+2,2)/2));
    el.textContent = String(v);
    if(p<1) requestAnimationFrame(tick); else el.textContent = String(to);
  };
  requestAnimationFrame(tick);
}
function drawPath(path){
  if(!path || !path.getTotalLength) return;
  const L = path.getTotalLength(); if(!L) return;
  path.style.strokeDasharray = L; path.style.strokeDashoffset = RM?0:L;
  if(!RM) anim(path, [{strokeDashoffset:L},{strokeDashoffset:0}], {duration:DUR.move+160});
  path.style.strokeDashoffset = 0;
}

/* ---------------- code blocks: highlight + copy ---------------- */
const KW = /\b(def|return|if|else|elif|for|while|in|not|and|or|None|True|False|class|import|from|raise|break|continue|lambda|print|len|range|append|pop|in)\b/g;
function hlLine(txt){
  let out='', i=0;
  const re = /(#.*$)|("[^"]*"|'[^']*')|(\b\d+(?:\.\d+)?\b)|(\b(?:def|return|if|elif|else|for|while|in|not|and|or|None|True|False|class|import|from|raise|break|continue|lambda|print|len|range|append|pop)\b)/g;
  let m, last=0;
  const esc = s=> s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  while((m = re.exec(txt))){
    out += esc(txt.slice(last, m.index));
    const cls = m[1]?'c':m[2]?'s':m[3]?'n':'k';
    out += `<span class="${cls}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
    if(m[0]==='') re.lastIndex++;
  }
  out += esc(txt.slice(last));
  return out;
}
function buildCode(block){
  const body = $('.cbody', block);
  let raw = block.dataset.code || '';
  if(!raw && body && body.dataset.src){
    const src = document.getElementById('src-'+body.dataset.src);
    raw = src ? src.textContent.replace(/^\n/,'').replace(/\s+$/,'') : '';
  }
  const lines = raw.replace(/\s+$/,'').split('\n');
  const pre = document.createElement('pre');
  pre.innerHTML = lines.map((ln,i)=>
    `<span class="ln" data-l="${i+1}"><span class="cn">${i+1}</span>${hlLine(ln)||' '}</span>`).join('');
  body.appendChild(pre);
  const hlb = document.createElement('i'); hlb.className='hl'; body.insertBefore(hlb, pre);
  const btn = $('[data-copy]', block);
  if(btn) btn.addEventListener('click', ()=> copyText(raw, btn));
}
function copyText(txt, btn){
  const done = ()=>{
    if(!btn) return;
    const old = btn.innerHTML;
    btn.innerHTML = icon('check'); btn.classList.add('done');
    btn.setAttribute('aria-label','تم النسخ');
    setTimeout(()=>{ btn.innerHTML = old; btn.classList.remove('done'); btn.setAttribute('aria-label','نسخ'); }, 1500);
  };
  const fb = ()=>{
    try{
      const ta=document.createElement('textarea'); ta.value=txt; ta.setAttribute('readonly','');
      ta.style.cssText='position:fixed;top:-1000px;opacity:0'; document.body.appendChild(ta);
      ta.select(); ta.setSelectionRange(0,txt.length);
      const ok=document.execCommand&&document.execCommand('copy'); document.body.removeChild(ta);
      if(ok) done(); else if(btn){ btn.setAttribute('aria-label','تعذّر النسخ — حدّد النص يدويًا'); }
    }catch(e){}
  };
  if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, fb);
  else fb();
}
$$('.code').forEach(buildCode);

/* ---------------- reveal on scroll (once) ---------------- */
(function reveal(){
  const els = $$('.reveal');
  if(!els.length) return;
  if(!('IntersectionObserver' in window)){ els.forEach(e=>e.classList.add('in')); return; }
  const io = new IntersectionObserver((es)=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {rootMargin:'0px 0px -8% 0px'});
  els.forEach(e=>io.observe(e));
})();

/* ---------------- exercise toggles ---------------- */
$$('details.ex').forEach(d=>{
  const l=$('.ex-lbl',d); if(!l) return;
  const p=()=>{ l.textContent = d.open ? 'إخفاء الحل' : 'أظهر الحل'; };
  d.addEventListener('toggle',p); p();
});

/* ---------------- rail (TOC) + progress ---------------- */
const SECTIONS = M.sections || [];
function actDone(a){
  const [k,v] = String(a).split(':');
  if(k==='pa')   return !!ST.pa[v];
  if(k==='anim') return !!ST.anim[v];
  if(k==='tool') return !!ST.tool[v];
  if(k==='ca')   return (ST.ca.passed||[]).length >= ((M.ca&&M.ca.levels&&M.ca.levels.length)||5);
  if(k==='quiz') return !!ST.quiz;
  return false;
}
const TOTAL_ACTS = SECTIONS.reduce((n,s)=>n+(s.acts||[]).length,0);
function paintProgress(){
  SECTIONS.forEach(s=>{
    const link = $(`.rail a[href="#${s.id}"]`);
    const n=(s.acts||[]).length, d=(s.acts||[]).filter(actDone).length;
    if(link){
      let t = $('.tick', link);
      if(!t){ t=document.createElement('span'); t.className='tick'; link.appendChild(t); }
      if(!n){ t.textContent=''; }
      else if(d===n){ t.innerHTML = icon('check'); }
      else if(d>0){ t.textContent = `${d}/${n}`; }
      else { t.textContent = ''; }
      t.className = 'tick' + ((n&&d<n)?' part':'');
    }
  });
  const doneAll = SECTIONS.reduce((n,s)=>n+(s.acts||[]).filter(actDone).length,0);
  const p = TOTAL_ACTS ? Math.round(doneAll/TOTAL_ACTS*100) : 0;
  [['#introProg',p+'%'],['#introProg2',p+'%'],['#introProgTxt',`${p}%`],['#railProgTxt',`${p}% · ${doneAll}/${TOTAL_ACTS}`]].forEach(([sel,val])=>{
    const el=$(sel); if(el){ if(el.tagName==='I') el.style.width=val; else el.textContent=val; } });
}
function paintRail(){
  const links = $$('.rail a');
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){
      links.forEach(a=>a.classList.toggle('on', a.getAttribute('href')==='#'+e.target.id));
      if(ST.seen.indexOf(e.target.id)<0){ ST.seen.push(e.target.id); LS.set(KEY+'state',ST); }
    }});
  }, {rootMargin:'-45% 0px -50% 0px'});
  $$('main .sec').forEach(s=>io.observe(s));
}
window.addEventListener('scroll', ()=>{
  const h=document.documentElement;
  const p = h.scrollTop/Math.max(1,(h.scrollHeight-h.clientHeight))*100;
  const bar = $('#scrollProg'); if(bar) bar.style.width = Math.min(100,Math.max(0,p))+'%';
}, {passive:true});
paintRail(); paintProgress();

/* ---------------- animation player ---------------- */
/* حالة كل خطوة قابلة للاسترجاع: أي قفز للأمام أو للخلف يُعيد بناء الحالة من الصفر */
class Anim {
  constructor(root){
    this.root = root;
    this.id = root.dataset.anim;
    const spec = (M.anims||{})[this.id];
    if(!spec) return;
    this.spec = spec;
    this.steps = spec.steps || [];
    this.i = -1; this.timer=null; this.playing=false; this.x2=false;
    this.chips = $$('.chip', root);
    this.hl = $('.hl', root);
    this.capEl = $('.cap', root);
    this.stepno = $('.stepno', root);
    this.strip = $('.segstrip', root);
    this.watchEl = $('.watch', root);
    // لقطة الحالة الابتدائية (للعودة النظيفة)
    this.ini = {
      chips: this.chips.map(c=>({el:c, op:c.style.opacity, cls:c.className, html:c.innerHTML})),
      texts: new Map()
    };
    this.bind(); this.layout(); this.buildStrip();
    if(this.stepno) this.stepno.textContent = `Step 0 of ${this.steps.length}`;
    this.root.classList.add('idle');
  }
  layout(){
    this.chips.forEach(c=>{
      const home = c.dataset.home ? document.getElementById(c.dataset.home) : null;
      if(home) placeChip(c, home, false);
    });
  }
  buildStrip(){
    if(!this.strip) return;
    this.strip.innerHTML = this.steps.map((_,k)=>
      `<button type="button" data-s="${k}" aria-label="الخطوة ${k+1}"></button>`).join('');
    $$('button', this.strip).forEach(b=>b.addEventListener('click',()=>{
      this.pause(); this.goto(+b.dataset.s, +b.dataset.s > this.i);
    }));
  }
  bind(){
    const q = s=>$(s, this.root);
    const on=(k,fn)=>{ const b=q(`[data-a="${k}"]`); b && b.addEventListener('click', fn); };
    on('start', ()=>{ this.root.classList.remove('idle'); this.reset(); this.goto(0,false); });
    on('next',  ()=>{ this.root.classList.remove('idle'); this.goto(Math.min(this.steps.length-1, this.i+1), true); });
    on('prev',  ()=>{ this.goto(Math.max(0, this.i-1), false); });
    on('play',  ()=> this.play());
    on('pause', ()=> this.pause());
    on('reset', ()=>{ this.pause(); this.reset(); this.i = -1;
      if(this.stepno) this.stepno.textContent = `Step 0 of ${this.steps.length}`;
      $$('button', this.strip||document.createElement('div')).forEach(b=>b.classList.remove('cur','seen'));
      if(this.capEl) this.capEl.querySelector('.txt').textContent = this.capEl.dataset.base || '';
      this.root.classList.add('idle'); });
    on('speed', (e)=>{ this.x2=!this.x2;
      e.currentTarget.setAttribute('aria-pressed', this.x2?'true':'false');
      e.currentTarget.setAttribute('aria-label', this.x2?'سرعة مضاعفة مفعّلة':'سرعة عادية'); });
    const pr = q('.predict');
    if(pr) pr.addEventListener('change', ()=>{ this.root.dataset.predict = pr.checked?'1':'0'; });
    this.root.dataset.predict = (pr && pr.checked) ? '1':'0';
    this.root.addEventListener('mouseenter', ()=>{ window.__activeAnim=this; });
    this.root.addEventListener('focusin', ()=>{ window.__activeAnim=this; });
    if(this.capEl && !this.capEl.dataset.base) this.capEl.dataset.base = this.capEl.querySelector('.txt').textContent;
  }
  reset(){
    this.ini.chips.forEach(c=>{
      c.el.style.opacity = c.op; c.el.className = c.cls; c.el.innerHTML = c.html;
      if(c.el.style.transform) c.el.style.transform='';
    });
    this.ini.texts.forEach((v,k)=>{ const el=document.getElementById(k); if(el) el.textContent = v; });
    $$('.hot', this.root).forEach(e=>e.classList.remove('hot'));
    this.layout();
  }
  play(){
    this.root.classList.remove('idle');
    if(this.playing) return;
    if(this.i >= this.steps.length-1){ this.reset(); this.i=-1; }
    this.playing = true;
    const tick = ()=>{
      if(!this.playing) return;
      if(this.i >= this.steps.length-1){ this.pause(); return; }
      this.goto(this.i+1, true);
      const waiting = this.root.dataset.predict==='1' && this.steps[this.i] && this.steps[this.i].ask;
      this.timer = setTimeout(tick, waiting ? 999999 : (this.x2 ? DUR.move*0.9 : DUR.move*1.7));
    };
    this.timer = setTimeout(tick, 120);
  }
  pause(){ this.playing=false; clearTimeout(this.timer); this.timer=null; }
  el(id){ return document.getElementById(id) || this.root.querySelector(`[data-chip="${id}"]`); }
  apply(st, animate){
    // 1) chips
    const pos = st.pos || {};
    this.chips.forEach(chip=>{
      const id = chip.dataset.chip;
      const targetId = pos[id] || chip.dataset.home;
      const target = targetId ? document.getElementById(targetId) : null;
      if(target) placeChip(chip, target, animate);
      else if(animate===false) placeChip(chip, document.getElementById(chip.dataset.home), false);
      chip.classList.toggle('held', !pos[id]);
    });
    if(st.lbl) Object.keys(st.lbl).forEach(id=>{
      const chip=this.chips.find(c=>c.dataset.chip===id); if(!chip) return;
      const t=$('.t',chip);
      if(t) t.innerHTML = st.lbl[id]; else chip.innerHTML = st.lbl[id];
    });
    if(st.cls) Object.keys(st.cls).forEach(id=>{
      const chip=this.chips.find(c=>c.dataset.chip===id); if(!chip) return;
      chip.classList.remove('bad','good'); if(st.cls[id]) chip.classList.add(st.cls[id]);
    });
    // 2) raw sets (text/classes)
    if(st.set) st.set.forEach(o=>{
      const el=this.el(o.id); if(!el) return;
      if(!this.ini.texts.has(o.id)) this.ini.texts.set(o.id, el.textContent);
      if(o.text!=null) el.textContent = o.text;
      if(o.html!=null) el.innerHTML = o.html;
      if(o.cls) o.cls.split(' ').forEach(c=>el.classList.add(c));
      if(o.uncls) o.uncls.split(' ').forEach(c=>el.classList.remove(c));
    });
    // 3) css widths/opacities (سباق، إخفاء/إظهار)
    if(st.css) st.css.forEach(o=>{
      const el=this.el(o.id); if(!el) return;
      if(!this.ini.texts.has('_css_'+o.id)) this.ini.texts.set('_css_'+o.id, el.style.cssText);
      if(o.w!=null){
        if(animate && !RM) anim(el,[{width:(el.style.width||'0%')},{width:o.w+'%'}],{duration:DUR.move});
        el.style.width = o.w+'%';
      }
      if(o.t!=null){
        if(animate && !RM) anim(el,[{opacity:(el.style.opacity||'1')},{opacity:o.t}],{duration:DUR.fast});
        el.style.opacity = o.t;
      }
    });
    // 4) code line
    if(this.hl && st.line){
      const ln = $(`.ln[data-l="${st.line}"]`, this.root);
      if(ln){ this.hl.style.height = ln.offsetHeight+'px';
        if(animate && !RM) anim(this.hl, [{transform:this.hl.style.transform||'none'},{transform:`translateY(${ln.offsetTop}px)`}], {duration:DUR.fast});
        this.hl.style.transform = `translateY(${ln.offsetTop}px)`; }
    }
    // 5) watch panel
    if(this.watchEl && st.watch){
      Object.keys(st.watch).forEach(k=>{
        const cell = $(`[data-w="${k}"]`, this.watchEl); if(!cell) return;
        const v = String(st.watch[k]);
        if(cell.textContent !== v){ cell.textContent = v; if(animate) flash(cell,'flash',420); }
      });
    }
    // 6) caption
    if(this.capEl && st.cap!=null){
      const t = this.capEl.querySelector('.txt');
      t.innerHTML = st.cap;
      if(animate && !RM) anim(t,[{opacity:0},{opacity:1}],{duration:300});
    }
    // 7) marks
    $$('.hot', this.root).forEach(e=>e.classList.remove('hot'));
    (st.hot||[]).forEach(id=>{ const e=document.getElementById(id); e && e.classList.add('hot'); });
  }
  goto(n, forward){
    if(n<0) n=0; if(n>=this.steps.length) n=this.steps.length-1;
    if(n===this.i) return;
    const back = n < this.i;
    if(back || n > this.i+1){
      this.reset();
      for(let k=0;k<n;k++) this.apply(this.steps[k], false);
    }
    const st = this.steps[n];
    this.apply(st, true);
    if(forward && !back) (st.fx||[]).forEach(spec=>{
      const [op, a, b] = String(spec).split(':');
      if(op==='shake'){ flash($('#'+a, this.root),'collide',420); }
      if(op==='pulse'){ flash($('#'+a, this.root), b==='bad'?'badfade':'okpulse',700); }
      if(op==='count'){ countTo($('#'+a, this.root), +b, 420); }
      if(op==='draw'){ drawPath($('#'+a, this.root)); }
      if(op==='flash'){ flash($('#'+a, this.root),'okpulse',560); }
    });
    this.i = n;
    if(this.stepno) this.stepno.textContent = `Step ${n+1} of ${this.steps.length}`;
    if(this.strip) $$('button', this.strip).forEach((b,k)=>{
      b.classList.toggle('cur', k===n); b.classList.toggle('seen', k<n);
    });
    if(st.ask && this.root.dataset.predict==='1') this.ask(st);
    else { const box=$('.askbox',this.root); if(box) box.hidden = true; }
    if(n===this.steps.length-1 && !ST.anim[this.id]){ ST.anim[this.id]=true; save(); }
  }
  ask(st){
    const box = $('.askbox', this.root); if(!box) return;
    box.hidden = false;
    $('.askq', box).textContent = st.ask.q;
    const opts = $('.askopts', box);
    opts.innerHTML = st.ask.opts.map(o=>`<button class="opt" type="button" data-o="${o}">${o}</button>`).join('');
    $('.askfb', box).textContent='';
    $$('[data-o]', opts).forEach(b=>b.addEventListener('click', ()=>{
      const ok = String(b.dataset.o)===String(st.ask.a);
      $$('[data-o]', opts).forEach(x=>{ if(String(x.dataset.o)===String(st.ask.a)) x.classList.add('correct'); });
      if(!ok) b.classList.add('wrong');
      const fb=$('.askfb', box);
      fb.textContent = (ok?'صحيح — ':'ليس صحيحًا — ')+st.ask.why;
      fb.className = 'askfb fb show '+(ok?'ok':'bad');
    }));
  }
}
$$('.anim[data-anim]').forEach(el=>{
  try{ const a=new Anim(el); (window.__anims=window.__anims||{})[el.dataset.anim]=a; }
  catch(e){ if(window.console) console.warn('anim init',e); }
});
document.addEventListener('keydown', e=>{
  const a = window.__activeAnim; if(!a || !a.steps) return;
  if(/input|textarea|select/i.test(e.target.tagName)) return;
  if(e.key==='ArrowLeft'){ e.preventDefault(); a.root.classList.remove('idle'); a.goto(Math.min(a.steps.length-1,a.i+1), true); }
  if(e.key==='ArrowRight'){ e.preventDefault(); a.goto(Math.max(0,a.i-1), false); }
  if(e.code==='Space'){ e.preventDefault(); a.playing? a.pause() : a.play(); }
});

/* ---------------- participation activities ---------------- */
function mountPA(spec){
  const pid = 'pa-' + String(spec.num).replace(/\./g,'-');
  const host = document.getElementById(pid) || document.getElementById(spec.sec);
  if(!host) return;
  const box = document.createElement('div');
  box.className='act'; box.id=pid;
  box.innerHTML = `<div class="act-h"><span class="act-k">Participation Activity <b>${spec.num}</b></span><h3>${spec.title}</h3></div>`;
  const solved = [], forfeit = [];
  spec.items.forEach((it, idx)=>{
    const w = document.createElement('div'); w.className='pa-item';
    w.innerHTML = `<div class="pa-q"><span class="pa-qn">${idx+1}</span><span>${it.q}</span></div>`;
    box.appendChild(w);
    let picked = null;
    if(it.opts){
      const opts = document.createElement('div'); opts.className='opts';
      it.opts.forEach((o,j)=>{
        const b=document.createElement('button'); b.type='button'; b.className='opt'; b.textContent=o;
        b.addEventListener('click', ()=>{ if(w.dataset.locked==='1') return;
          $$('.opt',opts).forEach(x=>x.setAttribute('aria-pressed','false')); b.setAttribute('aria-pressed','true'); picked=j; });
        opts.appendChild(b);
      });
      w.appendChild(opts);
    } else {
      const lab=document.createElement('label'); lab.className='fl'; lab.textContent='إجابتك (رقم)';
      const inp=document.createElement('input'); inp.type='number'; inp.setAttribute('aria-label','إجابتك');
      w.appendChild(lab); w.appendChild(inp);
    }
    const acts=document.createElement('div'); acts.className='acts';
    acts.innerHTML = `<button class="btn" type="button" data-check>Check</button>
      <button class="btn ghost" type="button" data-show>Show answer</button>`;
    const fb=document.createElement('div'); fb.className='fb';
    w.appendChild(acts); w.appendChild(fb);
    const val = ()=> it.opts ? picked : (w.querySelector('input').value.trim());
    const correct = ()=> String(it.a);
    $('[data-check]',acts).addEventListener('click', ()=>{
      const v = val();
      if(v===null || v===''){ fb.className='fb show bad'; fb.innerHTML='<b class="tag">اختر إجابة أو اكتب قيمة أولًا</b>'; return; }
      const ok = String(v)===correct();
      fb.className='fb show '+(ok?'ok':'bad');
      if(ok){
        fb.innerHTML = `<b class="tag">${icon('check')} Correct</b><div>${it.why}</div>`;
        w.dataset.locked='1'; solved[idx]=true;
        if(it.opts) $$('.opt',w).forEach((x,j)=>{ if(String(j)===correct()) x.classList.add('correct'); });
        if(solved.every(Boolean)){ ST.pa[spec.num]=true; save(); box.dataset.done='1'; }
      } else {
        fb.innerHTML = `<b class="tag">${icon('x')} Incorrect — Try again</b><div>أعِد الحساب من التعريف في القسم أعلاه ثم اضغط Check مرة أخرى.</div>`;
      }
    });
    $('[data-show]',acts).addEventListener('click', ()=>{
      const inp=w.querySelector('input'); if(inp) inp.value = correct();
      if(it.opts) $$('.opt',w).forEach((x,j)=>{ if(String(j)===correct()) x.classList.add('correct'); });
      fb.className='fb show';
      fb.innerHTML = `<b class="tag">Answer: <span class="mono">${it.opts?it.opts[+correct()]:correct()}</span></b>
        <span class="forfeit">لا نقطة بعد إظهار الإجابة</span><div>${it.why}</div>`;
      w.dataset.locked='1'; solved[idx]=true; forfeit[idx]=true;
      if(solved.every(Boolean)){ ST.pa[spec.num]=true; save(); box.dataset.done='1'; }
    });
  });
  const anchor = document.getElementById(spec.after) || host;
  anchor.appendChild(box);
}
(M.pas||[]).forEach(mountPA);

/* ---------------- challenge activity ---------------- */
function mountCA(spec){
  const host = document.getElementById(spec.after) || document.getElementById('challenge');
  if(!host) return;
  const box=document.createElement('div'); box.className='act'; box.id='ca-'+String(spec.num).replace(/\./g,'-');
  box.innerHTML = `
    <div class="act-h"><span class="act-k">Challenge Activity <b>${spec.num}</b></span><h3>${spec.title}</h3></div>
    <div class="controls" style="margin:0 0 var(--s2)">
      <span class="jump" data-jump>Jump to level 1</span>
      <div class="lvstrip" data-strip></div>
      <span class="state" data-state>—</span>
    </div>
    <div class="ca-q" data-q></div>
    <div data-form style="margin-top:var(--s2)"></div>
    <div class="acts">
      <button class="btn" type="button" data-check>Check</button>
      <button class="btn ghost" type="button" data-try>Try again</button>
      <button class="btn ghost" type="button" data-next disabled>Next ${icon('chevron-left')}</button>
      <button class="btn ghost" type="button" data-reset>من المستوى 1</button>
    </div>
    <div class="fb" data-fb></div>`;
  host.appendChild(box);
  const ca = {lv:0, passed:new Set(ST.ca.passed||[]), cur:null, graded:false, pick:null};
  const el = s=>$(s,box);
  function paint(){
    el('[data-jump]').innerHTML = ca.passed.size>=spec.levels.length
      ? `${icon('check')} Level ${spec.levels.length}/${spec.levels.length}`
      : `Jump to level ${ca.lv+1}`;
    el('[data-strip]').innerHTML = spec.levels.map((_,k)=>
      `<button type="button" class="lv ${ca.passed.has(k)?'pass':''} ${k===ca.lv?'cur':''}" data-l="${k}" aria-label="المستوى ${k+1}">${ca.passed.has(k)?icon('check'):k+1}</button>`).join('');
    $$('[data-l]',box).forEach(b=>b.addEventListener('click',()=>{
      const l=+b.dataset.l; if(l<=Math.max(-1,...[...ca.passed])+1){ ca.lv=l; newQ(); }
    }));
    el('[data-next]').disabled = !ca.passed.has(ca.lv) || ca.lv>=spec.levels.length-1;
  }
  function newQ(){
    ca.cur = spec.levels[ca.lv]();
    ca.graded=false; ca.pick=null;
    el('[data-fb]').className='fb'; el('[data-fb]').innerHTML='';
    el('[data-state]').textContent='—'; el('[data-state]').className='state';
    el('[data-q]').innerHTML = ca.cur.q;
    const f = el('[data-form]');
    if(ca.cur.kind==='num'){
      f.innerHTML = `<label class="fl">إجابتك (رقم)</label><input type="number" data-in aria-label="إجابة رقمية">`;
      el('[data-in]').addEventListener('keydown', e=>{ if(e.key==='Enter') grade(); });
    } else {
      f.innerHTML = `<div class="opts">${ca.cur.opts.map(o=>`<button type="button" class="opt" data-c="${String(o).replace(/"/g,'&quot;')}">${o}</button>`).join('')}</div>`;
      $$('[data-c]',f).forEach(b=>b.addEventListener('click',()=>{
        if(ca.graded) return;
        $$('[data-c]',f).forEach(x=>x.setAttribute('aria-pressed','false'));
        b.setAttribute('aria-pressed','true'); ca.pick=b.dataset.c;
      }));
    }
    paint();
  }
  function grade(){
    if(ca.graded) return;
    const inp=el('[data-in]');
    const v = inp? inp.value.trim() : (ca.pick||'');
    const fb=el('[data-fb]');
    if(v===''){ fb.className='fb show bad'; fb.innerHTML='<b class="tag">اكتب إجابة أو اختر خيارًا</b>'; return; }
    const ok = String(v)===String(ca.cur.a);
    el('[data-state]').innerHTML = ok? icon('check')+' Correct' : icon('x')+' Try again';
    el('[data-state]').className='state '+(ok?'ok':'bad');
    if(ok){
      ca.graded=true; ca.passed.add(ca.lv);
      ST.ca.passed=[...ca.passed]; ST.ca.lv=ca.lv; save(); paint();
      fb.className='fb show ok';
      fb.innerHTML = `<b class="tag">${icon('check')} صحيح — المستوى ${ca.lv+1} مُجتاز</b><div>${ca.cur.why}</div>
        ${ca.lv<spec.levels.length-1?'<div class="muted">اضغط Next للانتقال إلى المستوى التالي.</div>':'<div class="muted">أكملت المستويات كلها.</div>'}`;
    } else {
      fb.className='fb show bad';
      fb.innerHTML = `<b class="tag">${icon('x')} ليس صحيحًا</b><div>${ca.cur.hint||'راجع الحساب ثم أعد المحاولة.'}</div>
        <div class="muted">اضغط Try again لسؤال جديد في المستوى نفسه.</div>`;
    }
  }
  el('[data-check]').addEventListener('click', grade);
  el('[data-try]').addEventListener('click', ()=>{ if(!ca.graded) newQ(); });
  el('[data-next]').addEventListener('click', ()=>{ if(ca.passed.has(ca.lv) && ca.lv<spec.levels.length-1){ ca.lv++; newQ(); } });
  el('[data-reset]').addEventListener('click', ()=>{ ca.lv=0; ca.passed.clear(); ST.ca.passed=[]; save(); newQ(); });
  paint(); newQ();
}
if(M.ca) mountCA(M.ca);

/* ---------------- sandbox / tool hooks ---------------- */
(M.tools||[]).forEach(t=>{
  const btn = document.getElementById(t.btn); if(!btn) return;
  btn.addEventListener('click', ()=>{
    const host = document.getElementById(t.after) || document.getElementById('sandbox');
    const a = (window.__anims||{})[t.anim];
    if(a && a.steps) a.paint && a.paint();
    if(!ST.tool[t.id]){ ST.tool[t.id]=true; save(); }
  });
});

/* ---------------- quiz ---------------- */
function mountQuiz(){
  const wrap = document.getElementById('quizList'); if(!wrap || !(M.quiz||[]).length) return;
  const Q = M.quiz;
  let graded=false, lastWrong=[];
  function render(filter){
    graded=false;
    const list = Q.map((q,i)=>({q,i})).filter(o=>!filter||filter.includes(o.i));
    if(!list.length){ wrap.innerHTML='<p class="muted">لا أخطاء سابقة — كل الأسئلة صحيحة في محاولتك الأخيرة.</p>'; return; }
    wrap.innerHTML = list.map(({q,i})=>`
      <div class="q" data-q="${i}">
        <div class="q-h"><span class="q-n">${i+1}</span><span>${q.q}</span><span class="q-meta">${q.topic}</span></div>
        <div class="opts" data-opts>${q.opts.map((o,j)=>
          `<button type="button" class="opt" data-o="${j}" aria-pressed="false">${o}</button>`).join('')}</div>
        <div class="qfb"></div>
      </div>`).join('');
    $$('[data-opts]', wrap).forEach(row=>{
      $$('.opt', row).forEach(b=>b.addEventListener('click', ()=>{
        if(graded) return;
        $$('.opt',row).forEach(x=>x.setAttribute('aria-pressed','false'));
        b.setAttribute('aria-pressed','true');
      }));
    });
  }
  function grade(){
    if(graded) return; graded=true;
    const qs=$$('.q',wrap); let correct=0, wrong=[], topics={};
    qs.forEach(qd=>{
      const i=+qd.dataset.q, q=Q[i];
      const sel=$('.opt[aria-pressed="true"]',qd);
      const val = sel? +sel.dataset.o : -1;
      $$('.opt',qd).forEach((b,j)=>{
        if(j===q.a) b.classList.add('correct');
        if(j===val && val!==q.a) b.classList.add('wrong');
      });
      const fb=$('.qfb',qd); fb.classList.add('show', val===q.a?'ok':'bad');
      if(val===q.a){ correct++; fb.innerHTML=`<b class="tag">${icon('check')} صحيح</b><div>${q.why}</div>`; }
      else { wrong.push(i); topics[q.topic]=(topics[q.topic]||0)+1;
        fb.innerHTML=`<b class="tag">${icon('x')} خطأ${val<0?' (لم تختر)':''}</b><div>${q.why}</div>`; }
    });
    const total=qs.length, pct= total? Math.round(correct/total*100):0;
    const sv=$('#scoreVal'), sm=$('#scoreMsg');
    if(sv) sv.textContent=`${correct} / ${total}`;
    if(sm) sm.textContent = pct===100?'— ممتاز':(pct>=75?'— جيد، راجع الأخطاء فقط':(pct>=50?'— راجع أقسام 1.4–1.6':'— أعد قراءة الوحدة'));
    lastWrong=wrong;
    const hist=LS.get(KEY+'quiz',[]);
    hist.push({t:new Date().toISOString().slice(0,16),score:correct,total,wrong,topics});
    LS.set(KEY+'quiz', hist.slice(-10));
    if(!ST.quiz){ ST.quiz=true; save(); }
    paintWeak();
  }
  function paintWeak(){
    const body=$('#weakBody'); if(!body) return;
    const hist=LS.get(KEY+'quiz',[]);
    if(!hist.length){ body.innerHTML='<p class="muted">لم تُصحَّح أي محاولة بعد.</p>'; return; }
    const agg={}; hist.forEach(h=>Object.entries(h.topics||{}).forEach(([k,v])=>agg[k]=(agg[k]||0)+v));
    const rows=Object.entries(agg).sort((a,b)=>b[1]-a[1]);
    const last=hist[hist.length-1];
    body.innerHTML = `<p class="muted">آخر محاولة <b>${last.score}/${last.total}</b> · ${last.t} · المحاولات: ${hist.length}</p>
      <div class="pillrow">${rows.length? rows.map(([k,v])=>`<span class="pill bad">${k} ×${v}</span>`).join('') : '<span class="pill">لا مواضيع ضعيفة</span>'}</div>`;
  }
  const on=(sel,fn)=>{ const b=$(sel); b && b.addEventListener('click',fn); };
  on('#gradeBtn', grade);
  on('#retryBtn', ()=>{ render(null); if($('#scoreVal'))$('#scoreVal').textContent='—'; });
  on('#onlyWrong', ()=>{ const h=LS.get(KEY+'quiz',[]); const w=h.length?h[h.length-1].wrong:[]; render(w.length?w:[-1]); });
  on('#showAll', ()=>render(null));
  on('#clearHist', ()=>{ LS.del(KEY+'quiz'); paintWeak(); render(null); });
  render(null); paintWeak();
}
mountQuiz();

/* ---------------- self tests ---------------- */
(function selfTests(){
  const host=document.getElementById('selftests'); if(!host) return;
  const list=M.selftests||[]; let ok=0;
  host.innerHTML = list.map(t=>{
    let got='ERR'; try{ got=t.got(); }catch(e){ got='ERR'; }
    const pass = String(got)===String(t.want); if(pass) ok++;
    return `<div class="pa-item" style="border-top:0;padding-top:4px;margin-top:0">
      <span class="mono">${pass?icon('check'):icon('x')}</span> ${t.name}:
      <span class="mono">${got}</span>
      ${pass?`<span class="pill" style="border-color:var(--ok);color:var(--ok)">${icon('check')} مطابق للشريحة ${t.slide}</span>`
            :`<span class="pill bad">متوقّع ${t.want}</span>`}</div>`;
  }).join('') + `<p class="muted" style="margin-top:8px">النتيجة: <b>${ok}/${list.length}</b> — تُحسب عند تحميل الصفحة من بيانات الوحدة، لا من قيم ثابتة.</p>`;
})();

/* ---------------- checklist ---------------- */
(function checklist(){
  const host=document.getElementById('checkList'); if(!host || !M.checklist) return;
  const saved=LS.get(KEY+'check',[]);
  host.innerHTML = M.checklist.map((t,i)=>
    `<label class="pa-item" style="display:flex;gap:10px;align-items:flex-start;border-top:0;padding-top:4px;margin-top:0">
      <input type="checkbox" data-ci="${i}" ${saved.includes(i)?'checked':''} style="margin-top:.55em;width:16px;height:16px;accent-color:var(--accent)">
      <span>${t}</span></label>`).join('')
    + `<p class="muted" id="chkTxt" style="margin-top:8px"></p>`;
  const paint=()=>{
    const s=$$('[data-ci]:checked',host).map(x=>+x.dataset.ci);
    LS.set(KEY+'check',s);
    const t=$('#chkTxt'); if(t) t.textContent=`أنجزت ${s.length} من ${M.checklist.length}`;
  };
  $$('[data-ci]',host).forEach(c=>c.addEventListener('change',paint)); paint();
})();

/* expose a couple of helpers for module data */
window.CS = {icon, countTo, drawPath, save, ST, LS, flash};

/* module-specific mounts (sandbox tools etc.) */
(M.mount||[]).forEach(f=>{ try{ f(); }catch(e){ if(window.console) console.warn('mount failed',e); } });
})();
/* CORE v1.1 END:js */
