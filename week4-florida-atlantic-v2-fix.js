/* Week 4 v2 fixes: guarantee 2026 FAU player intel roster from PFF if roster.json/API is absent, and proxy depth PDF same-origin. */
(() => {
  const isW4=()=>typeof prepWeek!=='undefined'&&prepWeek==='W4';
  const clean=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const jersey=v=>String(v??'').replace(/\D/g,'').replace(/^0+/,'');
  const oldLoad=typeof loadOpponentData==='function'?loadOpponentData:null;
  const oldPlayers=typeof playersPage==='function'?playersPage:null;
  const oldDepth=typeof depthChartPage==='function'?depthChartPage:null;
  const offenseSet=new Set(['QB','RB','HB','TB','FB','WR','TE','OL','OT','OG','C','LT','LG','RG','RT','T','G','OC']);
  const normOffPos=p=>{
    const x=String(p||'').toUpperCase().trim();
    if(['HB','TB','FB'].includes(x))return 'RB';
    if(['OT','T','LT','RT'].includes(x))return 'OT';
    if(['OG','G','LG','RG'].includes(x))return 'OG';
    if(x==='OC')return 'C';
    return x;
  };
  function pffRoster(){
    const keys=['qb','pressure','receiving','rushing','runBlocking','passBlocking'];
    const by=new Map();
    for(const key of keys){
      for(const r of (datasets?.[key]||[])){
        const name=String(r?.Name||'').trim();
        const posRaw=String(r?.POS||'').toUpperCase().trim();
        if(!name||!offenseSet.has(posRaw))continue;
        const number=jersey(r?.['#']);
        const k=clean(name)+'|'+number;
        const row={name,number,position:normOffPos(posRaw),source:'2026 FAU PFF roster fallback'};
        if(!by.has(k))by.set(k,row);
      }
    }
    return [...by.values()].sort((a,b)=>Number(a.number||999)-Number(b.number||999)||a.name.localeCompare(b.name));
  }
  async function officialRoster(){
    try{
      const r=await fetch('/api/fau-roster?v=20260920w4v2',{cache:'no-store'});
      if(!r.ok)return [];
      const j=await r.json();
      const rows=Array.isArray(j)?j:Array.isArray(j?.players)?j.players:[];
      return rows.filter(p=>p?.name&&offenseSet.has(String(p.position||'').toUpperCase().trim()));
    }catch{return []}
  }
  async function repairRoster(){
    if(!isW4())return;
    const pff=pffRoster();
    const off=await officialRoster();
    const byOfficial=new Map(off.map(p=>[clean(p.name),p]));
    const merged=pff.map(p=>{
      const o=byOfficial.get(clean(p.name));
      return o?{...p,...o,number:p.number||o.number,position:p.position||o.position,source:'2026 FAU PFF + official roster'}:p;
    });
    for(const o of off){
      if(!merged.some(p=>clean(p.name)===clean(o.name)))merged.push({...o,source:'Official FAU 2026 roster'});
    }
    if(merged.length>=10)roster=merged;
    if(typeof render==='function')render();
  }
  if(oldLoad){
    loadOpponentData=async function(...args){
      const out=await oldLoad.apply(this,args);
      if(isW4())await repairRoster();
      return out;
    };
  }
  playersPage=function(){
    if(!isW4())return oldPlayers?oldPlayers():'';
    let all=typeof offenseRoster==='function'?offenseRoster():[];
    if(!all.length){roster=pffRoster();all=typeof offenseRoster==='function'?offenseRoster():roster;}
    let list=typeof filteredPlayers==='function'?filteredPlayers():all;
    let posCounts={};all.forEach(p=>{const k=typeof normPos==='function'?normPos(p.position):p.position;posCounts[k]=(posCounts[k]||0)+1});
    return `<div class="page-title"><h2>Player Intelligence</h2><p>Florida Atlantic · 2026-only roster and PFF personnel intelligence.</p></div>${typeof dataStatus==='function'?dataStatus():''}<div class="toolbar"><input id="playerSearch" placeholder="Search name or number" oninput="render()"><select id="playerSort" onchange="render()"><option value="number">Sort: number</option><option value="name">Sort: name</option><option value="position">Sort: position</option></select><div></div><div></div></div><div class="position-tabs">${typeof positionGroups==='function'?positionGroups().map(([id,l])=>`<button class="${group===id?'active':''}" onclick="setGroup('${id}')">${l}${id!=='ALL'&&posCounts[id]!=null?` (${posCounts[id]})`:''}</button>`).join(''):''}</div><div class="kpis"><div class="kpi"><span>Offensive Players</span><b>${all.length}</b><small>2026 FAU current roster/PFF</small></div><div class="kpi"><span>Current View</span><b>${list.length}</b><small>${group==='ALL'?'All offense':group}</small></div><div class="kpi"><span>PFF Plays</span><b>${(datasets.plays||[]).length}</b><small>2026 eligible plays</small></div><div class="kpi"><span>PFF Files Live</span><b>${Object.values(loadState||{}).filter(x=>x?.ok).length}</b><small>Supabase Storage</small></div></div><div class="player-grid">${list.length?list.map(playerCard).join(''):'<div class="empty">No players match this view.</div>'}</div>`;
  };
  depthChartPage=function(){
    if(!isW4())return oldDepth?oldDepth():'';
    return `<div class="page-title"><h2>Florida Atlantic 2 Deep</h2><p>Week 4 offensive depth chart from the Command Center repo.</p></div>${typeof dataStatus==='function'?dataStatus():''}<div class="card"><div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Florida Atlantic Week 4 Depth Chart</h3><div class="muted">Source: ULM_Week_4_Florida_Atlantic_Depth_Chart.pdf</div></div><a class="primary" href="/api/fau-depth-pdf" target="_blank" rel="noopener">Open Full PDF</a></div><iframe src="/api/fau-depth-pdf#view=FitH" title="Florida Atlantic Week 4 depth chart" style="width:100%;height:900px;margin-top:14px;border:1px solid #24384a;border-radius:10px;background:#fff"></iframe></div>`;
  };
  setTimeout(()=>{if(isW4())repairRoster()},500);
})();
