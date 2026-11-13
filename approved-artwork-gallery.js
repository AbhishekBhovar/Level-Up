/* LEVEL UP artwork gallery • 87 approved character pairs • artwork-only */
(function(){'use strict';
function init(){
 const reg=window.LEVEL_UP_ARTWORK_REGISTRY;
 const heroes=document.getElementById('levelsView');
 const roster=document.getElementById('v109Roster');
 if(!reg||reg.count!==87||!heroes||!roster)return;
 const collection=roster.closest('.v109-collection');
 if(!collection)return;
 const trigger=document.createElement('button');trigger.type='button';trigger.id='lu86Open';trigger.className='lu86-trigger';trigger.textContent='VIEW ALL 87 APPROVED ARTWORK PAIRS';
 trigger.setAttribute('aria-haspopup','dialog');
 const note=document.createElement('p');note.className='lu86-note';note.textContent='87 approved fighters · Displayed in current unlock order';
 collection.append(trigger,note);
 const overlay=document.createElement('div');overlay.id='lu86Overlay';overlay.className='lu86-overlay';overlay.setAttribute('aria-hidden','true');
 overlay.innerHTML='<section class="lu86-panel" role="dialog" aria-modal="true" aria-label="Approved character artwork"><header class="lu86-head"><button type="button" id="lu86Back" class="lu86-back" hidden>← ALL ARTWORK</button><div><strong id="lu86Heading">APPROVED ARTWORK</strong><small id="lu86Subtitle">87 characters · 174 approved images</small></div><button type="button" id="lu86Close" class="lu86-close" aria-label="Close artwork library">×</button></header><div class="lu86-scroll"><div id="lu86Grid" class="lu86-grid"></div><div id="lu86Detail" class="lu86-detail" hidden><div class="lu86-role"><span>PORTRAIT</span><img id="lu86Portrait" alt="" loading="lazy"></div><div class="lu86-role"><span>HQ LANDSCAPE</span><img id="lu86Landscape" alt="" loading="lazy"></div></div></div></section>';
 document.body.appendChild(overlay);
 const get=id=>overlay.querySelector('#'+id),grid=get('lu86Grid'),detail=get('lu86Detail'),back=get('lu86Back');
 let lastFocus=null,previousOverflow='',current=null;
 const cards=[];
 const activeRoster=window.LEVEL_UP_86_DATA?.roster||[];
 const inRankOrder=activeRoster.map(f=>reg.get(f.artId)).filter(Boolean);
 (inRankOrder.length===87?inRankOrder:reg.entries).forEach((e,i)=>{
  const button=document.createElement('button');button.type='button';button.className='lu86-tile';button.dataset.artworkId=e.id;
  const image=document.createElement('img');image.src=e.portrait;image.alt='';image.loading=i<8?'eager':'lazy';image.decoding='async';
  const title=document.createElement('span');title.textContent=e.name;
  const desc=document.createElement('small');desc.textContent='PORTRAIT + HQ';
  button.append(image,title,desc);button.addEventListener('click',()=>showDetail(e));
  grid.appendChild(button);cards.push(button);
 });
 function open(){lastFocus=document.activeElement;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');showGrid();get('lu86Close').focus()}
 function close(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.style.overflow=previousOverflow;current=null;if(lastFocus&&lastFocus.focus)lastFocus.focus()}
 function showGrid(){current=null;detail.hidden=true;grid.hidden=false;back.hidden=true;get('lu86Heading').textContent='APPROVED ARTWORK';get('lu86Subtitle').textContent='87 characters · 174 approved images';overlay.querySelector('.lu86-scroll').scrollTop=0;}
 function showDetail(e){current=e.id;grid.hidden=true;detail.hidden=false;back.hidden=false;get('lu86Heading').textContent=e.name.toUpperCase();get('lu86Subtitle').textContent='Approved portrait + HQ landscape · artwork only';const p=get('lu86Portrait'),l=get('lu86Landscape');p.src=e.portrait;p.alt=e.name+' portrait';l.src=e.landscape;l.alt=e.name+' HQ landscape';overlay.querySelector('.lu86-scroll').scrollTop=0;back.focus()}
 trigger.addEventListener('click',open);get('lu86Close').addEventListener('click',close);back.addEventListener('click',()=>{showGrid();get('lu86Back').blur();get('lu86Close').focus()});overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
 document.addEventListener('keydown',e=>{if(!overlay.classList.contains('open'))return;if(e.key==='Escape'){e.preventDefault();if(current)showGrid();else close()}if(e.key==='Tab'){const focusable=[...overlay.querySelectorAll('button:not([hidden]):not([disabled])')].filter(x=>x.offsetParent!==null);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 window.__levelUpArtworkGallery=Object.freeze({count:reg.count,open,close,show:function(id){const e=reg.get(id);if(!e)return false;open();showDetail(e);return true}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
