/* Week 4 FAU v5: exact 2026 Supabase loads + ULM defensive scout formation language + official bio portraits. */
(() => {
  const isW4=()=>typeof prepWeek!=='undefined'&&prepWeek==='W4';
  const oldLoad=typeof loadOpponentData==='function'?loadOpponentData:null;
  const oldRender=typeof render==='function'?render:null;
  const oldPhoto=typeof photo==='function'?photo:null;
  const BASE=SUPABASE_BASE+'/Defensive%20Intelligence/Opponents/Florida%20Atlantic/';
  const FILES_EXACT={plays:'play_feed (25).csv',qb:'pff-data (63).csv',routes:'pff-data (64).csv',dropbacks:'pff-data (65).csv',passOverall:'pff-data (66).csv',pressure:'pff-data (67).csv',receiving:'pff-data (68).csv',rushing:'pff-data (69).csv',runConcepts:'pff-data (70).csv',runDirections:'pff-data (71).csv',runBlocking:'pff-data (72).csv',passBlocking:'pff-data (73).csv',formations:'pff-data (74).csv',personnel:'pff-data (75).csv'};
  const MAP={
    'TREY - OPEN':'TREY Y OFF','SLOT - PRO':'DUO Y OFF','TRIPS - CLOSED':'TRIPS','TREY - CLOSED':'KING U OFF','TRIPS - OPEN':'TRIPS - OPEN','PRO - PRO':'ACE YU OFF','SLOT - SLOT':'DOUBLES','TRIPS - SLOT':'TRIPS - SLOT','SLOT - WING':'SLOT - WING','TOAD WING - OPEN':'TREY U HIP','PRO - OPEN':'PRO - OPEN','SLOT - CLOSED':'PRO','SLOT - OPEN':'SLOT - OPEN','QUAY - NIX':'TREY Y OFF','QUAY - OPEN':'TREY Y OFF','PRO - WING':'PRO - WING','QUADS WING - NIX':'QUADS WING - NIX','TREY - SLOT':'EMPTY 3x2 Y OFF','TREY - PRO':'ACE YU OFF','PRO - CLOSED':'KING U OFF B HIP','QUADS - OPEN':'EMPTY 4x1 Y OFF','TOAD WING - SLOT':'EMPTY 4x1 T STING','TOAD WING - PRO':'TOAD WING - PRO','TOAD WING - CLOSED':'TOAD WING - CLOSED','TRIPS - WING':'TRIPS - WING','TRIPS - PRO':'TRIPS - PRO','CLOSED - CLOSED':'CLOSED - CLOSED','OPEN - OPEN':'OPEN - OPEN','OPEN - CLOSED':'OPEN - CLOSED','WING - CLOSED':'WING - CLOSED','WING - OPEN':'WING - OPEN','WING - NIX':'WING - NIX','TANK WING - OPEN':'TANK WING - OPEN','OTHER':'OTHER'
  };
  const scout=s=>MAP[String(s||'').trim().toUpperCase()]||String(s||'').trim();
  const noPlay=r=>['1','TRUE','T','YES'].includes(String(r?.pff_NOPLAY??'').trim().toUpperCase());
  function parseCSV(t){
    if(window.Papa?.parse)return Papa.parse(t,{header:true,skipEmptyLines:true,dynamicTyping:false}).data;
    if(typeof csvToObjects==='function')return csvToObjects(t);
    throw new Error('CSV parser unavailable');
  }
  function exactURL(name){return BASE+encodeURIComponent(name).replace(/%2F/gi,'/');}
  async function loadExact(key,name){
    const r=await fetch(exactURL(name)+'?v='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error(`${name}: ${r.status}`);
    const rows=parseCSV(await r.text());
    datasets[key]=rows;
    loadState[key]={ok:true,n:rows.length,file:name};
    return rows;
  }
  function translateRows(rows){return (rows||[]).map(r=>{
    const a=String(r.pff_OFFENSIVE_FORMATION_NAME||'').trim();
    const b=String(r.pff_STARTING_OFFENSIVE_FORMATION_NAME||'').trim();
    if(a){r.pff_PFF_OFFENSIVE_FORMATION_NAME=a;r.pff_OFFENSIVE_FORMATION_NAME=scout(a)}
    if(b){r.pff_PFF_STARTING_OFFENSIVE_FORMATION_NAME=b;r.pff_STARTING_OFFENSIVE_FORMATION_NAME=scout(b)}
    return r;
  })}
  async function forceFAUData(){
    if(!isW4())return;
    datasets=datasets||{};loadState=loadState||{};
    const results=await Promise.allSettled(Object.entries(FILES_EXACT).map(async([k,f])=>[k,await loadExact(k,f)]));
    const failed=[];results.forEach((x,i)=>{if(x.status==='rejected')failed.push(Object.entries(FILES_EXACT)[i][0])});
    rawPlayRows=translateRows((datasets.plays||[]).slice());
    datasets.plays=rawPlayRows.filter(r=>!noPlay(r));
    analysisMode='current';
    FILES={...FILES_EXACT};PFF_BASE=BASE;
    const ok=Object.keys(FILES_EXACT).filter(k=>loadState?.[k]?.ok).length;
    const h=document.getElementById('headerStatus');
    if(h)h.textContent=`Florida Atlantic live • ${datasets.plays.length} eligible 2026 plays • no-plays excluded • ${(roster||[]).length} roster players • ${ok}/14 PFF files${failed.length?' • missing: '+failed.join(', '):''}`;
  }
  if(oldLoad)loadOpponentData=async function(...args){const out=await oldLoad.apply(this,args);if(isW4()){await forceFAUData();if(typeof repairRoster==='function')await repairRoster();if(typeof render==='function')render()}return out};

  // Official bio portrait. Pass profile + jersey so the resolver can survive punctuation/suffix differences.
  photo=function(p){
    if(!isW4())return oldPhoto?oldPhoto(p):'';
    const name=String(p?.name||'').trim(),num=String(p?.number||p?.jersey||'').trim(),profile=String(p?.profile||'').trim();
    if(!name&&!num)return '<div class="initials">?</div>';
    const q=new URLSearchParams();if(name)q.set('name',name);if(num)q.set('number',num);if(profile)q.set('profile',profile);q.set('v','20260920w4v5');
    const src='/api/fau-player-image?'+q.toString();
    return `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:50% 10%;image-rendering:auto" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="initials" style="display:none">${initials(name)}</div>`;
  };

  // Re-label any remaining PFF formation strings after render. The play-feed rows are also translated above,
  // so filters/charts use the defensive scout terminology rather than offensive install language.
  function relabel(root=document){
    if(!isW4())return;
    const sels=root.querySelectorAll?.('option,.sle-structure-summary b,.sle-structure-summary span,.run-filter-note,.subtle,.formation-name,.chip,.pill,td')||[];
    sels.forEach(el=>{let t=el.textContent||'',n=t;for(const [p,u] of Object.entries(MAP))n=n.split(p).join(u);if(n!==t)el.textContent=n});
  }
  if(oldRender)render=function(){const out=oldRender.apply(this,arguments);setTimeout(()=>relabel(document),0);return out};

  setTimeout(async()=>{if(isW4()){await forceFAUData();if(typeof render==='function')render()}},700);
})();
