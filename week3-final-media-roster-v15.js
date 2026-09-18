/* Week 3 v17: current 2026 SEL roster only; preserve Supabase identities and enrich from Lionsports. */
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
    const src=`/api/sle-player-image?name=${encodeURIComponent(name)}&v=20260918v17`;
    return `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" data-sel-v17="1" style="object-fit:cover;object-position:50% 14%;image-rendering:auto" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="initials" style="display:none">${initials(name)}</div>`;
  }

  photo=function(p){
    if(!isW3())return oldPhoto?oldPhoto(p):'';
    return selPhoto(p);
  };

  async function syncCurrentSELRoster(doRender=true){
    if(!isW3()||refreshing)return;
    refreshing=true;
    try{
      // Supabase remains the identity/position source because it is already normalized for
      // Player Intelligence and PFF matching. The official 2026 roster is used only as the
      // membership gate and media source.
      const base=Array.isArray(roster)?roster.slice():[];
      if(!base.length)throw new Error('Supabase SEL roster not loaded; refusing to replace it');

      const r=await fetch('/api/sle-roster?v=20260918v17',{cache:'no-store'});
      if(!r.ok)throw new Error(`official roster ${r.status}`);
      const j=await r.json();
      const live=Array.isArray(j?.players)?j.players:[];
      if(!live.length)throw new Error('official 2026 roster empty');

      const byName=new Map(live.map(p=>[clean(p?.name),p]));
      const currentNames=new Set(byName.keys());

      // IMPORTANT: only players who are on the official 2026 roster remain visible.
      // Their 2025 PFF history is still retained in datasets and can populate weighted/current
      // player intelligence, but 2025-only players no longer get cards or bios.
      roster=base
        .filter(p=>currentNames.has(clean(p?.name)))
        .map(p=>{
          const official=byName.get(clean(p?.name));
          return {
            ...p,
            image: official?.image || p.image || '',
            profile: official?.profile || p.profile || '',
            source:'Current 2026 SEL roster + Supabase identity/PFF matching'
          };
        });

      if(doRender&&typeof render==='function')render();
      if(typeof selected!=='undefined'&&selected&&typeof renderFAUDrawer==='function'){
        const p=roster.find(x=>clean(x.name)===clean(selected));
        if(p)renderFAUDrawer(p);
        else selected=null;
      }
    }catch(e){
      console.warn('SEL current-roster filter v17:',e);
      // If the official 2026 membership check fails, keep the already-working Supabase roster
      // rather than risking another empty Player Intelligence page.
    }finally{refreshing=false}
  }

  playersPage=function(){
    if(!isW3())return oldPlayers?oldPlayers():'';
    let all=offenseRoster(),list=filteredPlayers(),posCounts={};
    all.forEach(p=>posCounts[normPos(p.position)]=(posCounts[normPos(p.position)]||0)+1);
    return `<div class="page-title"><h2>Player Intelligence</h2><p>Southeastern Louisiana current 2026 roster, bios/photos and PFF personnel intelligence.</p></div>${dataStatus()}<div class="toolbar"><input id="playerSearch" placeholder="Search name, number, hometown or previous school" oninput="render()"><select id="playerSort" onchange="render()"><option value="number">Sort: number</option><option value="name">Sort: name</option><option value="position">Sort: position</option></select><div></div><div></div></div><div class="position-tabs">${positionGroups().map(([id,l])=>`<button class="${group===id?'active':''}" onclick="setGroup('${id}')">${l}${id!=='ALL'&&posCounts[id]!=null?` (${posCounts[id]})`:''}</button>`).join('')}</div><div class="kpis"><div class="kpi"><span>Offensive Players</span><b>${all.length}</b><small>Current 2026 SEL roster only</small></div><div class="kpi"><span>Current View</span><b>${list.length}</b><small>${group==='ALL'?'All offense':group}</small></div><div class="kpi"><span>PFF Plays</span><b>${typeof sleEligibleRows==='function'&&analysisMode==='weighted'?sleEligibleRows(rawPlayRows).length:(datasets.plays||[]).length}</b><small>${analysisMode==='weighted'?'eligible plays · rates weighted 50/50':'active data view'}</small></div><div class="kpi"><span>PFF Files Live</span><b>${Object.values(loadState).filter(x=>x.ok).length}</b><small>Supabase Storage</small></div></div><div class="player-grid">${list.length?list.map(playerCard).join(''):'<div class="empty">No players match this view.</div>'}</div><div class="card source-card"><b>Roster identity:</b> <code>Defensive Intelligence / Opponents / Southeastern Louisiana / roster.json</code><br><b>Current membership:</b> <code>Official Southeastern Louisiana 2026 roster</code><br><b>PFF:</b> <code>Defensive Intelligence / Opponents / Southeastern Louisiana</code><br><b>Photos/Bios:</b> <code>Official Lionsports media</code></div>`;
  };

  if(oldLoad){
    loadOpponentData=async function(...args){
      const out=await oldLoad.apply(this,args);
      if(isW3())await syncCurrentSELRoster(true);
      return out;
    };
  }

  if(!document.getElementById('selV17PhotoStyle')){
    const s=document.createElement('style');s.id='selV17PhotoStyle';
    s.textContent=`body .player-photo img[data-sel-v17="1"]{width:100%!important;height:100%!important;object-fit:cover!important;object-position:50% 14%!important;filter:none!important;transform:none!important}`;
    document.head.appendChild(s);
  }

  setTimeout(()=>{if(isW3()&&Array.isArray(roster)&&roster.length)syncCurrentSELRoster(true)},250);
})();
