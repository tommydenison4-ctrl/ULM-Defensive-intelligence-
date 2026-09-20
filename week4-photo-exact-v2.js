/* Week 4 FAU: exact official bio portraits + hard fix for Week 4 selector. */
(() => {
  const isW4=()=>typeof prepWeek!=='undefined'&&prepWeek==='W4';
  const previousPhoto=typeof photo==='function'?photo:null;

  // Keep the Week 4 photo layer isolated to FAU.
  window.photo=function(p){
    if(!isW4())return previousPhoto?previousPhoto(p):'';
    const name=String(p?.name||'').trim();
    const number=String(p?.number||'').trim();
    const profile=String(p?.profile||'').trim();
    if(!name)return '<div class="initials">?</div>';
    const src=`/api/fau-player-image?name=${encodeURIComponent(name)}&number=${encodeURIComponent(number)}&profile=${encodeURIComponent(profile)}&v=20260920clickfix1`;
    return `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;object-position:center bottom;image-rendering:auto" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="initials" style="display:none">${initials(name)}</div>`;
  };

  async function forceWeek4(){
    try{
      // Bypass any stale/broken Week-4 onclick wrapper and set the same globals the app uses.
      prepWeek='W4';
      if(typeof analysisMode!=='undefined')analysisMode='current';
      if(typeof page!=='undefined')page='dashboard';
      if(typeof selected!=='undefined')selected=null;
      try{localStorage.setItem('ulmDefPrepWeekV1','W4')}catch(_e){}
      if(typeof syncNav==='function')syncNav();
      if(typeof updatePrepChrome==='function')updatePrepChrome();
      if(typeof loadOpponentData==='function')await loadOpponentData();
      else if(typeof render==='function')render();
      if(typeof updatePrepChrome==='function')updatePrepChrome();
      if(typeof render==='function')render();
    }catch(err){
      console.error('FAU Week 4 activation failed',err);
      try{if(typeof setPrepWeek==='function')await setPrepWeek('W4')}catch(e){console.error(e)}
    }
  }

  function isFAUButton(btn){
    if(!btn)return false;
    const txt=String(btn.textContent||'');
    const oc=String(btn.getAttribute?.('onclick')||'');
    return /Florida Atlantic/i.test(txt)||/setPrepWeek\(['\"]W4['\"]\)/.test(oc)||btn.dataset?.week==='W4';
  }

  function repairFAUButtons(root=document){
    const all=[...(root.querySelectorAll?.('button')||[])];
    all.filter(isFAUButton).forEach(btn=>{
      btn.disabled=false;
      btn.removeAttribute('aria-disabled');
      btn.style.pointerEvents='auto';
      btn.style.cursor='pointer';
      btn.dataset.week='W4';
    });
  }

  // Capture before any stale inline/legacy handler can swallow the event.
  document.addEventListener('click',ev=>{
    const btn=ev.target?.closest?.('button');
    if(!isFAUButton(btn))return;
    ev.preventDefault();
    ev.stopPropagation();
    if(typeof ev.stopImmediatePropagation==='function')ev.stopImmediatePropagation();
    forceWeek4();
  },true);

  const boot=()=>repairFAUButtons(document);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

  // Week switches are re-rendered, so keep the FAU button enabled after render cycles.
  const obs=new MutationObserver(muts=>{
    if(muts.some(m=>m.addedNodes?.length))repairFAUButtons(document);
  });
  if(document.documentElement)obs.observe(document.documentElement,{childList:true,subtree:true});
})();
