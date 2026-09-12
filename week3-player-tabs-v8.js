/* Week 3 v8: make every Player Intelligence tab resolve from the active Southeastern sample, with summary fallbacks when a play-feed field is absent. */
(() => {
  const isW3=()=>typeof prepWeek!=='undefined'&&prepWeek==='W3';
  const clean=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const n=v=>{const x=parseFloat(String(v??'').replace(/[%,$]/g,''));return Number.isFinite(x)?x:0};
  const first=(r,keys)=>{for(const k of keys){const v=r?.[k];if(v!==undefined&&v!==null&&String(v).trim()!=='')return String(v).trim()}return''};
  const result=r=>String(r?.pff_PASSRESULT||'').toUpperCase();
  const attempt=r=>['COMPLETE','INCOMPLETE','INTERCEPTION','THROWN AWAY','HIT AS THREW','BATTED PASS'].includes(result(r));
  const td=r=>String(r?.pff_TOUCHDOWN||'').trim()!=='';
  const pos=p=>typeof normPos==='function'?normPos(p?.position):String(p?.position||'').toUpperCase();
  const season=()=>analysisMode==='current'?'2026':analysisMode==='historical'?'2025':'2025 + 2026';
  const plays=p=>typeof playsForPlayer==='function'?playsForPlayer(p):[];
  const passer=p=>plays(p).filter(r=>clean(r?.pff_PASSER).includes(clean(p?.name))||pos(p)==='QB');
  const targets=p=>plays(p).filter(r=>clean(r?.pff_PASSRECEIVERTARGET).includes(clean(p?.name)));
  const passRows=p=>pos(p)==='QB'?plays(p).filter(r=>String(r?.pff_RUNPASS||'').toUpperCase()==='P'):targets(p);
  const summaryRows=(key,p)=>{
    const rows=datasets?.[key]||[];
    let hit=rows.filter(r=>clean(r?.Name)===clean(p?.name));
    if(hit.length)return hit;
    const num=String(p?.number??'').replace(/\D/g,'');
    if(num)hit=rows.filter(r=>String(r?.['#']??'').replace(/\D/g,'')===num);
    return hit;
  };
  const routeName=r=>first(r,['pff_ROUTE_THROWN','pff_PASSROUTETARGETGROUP','pff_PASSROUTETARGET','pff_TARGETEDROUTE','pff_TARGETED_ROUTE','pff_ROUTE','pff_ROUTE_TYPE','pff_PASSROUTE','pff_PASS_ROUTE','pff_ROUTE_CONCEPT']);
  const coverageName=r=>first(r,['pff_PASS_COVERAGE_BASIC','pff_PASSCOVERAGEBASIC','pff_COVERAGE','pff_COVERAGE_BASIC','pff_DEFCOVERAGE','pff_DEF_COVERAGE']);
  const depthVal=r=>{for(const k of ['pff_PASSDEPTH','pff_PASS_DEPTH','pff_TARGETDEPTH','pff_TARGET_DEPTH','pff_AIRYARDS','pff_AIR_YARDS']){const x=parseFloat(r?.[k]);if(Number.isFinite(x))return x}return null};

  // Fresh portrait request after the API resolver change.
  const oldPhoto=typeof photo==='function'?photo:null;
  photo=function(p){if(!isW3())return oldPhoto?oldPhoto(p):'';const name=String(p?.name||'').trim();if(!name)return `<div class="initials">?</div>`;const src=`/api/sle-player-image?name=${encodeURIComponent(name)}&v=20260912v8`;return `<img src="${esc(src)}" alt="${esc(name)}" loading="eager" style="object-fit:cover;object-position:50% 12%" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="initials" style="display:none">${initials(name)}</div>`};

  function routeFromFeed(p){
    const g={};
    passRows(p).forEach(r=>{const k=routeName(r);if(!k)return;const z=g[k]||(g[k]={n:0,c:0,y:0,td:0,d:[]});z.n++;if(result(r)==='COMPLETE'){z.c++;z.y+=n(r.pff_GAINLOSSNET??r.pff_GAINLOSS)}if(result(r)==='COMPLETE'&&td(r))z.td++;const d=depthVal(r);if(d!==null)z.d.push(d)});
    return Object.entries(g).map(([route,z])=>({route,...z,ad:z.d.length?z.d.reduce((a,b)=>a+b,0)/z.d.length:0})).sort((a,b)=>b.n-a.n);
  }
  function routeFromSummary(p){
    let rows=summaryRows('routes',p);
    if(!rows.length&&pos(p)==='QB')rows=datasets?.routes||[];
    return rows.map(r=>({route:first(r,['ROUTE','Route','Route Type','ROUTE TYPE','Concept','CONCEPT'])||'Unknown',n:n(r.TGT??r.ATT??r.OFF??r.PLAYS??r.DB),c:n(r.REC??r.COMP),y:n(r['REC YDS']??r['PASS YDS']??r.YDS),td:n(r['REC TD']??r['PASS TD']??r.TD),ad:n(r.ADOT??r['AVG DEPTH']??r['PASS DEPTH'])})).filter(z=>z.n||z.y||z.route!=='Unknown').sort((a,b)=>b.n-a.n);
  }
  const oldRoutes=typeof routeTreePanel==='function'?routeTreePanel:null;
  routeTreePanel=function(p){
    if(!isW3())return oldRoutes?oldRoutes(p):'';
    let rs=routeFromFeed(p),source='play feed';
    if(!rs.length){rs=routeFromSummary(p);source=pos(p)==='QB'?'Southeastern route summary':'player route summary'}
    if(!rs.length)return `<div class="card"><h3>Route Dashboard · ${season()}</h3><div class="empty">No route field is present in the active Southeastern source for ${esc(p.name)}.</div></div>`;
    return `<div class="card"><h3>Route Dashboard · ${season()}</h3><div class="subtle">${esc(source)}</div>${table(['Route','Looks','Comp','Comp %','Avg Depth','Yards','Yds/Look','TD'],rs.map(z=>[esc(z.route),z.n,z.c,z.n?fmt(100*z.c/z.n,1)+'%':'—',Number.isFinite(z.ad)?fmt(z.ad,1):'—',Math.round(z.y),z.n?fmt(z.y/z.n,1):'—',z.td]))}</div>`;
  };

  function targetGrid(p){
    const rows=passRows(p).filter(r=>attempt(r)||result(r)==='COMPLETE'||result(r)==='INTERCEPTION');
    if(!rows.length)return'';
    const cells=Array.from({length:20},()=>({n:0,c:0,y:0}));
    const side=r=>{const s=first(r,['pff_PASSLOCATION','pff_PASS_LOCATION','pff_TARGETLOCATION','pff_TARGET_LOCATION','pff_PASSDIRECTION','pff_PASS_DIRECTION']).toUpperCase();if(/LEFT/.test(s))return 0;if(/RIGHT/.test(s))return 4;if(/MIDDLE|CENTER/.test(s))return 2;return 2};
    rows.forEach(r=>{const d=depthVal(r);let rr=d===null?1:d<0?0:d<10?1:d<20?2:3,cc=side(r),z=cells[rr*5+cc];z.n++;if(result(r)==='COMPLETE')z.c++;z.y+=n(r.pff_GAINLOSSNET??r.pff_GAINLOSS)});
    const max=Math.max(1,...cells.map(z=>z.n)),labels=['Behind LOS','0–9','10–19','20+'];
    return `<div class="heat-grid">${cells.map((z,i)=>`<div class="heat-cell ${z.n?'':'zero'}" style="background:rgba(138,36,50,${(.08+.82*z.n/max).toFixed(2)})"><b>${z.n}</b><span>${labels[Math.floor(i/5)]}</span><small>${z.c} comp · ${Math.round(z.y)} yds</small></div>`).join('')}</div><div class="heat-axis"><span>DEF LEFT</span><span>DEFENSIVE VIEW</span><span>DEF RIGHT</span></div>`;
  }
  const oldTargets=typeof targetsPanel==='function'?targetsPanel:null;
  targetsPanel=function(p){
    if(!isW3())return oldTargets?oldTargets(p):'';
    const grid=targetGrid(p);if(grid)return `<div class="card"><h3>${pos(p)==='QB'?'Throw Map':'Targets'} · ${season()}</h3>${grid}</div>`;
    const rows=pos(p)==='QB'?summaryRows('qb',p):summaryRows('receiving',p);
    if(rows.length)return `<div class="card"><h3>${pos(p)==='QB'?'Passing Targets':'Receiving Targets'} · ${season()}</h3>${table(Object.keys(rows[0]).slice(0,10),rows.map(r=>Object.keys(rows[0]).slice(0,10).map(k=>r[k])))}</div>`;
    return `<div class="card"><h3>${pos(p)==='QB'?'Throw Map':'Targets'} · ${season()}</h3><div class="empty">No target-location fields are present for this player in the active source.</div></div>`;
  };

  function coverageGroups(p,manZoneOnly){
    const g={};passRows(p).forEach(r=>{const raw=coverageName(r);if(!raw)return;const man=/COVER 0|COVER 1|2 MAN|\bMAN\b/i.test(raw),k=manZoneOnly?(man?'MAN':'ZONE'):raw,z=g[k]||(g[k]={n:0,a:0,c:0,y:0,td:0,int:0,expl:0});z.n++;if(attempt(r))z.a++;if(result(r)==='COMPLETE')z.c++;if(result(r)==='INTERCEPTION')z.int++;const gain=n(r.pff_GAINLOSSNET??r.pff_GAINLOSS);z.y+=gain;if(gain>=15)z.expl++;if(result(r)==='COMPLETE'&&td(r))z.td++});return g;
  }
  const oldCoverage=typeof coveragePlayerPanel==='function'?coveragePlayerPanel:null;
  coveragePlayerPanel=function(p,manZoneOnly=false){
    if(!isW3())return oldCoverage?oldCoverage(p,manZoneOnly):'';
    const g=coverageGroups(p,manZoneOnly),entries=Object.entries(g).sort((a,b)=>b[1].n-a[1].n);
    if(entries.length)return `<div class="card"><h3>${manZoneOnly?'Man / Zone':'Vs Coverage'} · ${season()}</h3><div class="coverage-grid-v6">${entries.map(([k,z])=>`<div class="coverage-card-v6"><h4>${esc(k)}</h4><div class="big">${z.n} plays</div><div class="metric-grid">${metric('C/A',`${z.c}/${z.a}`)}${metric('YPP',fmt(z.y/Math.max(1,z.n),2))}${metric('Expl',z.expl)}${metric('TD / INT',`${z.td} / ${z.int}`)}</div></div>`).join('')}</div></div>`;
    const rows=summaryRows('coverage',p);
    if(rows.length)return `<div class="card"><h3>${manZoneOnly?'Man / Zone':'Vs Coverage'} · ${season()}</h3>${table(Object.keys(rows[0]).slice(0,10),rows.map(r=>Object.keys(rows[0]).slice(0,10).map(k=>r[k])))}</div>`;
    return `<div class="card"><h3>${manZoneOnly?'Man / Zone':'Vs Coverage'} · ${season()}</h3><div class="empty">No coverage field is present for this player in the active Southeastern source.</div></div>`;
  };

  // Ensure every visible portal tab routes to the Week 3 implementations instead of inherited Week 1/2 functions.
  const oldPortal=typeof renderPortalTab==='function'?renderPortalTab:null;
  renderPortalTab=function(p){
    if(!isW3())return oldPortal?oldPortal(p):'';
    const tab=String(portalTab||'overview');
    if(tab==='overview')return typeof overviewFAU==='function'?overviewFAU(p):'';
    if(tab==='passing')return typeof passingPanel==='function'?passingPanel(p):'';
    if(tab==='rushing')return typeof rushingPanel==='function'?rushingPanel(p):'';
    if(tab==='routes')return routeTreePanel(p);
    if(tab==='top')return typeof topGamesPanel==='function'?topGamesPanel(p):'';
    if(tab==='targets')return targetsPanel(p);
    if(tab==='coverage')return coveragePlayerPanel(p,false);
    if(tab==='manzone')return coveragePlayerPanel(p,true);
    if(tab==='games')return typeof gameLogFAU==='function'?gameLogFAU(p):'';
    if(tab==='notes')return typeof coachNotesFAU==='function'?coachNotesFAU(p):'<div class="card"><div class="empty">Coach notes are available when entered.</div></div>';
    return typeof overviewFAU==='function'?overviewFAU(p):'';
  };
})();
