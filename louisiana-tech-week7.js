
(() => {
 const oldName=activeOpponentName,oldLabel=activeWeekLabel,oldNotes=notesTeam,oldSwitch=weekSwitchHTML,oldChrome=updatePrepChrome,oldSet=window.setPrepWeek,oldLoad=window.loadRoster;
 activeOpponentName=()=>prepWeek==='W7'?'Louisiana Tech':oldName();activeWeekLabel=()=>prepWeek==='W7'?'Week 7':oldLabel();notesTeam=()=>prepWeek==='W7'?'Louisiana Tech':oldNotes();
 weekSwitchHTML=()=>oldSwitch().replace('</div>',`<button class="${prepWeek==='W7'?'active':''}" onclick="setPrepWeek('W7')"><b>Week 7 · Louisiana Tech</b><span>Current opponent prep</span></button></div>`);
 updatePrepChrome=function(){if(prepWeek!=='W7')return oldChrome();document.title='ULM Defensive Intelligence | Louisiana Tech';document.querySelector('.side-sub').textContent='Louisiana Tech Week';document.querySelector('.opp-name').textContent='Louisiana Tech';document.querySelector('.opp-meta').textContent='Week 7 · October 17, 2026 · Home';const n=document.querySelector('[data-page="depth"]');n.innerHTML='≡ Louisiana Tech Depth Chart';n.style.display='';document.querySelectorAll('[data-page="jones"]').forEach(b=>b.style.display='')};
 const clean=x=>String(x??'').trim();
 const internalColumns=['Formation','Personnel','Backfield','Form Var','Motion','Y Location','Pass Concept','Run Concept','Play Type','Proctection','Front'];
 const crosswalkSpecs={
  Formation:[['pff_OFFFORMATIONGROUP','pff_OFFPERSONNELBASIC','pff_RUNPASS'],['pff_OFFFORMATIONGROUP','pff_OFFPERSONNELBASIC'],['pff_OFFFORMATIONGROUP']],
  'Run Concept':[['pff_RUNCONCEPTPRIMARY'],['pff_RUNCONCEPTPRIMARY','pff_RUNPASS']],
  Front:[['pff_FRONTTYPE'],['pff_FRONTTYPE','pff_OFFFORMATIONGROUP']],
  'Play Type':[['pff_RUNPASS','pff_RUNCONCEPTPRIMARY'],['pff_RUNPASS','pff_RUNPASSOPTION'],['pff_RUNPASS']],
  Backfield:[['pff_OFFFORMATIONGROUP','pff_OFFPERSONNELBASIC','pff_RUNPASS'],['pff_OFFFORMATIONGROUP','pff_OFFPERSONNELBASIC'],['pff_OFFFORMATIONGROUP']],
  'Form Var':[['pff_OFFFORMATIONGROUP','pff_OFFPERSONNELBASIC','pff_RUNPASS'],['pff_OFFFORMATIONGROUP','pff_OFFPERSONNELBASIC'],['pff_OFFFORMATIONGROUP']],
  Motion:[['pff_OFFFORMATIONGROUP','pff_OFFPERSONNELBASIC','pff_RUNPASS'],['pff_OFFFORMATIONGROUP','pff_OFFPERSONNELBASIC'],['pff_OFFFORMATIONGROUP']],
  'Y Location':[['pff_OFFFORMATIONGROUP','pff_OFFPERSONNELBASIC','pff_RUNPASS'],['pff_OFFFORMATIONGROUP','pff_OFFPERSONNELBASIC'],['pff_OFFFORMATIONGROUP']],
  'Pass Concept':[['pff_OFFFORMATIONGROUP','pff_OFFPERSONNELBASIC','pff_RUNPASS'],['pff_OFFFORMATIONGROUP','pff_OFFPERSONNELBASIC'],['pff_OFFFORMATIONGROUP']],
  Proctection:[['pff_OFFFORMATIONGROUP','pff_OFFPERSONNELBASIC','pff_RUNPASS'],['pff_OFFFORMATIONGROUP','pff_OFFPERSONNELBASIC'],['pff_OFFFORMATIONGROUP']]
 };
 function referenceMatch(rows,field,play){
  const specs=crosswalkSpecs[field]||crosswalkSpecs.Formation;
  for(const fields of specs){
   const key=fields.map(k=>clean(play[k])).join('|');
   if(fields.some(k=>!clean(play[k])))continue;
   const counts=new Map();
   for(const ref of rows){
    if(fields.map(k=>clean(ref[k])).join('|')!==key)continue;
    const value=clean(ref[field]);if(value)counts.set(value,(counts.get(value)||0)+1);
   }
   if(counts.size)return [...counts].sort((a,b)=>b[1]-a[1])[0][0];
  }
  return '';
 }
 function activateLaTechULM(){
  const plays=datasets.plays||[],reference=datasets.languageReference||datasets.internalLanguage||[];
  ulmPlayMap=new WeakMap();let matchedFormation=0,unmappedFormation=0;
  datasets.ulmHybrid=plays.map(r=>{
   const Formation=referenceMatch(reference,'Formation',r)||'Unknown';
   if(Formation!=='Unknown')matchedFormation++;else unmappedFormation++;
   const mapped={...r};
   for(const field of internalColumns)mapped[field]=referenceMatch(reference,field,r)||'Unknown';
   mapped.Formation=Formation;
   mapped.Personnel=clean(r.pff_OFFPERSONNELBASIC)||'Unknown';
   ulmPlayMap.set(r,mapped);return mapped;
  });
  ulmHybridReady=plays.length>0;ulmHybridMatchRate=plays.length?matchedFormation/plays.length:0;
  loadState.ulmHybrid={ok:plays.length>0,n:plays.length,file:'GAMES_1-5.csv · internal ULM tags selected by formation group and personnel',matchedFormation,unmappedFormation,referencePlays:reference.length};
 }
 const originalPhoto=typeof photo==='function'?photo:null;
 if(originalPhoto)photo=function(p){if(prepWeek!=='W7')return originalPhoto(p);const name=clean(p?.name),number=clean(p?.number);if(!name)return '<div class="initials">?</div>';const src='/api/latech-player-image?name='+encodeURIComponent(name)+'&number='+encodeURIComponent(number)+'&v=week7-photo-v1';return `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:50% 14%" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="initials" style="display:none">${esc(initials(name))}</div>`};

 const priorPlayerPage=playersPage;playersPage=function(){const html=priorPlayerPage();return prepWeek==='W7'?html.replaceAll('2025 play feed','2026 play feed').replace('Defensive Intelligence / Mississippi State / Current','Defensive Intelligence / Opponents / Louisiana Tech').replace('Roster image source','Official LA Tech Athletics image lookup').replace('Special Teams / Current / roster.json','Defensive Intelligence / Opponents / Louisiana Tech / roster.json'):html};
 const priorTokenJersey=tokenJersey;tokenJersey=function(token){if(prepWeek==='W7'){const m=String(token||'').toUpperCase().match(/\\bLATC\\s+0*(\\d{1,2})\\b/);if(m)return String(parseInt(m[1],10))}return priorTokenJersey(token)};
 const priorUABTokenJersey=uabTokenJersey;uabTokenJersey=function(token){if(prepWeek==='W7'){const m=String(token||'').toUpperCase().match(/\\bLATC\\s+0*(\\d{1,2})\\b/);if(m)return String(parseInt(m[1],10))}return priorUABTokenJersey(token)};
 const priorOLMatch=seasonOffPlayerMatch;seasonOffPlayerMatch=function(r,p,season=playerSeasonView){if(prepWeek!=='W7')return priorOLMatch(r,p,season);if(!r||!p||seasonYear(r)!==String(season))return false;const j=jerseyNum(p.number);return !!j&&String(r.pff_OFFPLAYERS||'').split(';').some(token=>tokenJersey(token)===j)};
 const priorDrawer=renderFAUDrawer;renderFAUDrawer=function(p){if(prepWeek!=='W7')return priorDrawer(p);priorDrawer(p);const hero=$('fauDrawerBody')?.querySelector('.fau-hero-info');if(!hero)return;const kicker=hero.querySelector('.kicker'),season=hero.querySelector('.season-title'),sample=hero.querySelector('.sample-row');if(kicker)kicker.textContent='LOUISIANA TECH · WEEK 7 PLAYER INTELLIGENCE';if(season)season.textContent='2026 PFF STATS';if(sample)sample.innerHTML=`<span class="sample-badge">${playsForPlayer(p.name).length?'PFF Linked':'Rostered'}</span><span>${playsForPlayer(p.name).length} linked 2026 Louisiana Tech play-feed events · stats from supplied PFF files</span>`};
 const originalRender=render;
 render=function(){if(prepWeek!=='W7')return originalRender();datasets=LaTech.state.data;roster=LaTech.state.roster||LaTech.roster(['offense']);updatePrepChrome();const missing=!datasets.plays?.length;const need={dashboard:['plays','qb','passOverall'],players:['qb','receiving','passBlocking','runBlocking'],pass:['plays','passOverall'],pressure:['plays','pressure']};const pending=missing||(need[page]?.length && need[page].some(k=>!datasets[k]?.length));
  if(page==='depth')$('app').innerHTML=weekSwitchHTML()+LaTech.depthHTML(['offense']);
  else if(page==='jones')$('app').innerHTML=weekSwitchHTML()+LaTech.pending('Coach Jones Notes');
  else if(pending)$('app').innerHTML=weekSwitchHTML()+LaTech.pending(page)+LaTech.statusHTML();else originalRender();};
 async function loadLT(){$('headerStatus').textContent='Louisiana Tech · Checking uploads…';datasets={};roster=[];loadState={};rawPlayRows=[];ulmPlayMap=new WeakMap();ulmHybridReady=false;ulmHybridMatchRate=0;analysisMode='current';selected=null;render();const result=await LaTech.load(parseCSV);if(!result||prepWeek!=='W7')return;
 datasets=result.data;rawPlayRows=(datasets.plays||[]).slice();roster=result.roster||LaTech.roster(['offense']);loadState=Object.fromEntries(Object.entries(result.status).map(([k,v])=>[k,{ok:!!datasets[k]?.length,n:datasets[k]?.length||0,file:v}]));activateLaTechULM();
 const playCount=datasets.plays?.length||0,internalCount=(datasets.languageReference||datasets.internalLanguage||[]).length;
 $('headerStatus').textContent='Louisiana Tech · Week 7 · '+(playCount?playCount+' 2026 plays loaded':'Awaiting upload')+(internalCount?' · '+internalCount+' defensive-language reference plays loaded':'');render();}
 window.setPrepWeek=async function(w){if(w!=='W7')return oldSet(w);prepWeek='W7';page='dashboard';localStorage.setItem('ulmDefPrepWeekV1','W7');syncNav();return loadLT()};
 window.loadRoster=function(){return prepWeek==='W7'?loadLT():oldLoad()};$('reloadBtn').onclick=()=>window.loadRoster();
 if(LaTech.initial())window.setPrepWeek('W7');
})();
