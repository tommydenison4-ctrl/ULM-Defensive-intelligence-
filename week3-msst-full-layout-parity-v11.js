/* v11: Southeastern Louisiana uses the exact Mississippi State UI/renderers, with Week 3 data helpers retained. */
(() => {
  const isW3=()=>typeof prepWeek!=='undefined'&&prepWeek==='W3';
  const B=window.__MSST_LAYOUT__||{};
  const swapText=html=>String(html||'')
    .replace(/MISSISSIPPI STATE/g,'SOUTHEASTERN LOUISIANA')
    .replace(/Mississippi State/g,'Southeastern Louisiana')
    .replace(/Mississippi state/g,'Southeastern Louisiana')
    .replace(/Week 1/g,'Week 3')
    .replace(/WEEK 1/g,'WEEK 3')
    .replace(/2025 SEASON STATS/g,analysisMode==='current'?'2026 SOUTHEASTERN LOUISIANA STATS':analysisMode==='historical'?'2025 SOUTHEASTERN LOUISIANA STATS':'SOUTHEASTERN LOUISIANA · WEIGHTED 50/50')
    .replace(/Special Teams \/ Current \/ roster\.json/g,'Defensive Intelligence / Opponents / Southeastern Louisiana / roster.json')
    .replace(/Defensive Intelligence \/ Mississippi State \/ Current/g,'Defensive Intelligence / Opponents / Southeastern Louisiana')
    .replace(/2025 play feed/g,analysisMode==='current'?'2026 active play feed':analysisMode==='historical'?'2025 active play feed':'eligible plays · rates weighted 50/50')
    .replace(/Roster image source/g,'Southeastern Louisiana official roster bio images');

  const basePage=name=>{
    const fn=B[name];
    if(typeof fn!=='function')return null;
    return function(...args){
      if(!isW3()) return fn.apply(this,args);
      return swapText(fn.apply(this,args));
    };
  };

  // Restore every coach-facing page to the exact base/MSST renderer.
  ['dashboardPage','playersPage','personnelPage','runPage','passPage','heatmapPage','coveragePage','situationsPage','rushCountPage','pressurePage'].forEach(n=>{
    const f=basePage(n); if(f) window[n]=f;
  });

  // Restore the Mississippi State player-card presentation. Week 3 photo + stat helpers stay active.
  if(typeof B.playerCard==='function'){
    const base=B.playerCard;
    window.playerCard=function(p){ return isW3()?swapText(base(p)):base(p); };
  }

  // Restore every player-detail visual/tab component to the MSST version.
  ['overviewFAU','passingPanel','rushingPanel','routeTreePanel','targetsPanel','coveragePlayerPanel','topGamesPanel','gameLogFAU','coachNotesFAU'].forEach(n=>{
    if(typeof B[n]!=='function')return;
    const base=B[n];
    window[n]=function(...args){ return isW3()?swapText(base.apply(this,args)):base.apply(this,args); };
  });

  if(typeof B.renderPortalTab==='function'){
    const base=B.renderPortalTab;
    window.renderPortalTab=function(p){ return isW3()?swapText(base(p)):base(p); };
  }

  // Use the exact MSST drawer shell, but relabel opponent/week after rendering.
  if(typeof B.renderFAUDrawer==='function'){
    const base=B.renderFAUDrawer;
    window.renderFAUDrawer=function(p){
      base(p);
      if(!isW3())return;
      const body=document.getElementById('fauDrawerBody');
      if(body) body.innerHTML=swapText(body.innerHTML);
    };
  }

  // Re-assert after any late render cycle. No observers; this does not interfere with navigation.
  const oldRender=typeof render==='function'?render:null;
  if(oldRender){
    window.render=function(...args){
      const out=oldRender.apply(this,args);
      if(isW3()){
        const app=document.getElementById('app');
        if(app) app.innerHTML=swapText(app.innerHTML);
      }
      return out;
    };
  }
})();
