/* Week 3 Southeastern v2: correct current roster, player images, and W3 player-intelligence labels */
(() => {
  const isW3=()=>typeof prepWeek!=='undefined'&&prepWeek==='W3';
  const clean=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const offensePos=p=>['QB','RB','HB','TB','FB','WR','TE','OL','OT','OG','C','LT','LG','RG','RT','T','G','OC'].includes(String(p||'').toUpperCase().trim());
  let officialRoster=[];

  function mergeOfficialRow(p){
    const hit=officialRoster.find(x=>clean(x.name)===clean(p.name));
    return hit?{...p,...hit,aliases:[...(p.aliases||[]),p.name].filter(Boolean)}:p;
  }
  async function fetchOfficialRoster(){
    try{
      const r=await fetch('/api/sle-roster?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error(r.status);
      const d=await r.json();let rows=Array.isArray(d)?d:Array.isArray(d?.players)?d.players:[];
      rows=rows.filter(x=>x?.name&&offensePos(x.position));
      if(rows.length<10)throw Error('official roster parser returned only '+rows.length+' offensive players');
      officialRoster=rows;
      if(isW3()){
        roster=rows.map(x=>({...x}));
        if(typeof render==='function')render();
        const h=document.getElementById('headerStatus');if(h)h.textContent=h.textContent.replace(/\d+ roster players/,(roster.length)+' current offensive roster players');
      }
    }catch(e){console.warn('SLE official roster enrichment',e)}
  }

  const oldLoad=typeof loadOpponentData==='function'?loadOpponentData:null;
  if(oldLoad)loadOpponentData=async function(){let out=await oldLoad.apply(this,arguments);if(isW3())await fetchOfficialRoster();return out};

  const oldPhoto=typeof photo==='function'?photo:null;
  if(oldPhoto)photo=function(p){
    if(!isW3())return oldPhoto(p);
    const q=mergeOfficialRow(p||{});
    let primary=String(q.image||q.photo||q.headshot||'').trim();
    let profile=String(q.profile||'').trim();
    let backup=profile?`/api/player-image?url=${encodeURIComponent(profile)}`:'';
    if(!primary&&backup)primary=backup;
    if(!primary)return `<div class="initials">${initials(q.name)}</div>`;
    return `<img src="${esc(primary)}" alt="${esc(q.name)}" loading="lazy" referrerpolicy="no-referrer" data-backup="${esc(backup)}" onerror="if(this.dataset.backup&&!this.dataset.tried){this.dataset.tried='1';this.src=this.dataset.backup}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div class="initials" style="display:none">${initials(q.name)}</div>`;
  };

  const oldSeasonNote=typeof playerSeasonSampleNote==='function'?playerSeasonSampleNote:null;
  if(oldSeasonNote)playerSeasonSampleNote=function(p){
    if(!isW3())return oldSeasonNote(p);
    let rows=[];try{rows=playsForPlayer(p.name)||[]}catch(e){}
    let yr=analysisMode==='historical'?'2025':analysisMode==='current'?'2026':'2025 + 2026';
    return `${rows.length} matched ${yr} Southeastern Louisiana raw play-feed events`;
  };
  const oldDisplayTitle=typeof playerDisplayTitle==='function'?playerDisplayTitle:null;
  if(oldDisplayTitle)playerDisplayTitle=function(p){if(!isW3())return oldDisplayTitle(p);return analysisMode==='historical'?'2025 Southeastern Louisiana':analysisMode==='current'?'2026 Southeastern Louisiana':'Southeastern Louisiana Weighted 50/50'};
  const oldSeasonLabel=typeof seasonLabel==='function'?seasonLabel:null;
  if(oldSeasonLabel)seasonLabel=function(){if(!isW3())return oldSeasonLabel();return analysisMode==='historical'?'2025 Southeastern Louisiana':analysisMode==='current'?'2026 Southeastern Louisiana':'Southeastern Louisiana Weighted 50/50'};

  const oldDrawer=typeof renderFAUDrawer==='function'?renderFAUDrawer:null;
  if(oldDrawer)renderFAUDrawer=function(p){
    oldDrawer(p);
    if(!isW3())return;
    const body=document.getElementById('fauDrawerBody');if(!body)return;
    let h=body.innerHTML;
    h=h.replace(/MISSISSIPPI STATE PLAYER INTELLIGENCE/gi,'SOUTHEASTERN LOUISIANA · WEEK 3 PLAYER INTELLIGENCE')
       .replace(/UAB WEEK 2 PLAYER INTELLIGENCE/gi,'SOUTHEASTERN LOUISIANA · WEEK 3 PLAYER INTELLIGENCE')
       .replace(/2026 UAB/gi,'2026 SOUTHEASTERN LOUISIANA')
       .replace(/2025 UAB/gi,'2025 SOUTHEASTERN LOUISIANA')
       .replace(/UAB raw play-feed events/gi,'Southeastern Louisiana raw play-feed events')
       .replace(/2025 SEASON STATS/gi,analysisMode==='historical'?'2025 SOUTHEASTERN LOUISIANA STATS':analysisMode==='current'?'2026 SOUTHEASTERN LOUISIANA STATS':'SOUTHEASTERN LOUISIANA · WEIGHTED 50/50');
    body.innerHTML=h;
  };

  const oldOverview=typeof overview==='function'?overview:null;
  if(oldOverview)overview=function(p){if(!isW3())return oldOverview(p);let h=oldOverview(p);return h.replace(/2026 Current/g,'2026 Southeastern Louisiana Current').replace(/2025 PFF/g,'Southeastern Louisiana PFF')};

  window.addEventListener('DOMContentLoaded',()=>setTimeout(fetchOfficialRoster,350));
  if(document.readyState!=='loading')setTimeout(fetchOfficialRoster,350);
})();
