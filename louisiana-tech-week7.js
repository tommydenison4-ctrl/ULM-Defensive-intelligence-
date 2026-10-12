
(() => {
 const oldName=activeOpponentName,oldLabel=activeWeekLabel,oldNotes=notesTeam,oldSwitch=weekSwitchHTML,oldChrome=updatePrepChrome,oldSet=window.setPrepWeek,oldLoad=window.loadRoster;
 activeOpponentName=()=>prepWeek==='W7'?'Louisiana Tech':oldName();activeWeekLabel=()=>prepWeek==='W7'?'Week 7':oldLabel();notesTeam=()=>prepWeek==='W7'?'Louisiana Tech':oldNotes();
 weekSwitchHTML=()=>oldSwitch().replace('</div>',`<button class="${prepWeek==='W7'?'active':''}" onclick="setPrepWeek('W7')"><b>Week 7 · Louisiana Tech</b><span>Current opponent prep</span></button></div>`);
 updatePrepChrome=function(){if(prepWeek!=='W7')return oldChrome();document.title='ULM Defensive Intelligence | Louisiana Tech';document.querySelector('.side-sub').textContent='Louisiana Tech Week';document.querySelector('.opp-name').textContent='Louisiana Tech';document.querySelector('.opp-meta').textContent='Week 7 · October 17, 2026 · Home';const n=document.querySelector('[data-page="depth"]');n.innerHTML='≡ Louisiana Tech Depth Chart';n.style.display='';document.querySelectorAll('[data-page="jones"]').forEach(b=>b.style.display='')};
 const LA_TECH_ULM_FORMATION_MAP={"PRO - CLOSED":"I-FLUTE","PRO - OPEN":"SPIN","PRO - PRO":"DIAMOND","QUADS WING - NIX":"FLANK","QUAY - NIX":"TRIO XTRA","QUAY - OPEN":"TRIO XTRA","SLOT - CLOSED":"FLANK FIB","SLOT - OPEN":"TRIO","SLOT - PRO":"DUO","SLOT - SLOT":"DICE","SLOT - WING":"FLANK FIB","TOAD WING - OPEN":"TOP","TREY - CLOSED":"FLANK","TREY - NIX":"TRIPS XTRA","TREY - OPEN":"TRIO","TREY - PRO":"TRUST FIB","TREY - SLOT":"TRUST","TRIPS - CLOSED":"FIST","TRIPS - OPEN":"TOP","TRIPS - SLOT":"TOP"};
 const clean=x=>String(x??'').trim();
 function laTechInternalRow(r){
  const rawFormation=clean(r.pff_OFFENSIVE_FORMATION_NAME||r.pff_STARTING_OFFENSIVE_FORMATION_NAME);
  const pffRun=clean(r.pff_RUNCONCEPTPRIMARY).toUpperCase();
  const runConcept=({'INSIDE ZONE':'INSIDE ZONE','OUTSIDE ZONE':'OUTSIDE ZONE','COUNTER':'COUNTER','QB RUNS':'QB RUN','READ OPTION':'READ OPTION','PULL LEAD':'PULL LEAD'})[pffRun]||pffRun;
  let playType='';
  if(clean(r.pff_RUNPASS).toUpperCase()==='R'){
   if(/ZONE|READ OPTION/.test(runConcept))playType='ZONE';
   else if(/COUNTER|POWER|PULL|LEAD|MAN/.test(runConcept))playType='GAP';
   else if(/DRAW/.test(runConcept))playType='DRAW';
  }
  if(!playType&&clean(r.pff_RUNPASSOPTION)==='1')playType='RPO';
  if(!playType&&clean(r.pff_SCREEN)==='1')playType='SCREEN';
  if(!playType)playType=clean(r.pff_RUNPASS).toUpperCase()==='P'?'DROPBACK':'';
  const formation=LA_TECH_ULM_FORMATION_MAP[rawFormation.toUpperCase()]||rawFormation||clean(r.pff_OFFFORMATIONGROUP);
  return {...r,Personnel:clean(r.pff_OFFPERSONNELBASIC||r.pff_OFF_PERSONNEL_GROUP),Formation:formation,'Form Var':'',Motion:clean(r.pff_SHIFTMOTION),'Y Location':clean(r.pff_TEALIGNMENT),Backfield:clean(r.pff_RBALIGNMENT),'Run Concept':runConcept,'Play Type':playType,'Pass Concept':clean(r.pff_PASSPATTERN||r.pff_PASSPATTERNBASIC||r.pff_PASSROUTETARGET),'Proctection':''};
 }
 function activateLaTechULM(){
  const plays=datasets.plays||[];ulmPlayMap=new WeakMap();let mapped=0;
  datasets.ulmHybrid=plays.map(r=>{const p=laTechInternalRow(r);if(LA_TECH_ULM_FORMATION_MAP[clean(r.pff_OFFENSIVE_FORMATION_NAME||r.pff_STARTING_OFFENSIVE_FORMATION_NAME).toUpperCase()])mapped++;ulmPlayMap.set(r,p);return p});
  ulmHybridReady=plays.length>0;ulmHybridMatchRate=plays.length?1:0;
  const internal=datasets.internalLanguage||[];const games=new Set(internal.map(r=>clean(r.Name).replace(/,\s*Play\s+\d+.*$/i,'')).filter(Boolean));
  loadState.ulmHybrid={ok:ulmHybridReady,n:plays.length,file:'play_feed-4.csv translated to established ULM labels; GAMES_1-5.csv reference loaded',formationMapped:mapped,internalReferencePlays:internal.length,internalReferenceGames:games.size};
 }
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
