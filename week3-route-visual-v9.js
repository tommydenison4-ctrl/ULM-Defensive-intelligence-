/* Week 3 v9: restore the exact Week 1/2 route-tree visualization for Southeastern player Routes. */
(() => {
  const isW3=()=>typeof prepWeek!=='undefined'&&prepWeek==='W3';
  const oldRouteTree=typeof routeTreePanel==='function'?routeTreePanel:null;
  routeTreePanel=function(p){
    if(!isW3()) return oldRouteTree?oldRouteTree(p):'';
    const pos=normPos(p.position), rs=playerTargetRoutes(p);
    if(!['QB','WR','TE','RB'].includes(pos)) return `<div class="card"><h3>Route Dashboard</h3><div class="empty">Route view applies to quarterbacks and skill players.</div></div>`;
    if(!rs.length) return `<div class="card"><h3>Route Dashboard</h3><div class="empty">No targeted route tags matched this player in the current Southeastern sample.</div></div>`;
    const focus=routeFocus==='ALL'?rs[0]:(rs.find(x=>x.route===routeFocus)||rs[0]);
    const breakDepth=isNaN(focus.breakDepth)?focus.avgDepth:focus.breakDepth;
    const breakY=depthToY(breakDepth), path=routePathFor(focus.family,breakDepth);
    const pills=`<div class="route-pill-wrap"><button class="${routeFocus==='ALL'?'primary':''}" onclick="setRouteFocus('ALL')">Top Route View</button>`+
      rs.map(r=>`<button class="${focus.route===r.route?'primary':''}" onclick='setRouteFocus(${JSON.stringify(r.route)})'>${esc(r.route)} (${r.tgt})</button>`).join('')+`</div>`;
    return `<div class="route-dashboard-v6">
      <div class="section-head"><div><h3>Route Dashboard</h3><small>${analysisMode==='current'?'2026':analysisMode==='historical'?'2025':'2025 + 2026'} Southeastern Louisiana</small></div>${freqToggle()}</div>
      <div class="heat-controls">${pills}</div>
      <div class="route-stage-v6">
        <div class="route-tree-panel-v6">
          <svg class="route-tree-svg-v6" viewBox="0 0 360 500">
            <line x1="25" y1="450" x2="326" y2="450" stroke="#98a2b3" stroke-width="2"/>
            <line x1="168" y1="60" x2="168" y2="450" stroke="#eef1f4" stroke-width="2"/>
            <line x1="36" y1="${breakY}" x2="324" y2="${breakY}" stroke="#d0d5dd" stroke-dasharray="5 5" stroke-width="1.5"/>
            <text x="40" y="${breakY-6}" font-size="10" fill="#667085">~${fmt(breakDepth,1)} yds</text>
            <circle cx="168" cy="456" r="6" fill="#8A2432"/>
            <circle cx="326" cy="472" r="16" fill="#0f172a"/>
            <text x="326" y="476" text-anchor="middle" font-size="10" font-weight="900" fill="#fff">QB</text>
            <path d="${path}" onclick='setRouteFocus(${JSON.stringify(focus.route)})' style="cursor:pointer"/>
            <rect class="route-label-box" x="100" y="92" width="160" height="46" rx="8" onclick='setRouteFocus(${JSON.stringify(focus.route)})' style="cursor:pointer"/>
            <text x="180" y="110" text-anchor="middle" font-size="13" font-weight="800">${esc(focus.route)}</text>
            <text x="180" y="124" text-anchor="middle" font-size="9" fill="#667085">${focus.tgt} tgt · ${focus.rec} rec · ${fmt(focus.avgDepth,1)} avg depth</text>
            <text x="180" y="490" text-anchor="middle" font-size="10" fill="#667085">LINE OF SCRIMMAGE</text>
          </svg>
        </div>
        <div class="route-detail-v6">
          <h3>${esc(focus.route)}</h3>
          <div class="subtle">${focus.rawText?`PFF tag(s): ${esc(focus.rawText)}`:'Generic route view'}</div>
          <div class="route-detail-grid-v6">
            <div class="route-detail-stat-v6"><small>Targets</small><b>${focus.tgt}</b></div>
            <div class="route-detail-stat-v6"><small>Receptions</small><b>${focus.rec}</b></div>
            <div class="route-detail-stat-v6"><small>Catch %</small><b>${pct(100*focus.rec/Math.max(1,focus.tgt))}</b></div>
            <div class="route-detail-stat-v6"><small>Yards</small><b>${focus.yds}</b></div>
            <div class="route-detail-stat-v6"><small>Yards / Target</small><b>${fmt(focus.yds/Math.max(1,focus.tgt),1)}</b></div>
            <div class="route-detail-stat-v6"><small>TD</small><b>${focus.td}</b></div>
            <div class="route-detail-stat-v6"><small>Explosive</small><b>${freqMode==='raw'?focus.expl:pct(100*focus.expl/Math.max(1,focus.tgt))}</b></div>
            <div class="route-detail-stat-v6"><small>Negative</small><b>${freqMode==='raw'?focus.neg:pct(100*focus.neg/Math.max(1,focus.tgt))}</b></div>
            <div class="route-detail-stat-v6"><small>Avg Depth</small><b>${fmt(focus.avgDepth,1)}</b></div>
            <div class="route-detail-stat-v6"><small>Break Depth</small><b>${fmt(breakDepth,1)}</b></div>
          </div>
        </div>
      </div>
      <div class="route-table-wrap" style="margin-top:14px">${routeTableHTML(rs,focus)}</div>
    </div>`;
  };

  const oldPortal=typeof renderPortalTab==='function'?renderPortalTab:null;
  renderPortalTab=function(p){
    if(!isW3()) return oldPortal?oldPortal(p):'';
    if(String(portalTab||'overview')==='routes') return routeTreePanel(p);
    return oldPortal?oldPortal(p):'';
  };
})();
