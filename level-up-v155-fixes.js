(function(){'use strict';
function init(){
 const hq=document.querySelector('#progressView');if(!hq)return;
 if(document.getElementById('lu155-hq'))return;
 const card=document.createElement('section');card.id='lu155-hq';card.className='lu155-hq';card.setAttribute('aria-label','Current 87-fighter progression');
 const obsolete=hq.querySelector('.v103-fighter-home');
 if(obsolete)obsolete.insertAdjacentElement('beforebegin',card);else hq.prepend(card);
 const art=window.LEVEL_UP_ARTWORK_REGISTRY;
 function artFor(id){const entries=art?.entries||art?.characters||art;return Array.isArray(entries)?entries.find(x=>x.id===id):art?.get?.(id)}
 function render(){const D=window.LEVEL_UP_86_DATA,api=window.__LEVEL_UP_86;if(!D?.roster||!api?.read)return;
  let s;try{api.recompute?.();s=api.read()}catch(e){return}
  const unlocked=s.fighterEarned||[];const current=D.roster.find(f=>!unlocked.includes(f.level))||D.roster[D.roster.length-1];
  const previous=D.roster[Math.max(0,current.level-2)];const shown=unlocked.length?previous:current;
  const image=artFor(shown.artId),img=image?.landscape||image?.portrait||'';
  const next=current;const escape=x=>String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  card.innerHTML=(img?`<img class="lu155-hq-image" src="${escape(img)}" alt="">`: '')+`<div class="lu155-hq-shade"></div><div class="lu155-hq-content"><div class="lu155-hq-kicker">LEVEL UP · ${unlocked.length} / 87 FIGHTERS UNLOCKED</div><h2 class="lu155-hq-name">${escape(unlocked.length?shown.name:'MORGAN GRIMES')}</h2><div class="lu155-hq-next">${unlocked.length===87?'All fighters unlocked':`NEXT — LEVEL ${next.level}: ${escape(next.name)} · ${(s.earned||[]).length} / ${next.total} milestones`}</div><button class="lu155-hq-btn" id="lu155-heroes-open">VIEW 87-FIGHTER PROGRESSION →</button><div class="lu155-hq-links"><button id="lu155-train-open">TRAINING</button><button id="lu155-exercises-open">EXERCISE LIBRARY</button></div></div>`;
  card.querySelector('#lu155-heroes-open').onclick=()=>{if(window.__LEVEL_UP_HEROES_87?.open)window.__LEVEL_UP_HEROES_87.open();else document.getElementById('levelsTabBtn')?.click()};
  card.querySelector('#lu155-train-open').onclick=()=>{document.getElementById('rankingsTabBtn')?.click()};
  card.querySelector('#lu155-exercises-open').onclick=()=>{api.open?.('exercises')};
 }
 render();document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});window.addEventListener('storage',render);
 document.querySelectorAll('.tab-btn').forEach(btn=>btn.addEventListener('click',()=>{if(btn.id==='progressTabBtn')render()}));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
