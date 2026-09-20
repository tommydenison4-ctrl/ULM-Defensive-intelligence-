/* Week 4 · Florida Atlantic · 2026-only opponent layer */
(() => {
  const isW4=()=>typeof prepWeek!=='undefined'&&prepWeek==='W4';
  const clean=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const jersey=v=>String(v??'').replace(/\D/g,'').replace(/^0+/,'');
  const FAU_PFF_BASE=SUPABASE_BASE+'/Defensive%20Intelligence/Opponents/Florida%20Atlantic/';
  const FAU_ROSTER_URL=FAU_PFF_BASE+'roster.json';
  const FAU_DEPTH_URL=FAU_PFF_BASE+'depth-chart.json';
  const FAU_DEPTH_PDF='https://raw.githubusercontent.com/tommydenison4-ctrl/Command-Center-/main/ULM_Week_4_Florida_Atlantic_Depth_Chart.pdf';
  const FAU_FILES={
    plays:'play_feed (25).csv',
    qb:'pff-data (63).csv',
    routes:'pff-data (64).csv',
    dropbacks:'pff-data (65).csv',
    passOverall:'pff-data (66).csv',
    pressure:'pff-data (67).csv',
    receiving:'pff-data (68).csv',
    rushing:'pff-data (69).csv',
    runConcepts:'pff-data (70).csv',
    runDirections:'pff-data (71).csv',
    runBlocking:'pff-data (72).csv',
    passBlocking:'pff-data (73).csv',
    formations:'pff-data (74).csv',
    personnel:'pff-data (75).csv'
  };
  let fauDepth=null;

  DEF_PREP_WEEKS.W4={id:'W4',week:'WEEK 4',opponent:'Florida Atlantic'};

  const prev={
    loadOpponentData:typeof loadOpponentData==='function'?loadOpponentData:null,
    applyAnalysisMode:typeof applyAnalysisMode==='function'?applyAnalysisMode:null,
    analysisModeHTML:typeof analysisModeHTML==='function'?analysisModeHTML:null,
    weekSwitchHTML:typeof weekSwitchHTML==='function'?weekSwitchHTML:null,
    setPrepWeek:window.setPrepWeek,
    updatePrepChrome:typeof updatePrepChrome==='function'?updatePrepChrome:null,
    activePrep:typeof activePrep==='function'?activePrep:null,
    activeOpponentName:typeof activeOpponentName==='function'?activeOpponentName:null,
    activeWeekLabel:typeof activeWeekLabel==='function'?activeWeekLabel:null,
    notesTeam:typeof notesTeam==='function'?notesTeam:null,
    depthChartPage:typeof depthChartPage==='function'?depthChartPage:null,
    playersPage:typeof playersPage==='function'?playersPage:null,
    photo:typeof photo==='function'?photo:null,
    playerTokenMatch:typeof playerTokenMatch==='function'?playerTokenMatch:null,
    playerTokenMatchRow:typeof playerTokenMatchRow==='function'?playerTokenMatchRow:null,
    playsForPlayer:typeof playsForPlayer==='function'?playsForPlayer:null,
    findPlayerRow:typeof findPlayerRow==='function'?findPlayerRow:null,
    findPlayerRows:typeof findPlayerRows==='function'?findPlayerRows:null,
    playerSeasonSampleNote:typeof playerSeasonSampleNote==='function'?playerSeasonSampleNote:null,
    playerDisplayTitle:typeof playerDisplayTitle==='function'?playerDisplayTitle:null,
    seasonLabel:typeof seasonLabel==='function'?seasonLabel:null,
    renderFAUDrawer:typeof renderFAUDrawer==='function'?renderFAUDrawer:null,
    coachJonesNotesPage:typeof coachJonesNotesPage==='function'?coachJonesNotesPage:null
  };

  function noPlay(r){const v=String(r?.pff_NOPLAY??'').trim().toUpperCase();return ['1','TRUE','T','YES'].includes(v)}
  function year(r){return String(r?.pff_GAMESEASON||r?.pff_GAMEDATE||'').slice(0,4)}
  function eligible(rows){return (rows||[]).filter(r=>!noPlay(r)&&year(r)==='2026')}
  function tokenJersey(t){const m=String(t||'').toUpperCase().match(/\bFLAT\s+0*([0-9]{1,2})\b/);return m?String(parseInt(m[1],10)):''}
  function compatible(p,role=''){
    const pos=normPos(p?.position);
    if(role==='QB')return pos==='QB';
    if(role==='TARGET')return ['WR','TE','RB'].includes(pos);
    if(role==='CARRIER')return ['RB','QB','WR'].includes(pos);
    return true;
  }
  function tokenMatch(token,p,role=''){
    if(!token||!p||!compatible(p,role))return false;
    if(clean(token)===clean(p.name))return true;
    const tj=tokenJersey(token),pj=jersey(p.number);
    return !!tj&&!!pj&&tj===pj;
  }

  activePrep=function(){return DEF_PREP_WEEKS[prepWeek]||DEF_PREP_WEEKS.W4};
  activeOpponentName=function(){return isW4()?'Florida Atlantic':prev.activeOpponentName?prev.activeOpponentName():'Mississippi State'};
  activeWeekLabel=function(){return isW4()?'Week 4':prev.activeWeekLabel?prev.activeWeekLabel():'Week 1'};
  notesTeam=function(){return isW4()?'Florida Atlantic':prev.notesTeam?prev.notesTeam():'Mississippi State'};

  applyAnalysisMode=function(){
    if(!isW4())return prev.applyAnalysisMode?prev.applyAnalysisMode():undefined;
    analysisMode='current';
    datasets.plays=eligible(rawPlayRows);
  };
  analysisModeHTML=function(){
    if(!isW4())return prev.analysisModeHTML?prev.analysisModeHTML():'';
    const n=eligible(rawPlayRows).length;
    return `<div class="analysis-mode-bar no-print"><div class="analysis-mode-left"><span class="lbl">DATA VIEW</span><button class="active">2026 ONLY</button><span class="uab-live-badge">FLORIDA ATLANTIC LIVE FROM SUPABASE</span></div><div class="analysis-mode-note">${n} eligible 2026 plays · no-plays excluded · no historical weighting.</div></div>`;
  };

  weekSwitchHTML=function(){return `<div class="week-switch no-print">
    <button class="${prepWeek==='W1'?'active':''}" onclick="setPrepWeek('W1')"><b>Week 1 · Mississippi State</b><span>Archive</span></button>
    <button class="${prepWeek==='W2'?'active':''}" onclick="setPrepWeek('W2')"><b>Week 2 · UAB</b><span>Archive</span></button>
    <button class="${prepWeek==='W3'?'active':''}" onclick="setPrepWeek('W3')"><b>Week 3 · Southeastern Louisiana</b><span>Archive</span></button>
    <button class="${prepWeek==='W4'?'active':''}" onclick="setPrepWeek('W4')"><b>Week 4 · Florida Atlantic</b><span>Current opponent prep</span></button>
  </div>`};

  window.setPrepWeek=async w=>{
    if(w!=='W4')return prev.setPrepWeek?prev.setPrepWeek(w):undefined;
    prepWeek='W4';analysisMode='current';
    localStorage.setItem('ulmDefPrepWeekV1','W4');
    page='dashboard';
    if(typeof syncNav==='function')syncNav();
    updatePrepChrome();
    await loadOpponentData();
  };

  updatePrepChrome=function(){
    if(!isW4())return prev.updatePrepChrome?prev.updatePrepChrome():undefined;
    const side=document.querySelector('.side-sub');if(side)side.textContent='Florida Atlantic Week';
    const depthNav=document.querySelector('.nav[data-page="depth"]');if(depthNav)depthNav.innerHTML='≡ Florida Atlantic 2 Deep';
    const opp=document.querySelector('.opp-name');if(opp)opp.textContent='Florida Atlantic';
    const meta=document.querySelector('.opp-meta');if(meta)meta.textContent='Week 4 · defensive staff · opponent offense scouting · 2026 only';
    document.querySelectorAll('.nav[data-page="depth"]').forEach(b=>b.style.display='');
    document.querySelectorAll('.nav[data-page="jones"]').forEach(b=>b.style.display='');
    document.title='ULM Defensive Intelligence | Florida Atlantic';
  };

  async function loadRoster(){
    try{
      let r=await fetch(FAU_ROSTER_URL+'?v='+Date.now(),{cache:'no-store'});
      if(r.ok){let d=await r.json(),rows=Array.isArray(d)?d:Array.isArray(d?.players)?d.players:[];if(rows.length)return rows}
    }catch(e){console.warn('FAU Supabase roster',e)}
    try{
      let r=await fetch('/api/fau-roster?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error(r.status);
      let d=await r.json(),rows=Array.isArray(d)?d:Array.isArray(d?.players)?d.players:[];if(rows.length)return rows;
    }catch(e){console.warn('FAU official roster fallback',e)}
    return typeof buildPFFRoster==='function'?buildPFFRoster():[];
  }
  async function loadDepth(){
    try{let r=await fetch(FAU_DEPTH_URL+'?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error(r.status);fauDepth=await r.json();return fauDepth}catch(e){fauDepth=null;return null}
  }

  loadOpponentData=async function(){
    if(!isW4())return prev.loadOpponentData?prev.loadOpponentData():undefined;
    const h=document.getElementById('headerStatus');if(h)h.textContent='Loading Florida Atlantic 2026 PFF…';
    datasets={};loadState={};roster=[];ulmPlayMap=new WeakMap();ulmHybridReady=false;ulmHybridMatchRate=0;
    FILES=FAU_FILES;PFF_BASE=FAU_PFF_BASE;
    await Promise.all(Object.keys(FILES).map(fetchCSV));
    rawPlayRows=(datasets.plays||[]).slice();
    datasets.plays=eligible(rawPlayRows);
    loadState.ulmHybrid={ok:false,n:0,error:'Week 4 uses 2026 PFF source with existing defensive-language renderers'};
    const live=await Promise.all([loadRoster(),loadDepth()]);roster=live[0]||[];
    analysisMode='current';
    const ok=Object.keys(FAU_FILES).filter(k=>loadState[k]?.ok).length,n=datasets.plays.length;
    if(h)h.textContent=`Florida Atlantic live • ${n} eligible 2026 plays • no-plays excluded • ${roster.length} roster players • ${ok}/${Object.keys(FAU_FILES).length} PFF files`;
    if(typeof render==='function')render();
  };
  loadRoster=function(){return loadOpponentData()};

  playerTokenMatch=function(token,p,role=''){
    if(!isW4())return prev.playerTokenMatch?prev.playerTokenMatch(token,p,role):false;
    return tokenMatch(token,p,role);
  };
  playerTokenMatchRow=function(r,token,p,role=''){
    if(!isW4())return prev.playerTokenMatchRow?prev.playerTokenMatchRow(r,token,p,role):false;
    return tokenMatch(token,p,role);
  };
  playsForPlayer=function(value){
    if(!isW4())return prev.playsForPlayer?prev.playsForPlayer(value):[];
    const p=typeof value==='object'&&value?value:(roster||[]).find(x=>clean(x.name)===clean(value));if(!p)return[];
    return (datasets.plays||[]).filter(r=>tokenMatch(r.pff_PASSER,p,'QB')||tokenMatch(r.pff_BALLCARRIER,p,'CARRIER')||tokenMatch(r.pff_PASSRECEIVERTARGET,p,'TARGET')||tokenMatch(r.pff_OFFPLAYERS,p,''));
  };
  findPlayerRow=function(key,value){
    if(!isW4())return prev.findPlayerRow?prev.findPlayerRow(key,value):null;
    const p=typeof value==='object'&&value?value:(roster||[]).find(x=>clean(x.name)===clean(value));
    const rows=datasets?.[key]||[];if(!p)return rows.find(r=>clean(r?.Name)===clean(value))||null;
    return rows.find(r=>clean(r?.Name)===clean(p.name))||rows.find(r=>jersey(r?.['#'])===jersey(p.number)&&(!r?.POS||normPos(r.POS)===normPos(p.position)))||null;
  };
  findPlayerRows=function(key,value){if(!isW4())return prev.findPlayerRows?prev.findPlayerRows(key,value):[];const r=findPlayerRow(key,value);return r?[r]:[]};

  photo=function(p){
    if(!isW4())return prev.photo?prev.photo(p):'';
    const name=String(p?.name||'').trim();if(!name)return '<div class="initials">?</div>';
    const src=`/api/fau-player-image?name=${encodeURIComponent(name)}&v=20260920w4`;
    return `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" data-fau-w4="1" style="object-fit:cover;object-position:50% 14%;image-rendering:auto" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="initials" style="display:none">${initials(name)}</div>`;
  };

  playerSeasonSampleNote=function(p){if(!isW4())return prev.playerSeasonSampleNote?prev.playerSeasonSampleNote(p):'';return `${playsForPlayer(p).length} matched 2026 Florida Atlantic play-feed events`};
  playerDisplayTitle=function(p){if(!isW4())return prev.playerDisplayTitle?prev.playerDisplayTitle(p):'';return '2026 Florida Atlantic'};
  seasonLabel=function(){if(!isW4())return prev.seasonLabel?prev.seasonLabel():'';return '2026 Florida Atlantic'};

  renderFAUDrawer=function(p){
    if(!isW4())return prev.renderFAUDrawer?prev.renderFAUDrawer(p):undefined;
    if(prev.renderFAUDrawer)prev.renderFAUDrawer(p);
    const body=document.getElementById('fauDrawerBody');if(!body)return;
    body.innerHTML=String(body.innerHTML)
      .replace(/MISSISSIPPI STATE PLAYER INTELLIGENCE/gi,'FLORIDA ATLANTIC · WEEK 4 PLAYER INTELLIGENCE')
      .replace(/UAB WEEK 2 PLAYER INTELLIGENCE/gi,'FLORIDA ATLANTIC · WEEK 4 PLAYER INTELLIGENCE')
      .replace(/SOUTHEASTERN LOUISIANA[^<]*/gi,'FLORIDA ATLANTIC · WEEK 4 PLAYER INTELLIGENCE')
      .replace(/2025\s*\+\s*2026/gi,'2026')
      .replace(/WEIGHTED 50\/50/gi,'2026 ONLY')
      .replace(/2025 SEASON STATS/gi,'2026 FLORIDA ATLANTIC STATS')
      .replace(/2026 CURRENT/gi,'2026 FLORIDA ATLANTIC');
  };

  function depthRows(){
    const d=fauDepth,src=Array.isArray(d)?d:Array.isArray(d?.offense)?d.offense:Array.isArray(d?.depthChart)?d.depthChart:[];
    return src.map(r=>{if(Array.isArray(r))return {pos:r[0],players:r.slice(1).filter(Boolean)};const ps=r.players||r.depth||r.entries||[r.first||r.starter,r.second||r.backup,r.third].filter(Boolean);return {pos:r.position||r.pos||'',players:Array.isArray(ps)?ps:[ps].filter(Boolean)}}).filter(r=>r.pos);
  }
  function depthCell(x){if(!x)return '—';let number='',name='',cls='';if(Array.isArray(x)){number=x[0]??'';name=x[1]??'';cls=x[2]??''}else if(typeof x==='object'){number=x.number??x.jersey??x['#']??'';name=x.name??x.player??'';cls=x.class??x.year??''}else name=String(x);if(!name)return '—';return `<button class="depth-player" onclick='openFAUProfile(${JSON.stringify(name)})'><span class="depth-no">#${esc(number||'—')}</span><span class="depth-name">${esc(name)}</span>${cls?`<span class="depth-class">${esc(cls)}</span>`:''}</button>`}
  depthChartPage=function(){
    if(!isW4())return prev.depthChartPage?prev.depthChartPage():'';
    const rows=depthRows();
    const table=rows.length?`<table class="depth-table"><thead><tr><th>Position</th><th>1st</th><th>2nd</th><th>Additional</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="pos">${esc(r.pos)}</td><td>${depthCell(r.players[0])}</td><td>${depthCell(r.players[1])}</td><td>${r.players.slice(2).map(depthCell).join(' ')||'—'}</td></tr>`).join('')}</tbody></table>`:`<div class="card"><h3>Florida Atlantic Week 4 Depth Chart</h3><p>The staff PDF is already maintained in Command Center.</p><p><a class="primary" href="${FAU_DEPTH_PDF}" target="_blank" rel="noopener">Open Week 4 Florida Atlantic Depth Chart PDF</a></p><iframe src="${FAU_DEPTH_PDF}" title="Florida Atlantic depth chart" style="width:100%;height:760px;border:1px solid #24384a;border-radius:10px;background:#fff"></iframe></div>`;
    return `<div class="page-title"><h2>Florida Atlantic 2 Deep</h2><p>Week 4 offensive depth chart. Click a player to open Player Intelligence when structured depth data is available.</p></div>${typeof dataStatus==='function'?dataStatus():''}<div class="depth-shell"><div class="depth-card"><div class="depth-head"><div><div class="sub">Week 4 Opponent</div><h3>Florida Atlantic Offense</h3></div><div style="text-align:right"><div class="sub">2026</div><div style="font-size:11px;font-weight:850">Opponent prep</div></div></div>${table}<div class="depth-note">Source: Command Center · ULM_Week_4_Florida_Atlantic_Depth_Chart.pdf${rows.length?' + Supabase depth-chart.json':''}</div></div></div>`;
  };

  playersPage=function(){
    if(!isW4())return prev.playersPage?prev.playersPage():'';
    const all=offenseRoster(),list=filteredPlayers(),posCounts={};all.forEach(p=>posCounts[normPos(p.position)]=(posCounts[normPos(p.position)]||0)+1);
    return `<div class="page-title"><h2>Player Intelligence</h2><p>Florida Atlantic 2026 roster, official bio portraits and PFF personnel intelligence.</p></div>${dataStatus()}<div class="toolbar"><input id="playerSearch" placeholder="Search name, number, hometown or previous school" oninput="render()"><select id="playerSort" onchange="render()"><option value="number">Sort: number</option><option value="name">Sort: name</option><option value="position">Sort: position</option></select><div></div><div></div></div><div class="position-tabs">${positionGroups().map(([id,l])=>`<button class="${group===id?'active':''}" onclick="setGroup('${id}')">${l}${id!=='ALL'&&posCounts[id]!=null?` (${posCounts[id]})`:''}</button>`).join('')}</div><div class="kpis"><div class="kpi"><span>Offensive Players</span><b>${all.length}</b><small>2026 FAU roster</small></div><div class="kpi"><span>Current View</span><b>${list.length}</b><small>${group==='ALL'?'All offense':group}</small></div><div class="kpi"><span>PFF Plays</span><b>${(datasets.plays||[]).length}</b><small>2026 only · no-plays excluded</small></div><div class="kpi"><span>PFF Files Live</span><b>${Object.keys(FAU_FILES).filter(k=>loadState[k]?.ok).length}</b><small>Supabase Storage</small></div></div><div class="player-grid">${list.length?list.map(playerCard).join(''):'<div class="empty">No players match this view.</div>'}</div><div class="card source-card"><b>Roster:</b> <code>Florida Atlantic 2026</code><br><b>PFF:</b> <code>Defensive Intelligence / Opponents / Florida Atlantic</code><br><b>Analysis:</b> <code>2026 only</code></div>`;
  };

  coachJonesNotesPage=function(){if(!isW4())return prev.coachJonesNotesPage?prev.coachJonesNotesPage():'';return `<div class="page-title"><h2>Coach Jones Tips &amp; Reminders</h2><p>Florida Atlantic · Week 4</p></div><div class="card"><h3>Week 4 board</h3><div class="empty">No Florida Atlantic Coach Jones board notes have been added yet.</div></div>`};

  if(!document.getElementById('fauW4Styles')){const s=document.createElement('style');s.id='fauW4Styles';s.textContent=`body .player-photo img[data-fau-w4="1"]{width:100%!important;height:100%!important;object-fit:cover!important;object-position:50% 14%!important;filter:none!important;transform:none!important}`;document.head.appendChild(s)}

  setTimeout(()=>{
    const saved=localStorage.getItem('ulmDefPrepWeekV1');
    if(saved==='W3'||!['W1','W2','W3','W4'].includes(saved||''))window.setPrepWeek('W4');
    else if(saved==='W4'){prepWeek='W4';analysisMode='current';updatePrepChrome();loadOpponentData();}
  },350);
})();
