
(() => {
 const oldName=activeOpponentName,oldLabel=activeWeekLabel,oldNotes=notesTeam,oldSwitch=weekSwitchHTML,oldChrome=updatePrepChrome,oldSet=window.setPrepWeek,oldLoad=window.loadRoster;
 activeOpponentName=()=>prepWeek==='W7'?'Louisiana Tech':oldName();activeWeekLabel=()=>prepWeek==='W7'?'Week 7':oldLabel();notesTeam=()=>prepWeek==='W7'?'Louisiana Tech':oldNotes();
 weekSwitchHTML=()=>oldSwitch().replace('</div>',`<button class="${prepWeek==='W7'?'active':''}" onclick="setPrepWeek('W7')"><b>Week 7 · Louisiana Tech</b><span>Current opponent prep</span></button></div>`);
 updatePrepChrome=function(){if(prepWeek!=='W7')return oldChrome();document.title='ULM Defensive Intelligence | Louisiana Tech';document.querySelector('.side-sub').textContent='Louisiana Tech Week';document.querySelector('.opp-name').textContent='Louisiana Tech';document.querySelector('.opp-meta').textContent='Week 7 · October 17, 2026 · Home';const n=document.querySelector('[data-page="depth"]');n.innerHTML='≡ Louisiana Tech Depth Chart';n.style.display='';document.querySelectorAll('[data-page="jones"]').forEach(b=>b.style.display='')};
 const originalRender=render;
 render=function(){if(prepWeek!=='W7')return originalRender();datasets=LaTech.state.data;roster=LaTech.state.roster||LaTech.roster(['offense']);updatePrepChrome();const missing=!datasets.plays?.length;const need={dashboard:['plays','qb','passOverall'],players:['qb','receiving','passBlocking','runBlocking'],pass:['plays','passOverall'],pressure:['plays','pressure']};const pending=missing||(need[page]?.length && need[page].some(k=>!datasets[k]?.length));
 if(page==='depth')$('app').innerHTML=weekSwitchHTML()+LaTech.depthHTML(['offense','defense','specialTeams']);
 else if(page==='jones')$('app').innerHTML=weekSwitchHTML()+LaTech.pending('Coach Jones Notes');
 else if(pending)$('app').innerHTML=weekSwitchHTML()+LaTech.pending(page)+LaTech.statusHTML();else originalRender();};
 async function loadLT(){$('headerStatus').textContent='Louisiana Tech · Checking uploads…';datasets={};roster=[];loadState={};rawPlayRows=[];ulmPlayMap=new WeakMap();ulmHybridReady=false;ulmHybridMatchRate=0;analysisMode='current';selected=null;render();const result=await LaTech.load(parseCSV);if(!result||prepWeek!=='W7')return;
 datasets=result.data;rawPlayRows=(datasets.plays||[]).slice();roster=result.roster||LaTech.roster(['offense']);loadState=Object.fromEntries(Object.entries(result.status).map(([k,v])=>[k,{ok:!!datasets[k]?.length,n:datasets[k]?.length||0,file:v}]));
 $('headerStatus').textContent='Louisiana Tech · Week 7 · '+(datasets.plays?.length?'2026 play feed loaded':'Awaiting upload');render();}
 window.setPrepWeek=async function(w){if(w!=='W7')return oldSet(w);prepWeek='W7';page='dashboard';localStorage.setItem('ulmDefPrepWeekV1','W7');syncNav();return loadLT()};
 window.loadRoster=function(){return prepWeek==='W7'?loadLT():oldLoad()};$('reloadBtn').onclick=()=>window.loadRoster();
 if(LaTech.initial())window.setPrepWeek('W7');
})();
