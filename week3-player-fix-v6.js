/* Week 3 v6: official bio portraits + row-aware game log */
(() => {
  const isW3=()=>typeof prepWeek!=='undefined'&&prepWeek==='W3';
  const clean=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const jersey=v=>String(v??'').replace(/^0+/,'').replace(/\D/g,'');
  const tokenJersey=t=>{const m=String(t||'').toUpperCase().match(/\bLASE\s+0*(\d{1,2})\b/);return m?String(parseInt(m[1],10)):''};
  const num0=v=>{const n=parseFloat(String(v??'').replace(/[%,$]/g,''));return Number.isFinite(n)?n:0};
  function rowYear(r){return String(r?.pff_GAMESEASON||r?.pff_GAMEDATE||'').slice(0,4)}
  function playerObj(v){return typeof v==='object'&&v?v:(roster||[]).find(x=>clean(x.name)===clean(v))}
  function summaryJersey(p){
    for(const k of ['qb','receiving','rushing','passBlocking','runBlocking']){
      const hit=(datasets?.[k]||[]).find(r=>clean(r?.Name)===clean(p?.name));
      if(hit&&jersey(hit['#']))return jersey(hit['#']);
    }
    return '';
  }
  function rowMatch(r,token,p,role=''){
    if(!token||!p)return false;
    const pos=normPos(p.position);
    if(role==='QB'&&pos!=='QB')return false;
    if(role==='TARGET'&&!['WR','TE','RB'].includes(pos))return false;
    if(role==='CARRIER'&&!['RB','QB','WR'].includes(pos))return false;
    if(clean(token)===clean(p.name))return true;
    const tj=tokenJersey(token);if(!tj)return false;
    const pj=rowYear(r)==='2026'?jersey(p.number):(summaryJersey(p)||jersey(p.number));
    return !!pj&&tj===pj;
  }

  const oldRelevant=typeof relevantGameRows==='function'?relevantGameRows:null;
  relevantGameRows=function(value){
    if(!isW3())return oldRelevant?oldRelevant(value):[];
    const p=playerObj(value);if(!p)return[];
    const pos=normPos(p.position),games={};
    (datasets.plays||[]).forEach(r=>{
      let linked=false;
      if(pos==='QB')linked=rowMatch(r,r.pff_PASSER,p,'QB')||rowMatch(r,r.pff_BALLCARRIER,p,'CARRIER');
      else if(['WR','TE'].includes(pos))linked=rowMatch(r,r.pff_PASSRECEIVERTARGET,p,'TARGET');
      else if(pos==='RB')linked=rowMatch(r,r.pff_BALLCARRIER,p,'CARRIER')||rowMatch(r,r.pff_PASSRECEIVERTARGET,p,'TARGET');
      else if(pos==='OL')linked=rowMatch(r,r.pff_OFFPLAYERS,p,'');
      if(!linked)return;
      const id=r.pff_GAMEID||r.pff_GAMEDATE||'Unknown';
      const g=games[id]||(games[id]={id,date:r.pff_GAMEDATE||'',opp:r.pff_DEFTEAM||'',plays:0,att:0,comp:0,passY:0,passTD:0,int:0,rush:0,rushY:0,tgt:0,rec:0,recY:0,td:0,expl:0});
      g.plays++;
      const gain=num0(r.pff_GAINLOSSNET??r.pff_GAINLOSS),res=String(r.pff_PASSRESULT||'').toUpperCase();
      if(gain>=15)g.expl++;
      if(pos==='QB'&&rowMatch(r,r.pff_PASSER,p,'QB')){
        if(['COMPLETE','INCOMPLETE','INTERCEPTION','THROWN AWAY','HIT AS THREW','BATTED PASS'].includes(res))g.att++;
        if(res==='COMPLETE')g.comp++;
        g.passY+=gain;
        if(res==='INTERCEPTION')g.int++;
        if(res==='COMPLETE'&&String(r.pff_TOUCHDOWN||'').trim())g.passTD++;
      }
      if((pos==='RB'||pos==='QB')&&String(r.pff_RUNPASS||'').toUpperCase()==='R'&&rowMatch(r,r.pff_BALLCARRIER,p,'CARRIER')){
        g.rush++;g.rushY+=gain;if(String(r.pff_TOUCHDOWN||'').trim())g.td++;
      }
      if(['WR','TE','RB'].includes(pos)&&rowMatch(r,r.pff_PASSRECEIVERTARGET,p,'TARGET')){
        g.tgt++;if(res==='COMPLETE'){g.rec++;g.recY+=gain}if(res==='COMPLETE'&&String(r.pff_TOUCHDOWN||'').trim())g.td++;
      }
    });
    return Object.values(games);
  };

  // Pull official roster-card headshots once, merge them into the current roster, then render.
  async function hydrateOfficialBioPhotos(){
    if(!isW3())return;
    try{
      const r=await fetch('/api/sle-roster?v=20260912c',{cache:'no-store'});if(!r.ok)return;
      const j=await r.json(),live=Array.isArray(j?.players)?j.players:[];if(!live.length)return;
      const byName=new Map(live.map(x=>[clean(x.name),x]));
      (roster||[]).forEach(p=>{
        const x=byName.get(clean(p.name));if(!x)return;
        if(x.image)p.image=x.image;
        if(x.profile)p.profile=x.profile;
      });
      if(typeof render==='function')render();
      if(typeof selected!=='undefined'&&selected&&typeof renderFAUDrawer==='function'){
        const p=(roster||[]).find(x=>x.name===selected);if(p)renderFAUDrawer(p);
      }
    }catch{}
  }

  const oldPhoto=typeof photo==='function'?photo:null;
  photo=function(p){
    if(!isW3())return oldPhoto?oldPhoto(p):'';
    const name=String(p?.name||'').trim();
    const src=p?.image||`/api/sle-player-image?name=${encodeURIComponent(name)}&v=20260912c`;
    if(!name)return `<div class="initials">?</div>`;
    return `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" style="object-fit:cover;object-position:50% 18%" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='/api/sle-player-image?name=${encodeURIComponent(name)}&v=20260912c';}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div class="initials" style="display:none">${initials(name)}</div>`;
  };

  // Force Week 3 game log/top-games labels to use the active Southeastern sample.
  const oldWeekly=typeof weeklyProductionChart==='function'?weeklyProductionChart:null;
  weeklyProductionChart=function(p){
    if(!isW3())return oldWeekly?oldWeekly(p):'';
    const games=relevantGameRows(p).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    if(!games.length)return `<div class="weekly-chart-card"><div class="no-sample-banner">No Southeastern Louisiana game-by-game sample matched this player.</div></div>`;
    const vals=games.map(g=>{const pos=normPos(p.position);return pos==='QB'?g.passY+g.rushY:pos==='RB'?g.rushY+g.recY:['WR','TE'].includes(pos)?g.recY:g.plays});
    const max=Math.max(1,...vals),W=900,H=230,left=45,right=18,top=22,bottom=55,iw=W-left-right,ih=H-top-bottom;
    const pts=vals.map((v,i)=>({x:left+(games.length===1?iw/2:i*iw/(games.length-1)),y:top+ih-(v/max)*ih,v,g:games[i]}));
    const path=pts.map((pt,i)=>(i?'L':'M')+pt.x.toFixed(1)+' '+pt.y.toFixed(1)).join(' ');
    const grid=[0,.25,.5,.75,1].map(f=>{const y=top+ih-f*ih;return `<line class="weekly-grid-line" x1="${left}" y1="${y}" x2="${W-right}" y2="${y}"/><text class="weekly-axis-text" x="${left-7}" y="${y+3}" text-anchor="end">${Math.round(max*f)}</text>`}).join('');
    const dots=pts.map(pt=>`<circle class="weekly-dot" cx="${pt.x}" cy="${pt.y}" r="5"/><text class="weekly-label" x="${pt.x}" y="${Math.max(12,pt.y-9)}" text-anchor="middle">${pt.v}</text><text class="weekly-opponent" x="${pt.x}" y="${H-28}" text-anchor="middle">vs ${esc(pt.g.opp||'—')}</text><text class="weekly-opponent" x="${pt.x}" y="${H-14}" text-anchor="middle">${esc(String(pt.g.date||'').slice(5))}</text>`).join('');
    return `<div class="weekly-chart-card"><div class="weekly-chart-head"><div><h3>Week-to-Week Production</h3><div class="subtle">Southeastern Louisiana · active PFF sample</div></div></div><svg class="weekly-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${grid}<path class="weekly-line" d="${path}"/>${dots}</svg></div>`;
  };

  setTimeout(hydrateOfficialBioPhotos,250);
})();
