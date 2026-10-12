
(() => {
 const oldName=activeOpponentName,oldLabel=activeWeekLabel,oldNotes=notesTeam,oldSwitch=weekSwitchHTML,oldChrome=updatePrepChrome,oldSet=window.setPrepWeek,oldLoad=window.loadRoster;
 activeOpponentName=()=>prepWeek==='W7'?'Louisiana Tech':oldName();activeWeekLabel=()=>prepWeek==='W7'?'Week 7':oldLabel();notesTeam=()=>prepWeek==='W7'?'Louisiana Tech':oldNotes();
 weekSwitchHTML=()=>oldSwitch().replace('</div>',`<button class="${prepWeek==='W7'?'active':''}" onclick="setPrepWeek('W7')"><b>Week 7 · Louisiana Tech</b><span>Current opponent prep</span></button></div>`);
 updatePrepChrome=function(){if(prepWeek!=='W7')return oldChrome();document.title='ULM Defensive Intelligence | Louisiana Tech';document.querySelector('.side-sub').textContent='Louisiana Tech Week';document.querySelector('.opp-name').textContent='Louisiana Tech';document.querySelector('.opp-meta').textContent='Week 7 · October 17, 2026 · Home';const n=document.querySelector('[data-page="depth"]');n.innerHTML='≡ Louisiana Tech Depth Chart';n.style.display='';document.querySelectorAll('[data-page="jones"]').forEach(b=>b.style.display='')};
 const LA_TECH_DEFENSIVE_FORMATION_MAP={'TREY - OPEN':'TREY Y OFF','SLOT - PRO':'DUO Y OFF','TRIPS - CLOSED':'TRIPS','TREY - CLOSED':'KING U OFF','TRIPS - OPEN':'TRIPS - OPEN','PRO - PRO':'ACE YU OFF','SLOT - SLOT':'DOUBLES','TRIPS - SLOT':'TRIPS - SLOT','SLOT - WING':'SLOT - WING','TOAD WING - OPEN':'TREY U HIP','PRO - OPEN':'PRO - OPEN','SLOT - CLOSED':'PRO','SLOT - OPEN':'SLOT - OPEN','QUAY - NIX':'TREY Y OFF','QUAY - OPEN':'TREY Y OFF','PRO - WING':'PRO - WING','QUADS WING - NIX':'QUADS WING - NIX','TREY - SLOT':'EMPTY 3x2 Y OFF','TREY - PRO':'ACE YU OFF','PRO - CLOSED':'KING U OFF B HIP','QUADS - OPEN':'EMPTY 4x1 Y OFF','TOAD WING - SLOT':'EMPTY 4x1 T STING','TOAD WING - PRO':'TOAD WING - PRO','TOAD WING - CLOSED':'TOAD WING - CLOSED','TRIPS - WING':'TRIPS - WING','TRIPS - PRO':'TRIPS - PRO','CLOSED - CLOSED':'CLOSED - CLOSED','OPEN - OPEN':'OPEN - OPEN','OPEN - CLOSED':'OPEN - CLOSED','WING - CLOSED':'WING - CLOSED','WING - OPEN':'WING - OPEN','WING - NIX':'WING - NIX','TANK WING - OPEN':'TANK WING - OPEN','OTHER':'OTHER'};
 const clean=x=>String(x??'').trim();
 const first=(r,keys)=>{for(const k of keys){const v=r?.[k];if(v!==undefined&&v!==null&&String(v).trim()!=='')return String(v).trim()}return''};
 function laTechInternalRow(r){
  const sourceFormation=first(r,['pff_PFF_OFFENSIVE_FORMATION_NAME','pff_OFFENSIVE_FORMATION_NAME','pff_STARTING_OFFENSIVE_FORMATION_NAME','pff_OFFFORMATIONNAME','pff_OFFFORMATIONGROUP']);
  const formation=LA_TECH_DEFENSIVE_FORMATION_MAP[sourceFormation.toUpperCase()]||sourceFormation||'Unknown';
  const protection=first(r,['pff_PROTECTION','pff_PASSBLOCKINGSCHEME','pff_PASS_PROTECTION','pff_PROTECTIONSCHEME']);
  return {'Formation':formation,'Personnel':first(r,['pff_OFFPERSONNELBASIC','pff_OFF_PERSONNEL_GROUP'])||'Unknown','Backfield':first(r,['pff_BACKSET','pff_RBALIGNMENT','pff_RBDEPTH','pff_RBSINBACKFIELD'])||'Unknown','Form Var':formation,'Motion':first(r,['pff_MOTION','pff_MOTIONTYPE','pff_SHIFTMOTION','pff_PRE_SNAP_MOTION'])||'None','Y Location':first(r,['pff_TEALIGNMENT','pff_TES','pff_YALIGNMENT'])||'Unknown','TE':first(r,['pff_TES','pff_TEALIGNMENT']),'Pass Concept':first(r,['pff_PASSCONCEPT','pff_PASS_CONCEPT','pff_PASSPATTERNBASIC','pff_PASSROUTETARGETGROUP','pff_ROUTE_THROWN'])||'Unknown','Run Concept':first(r,['pff_RUNCONCEPTPRIMARY','pff_RUNCONCEPTSECONDARY']),'Play Type':first(r,['pff_PLAYTYPE','pff_DROPBACKTYPE','pff_DROPBACK_TYPE'])||(String(r?.pff_RPO||r?.pff_RUNPASSOPTION||'')==='1'?'RPO':'Dropback'),'Protection':protection||'Unknown','Proctection':protection||'Unknown','Coverage':first(r,['pff_PASS_COVERAGE_BASIC','pff_PASSCOVERAGEBASIC'])};
 }
 function activateLaTechULM(){
  const plays=datasets.plays||[];ulmPlayMap=new WeakMap();let translated=0;
  datasets.ulmHybrid=plays.map(r=>{const p=laTechInternalRow(r);if(LA_TECH_DEFENSIVE_FORMATION_MAP[clean(r.pff_OFFENSIVE_FORMATION_NAME||r.pff_STARTING_OFFENSIVE_FORMATION_NAME).toUpperCase()])translated++;ulmPlayMap.set(r,p);return p});
  ulmHybridReady=plays.length>0;ulmHybridMatchRate=plays.length?1:0;
  const internal=datasets.internalLanguage||[];const games=new Set(internal.map(r=>clean(r.Name).replace(/,\s*Play\s+\d+.*$/i,'')).filter(Boolean));
  loadState.ulmHybrid={ok:ulmHybridReady,n:plays.length,file:'Week 3–4 defensive-scout language crosswalk; GAMES_1-5.csv retained as reference',formationTranslated:translated,internalReferencePlays:internal.length,internalReferenceGames:games.size};
 }\n const originalPhoto=typeof photo==='function'?photo:null;
 if(originalPhoto)photo=function(p){if(prepWeek!=='W7')return originalPhoto(p);const name=clean(p?.name),number=clean(p?.number);if(!name)return '<div class="initials">?</div>';const src='/api/latech-player-image?name='+encodeURIComponent(name)+'&number='+encodeURIComponent(number)+'&v=week7-photo-v1';return `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:50% 14%" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="initials" style="display:none">${esc(initials(name))}</div>`};

 const originalRender=render;
 render=function(){if(prepWeek!=='W7')return originalRender();datasets=LaTech.state.data;roster=LaTech.state.roster||LaTech.roster(['offense']);updatePrepChrome();const missing=!datasets.plays?.length;const need={dashboard:['plays','qb','passOverall'],players:['qb','receiving','passBlocking','runBlocking'],pass:['plays','passOverall'],pressure:['plays','pressure']};const pending=missing||(need[page]?.length && need[page].some(k=>!datasets[k]?.length));
  if(page==='depth')$('app').innerHTML=weekSwitchHTML()+LaTech.depthHTML(['offense','defense','specialTeams']);
  else if(page==='jones')$('app').innerHTML=weekSwitchHTML()+LaTech.pending('Coach Jones Notes');
  else if(pending)$('app').innerHTML=weekSwitchHTML()+LaTech.pending(page)+LaTech.statusHTML();else originalRender();};
 async function loadLT(){$('headerStatus').textContent='Louisiana Tech · Checking uploads…';datasets={};roster=[];loadState={};rawPlayRows=[];ulmPlayMap=new WeakMap();ulmHybridReady=false;ulmHybridMatchRate=0;analysisMode='current';selected=null;render();const result=await LaTech.load(parseCSV);if(!result||prepWeek!=='W7')return;
 datasets=result.data;rawPlayRows=(datasets.plays||[]).slice();roster=result.roster||LaTech.roster(['offense']);loadState=Object.fromEntries(Object.entries(result.status).map(([k,v])=>[k,{ok:!!datasets[k]?.length,n:datasets[k]?.length||0,file:v}]));activateLaTechULM();
 const playCount=datasets.plays?.length||0,internalCount=datasets.internalLanguage?.length||0;
 $('headerStatus').textContent='Louisiana Tech · Week 7 · '+(playCount?playCount+' 2026 plays loaded':'Awaiting upload')+(internalCount?' · '+internalCount+' internal-language reference plays loaded':'');render();}
 window.setPrepWeek=async function(w){if(w!=='W7')return oldSet(w);prepWeek='W7';page='dashboard';localStorage.setItem('ulmDefPrepWeekV1','W7');syncNav();return loadLT()};
 window.loadRoster=function(){return prepWeek==='W7'?loadLT():oldLoad()};$('reloadBtn').onclick=()=>window.loadRoster();
 if(LaTech.initial())window.setPrepWeek('W7');
})();
