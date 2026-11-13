/* LEVEL UP v151 — 87-fighter progression and direct exercise mastery library. Legacy save compatibility preserved. */
(function(){'use strict';
const D=window.LEVEL_UP_86_DATA,A=window.LEVEL_UP_ARTWORK_REGISTRY;if(!D||!A)return;
const KEY='levelUp87Progress_v149';const ALL_EX=D.exercises.flatMap(e=>e.milestones.map(m=>({...m,exerciseId:e.id,category:e.category,kind:e.kind})));const ALL_MA=D.martial.flatMap(t=>t.milestones.map(m=>({...m,techniqueId:t.id})));
const byEx=Object.fromEntries(D.exercises.map(e=>[e.id,e]));const byMart=Object.fromEntries(D.martial.map(t=>[t.id,t]));
const gymCats=new Set(['Strength','Bodyweight','Core','Balance/Agility','Chin-ups/Skills']);
let s={version:'v149',measurements:[],martialLogs:[],earned:[],fighterEarned:[],notificationQueue:[],seen:[],migration:null};
try{
 const newer=JSON.parse(localStorage.getItem(KEY)||'null');
 if(newer&&Array.isArray(newer.measurements)&&Array.isArray(newer.earned))s={...s,...newer};
 else {
  const prev=JSON.parse(localStorage.getItem('levelUp86Progress_v148')||'null');
  if(prev&&Array.isArray(prev.measurements)&&Array.isArray(prev.earned)){
   const shift=n=>Number.isInteger(n)&&n>=71?n+1:n;
   s={...s,...prev,version:'v149',fighterEarned:(prev.fighterEarned||[]).map(shift),notificationQueue:(prev.notificationQueue||[]).map(a=>{
    if(a.type!=='fighter')return a;
    const oldLevel=Number(String(a.id).split(':')[1]);
    const updated=shift(oldLevel),fighter=D.roster.find(f=>f.level===updated);
    return {...a,id:'fighter:'+updated,text:fighter?'LEVEL '+updated+' — '+fighter.name:a.text};
   }),seen:(prev.seen||[]).map(id=>String(id).replace(/^fighter:(\d+)$/,(_,n)=>'fighter:'+shift(Number(n)))),migration:{from:'v148',oldSavePreserved:true}};
  }
 }
}catch(e){}
const $=(id)=>document.getElementById(id);const esc=(v)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function persist(){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}};
function totals(){let a={gym:0,cardio:0,martial:0,total:s.earned.length};const earned=new Set(s.earned);for(let m of ALL_EX){if(earned.has(m.id)){if(gymCats.has(m.category))a.gym++;else a.cardio++}}for(let m of ALL_MA){if(earned.has(m.id))a.martial++}return a}
function isReached(m,measurement){const w=measurement.weight,r=measurement.reps,v=measurement.value;switch(m.kind){case'load_reps':case'carry':return w>=m.w&&r>=m.r;case'assistance':return v<=m.w&&measurement.reps>=8;case'race':return v>0&&v<=m.w&&(m.w!==7200&&m.w!==18000||v<m.w);default:return v>=m.w}}
function earnedElite(){const push=s.measurements.some(x=>x.id==='pushup'&&x.value>=100);const chin=s.measurements.some(x=>x.id==='strict_chinup'&&x.value>=30);const hm=s.measurements.some(x=>x.id==='half_marathon_race'&&x.value>0&&x.value<7200);const fm=s.measurements.some(x=>x.id==='marathon_race'&&x.value>0&&x.value<18000);return {push,chin,hm,fm,count:[push,chin,hm,fm].filter(Boolean).length}}
function martialTotal(id){return s.martialLogs.reduce((n,x)=>n+(x.id===id?x.reps:0),0)}
function fundamentalsMet(){return D.martial.filter(t=>t.tier.toLowerCase().includes('fundamental')).every(t=>martialTotal(t.id)>=10000)}
function gatesMet(l,tot,e){return tot.total>=l.total&&tot.gym>=l.gym&&tot.cardio>=l.cardio&&tot.martial>=l.martial&&e.count>=l.elite&&(!l.fundamentalAll||fundamentalsMet())}
function ensureEarned(){const earned=new Set(s.earned),newAwards=[];
 for(const m of ALL_EX){if(!earned.has(m.id)&&s.measurements.some(x=>x.id===m.exerciseId&&isReached(m,x))){earned.add(m.id);newAwards.push({type:'milestone',id:m.id,text:byEx[m.exerciseId].name+' — '+m.target})}}
 for(const m of ALL_MA){if(!earned.has(m.id)&&martialTotal(m.techniqueId)>=m.n){earned.add(m.id);newAwards.push({type:'milestone',id:m.id,text:byMart[m.techniqueId].name+' — '+m.n.toLocaleString()+' lifetime reps'})}}
 newAwards.sort((a,b)=>{const ax=ALL_EX.findIndex(m=>m.id===a.id),bx=ALL_EX.findIndex(m=>m.id===b.id);if(ax<0&&bx<0)return ALL_MA.findIndex(m=>m.id===a.id)-ALL_MA.findIndex(m=>m.id===b.id);if(ax<0)return 1;if(bx<0)return -1;return ax-bx});
 s.earned=[...earned];const tot=totals(),e=earnedElite();const fighter=new Set(s.fighterEarned);
 for(const f of D.roster){if(!fighter.has(f.level)&&gatesMet(f,tot,e)){fighter.add(f.level);newAwards.push({type:'fighter',id:'fighter:'+f.level,text:'LEVEL '+f.level+' — '+f.name})}}
 s.fighterEarned=[...fighter].sort((a,b)=>a-b);
 if(newAwards.length){s.notificationQueue.push(...newAwards);persist()}
 return newAwards.length}
// Copy only explicitly identifiable legacy performances; never remove or rewrite older save keys.
function migrateLegacy(){
 let imports=0;
 try{
  const old=JSON.parse(localStorage.getItem('fitnessRPGv11')||'null');
  if(old&&typeof old==='object'){
   const candidates=[];
   const add=(id,value,weight,reps,signature)=>{if(Number.isFinite(value)&&value>0&&(!weight||weight>0)&&(!reps||reps>0))candidates.push({id,value,weight:weight||null,reps:reps||null,source:'legacy-v11',sourceKey:signature,at:0})};
   if(old.benchWeight>0&&old.benchReps>0)add('bench_press',Number(old.benchWeight),Number(old.benchWeight),Number(old.benchReps),'bench:'+old.benchWeight+':'+old.benchReps);
   if(old.bwSquatReps>0)add('squat',Number(old.bwSquatReps),null,null,'squat:'+old.bwSquatReps);
   if(old.cardioWalkKm>0)add('outdoor_walk',Math.round(Number(old.cardioWalkKm)*1000),null,null,'walk:'+old.cardioWalkKm);
   if(old.cardioRunKm>0)add('outdoor_run',Math.round(Number(old.cardioRunKm)*1000),null,null,'run:'+old.cardioRunKm);
   if(old.cardioStairs>0)add('stairmaster',Number(old.cardioStairs),null,null,'stairs:'+old.cardioStairs);
   if(old.chinAssist>0&&old.chinRepsA>0)add('assisted_chinup',Number(old.chinAssist),null,Number(old.chinRepsA),'assist:'+old.chinAssist+':'+old.chinRepsA);
   if(old.chinRepsBW>0)add('strict_chinup',Number(old.chinRepsBW),null,null,'chin:'+old.chinRepsBW);
   const already=new Set(s.measurements.filter(x=>x.source==='legacy-v11').map(x=>x.sourceKey));
   for(const c of candidates)if(!already.has(c.sourceKey)){s.measurements.push(c);imports++;already.add(c.sourceKey)}
  }
 }catch(e){}
 try{
  const old=JSON.parse(localStorage.getItem('levelUpKarateV136')||'null');
  if(old&&Array.isArray(old.logs)){
   const recorded=new Set(s.martialLogs.filter(x=>x.source==='legacy-v136').map(x=>x.sourceKey));
   old.logs.forEach((x,i)=>{const n=Number(x.n);if(!byMart[x.id]||!Number.isInteger(n)||n<1)return;const key='legacy-karate:'+i+':'+String(x.id)+':'+String(x.at||'')+':'+n;
    if(!recorded.has(key)){s.martialLogs.push({id:x.id,reps:n,speed:({slow:'Slow',medium:'Medium',fast:'Fast'}[String(x.mode).toLowerCase()]||'Unspecified'),side:'Both / N/A',at:x.at||0,source:'legacy-v136',sourceKey:key});recorded.add(key);imports++}
   });
  }
 }catch(e){}
 if(imports){s.migration={importedFromExistingApp:(s.migration?.importedFromExistingApp||0)+imports};persist();}
 return imports
}
const portal=document.createElement('div');portal.id='lu148-portal';portal.setAttribute('aria-label','LEVEL UP 87 fighter progression');portal.innerHTML='<div class="luh"><div><strong>LEVEL UP · 87 FIGHTERS</strong><small>Strength · Endurance · Martial Arts</small></div><button class="lubtn" id="lu148-close">CLOSE ×</button></div><nav class="lutab"><button data-tab="heroes" class="on">Heroes</button><button data-tab="exercises">Exercises</button><button data-tab="martial">Martial Arts</button><button data-tab="stats">Stats</button></nav><div class="lucontent" id="lu148-content"></div><div id="lu148-notices"></div>';document.body.appendChild(portal);
const openButton=document.createElement('button');openButton.id='lu148-open';openButton.textContent='OPEN 87-FIGHTER PROGRESSION ↗';const existing=document.getElementById('levelsView');if(existing)existing.prepend(openButton);else document.querySelector('header')?.after(openButton);const hq=document.getElementById('progressView');if(hq){const hqButton=openButton.cloneNode(true);hqButton.id='lu148-hq-open';hq.prepend(hqButton);hqButton.onclick=()=>open('heroes')}
let tab='heroes',selectedExercise=null,selectedTechnique=null,alreadyOpen=false,priorOverflow='',exerciseFilter='All',exerciseQuery='';
const hallLaunch=document.createElement('button');hallLaunch.type='button';hallLaunch.id='lu151-exercises-open';hallLaunch.innerHTML='<span><strong>EXERCISES</strong><small>27 mastery tracks · see every milestone →</small></span><span aria-hidden="true">›</span>';const quickHeroes=document.getElementById('v108Heroes');if(quickHeroes){quickHeroes.parentElement.after(hallLaunch)}else if(hq){hq.prepend(hallLaunch)}hallLaunch.onclick=()=>open('exercises');const trainingHall=hallLaunch.cloneNode(true);trainingHall.id='lu151-training-exercises-open';const trainingView=document.getElementById('rankingsView');if(trainingView){trainingView.prepend(trainingHall);trainingHall.onclick=()=>open('exercises');}

function open(destination){migrateLegacy();ensureEarned();if(destination==='exercises'||destination==='heroes'||destination==='martial'||destination==='stats'){tab=destination;selectedExercise=null;selectedTechnique=null;}alreadyOpen=true;priorOverflow=document.body.style.overflow;document.body.style.overflow='hidden';portal.classList.add('open');portal.scrollTop=0;render();showNext();}
function close(){alreadyOpen=false;portal.classList.remove('open');document.body.style.overflow=priorOverflow}
openButton.onclick=()=>open('heroes');$('lu148-close').onclick=close;portal.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;selectedExercise=null;selectedTechnique=null;render()});
function progressBar(a,b){return '<div class="progressbar"><i style="width:'+Math.max(0,Math.min(100,Math.round(a/Math.max(1,b)*100)))+'%"></i></div>'}
function headerLine(title,sub){return '<div class="lucard"><h3>'+esc(title)+'</h3><div class="muted">'+esc(sub)+'</div></div>'}
function render(){portal.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));const c=$('lu148-content');c.innerHTML=tab==='heroes'?heroHTML():tab==='exercises'?exerciseHTML():tab==='martial'?martialHTML():statsHTML();bind()}
function heroHTML(){const t=totals(),e=earnedElite(),earnedFighter=Math.max(0,...s.fighterEarned),next=D.roster.find(f=>!s.fighterEarned.includes(f.level));let html=headerLine('YOUR FIGHTER JOURNEY',t.total+' earned milestones · '+earnedFighter+'/'+D.roster.length+' fighter levels unlocked');if(next){const f=next;html+='<div class="lucard"><div class="lupair"><h3>Next: '+f.level+' · '+esc(f.name)+'</h3><span class="muted">'+t.total+'/'+f.total+'</span></div>'+progressBar(t.total,f.total)+'<div class="muted">Gym '+t.gym+'/'+f.gym+' · Cardio '+t.cardio+'/'+f.cardio+' · Martial '+t.martial+'/'+f.martial+(f.elite?' · Elite '+e.count+'/'+f.elite:'')+(f.fundamentalAll?' · All 12 fundamentals to 10,000':'')+'</div></div>'}
 for(const f of D.roster){const a=A.get(f.artId);const done=s.fighterEarned.includes(f.level);html+='<div class="lulvl"><span class="luseq">'+f.level+'</span>'+(a&&a.portrait?'<img class="ficon" loading="lazy" src="'+esc(a.portrait)+'" alt="">':'')+'<div class="ludetails"><b>'+esc(f.name)+'</b><div class="lurequire">'+f.total+' milestones · '+f.gym+' gym · '+f.cardio+' cardio · '+f.martial+' martial'+(f.elite?' · '+f.elite+' elite':'')+'</div></div><span class="'+(done?'luc​​heck':'muted')+'">'+(done?'✓':'○')+'</span></div>'}return html}
function exerciseState(e){
 const got=e.milestones.filter(m=>s.earned.includes(m.id));
 const missing=e.milestones.filter(m=>!s.earned.includes(m.id));
 const latest=s.measurements.filter(x=>x.id===e.id).slice().sort((a,b)=>(b.at||0)-(a.at||0))[0];
 return {done:got.length,total:e.milestones.length,next:missing[0],highest:got[got.length-1],latest};
}
function exerciseHTML(){
 if(selectedExercise){
  const e=byEx[selectedExercise],q=exerciseState(e),earned=new Set(s.earned);
  const latest=q.latest?('<div class="lu151-summaryline"><span>Latest recorded</span><b>'+esc((q.latest.weight!=null?q.latest.weight+' kg × '+q.latest.reps:(q.latest.value??'—'))+(e.kind==='carry'?' steps':''))+'</b></div>'):'';
  let html='<button class="lubtn" data-back>← EXERCISE LIBRARY</button><div class="lucard"><div class="lu151-eyebrow">'+esc(e.category)+' · '+esc(e.unitHint||'')+'</div><h3>'+esc(e.name)+'</h3><div class="lu151-summaryline"><span>Mastery achieved</span><b>'+q.done+' / '+q.total+'</b></div>'+progressBar(q.done,q.total)+'<div class="lu151-summaryline"><span>Highest completed</span><b>'+esc(q.highest?q.highest.target:'Not yet recorded')+'</b></div><div class="lu151-summaryline"><span>Next milestone</span><b>'+esc(q.next?q.next.target:'All milestones complete')+'</b></div>'+latest+'</div>';
  html+='<div class="lucard"><h3>Log a performance</h3><form id="lu148-exercise-form"><label>'+((e.kind==='load_reps'||e.kind==='carry')?'Load (kg'+(e.kind==='carry'?' per hand':'')+')':'Result ('+(e.kind==='assistance'?'kg assistance':e.kind==='race'?'seconds':esc(e.milestones[0].unit))+')')+'</label><input id="lu148-value" inputmode="decimal" type="number" min="0" step="any" required placeholder="Enter result">'+((e.kind==='load_reps'||e.kind==='carry'||e.kind==='assistance')?'<label>'+(e.kind==='carry'?'Uninterrupted steps':'Repetitions in one set')+'</label><input id="lu148-reps" type="number" inputmode="numeric" min="1" required placeholder="Reps / steps">':'')+'<button class="lubtn" type="submit" style="margin-top:11px;width:100%">SAVE PERFORMANCE</button></form><div id="lu148-error" class="muted" aria-live="polite"></div></div>';
  html+='<div class="lucard"><div class="lu151-pair"><h3>Mastery ladder</h3><span class="muted">'+q.done+'/'+q.total+' completed</span></div>';
  html+=e.milestones.map((m,i)=>'<div class="lu151-rung '+(earned.has(m.id)?'complete':q.next?.id===m.id?'next':'')+'"><span class="lu151-rungno">'+(i+1)+'</span><span>'+esc(m.target)+(e.kind==='assistance'?' · 8 reps':'')+'</span><span class="lu151-rungstatus">'+(earned.has(m.id)?'✓':q.next?.id===m.id?'NEXT':'○')+'</span></div>').join('')+'</div>';
  return html;
 }
 const categories=['All',...new Set(D.exercises.map(e=>e.category))];
 const matches=D.exercises.filter(e=>(exerciseFilter==='All'||e.category===exerciseFilter)&&e.name.toLowerCase().includes(exerciseQuery.toLowerCase()));
 let html='<div class="lucard lu151-libraryhead"><div class="lu151-eyebrow">YOUR EXERCISE HALL OF FAME</div><h3>Exercise Library</h3><div class="muted">'+D.exercises.length+' exercise tracks · all mastery ladders and saved achievements in one place</div><div class="lu151-overall">'+D.exercises.reduce((n,e)=>n+exerciseState(e).done,0)+' / '+D.exercises.reduce((n,e)=>n+e.milestones.length,0)+' exercise milestones earned</div><label for="lu151-search">Find an exercise</label><input id="lu151-search" type="search" placeholder="Search all exercises…" value="'+esc(exerciseQuery)+'" autocomplete="off"/><div class="lu151-filters">'+categories.map((c,i)=>'<button class="lu151-filter '+(exerciseFilter===c?'on':'')+'" data-ex-filter="'+i+'" type="button">'+esc(c)+'</button>').join('')+'</div></div>';
 html+='<div class="lu151-catalog">';
 for(const e of matches){const q=exerciseState(e);html+='<button class="lu151-excard" type="button" data-ex="'+esc(e.id)+'"><div class="lu151-cardtop"><strong>'+esc(e.name)+'</strong><span class="lu151-chevron">›</span></div><div class="lu151-cardmeta">'+esc(e.category)+' · '+q.done+'/'+q.total+' milestones</div>'+progressBar(q.done,q.total)+'<div class="lu151-cardnext"><span>NEXT</span><b>'+esc(q.next?q.next.target:'MASTERED')+'</b></div></button>'}
 if(!matches.length)html+='<div class="lucard muted">No exercises match this search.</div>';
 return html+'</div>';
}
function martialHTML(){if(selectedTechnique){const t=byMart[selectedTechnique],n=martialTotal(t.id),hit=t.milestones.filter(x=>s.earned.includes(x.id)).length;return '<button class="lubtn" data-back>← ALL TECHNIQUES</button><div class="lucard"><h3>'+esc(t.name)+'</h3><div class="muted">'+esc(t.english)+' · '+n.toLocaleString()+'/'+t.ultimate.toLocaleString()+' lifetime correct reps · '+hit+'/'+t.milestones.length+' checkpoints</div>'+progressBar(n,t.ultimate)+'<form id="lu148-martial-form"><label>Technically sound repetitions this session</label><input id="lu148-martial-reps" type="number" min="1" max="10000" required inputmode="numeric" placeholder="Number completed"><div class="lurow"><div style="flex:1"><label>Speed</label><select id="lu148-speed"><option>Slow</option><option>Medium</option><option>Fast</option></select></div><div style="flex:1"><label>Side</label><select id="lu148-side"><option>Both / N/A</option><option>Left</option><option>Right</option></select></div></div><button type="submit" class="lubtn" style="width:100%;margin-top:8px">ADD PRACTICE REPS</button></form></div><div class="lucard"><h3>Cumulative checkpoints</h3>'+t.milestones.map(m=>'<div class="luearn">'+(s.earned.includes(m.id)?'✓ ':'○ ')+m.n.toLocaleString()+' lifetime repetitions</div>').join('')+'</div>'}
 let html=headerLine('29 MARTIAL ARTS TECHNIQUES','Cumulative technically sound repetitions, with speed and side logged separately. No belts, gradings, or repetition deadlines.');html+='<div class="lulist">';for(const t of D.martial){const n=martialTotal(t.id);html+='<button class="luitem" data-tech="'+t.id+'"><b>'+esc(t.name)+'</b><span>'+n.toLocaleString()+' / '+t.ultimate.toLocaleString()+' · from L'+t.intro+'</span></button>'}return html+'</div>'}
function statsHTML(){const t=totals(),e=earnedElite();return headerLine('PROGRESSION STATISTICS','Permanent achievements · no deadlines, resets or streak gates')+'<div class="lucard"><h3>'+t.total+' unique milestones</h3><div class="muted">Gym: '+t.gym+' · Cardio/races: '+t.cardio+' · Martial: '+t.martial+'</div><div class="muted">Fighters unlocked: '+s.fighterEarned.length+'/'+D.roster.length+'</div><div class="muted">Total recorded performances: '+s.measurements.length+' · martial sessions: '+s.martialLogs.length+'</div></div><div class="lucard"><h3>Four final achievements</h3>'+[['push','100 consecutive strict push-ups'],['chin','30 consecutive strict chin-ups'],['hm','Half marathon under 2 hours'],['fm','Marathon under 5 hours']].map(([k,label])=>'<div class="luearn">'+(e[k]?'✓ ':'○ ')+label+'</div>').join('')+'</div><div class="lucard"><h3>Preserved records</h3><div class="muted">This v149 tracker safely imports previous v148 progress into a new save key. The legacy app, 30-fighter records, artwork and prior workout history are not overwritten. This is the 87-fighter tracker, with independent results.</div></div><div class="lufooter">Progression thresholds remain proposed pending real-world calibration. Previously earned milestones never expire.</div>'}
function bind(){portal.querySelectorAll('[data-ex-filter]').forEach(b=>b.onclick=()=>{exerciseFilter=['All',...new Set(D.exercises.map(e=>e.category))][Number(b.dataset.exFilter)];render()});const search=$('lu151-search');if(search){search.oninput=()=>{exerciseQuery=search.value;const start=search.selectionStart;const focus=search===document.activeElement;render();if(focus){const next=$('lu151-search');next.focus();try{next.setSelectionRange(start,start)}catch(e){}}};}portal.querySelectorAll('[data-ex]').forEach(b=>b.onclick=()=>{selectedExercise=b.dataset.ex;render();portal.scrollTop=0});portal.querySelectorAll('[data-tech]').forEach(b=>b.onclick=()=>{selectedTechnique=b.dataset.tech;render();portal.scrollTop=0});portal.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{selectedExercise=null;selectedTechnique=null;render();portal.scrollTop=0});
 const form=$('lu148-exercise-form');if(form)form.onsubmit=e=>{e.preventDefault();const ex=byEx[selectedExercise],v=Number($('lu148-value').value),repField=$('lu148-reps'),reps=repField?Number(repField.value):null;if(!Number.isFinite(v)||v<=0||(repField&&(!Number.isInteger(reps)||reps<1))){$('lu148-error').textContent='Enter a valid positive performance.';return}if(['machine_chest_press','incline_leg_press','lat_pulldown','seated_row','seated_calf_machine'].includes(ex.id)&&v%5!==0){$('lu148-error').textContent='Use a 5 kg machine/load increment for these milestones.';return}const x={id:ex.id,at:Date.now(),value:v,weight:['load_reps','carry'].includes(ex.kind)?v:null,reps};s.measurements.push(x);persist();const count=ensureEarned();render();$('lu148-content').insertAdjacentHTML('afterbegin','<div class="lucard">Performance saved · '+count+' new achievements.</div>');showNext()};
 const mf=$('lu148-martial-form');if(mf)mf.onsubmit=e=>{e.preventDefault();const reps=Number($('lu148-martial-reps').value);if(!Number.isInteger(reps)||reps<1||reps>10000)return;s.martialLogs.push({id:selectedTechnique,reps,speed:$('lu148-speed').value,side:$('lu148-side').value,at:Date.now()});persist();const count=ensureEarned();render();$('lu148-content').insertAdjacentHTML('afterbegin','<div class="lucard">Practice recorded · '+count+' new achievements.</div>');showNext()}}
function showNext(){if(!alreadyOpen)return;const div=$('lu148-notices');if(div.children.length||!s.notificationQueue.length)return;const next=s.notificationQueue[0];const box=document.createElement('div');box.className='luoverlayNotice';box.innerHTML='<button class="lubtn">NEXT ✓</button><b>ACHIEVEMENT UNLOCKED</b><div style="font-size:12px;margin-top:5px">'+esc(next.text)+'</div>';box.querySelector('button').onclick=()=>{s.notificationQueue.shift();s.seen.push(next.id);persist();box.remove();showNext()};div.append(box)}
migrateLegacy();ensureEarned();persist();window.__LEVEL_UP_86=Object.freeze({data:D,read:()=>JSON.parse(JSON.stringify(s)),openExercises:()=>open('exercises'),recompute:()=>{migrateLegacy();const n=ensureEarned();if(alreadyOpen){render();showNext()}return n},open,close});
})();
