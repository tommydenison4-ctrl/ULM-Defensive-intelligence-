/* Week 4 Florida Atlantic uses the exact captured Mississippi State UI/renderers. */
(() => {
  const isW4=()=>typeof prepWeek!=='undefined'&&prepWeek==='W4';
  const B=window.__MSST_LAYOUT__||{};
  const swapText=html=>String(html||'')
    .replace(/MISSISSIPPI STATE/g,'FLORIDA ATLANTIC')
    .replace(/Mississippi State/g,'Florida Atlantic')
    .replace(/Mississippi state/g,'Florida Atlantic')
    .replace(/Week 1/g,'Week 4')
    .replace(/WEEK 1/g,'WEEK 4')
    .replace(/2025 SEASON STATS/g,'2026 FLORIDA ATLANTIC STATS')
    .replace(/2025 play feed/g,'2026 Florida Atlantic play feed')
    .replace(/WEIGHTED 50\/50/g,'2026 ONLY')
    .replace(/2025\s*\+\s*2026/g,'2026')
    .replace(/Special Teams \/ Current \/ roster\.json/g,'Florida Atlantic · 2026 roster')
    .replace(/Defensive Intelligence \/ Mississippi State \/ Current/g,'Defensive Intelligence / Opponents / Florida Atlantic')
    .replace(/Roster image source/g,'Florida Atlantic official roster bio images');
  const page=n=>{const fn=B[n];if(typeof fn!=='function')return null;return function(...args){return isW4()?swapText(fn.apply(this,args)):fn.apply(this,args)}};
  ['dashboardPage','playersPage','personnelPage','runPage','passPage','heatmapPage','coveragePage','situationsPage','rushCountPage','pressurePage'].forEach(n=>{const f=page(n);if(f)window[n]=f});
  if(typeof B.playerCard==='function'){const base=B.playerCard;window.playerCard=p=>isW4()?swapText(base(p)):base(p)}
  ['overviewFAU','passingPanel','rushingPanel','routeTreePanel','targetsPanel','coveragePlayerPanel','topGamesPanel','gameLogFAU','coachNotesFAU'].forEach(n=>{if(typeof B[n]!=='function')return;const base=B[n];window[n]=function(...args){return isW4()?swapText(base.apply(this,args)):base.apply(this,args)}});
  if(typeof B.renderPortalTab==='function'){const base=B.renderPortalTab;window.renderPortalTab=p=>isW4()?swapText(base(p)):base(p)}
  if(typeof B.renderFAUDrawer==='function'){const base=B.renderFAUDrawer;window.renderFAUDrawer=function(p){base(p);if(!isW4())return;const body=document.getElementById('fauDrawerBody');if(body)body.innerHTML=swapText(body.innerHTML)}}
})();
