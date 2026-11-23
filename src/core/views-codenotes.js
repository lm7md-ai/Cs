/* VIEWS-CODENOTES v1 START:js */
/* يبني عمود «شرح الأسطر بالعربية» لكل كتلة .code فيها .cnotes[data-cn].
   المصدر في content.html: <script type="text/plain" id="cn-XXX"> سطر لكل ملاحظة بصيغة «رقم|الشرح». */
(function(){
"use strict";
const WIDE = '(min-width:901px)';
const isWide = ()=> window.matchMedia(WIDE).matches;

function parse(src){
  return String(src.textContent||'').replace(/^\n/,'').split('\n')
    .map(l=>l.replace(/\s+$/,''))
    .filter(l=>l.trim() && l.indexOf('|')>0)
    .map(l=>{ const i=l.indexOf('|'); return {n:parseInt(l.slice(0,i),10), t:l.slice(i+1).trim()}; })
    .filter(r=>r.n>0 && r.t);
}

function build(code){
  const box = code.querySelector('.cnotes[data-cn]');
  if(!box || box.dataset.ready==='1') return;
  const src = document.getElementById('cn-'+box.dataset.cn);
  if(!src) return;
  const rows = parse(src); if(!rows.length) return;
  box.dataset.ready = '1';
  code.classList.add('has-notes');

  const d = document.createElement('details'); d.className='cn-d'; d.open = isWide();
  const sm = document.createElement('summary');
  sm.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-list"/></svg> شرح الأسطر بالعربية ('+rows.length+')';
  const list = document.createElement('div'); list.className='cn-list';
  rows.forEach(r=>{
    const row = document.createElement('div');
    row.className='cn-row'; row.dataset.l = String(r.n);
    const b = document.createElement('b'); b.textContent = r.n;
    const s = document.createElement('span'); s.innerHTML = r.t;
    row.appendChild(b); row.appendChild(s); list.appendChild(row);
  });
  d.appendChild(sm); d.appendChild(list); box.appendChild(d);
}

function wire(code){
  const rows = code.querySelectorAll('.cn-row');
  if(!rows.length) return;
  const lines = code.querySelectorAll('.ln');
  const paint = (n,on)=> code.querySelectorAll('.cn-row[data-l="'+n+'"], .ln[data-l="'+n+'"]')
    .forEach(x=>x.classList.toggle('on',on));
  lines.forEach(ln=>{
    const n = ln.dataset.l;
    if(!code.querySelector('.cn-row[data-l="'+n+'"]')) return;
    ln.classList.add('has-note');
    ln.addEventListener('mouseenter',()=>paint(n,true));
    ln.addEventListener('mouseleave',()=>paint(n,false));
    ln.addEventListener('focus',()=>paint(n,true));
    ln.addEventListener('blur',()=>paint(n,false));
    ln.addEventListener('click',()=>paint(n,true));
  });
  rows.forEach(r=>{
    const n = r.dataset.l;
    r.addEventListener('mouseenter',()=>paint(n,true));
    r.addEventListener('mouseleave',()=>paint(n,false));
    r.addEventListener('click',()=>paint(n,true));
  });
}

function init(){
  document.querySelectorAll('.code').forEach(code=>{ build(code); wire(code); });
  // على الشاشات الواسعة يبقى العمود ظاهرًا دائمًا
  window.addEventListener('resize',()=>{
    document.querySelectorAll('.cn-d').forEach(d=>{ if(isWide()) d.open = true; });
  });
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
/* VIEWS-CODENOTES v1 END:js */
