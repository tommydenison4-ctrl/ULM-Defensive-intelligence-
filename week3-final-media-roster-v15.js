/* Week 3 v16: preserve the working Supabase SEL roster; use Lionsports only for photo/profile enrichment. */
(() => {
  const isW3=()=>typeof prepWeek!=='undefined'&&prepWeek==='W3';
  const oldPlayers=typeof playersPage==='function'?playersPage:null;
  const oldPhoto=typeof photo==='function'?photo:null;
  const oldLoad=typeof loadOpponentData==='function'?loadOpponentData:null;
  let refreshing=false;
  const clean=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');

  function selPhoto(p){
    const name=String(p?.name||'').trim();
    if(!name)return `<div class="initials">?</div>`;
    const src=`/api/sle-player-image?name=${encodeURIComponent(name)}&v=20260918v16`;
    return `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" data-sel-v16="1" style="object-fit:cover;object-position:50% 14%;image-rendering:auto" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="initials" style="display:none">${initials(name)}</div>`;
  }

  photo=function(p){
    if(!isW3())return oldPhoto?oldPhoto(p):'';
    return selPhoto(p);
  };

  async function enrichSELMedia(doRender=true){
    if(!isW3()||refreshing)return;
    refreshing=true;
    try{
      // IMPORTANT: roster has already been loaded from Supabase by the Week 3 data loader.
      // Never replace that roster here. It contains the normalized positions/player identities
      // used by offenseRoster(), player cards, PFF matching and every player-intel tab.
      const base=Array.isArray(roster)?roster.slice():[];
      if(!base.length)throw new Error('Supabase SEL roster not loaded; refusing to replace it');

      const r=await fetch('/api/sle-roster?v=20260918v16',{cache:'no-store'});
      if(!r.ok)throw new Error(`official roster ${r.status}`);
      const j=await r.json();
      const live=Array.isArray(j?.players)?j.players:[];
      const byName=new Map(live.map(p=>[clean(p?.name),p]));

      roster=base.map(p=>{
        const official=byName.get(clean(p?.name));
        if(!official)return p;
        return {
          ...p,
          image: official.image || p.image || '',
          profile: official.profile || p.profile || '',
          source:'Supabase SEL roster + official Lionsports media'
        };
      });

      if(doRender&&typeof render==='function')render();
      if(typeof selected!=='undefined'&&selected&&typeof renderFAUDrawer==='function'){
        const p=roster.find(x=>clean(x.name)===clean(selected));
        if(p)renderFAUDrawer(p);
      }
    }catch(e){
      console.warn('SEL media enrichment v16:',e);
      // On any enrichment failure, leave the already-working Supabase roster untouched.
    }finally{refreshing=false}
  }

  // Same Mississippi State card/list layout; player identity/position source remains Supabase.
  playersPage=function(){
    if(!isW3())return oldPlayers?oldPlayers():'';
    let all=offenseRoster(),list=filteredPlayers(),posCounts={};
    all.forEach(p=>posCounts[normPos(p.position)]=(posCounts[normPos(p.position)]||0)+1);
    return `<div class="page-title"><h2>Player Intelligence</h2><p>Southeastern Louisiana current roster, bios/photos and PFF personnel intelligence.</p></div>${dataStatus()}<div class="toolbar"><input id="playerSearch" placeholder="Search name, number, hometown or previous school" oninput="render()"><select id="playerSort" onchange="render()"><option value="number">Sort: number</option><option value="name">Sort: name</option><option value="position">Sort: position</option></select><div></div><div></div></div><div class="position-tabs">${positionGroups().map(([id,l])=>`<button class="${group===id?'active':''}" onclick="setGroup('${id}')">${l}${id!=='ALL'&&posCounts[id]!=null?` (${posCounts[id]})`:''}</button>`).join('')}</div><div class="kpis"><div class="kpi"><span>Offensive Players</span><b>${all.length}</b><small>2026 SEL roster</small></div><div class="kpi"><span>Current View</span><b>${list.length}</b><small>${group==='ALL'?'All offense':group}</small></div><div class="kpi"><span>PFF Plays</span><b>${typeof sleEligibleRows==='function'&&analysisMode==='weighted'?sleEligibleRows(rawPlayRows).length:(datasets.plays||[]).length}</b><small>${analysisMode==='weighted'?'eligible plays · rates weighted 50/50':'active data view'}</small></div><div class="kpi"><span>PFF Files Live</span><b>${Object.values(loadState).filter(x=>x.ok).length}</b><small>Supabase Storage</small></div></div><div class="player-grid">${list.length?list.map(playerCard).join(''):'<div class="empty">No players match this view.</div>'}</div><div class="card source-card"><b>Roster:</b> <code>Defensive Intelligence / Opponents / Southeastern Louisiana / roster.json</code><br><b>PFF:</b> <code>Defensive Intelligence / Opponents / Southeastern Louisiana</code><br><b>Photos/Bios:</b> <code>Official Lionsports media enrichment</code></div>`;
  };

  if(oldLoad){
    loadOpponentData=async function(...args){
      const out=await oldLoad.apply(this,args);
      if(isW3())await enrichSELMedia(true);
      return out;
    };
  }

  if(!document.getElementById('selV16PhotoStyle')){
    const s=document.createElement('style');s.id='selV16PhotoStyle';
    s.textContent=`body .player-photo img[data-sel-v16="1"]{width:100%!important;height:100%!important;object-fit:cover!important;object-position:50% 14%!important;filter:none!important;transform:none!important}`;
    document.head.appendChild(s);
  }

  // If the Supabase roster is already present when this script loads, enrich it; otherwise the
  // loadOpponentData wrapper above will do it immediately after the Week 3 data load finishes.
  setTimeout(()=>{if(isW3()&&Array.isArray(roster)&&roster.length)enrichSELMedia(true)},250);
})();
