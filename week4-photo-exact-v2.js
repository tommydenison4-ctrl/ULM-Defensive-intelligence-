/* Week 4 FAU: official bio portraits + Week 4 selector + full player-profile matching. */
(() => {
  const isW4=()=>typeof prepWeek!=='undefined'&&prepWeek==='W4';
  const previousPhoto=typeof photo==='function'?photo:null;
  const previousSeasonRows=typeof playerSeasonRowsSource==='function'?playerSeasonRowsSource:null;
  const previousSeasonToken=typeof seasonTokenMatchRow==='function'?seasonTokenMatchRow:null;

  // Always request the official FAU bio portrait for the exact player.
  window.photo=function(p){
    if(!isW4())return previousPhoto?previousPhoto(p):'';
    const name=String(p?.name||'').trim();
    const number=String(p?.number||'').trim();
    const profile=String(p?.profile||'').trim();
    if(!name)return '<div class="initials">?</div>';
    const src=`/api/fau-player-image?name=${encodeURIComponent(name)}&number=${encodeURIComponent(number)}&profile=${encodeURIComponent(profile)}&v=20260920finalbio1`;
    return `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;object-position:center bottom;image-rendering:auto" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="initials" style="display:none">${initials(name)}</div>`;
  };

  // The base player portal still used the old UAB season/token helpers. For W4, force the
  // current FAU play feed and the already-correct W4 player-token matcher. This restores
  // targeted routes, route tree, linked plays, usage/alignment and the player profile tabs.
  window.playerSeasonRowsSource=function(season){
    if(!isW4())return previousSeasonRows?previousSeasonRows(season):[];
    return (typeof datasets!=='undefined'&&Array.isArray(datasets.plays))?datasets.plays:[];
  };
  window.seasonTokenMatchRow=function(r,token,p,expectedPos='',season){
    if(!isW4())return previousSeasonToken?previousSeasonToken(r,token,p,expectedPos,season):false;
    if(!r||!token||!p)return false;
    if(typeof playerTokenMatchRow==='function')return !!playerTokenMatchRow(r,token,p,expectedPos);
    if(typeof playerTokenMatch==='function')return !!playerTokenMatch(token,p,expectedPos);
    return false;
  };

  async function forceWeek4(){
    try{
      prepWeek='W4';
      if(typeof analysisMode!=='undefined')analysisMode='current';
      if(typeof playerSeasonView!=='undefined')playerSeasonView='2026';
      if(typeof page!=='undefined')page='dashboard';
      if(typeof selected!=='undefined')selected=null;
      try{localStorage.setItem('ulmDefPrepWeekV1','W4')}catch(_e){}
      if(typeof syncNav==='function')syncNav();
      if(typeof updatePrepChrome==='function')updatePrepChrome();
      if(typeof loadOpponentData==='function')await loadOpponentData();
      else if(typeof render==='function')render();
      if(typeof playerSeasonView!=='undefined')playerSeasonView='2026';
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
      btn.disabled=false;btn.removeAttribute('aria-disabled');btn.style.pointerEvents='auto';btn.style.cursor='pointer';btn.dataset.week='W4';
    });
  }
  document.addEventListener('click',ev=>{
    const btn=ev.target?.closest?.('button');
    if(!isFAUButton(btn))return;
    ev.preventDefault();ev.stopPropagation();if(typeof ev.stopImmediatePropagation==='function')ev.stopImmediatePropagation();forceWeek4();
  },true);
  const boot=()=>repairFAUButtons(document);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  const obs=new MutationObserver(muts=>{if(muts.some(m=>m.addedNodes?.length))repairFAUButtons(document)});
  if(document.documentElement)obs.observe(document.documentElement,{childList:true,subtree:true});
})();
