/* Week 3 v8: restore the same page renderers/data flow used for Mississippi State and UAB */
(() => {
  const isW3=()=>typeof prepWeek!=='undefined'&&prepWeek==='W3';
  const FORM_MAP={
    'TREY - OPEN':'TREY Y OFF','SLOT - PRO':'DUO Y OFF','TRIPS - CLOSED':'TRIPS','TREY - CLOSED':'KING U OFF',
    'TRIPS - OPEN':'TRIPS - OPEN','PRO - PRO':'ACE YU OFF','SLOT - SLOT':'DOUBLES','TRIPS - SLOT':'TRIPS - SLOT',
    'SLOT - WING':'SLOT - WING','TOAD WING - OPEN':'TREY U HIP','PRO - OPEN':'PRO - OPEN','SLOT - CLOSED':'PRO',
    'SLOT - OPEN':'SLOT - OPEN','QUAY - NIX':'TREY Y OFF','QUAY - OPEN':'TREY Y OFF','PRO - WING':'PRO - WING',
    'QUADS WING - NIX':'QUADS WING - NIX','TREY - SLOT':'EMPTY 3x2 Y OFF','TREY - PRO':'ACE YU OFF',
    'PRO - CLOSED':'KING U OFF B HIP','QUADS - OPEN':'EMPTY 4x1 Y OFF','TOAD WING - SLOT':'EMPTY 4x1 T STING',
    'TOAD WING - PRO':'TOAD WING - PRO','TOAD WING - CLOSED':'TOAD WING - CLOSED','TRIPS - WING':'TRIPS - WING',
    'TRIPS - PRO':'TRIPS - PRO','CLOSED - CLOSED':'CLOSED - CLOSED','OPEN - OPEN':'OPEN - OPEN','OPEN - CLOSED':'OPEN - CLOSED',
    'WING - CLOSED':'WING - CLOSED','WING - OPEN':'WING - OPEN','WING - NIX':'WING - NIX','TANK WING - OPEN':'TANK WING - OPEN','OTHER':'OTHER'
  };
  const first=(r,keys)=>{for(const k of keys){const v=r?.[k];if(v!==undefined&&v!==null&&String(v).trim()!=='')return String(v).trim()}return''};
  const scoutForm=r=>{const raw=first(r,['pff_OFFENSIVE_FORMATION_NAME','pff_STARTING_OFFENSIVE_FORMATION_NAME','pff_OFFFORMATIONNAME','pff_OFFFORMATIONGROUP']);return FORM_MAP[raw.toUpperCase()]||raw||'Unknown'};
  const rbBackfield=r=>first(r,['pff_BACKSET','pff_RBALIGNMENT','pff_RBDEPTH','pff_RBSINBACKFIELD'])||'Unknown';
  const yLoc=r=>first(r,['pff_TEALIGNMENT','pff_TES','pff_YALIGNMENT'])||'Unknown';
  const motion=r=>first(r,['pff_MOTION','pff_MOTIONTYPE','pff_SHIFTMOTION','pff_PRE_SNAP_MOTION'])||'None';
  const passConcept=r=>first(r,['pff_PASSCONCEPT','pff_PASS_CONCEPT','pff_PASSPATTERNBASIC','pff_PASSROUTETARGETGROUP','pff_ROUTE_THROWN'])||'Unknown';
  const playType=r=>first(r,['pff_PLAYTYPE','pff_DROPBACKTYPE','pff_DROPBACK_TYPE'])||((String(r?.pff_RPO||'')==='1')?'RPO':'Dropback');
  const protection=r=>first(r,['pff_PROTECTION','pff_PASSBLOCKINGSCHEME','pff_PASS_PROTECTION','pff_PROTECTIONSCHEME'])||'Unknown';

  function buildW3Hybrid(){
    if(!isW3())return;
    ulmPlayMap=new WeakMap();
    const rows=rawPlayRows?.length?rawPlayRows:(datasets.plays||[]);
    let mapped=0;
    rows.forEach(r=>{
      const u={
        'Formation':scoutForm(r),
        'Personnel':first(r,['pff_OFFPERSONNELBASIC','pff_OFF_PERSONNEL_GROUP'])||'Unknown',
        'Backfield':rbBackfield(r),
        'Form Var':first(r,['pff_OFFENSIVE_FORMATION_NAME','pff_STARTING_OFFENSIVE_FORMATION_NAME'])||'',
        'Motion':motion(r),
        'Y Location':yLoc(r),
        'TE':first(r,['pff_TES','pff_TEALIGNMENT'])||'',
        'Pass Concept':passConcept(r),
        'Run Concept':first(r,['pff_RUNCONCEPTPRIMARY','pff_RUNCONCEPTSECONDARY'])||'',
        'Play Type':playType(r),
        'Proctection':protection(r),
        'Protection':protection(r),
        'Coverage':first(r,['pff_PASS_COVERAGE_BASIC','pff_PASSCOVERAGEBASIC'])||''
      };
      ulmPlayMap.set(r,u);mapped++;
    });
    ulmHybridReady=mapped>0;ulmHybridMatchRate=mapped/Math.max(1,rows.length);
    if(typeof loadState==='object')loadState.ulmHybrid={ok:ulmHybridReady,n:mapped,error:''};
  }

  // Wrap the Week 3 loader so the same downstream functions used in Weeks 1/2 receive a hybrid row for every PFF play.
  const priorLoad=typeof loadOpponentData==='function'?loadOpponentData:null;
  if(priorLoad)loadOpponentData=async function(){const out=await priorLoad.apply(this,arguments);if(isW3()){buildW3Hybrid();if(typeof applyAnalysisMode==='function')applyAnalysisMode();if(typeof render==='function')render()}return out};

  // Exact Personnel & Formations flow from the prior two weeks.
  const oldPersonnel=typeof personnelPage==='function'?personnelPage:null;
  personnelPage=function(){
    if(!isW3())return oldPersonnel?oldPersonnel():'';
    let pers=datasets.personnel||[],forms=datasets.formations||[],
      hdr=freqMode==='raw'?['Personnel','Frequency','Run','Pass','RPO','Tempo']:['Personnel','Frequency','Run %','Pass %','RPO %','Tempo %'],
      fhdr=freqMode==='raw'?['Formation','Frequency','Run','Pass','RPO','Tempo']:['Formation','Frequency','Run %','Pass %','RPO %','Tempo %'];
    let head=`<div class="page-title"><h2>Personnel & Formations</h2><p>${activeOpponentName()} structure using the same defensive breakdown flow as Weeks 1 and 2, with PFF summaries retained below.</p></div>${dataStatus()}<div class="card"><div class="section-head"><div><h3>Frequency View</h3><small>RAW changes frequency/tendency fields to counts. % changes them back to percentages.</small></div>${freqToggle()}</div></div>`;
    let ulm=`<div class="card"><div class="section-head"><div><h3>Defensive Formation Language</h3><small>Week 3 PFF structure translated into the same defensive scouting terminology used in the prior two weeks.</small></div><span class="live-pill">MATCHED ${fmt(100*ulmHybridMatchRate,1)}%</span></div></div><div class="two"><div class="card"><h3>Formation</h3>${ulmLanguageTable('Formation','Formation')}</div><div class="card"><h3>Personnel</h3>${ulmLanguageTable('Personnel','Personnel')}</div></div><div class="two"><div class="card"><h3>Backfield</h3>${ulmLanguageTable('Backfield','Backfield')}</div><div class="card"><h3>Formation Variation</h3>${ulmLanguageTable('Form Var','Variation')}</div></div><div class="two"><div class="card"><h3>Motion</h3>${ulmLanguageTable('Motion','Motion')}</div><div class="card"><h3>Y Location</h3>${ulmLanguageTable('Y Location','Y Location')}</div></div>`;
    let legacy=`<div class="card"><h3>PFF Reference</h3><div class="subtle">Original PFF personnel and formation-group summaries retained for reference.</div></div><div class="two"><div class="card"><h3>PFF Personnel</h3>${table(hdr,pers.map(r=>[esc(r['O PERS']),freqVal(r.OFF,r['OFF%'],'plays'),countPctVal(r.OFF,r['RUN%']),countPctVal(r.OFF,r['PASS%']),countPctVal(r.OFF,r['RPO%']),countPctVal(r.OFF,r['TEMPO%'])]))}</div><div class="card"><h3>PFF Formation Groups</h3>${table(fhdr,forms.map(r=>[esc(r['Final Formation Group']),freqVal(r.OFF,r['OFF%'],'plays'),countPctVal(r.OFF,r['RUN%']),countPctVal(r.OFF,r['PASS%']),countPctVal(r.OFF,r['RPO%']),countPctVal(r.OFF,r['TEMPO%'])]))}</div></div>`;
    return head+ulm+topFormationDefenseCharts()+legacy;
  };

  // Restore the exact prior-week Run Game explorer instead of the simplified Week 3 version.
  const oldRunVisualizer=typeof runVisualizer==='function'?runVisualizer:null;
  runVisualizer=function(){
    if(!isW3())return oldRunVisualizer?oldRunVisualizer():'';
    let allRuns=(datasets.plays||[]).filter(r=>String(r.pff_RUNPASS||'').toUpperCase()==='R');
    let concepts=['ALL',...(datasets.runConcepts||[]).map(r=>r.RC).filter(Boolean)];
    let personnel=['ALL',...[...new Set(allRuns.map(r=>String(r.pff_OFFPERSONNELBASIC||r.pff_OFF_PERSONNEL_GROUP||'')).filter(Boolean))].sort()];
    let forms=['ALL',...ulmOptions('Formation',allRuns)],backfields=['ALL',...ulmOptions('Backfield',allRuns)],motions=['ALL',...ulmOptions('Motion',allRuns)];
    let current=concepts.includes(runConceptFocus)?runConceptFocus:'ALL', selected=selectedRunRows(current), total=selected.length;
    let gains=selected.map(r=>num(r.pff_GAINLOSSNET||r.pff_GAINLOSS)),gaps=gapPlayStats(current),hashes=hashRunStats(current),rb=rbSideStats(current);
    let gapOrder=[['RE','Def Left D'],['RT','Def Left C'],['RG','Def Left B'],['MR','Def Left A'],['ML','Def Right A'],['LG','Def Right B'],['LT','Def Right C'],['LE','Def Right D']];
    let primary=gapOrder.map(([k,l])=>[k,l,gaps[k]]).sort((a,b)=>b[2].n-a[2].n)[0];
    return `<div class="card"><div class="section-head"><div><h3>Run Game Explorer</h3></div>${freqToggle()}</div><div class="run-filter-bar"><label>Concept<select onchange="setRunFilter('concept',this.value)">${concepts.map(v=>`<option value="${esc(v)}" ${v===current?'selected':''}>${esc(v==='ALL'?'All Concepts':v)}</option>`).join('')}</select></label><label>Hash<select onchange="setRunFilter('hash',this.value)">${[['ALL','All Hashes'],['R','Def Left Hash'],['C','Middle'],['L','Def Right Hash']].map(([v,l])=>`<option value="${v}" ${runHashF===v?'selected':''}>${l}</option>`).join('')}</select></label><label>RB Side<select onchange="setRunFilter('rb',this.value)">${[['ALL','All RB Alignments'],['LEFT','Def RB Left'],['RIGHT','Def RB Right'],['CENTER','Pistol / Center'],['SPLIT','Split Backs'],['UNKNOWN','Unknown']].map(([v,l])=>`<option value="${v}" ${runRBSideF===v?'selected':''}>${l}</option>`).join('')}</select></label><label>Personnel<select onchange="setRunFilter('personnel',this.value)">${personnel.map(v=>`<option value="${esc(v)}" ${runPersonnelF===v?'selected':''}>${v==='ALL'?'All Personnel':v}</option>`).join('')}</select></label><label>Backfield<select onchange="setRunFilter('backfield',this.value)">${backfields.map(v=>`<option value="${esc(v)}" ${runBackfieldF===v?'selected':''}>${v==='ALL'?'All Backfields':v}</option>`).join('')}</select></label><label>Motion<select onchange="setRunFilter('motion',this.value)">${motions.map(v=>`<option value="${esc(v)}" ${runMotionF===v?'selected':''}>${v==='ALL'?'All Motion':v}</option>`).join('')}</select></label>${dndSelect()}<div class="run-filter-actions"><button onclick="resetRunFilters()">Reset Run Filters</button></div></div><div class="kpis"><div class="kpi"><span>Filtered Runs</span><b>${total}</b><small>current view</small></div><div class="kpi"><span>YPP</span><b>${fmt(avg(gains),2)}</b><small>filtered plays</small></div><div class="kpi"><span>Median</span><b>${fmt(calcMedian(gains),1)}</b><small>yards</small></div><div class="kpi"><span>Explosives</span><b>${freqMode==='raw'?gains.filter(x=>x>=15).length:pct(100*gains.filter(x=>x>=15).length/Math.max(1,total))}</b></div><div class="kpi"><span>Negative Plays</span><b>${freqMode==='raw'?gains.filter(x=>x<=0).length:pct(100*gains.filter(x=>x<=0).length/Math.max(1,total))}</b></div></div><div class="filter-result-note">${esc(current==='ALL'?'All concepts':current)} · ${runHashF==='ALL'?'all hashes':hashLabel(runHashF)} · ${runRBSideF==='ALL'?'all RB alignments':defRbLabel(runRBSideF)} · ${runPersonnelF==='ALL'?'all personnel':runPersonnelF} · ${runFormationF==='ALL'?'all defensive formations':runFormationF}</div><div class="formation-chart-control"><label>Formation<select onchange="setRunFilter('formation',this.value)">${forms.map(v=>`<option value="${esc(v)}" ${runFormationF===v?'selected':''}>${v==='ALL'?'All Formations':v}</option>`).join('')}</select></label></div>${filteredRunDiagram(selected,gaps,total)}${runSecondFormationVisual(selected,total)}<div class="gap-strip">${gapOrder.map(([k,label])=>{let x=gaps[k],share=100*x.n/Math.max(1,total),hot=primary&&primary[0]===k;return `<div class="gap-box ${hot?'hot':''}"><div class="gap-name">${label}</div><div class="gap-count">${freqMode==='raw'?x.n:pct(share)}</div><div class="gap-ypp2">${x.n?fmt(x.ypp,2):'—'} YPP</div><div class="subtle">${x.n?`${fmt(x.med,1)} median`:''}</div></div>`}).join('')}</div><div class="run-context-grid">${contextTable('Run Origin by Hash',[['Def Left Hash',hashes.R],['Middle',hashes.C],['Def Right Hash',hashes.L],['Unknown',hashes.UNK]],total)}${contextTable('RB Alignment to QB',[['Def RB Left',rb.RIGHT],['Def RB Right',rb.LEFT],['Pistol / Center',rb.CENTER],['Split Backs',rb.SPLIT],['Unknown',rb.UNKNOWN]],total)}</div>${runSurfacePanel(selected,total)}</div>`;
  };
  const oldRunPage=typeof runPage==='function'?runPage:null;
  runPage=function(){if(!isW3())return oldRunPage?oldRunPage():'';try{return runPageInner()}catch(err){console.error(err);return `<div class="page-title"><h2>Run Game</h2></div>${dataStatus()}<div class="card error-card">${esc(err?.message||String(err))}</div>`}};

  // Restore the full Week 1/2 Pass Game flow: PFF route table, dropback table, defensive-language splits, and both formation YPP charts.
  const oldPass=typeof passPage==='function'?passPage:null;
  passPage=function(){if(!isW3())return oldPass?oldPass():'';let routes=datasets.routes||[],db=datasets.dropbacks||[];let base=`<div class="page-title"><h2>Pass Game</h2><p>Route results and dropback-type production.</p></div>${dataStatus()}<div class="card"><h3>Routes / Concepts</h3>${table(['Route','Off %','ATT','COMP%','Yards','YPA','TD','INT','BTT','TWP'],routes.map(r=>[esc(r.ROUTE),r['OFF%'],r.ATT,r['COMP%'],r['PASS YDS'],r['PASS YPA'],r['PASS TD'],r.INT,r.BTT,r.TWP]))}</div><div class="card"><h3>Dropback Type</h3>${table(['Type','Off %','DB','ATT','COMP%','YPA','TD','INT','Sacks','Scrambles'],db.map(r=>[esc(r['Dropback Type']),r['OFF%'],r.DB,r.ATT,r['COMP%'],r['PASS YPA'],r['PASS TD'],r.INT,r.SK,r.SCR]))}</div>`;let passRows=(datasets.plays||[]).filter(r=>r.pff_RUNPASS==='P');return base+`<div class="card"><div class="section-head"><div><h3>Pass Language</h3><small>Same supplemental breakdown flow used in Weeks 1 and 2.</small></div>${freqToggle()}</div></div><div class="two"><div class="card"><h3>Pass Concept</h3>${ulmLanguageTable('Pass Concept','Pass Concept',passRows)}</div><div class="card"><h3>Play Type</h3>${ulmLanguageTable('Play Type','Play Type',passRows)}</div></div><div class="two"><div class="card"><h3>Protection</h3>${ulmLanguageTable('Proctection','Protection',passRows)}</div><div class="card"><h3>Backfield</h3>${ulmLanguageTable('Backfield','Backfield',passRows)}</div></div>${passGameFormationYPPCharts()}`};

  // Restore the full prior-week Pressure Response flow, including PFF quarterback pressure splits.
  const oldPressure=typeof pressurePage==='function'?pressurePage:null;
  pressurePage=function(){if(!isW3())return oldPressure?oldPressure():'';let prs=datasets.pressure||[],plays=(datasets.plays||[]).filter(r=>r.pff_RUNPASS==='P'),g={Blitz:[],NoBlitz:[]};plays.forEach(r=>(String(r.pff_BLITZDOG)==='1'?g.Blitz:g.NoBlitz).push(r));return `<div class="page-title"><h2>Pressure Response</h2><p>Blitz and pressure response, including quarterback splits.</p></div>${dataStatus()}<div class="card"><div class="section-head"><h3>Play Feed: Blitz vs No Blitz</h3>${freqToggle()}</div>${table(freqMode==='raw'?['Look','Pass Plays','YPP','Explosives','Negative','Sacks']:['Look','Pass Plays','YPP','Expl %','Neg %','Sacks'],Object.entries(g).map(([k,a])=>{let m=playMetrics(a),s=a.filter(r=>r.pff_PASSRESULT==='SACK').length,e=a.filter(r=>num(r.pff_GAINLOSSNET||r.pff_GAINLOSS)>=15).length,nn=a.filter(r=>num(r.pff_GAINLOSSNET||r.pff_GAINLOSS)<=0).length;return freqMode==='raw'?[k,a.length,fmt(m.ypp,2),e,nn,s]:[k,a.length,fmt(m.ypp,2),pct(100*e/Math.max(1,a.length)),pct(100*nn/Math.max(1,a.length)),s]}))}</div><div class="card"><h3>PFF QB Pressure Splits</h3>${table(['QB','Pressure Look','DB','ATT','COMP%','YPA','TD','INT','BTT','TWP','SCR'],prs.map(r=>[esc(r.Name),esc(r['PRESS PLAY']),r.DB,r.ATT,r['COMP%'],r['PASS YPA'],r['PASS TD'],r.INT,r.BTT,r.TWP,r.SCR]))}</div>`};

  // Heat Maps, Coverage Response, Situations and Rush Count were already the original Week 1/2 renderers; leave them untouched.
  setTimeout(()=>{if(isW3()){buildW3Hybrid();if(typeof render==='function')render()}},1200);
})();
