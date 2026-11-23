/* يستخرج مولِّدات التحدّي من modules/<id>/data.js ويشغّلها بذورًا مختلفة ويطبع JSON. */
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT='/home/user/CSVT/modules';

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}

function loadModule(id){
  const code=fs.readFileSync(path.join(ROOT,id,'data.js'),'utf8');
  const el=()=>({style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},
    setAttribute(){},getAttribute(){return null},appendChild(){},addEventListener(){},
    querySelector(){return null},querySelectorAll(){return []},innerHTML:'',textContent:''});
  const ctx={console, Math:Object.create(Math), window:{}, document:{
      getElementById(){return null}, querySelector(){return null}, querySelectorAll(){return []},
      createElement(){return el()}, addEventListener(){}, body:{appendChild(){}}},
    CustomEvent:function(){}, localStorage:{getItem(){return null},setItem(){}}};
  ctx.window=ctx; ctx.self=ctx;
  vm.createContext(ctx);
  vm.runInContext(code, ctx, {filename:id+'/data.js'});
  return ctx.MODULE;
}

const RUNS=parseInt(process.argv[2]||'500',10);
const ids=process.argv.slice(3);
const out={};
for(const id of ids){
  const M=loadModule(id);
  const ca=M.ca||{levels:[]};
  out[id]={levels:[], pas:[], quiz:[], selftests:[]};
  for(let lv=0; lv<(ca.levels||[]).length; lv++){
    const rows=[];
    for(let s=1;s<=RUNS;s++){
      Math.random=mulberry32(s*7919+lv*13+1);
      let q; try{ q=ca.levels[lv](); }catch(e){ rows.push({seed:s,error:String(e)}); continue; }
      rows.push({seed:s, kind:q.kind, q:q.q, a:q.a, opts:q.opts||null, hint:q.hint||null, why:q.why||null});
    }
    out[id].levels.push({lv, rows});
  }
  // PA items are static; dump their answers for reference
  (M.pas||[]).forEach(p=>out[id].pas.push({num:p.num, items:(p.items||[]).map(it=>({q:it.q,a:it.a,opts:it.opts||null}))}));
  (M.quiz||[]).forEach((q,i)=>out[id].quiz.push({i,q:q.q,a:q.a,opts:q.opts,topic:q.topic}));
}
process.stdout.write(JSON.stringify(out));
