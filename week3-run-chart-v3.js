/* Week 3 Southeastern run-chart correction: one formation structure chart, defensive terminology, TE/H + RB alignment */
(() => {
  const isW3=()=>typeof prepWeek!=='undefined'&&prepWeek==='W3';
  const oldRunVisualizer=typeof runVisualizer==='function'?runVisualizer:null;

  const css=`
  .sle-one-structure{margin-top:12px}
  .sle-one-structure .surface-structure-stat{padding:0;overflow:hidden}
  .sle-one-structure .sle-structure-summary{padding:10px 12px 7px}
  .sle-one-structure .sle-structure-summary small{display:block;color:#8fa4b6;font-size:8px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
  .sle-one-structure .sle-structure-summary b{display:block;color:#f3f7fb;font-size:15px;margin-top:2px}
  .sle-one-structure .sle-structure-summary span{display:block;color:#9fb0bf;font-size:10px;margin-top:2px}
  `;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

  function formationName(r){return String(r?.pff_OFFENSIVE_FORMATION_NAME||r?.pff_STARTING_OFFENSIVE_FORMATION_NAME||r?.pff_OFFFORMATIONGROUP||'').trim()}
  function dominant(rows,getter){let g={};(rows||[]).forEach(r=>{let v=String(getter(r)||'').trim();if(v)g[v]=(g[v]||0)+1});let e=Object.entries(g).sort((a,b)=>b[1]-a[1])[0];return e?e[0]:''}
  function selectedW3Runs(concept,formationOverride){
    return (datasets.plays||[]).filter(r=>{
      if(String(r.pff_RUNPASS||'').toUpperCase()!=='R')return false;
      if(!runConceptMatch(r,concept))return false;
      if(runHashF!=='ALL'&&normHash(r.pff_HASH)!==runHashF)return false;
      if(runRBSideF!=='ALL'&&rbSideFromRow(r)!==defRbToOffenseSide(runRBSideF))return false;
      if(runPersonnelF!=='ALL'&&personnelValue(r)!==runPersonnelF)return false;
      let f=formationOverride===undefined?runFormationF:formationOverride;
      if(f&&f!=='ALL'&&formationName(r)!==f)return false;
      if(!dndMatches(r))return false;
      return true;
    });
  }
  function gapStats(rows){
    let keys=['LE','LT','LG','ML','MR','RG','RT','RE'],o=Object.fromEntries(keys.map(k=>[k,{n:0,y:0,vals:[]} ]));
    (rows||[]).forEach(r=>{let k=normalizePOA(r.pff_POAACTUAL);if(!k||!o[k])return;let g=num(r.pff_GAINLOSSNET||r.pff_GAINLOSS);o[k].n++;o[k].y+=g;o[k].vals.push(g)});
    Object.values(o).forEach(x=>{x.ypp=x.n?x.y/x.n:0;x.med=x.n?calcMedian(x.vals):0});return o;
  }
  function hashStats(rows){let o={L:{n:0,y:0},C:{n:0,y:0},R:{n:0,y:0},UNK:{n:0,y:0}};(rows||[]).forEach(r=>{let k=normHash(r.pff_HASH),g=num(r.pff_GAINLOSSNET||r.pff_GAINLOSS);o[k].n++;o[k].y+=g});Object.values(o).forEach(x=>x.ypp=x.n?x.y/x.n:0);return o}
  function rbStats(rows){let o={LEFT:{n:0,y:0},RIGHT:{n:0,y:0},CENTER:{n:0,y:0},SPLIT:{n:0,y:0},UNKNOWN:{n:0,y:0}};(rows||[]).forEach(r=>{let k=rbSideFromRow(r),g=num(r.pff_GAINLOSSNET||r.pff_GAINLOSS);o[k].n++;o[k].y+=g});Object.values(o).forEach(x=>x.ypp=x.n?x.y/x.n:0);return o}

  const defGaps=[
    ['RE','Def Left D',70],['RT','Def Left C',145],['RG','Def Left B',220],['MR','Def Left A',295],
    ['ML','Def Right A',405],['LG','Def Right B',480],['LT','Def Right C',555],['LE','Def Right D',630]
  ];
  function parseFormationTokens(row){return String(row?.pff_OFFFORMATION||'').split(';').map(x=>x.trim()).filter(Boolean)}
  function defXForOffSide(side,inner=false,outer=false){
    side=String(side||'').toUpperCase();
    if(side==='R')return outer?145:inner?185:195; // offense right = defense left
    if(side==='L')return outer?555:inner?515:505; // offense left = defense right
    return 350;
  }
  function exactStructurePlayers(rows){
    let exact=dominant(rows,r=>r.pff_OFFFORMATION),rep=(rows||[]).find(r=>String(r.pff_OFFFORMATION||'').trim()===exact)||rows?.[0]||{};
    let toks=parseFormationTokens(rep),out=[];
    toks.forEach(t=>{
      let u=t.toUpperCase();
      if(/^TE-/.test(u)){
        let side=/-[^;]*L/.test(u)?'L':/-[^;]*R/.test(u)?'R':'';
        let inner=/-I[LR]/.test(u),outer=/-O[LR]/.test(u),on=/\^/.test(u);
        out.push({label:'TE',x:defXForOffSide(side,inner,outer),y:on?132:108,sub:on?'ON':'OFF'});
      }
      if(/^FB-/.test(u)||/^H-/.test(u)||/HBACK/.test(u)){
        let side=u.includes('-L')?'L':u.includes('-R')?'R':'';
        out.push({label:'H',x:defXForOffSide(side),y:78,sub:'BACK'});
      }
    });
    return {rep,players:out};
  }
  function rbMarkers(rep){
    let s=String(rep?.pff_RBALIGNMENT||rep?.pff_RBSINBACKFIELD||rep?.pff_BACKSET||'').toUpperCase();
    let hasL=/HB-L|\(HB-L\)/.test(s),hasR=/HB-R|\(HB-R\)/.test(s),center=!hasL&&!hasR&&(/\bHB\b|PISTOL/.test(s));
    let mk=(x,label)=>`<g><circle cx="${x}" cy="50" r="17" fill="#d3a83d" stroke="#0b1620" stroke-width="3"/><text x="${x}" y="54" text-anchor="middle" fill="#53260c" font-size="10" font-weight="950">${label}</text></g>`;
    if(hasL&&hasR)return mk(395,'RB')+mk(305,'RB');
    if(hasR)return mk(305,'RB'); // offense right = Def RB Left
    if(hasL)return mk(395,'RB'); // offense left = Def RB Right
    if(center)return mk(350,'RB');
    return mk(350,'RB');
  }
  function structureSVG(rows,gaps,form){
    if(!rows?.length)return '<div class="empty">No run plays match this formation.</div>';
    let {rep,players}=exactStructurePlayers(rows),maxN=Math.max(1,...defGaps.map(([k])=>gaps[k]?.n||0));
    let arrows=defGaps.map(([k,label,x])=>{let st=gaps[k]||{n:0,ypp:0},ratio=st.n/maxN,w=4+20*ratio,op=.18+.72*ratio;return `<g><path d="M 350 83 Q ${(350+x)/2} 118 ${x} 171" fill="none" stroke="rgba(255,198,96,${op.toFixed(2)})" stroke-width="${w.toFixed(1)}" stroke-linecap="round"/><circle cx="${x}" cy="171" r="${(10+13*ratio).toFixed(1)}" fill="rgba(127,17,40,${(.28+.65*ratio).toFixed(2)})" stroke="rgba(255,255,255,.3)" stroke-width="2"/><text x="${x}" y="168" text-anchor="middle" fill="#fff" font-size="12" font-weight="950">${st.n||0}</text><text x="${x}" y="184" text-anchor="middle" fill="#fff2c8" font-size="8" font-weight="900">${st.n?fmt(st.ypp,1)+' YPP':'—'}</text><text x="${x}" y="210" text-anchor="middle" fill="#ffe9a8" font-size="8" font-weight="900">${esc(label)}</text></g>`}).join('');
    let roles=players.map(p=>`<g><circle cx="${p.x}" cy="${p.y}" r="17" fill="${p.label==='H'?'#8a2432':'#173d5f'}" stroke="#fff" stroke-width="2.5"/><text x="${p.x}" y="${p.y-1}" text-anchor="middle" fill="#fff" font-size="10" font-weight="950">${p.label}</text><text x="${p.x}" y="${p.y+10}" text-anchor="middle" fill="#fff5cf" font-size="7" font-weight="900">${p.sub}</text></g>`).join('');
    let back=String(rep?.pff_BACKSET||'').trim(),rbAlign=String(rep?.pff_RBALIGNMENT||'').trim(),pers=String(rep?.pff_OFFPERSONNELBASIC||'').trim();
    return `<svg viewBox="0 0 700 235" width="100%" height="235" role="img" aria-label="${esc(form)} TE H and RB structure">
      <text x="350" y="17" text-anchor="middle" fill="#fff2c8" font-size="9" font-weight="900">DEFENSIVE VIEW · TE / H + RB ALIGNMENT</text>
      <text x="95" y="32" text-anchor="middle" fill="#9fb0bf" font-size="8" font-weight="900">DEF LEFT</text><text x="605" y="32" text-anchor="middle" fill="#9fb0bf" font-size="8" font-weight="900">DEF RIGHT</text>
      <line x1="35" y1="145" x2="665" y2="145" stroke="#e5f4e8" stroke-width="3" stroke-dasharray="10 8"/><text x="44" y="138" fill="#e5f4e8" font-size="9" font-weight="900">LOS</text>
      <circle cx="245" cy="132" r="11" fill="#f3f5f7"/><circle cx="290" cy="132" r="11" fill="#f3f5f7"/><circle cx="335" cy="132" r="11" fill="#f3f5f7"/><circle cx="380" cy="132" r="11" fill="#f3f5f7"/><circle cx="425" cy="132" r="11" fill="#f3f5f7"/>
      <g><circle cx="350" cy="92" r="17" fill="#7f1128" stroke="#fff" stroke-width="2.5"/><text x="350" y="96" text-anchor="middle" fill="#fff" font-size="10" font-weight="950">QB</text></g>
      ${rbMarkers(rep)}${roles}${arrows}
      <text x="350" y="229" text-anchor="middle" fill="#9fb0bf" font-size="8" font-weight="850">${esc(pers?pers+' personnel':'')}${back?` · ${esc(back)}`:''}${rbAlign?` · RB ${esc(rbAlign)}`:''}</text>
    </svg>`;
  }
  function secondChart(selected,total){
    if(!selected?.length)return '';
    let form=runFormationF&&runFormationF!=='ALL'?runFormationF:dominant(selected,formationName);
    if(!form)return '';
    let fr=selected.filter(r=>formationName(r)===form);if(!fr.length)fr=selected;
    let gaps=gapStats(fr),vals=fr.map(r=>num(r.pff_GAINLOSSNET||r.pff_GAINLOSS));
    let back=dominant(fr,r=>r.pff_BACKSET||r.pff_RBALIGNMENT),te=dominant(fr,r=>r.pff_TEALIGNMENT),pers=dominant(fr,r=>r.pff_OFFPERSONNELBASIC);
    return `<div class="surface-structure-wrap sle-one-structure"><div class="surface-structure-head"><div><h3>TE / H Structure + Run Distribution</h3><div class="subtle">${runFormationF==='ALL'?'Showing the most-used formation in the current filtered run sample.':'Showing the selected formation.'} Same defensive left/right terminology used in the primary run chart.</div></div></div><div class="surface-structure-stat"><div class="sle-structure-summary"><small>FORMATION + PERSONNEL</small><b>${esc(form)}${pers?` · ${esc(pers)}P`:''}</b><span>${fr.length} plays · ${fmt(avg(vals),2)} YPP · ${fmt(calcMedian(vals),1)} median${back?` · ${esc(back)}`:''}${te?` · TE ${esc(te)}`:''}</span></div><div class="surface-structure-visual" style="border-radius:0;border-left:0;border-right:0;border-bottom:0">${structureSVG(fr,gaps,form)}</div></div></div>`;
  }

  runVisualizer=function(){
    if(!isW3())return oldRunVisualizer?oldRunVisualizer():'';
    let allRuns=(datasets.plays||[]).filter(r=>String(r.pff_RUNPASS||'').toUpperCase()==='R');
    let concepts=['ALL',...(datasets.runConcepts||[]).map(r=>r.RC).filter(Boolean)];
    let personnel=['ALL',...structurePersonnelOptions(allRuns).map(x=>x.p)];
    let forms=['ALL',...[...new Set(allRuns.map(formationName).filter(Boolean))].sort()];
    if(!forms.includes(runFormationF))runFormationF='ALL';
    let current=concepts.includes(runConceptFocus)?runConceptFocus:'ALL',selected=selectedW3Runs(current),total=selected.length;
    let gains=selected.map(r=>num(r.pff_GAINLOSSNET||r.pff_GAINLOSS)),gaps=gapStats(selected),hashes=hashStats(selected),rb=rbStats(selected);
    let primary=defGaps.map(([k,l])=>[k,l,gaps[k]]).sort((a,b)=>b[2].n-a[2].n)[0];
    return `<div class="card"><div class="section-head"><div><h3>Run Game Explorer</h3></div>${freqToggle()}</div>
      <div class="run-filter-bar">
        <label>Concept<select onchange="setRunFilter('concept',this.value)">${concepts.map(v=>`<option value="${esc(v)}" ${v===current?'selected':''}>${esc(v==='ALL'?'All Concepts':v)}</option>`).join('')}</select></label>
        <label>Hash<select onchange="setRunFilter('hash',this.value)">${[['ALL','All Hashes'],['R','Def Left Hash'],['C','Middle'],['L','Def Right Hash']].map(([v,l])=>`<option value="${v}" ${runHashF===v?'selected':''}>${l}</option>`).join('')}</select></label>
        <label>RB Side<select onchange="setRunFilter('rb',this.value)">${[['ALL','All RB Alignments'],['LEFT','Def RB Left'],['RIGHT','Def RB Right'],['CENTER','Pistol / Center'],['SPLIT','Split Backs'],['UNKNOWN','Unknown']].map(([v,l])=>`<option value="${v}" ${runRBSideF===v?'selected':''}>${l}</option>`).join('')}</select></label>
        <label>Personnel<select onchange="setRunFilter('personnel',this.value)">${personnel.map(v=>`<option value="${esc(v)}" ${runPersonnelF===v?'selected':''}>${v==='ALL'?'All Personnel':v}</option>`).join('')}</select></label>
        ${dndSelect()}<div class="run-filter-actions"><button onclick="resetRunFilters()">Reset Run Filters</button></div>
      </div>
      <div class="kpis"><div class="kpi"><span>Filtered Runs</span><b>${total}</b><small>current view</small></div><div class="kpi"><span>YPP</span><b>${fmt(avg(gains),2)}</b><small>filtered plays</small></div><div class="kpi"><span>Median</span><b>${fmt(calcMedian(gains),1)}</b><small>yards</small></div><div class="kpi"><span>Explosives</span><b>${freqMode==='raw'?gains.filter(x=>x>=15).length:pct(100*gains.filter(x=>x>=15).length/Math.max(1,total))}</b><small>${freqMode==='raw'?pct(100*gains.filter(x=>x>=15).length/Math.max(1,total)):`${gains.filter(x=>x>=15).length} plays`}</small></div><div class="kpi"><span>Negative Plays</span><b>${freqMode==='raw'?gains.filter(x=>x<=0).length:pct(100*gains.filter(x=>x<=0).length/Math.max(1,total))}</b><small>${freqMode==='raw'?pct(100*gains.filter(x=>x<=0).length/Math.max(1,total)):`${gains.filter(x=>x<=0).length} plays`}</small></div></div>
      <div class="filter-result-note">${esc(current==='ALL'?'All concepts':current)} · ${runHashF==='ALL'?'all hashes':hashLabel(runHashF)} · ${runRBSideF==='ALL'?'all RB alignments':defRbLabel(runRBSideF)} · ${runPersonnelF==='ALL'?'all personnel':runPersonnelF} · ${runFormationF==='ALL'?'all formations':runFormationF}</div>
      <div class="formation-chart-control"><label>Formation<select onchange="setRunFilter('formation',this.value)">${forms.map(v=>`<option value="${esc(v)}" ${runFormationF===v?'selected':''}>${v==='ALL'?'All Formations':esc(v)}</option>`).join('')}</select></label></div>
      ${filteredRunDiagram(selected,gaps,total)}
      ${secondChart(selected,total)}
      <div class="gap-strip">${defGaps.map(([k,label])=>{let x=gaps[k],share=100*x.n/Math.max(1,total),hot=primary&&primary[0]===k;return `<div class="gap-box ${hot?'hot':''}"><div class="gap-name">${label}</div><div class="gap-count">${freqMode==='raw'?x.n:pct(share)}</div><div class="gap-ypp2">${x.n?fmt(x.ypp,2):'—'} YPP</div><div class="subtle">${x.n?`${fmt(x.med,1)} median`:''}</div></div>`}).join('')}</div>
      <div class="run-context-grid">${contextTable('Run Origin by Hash',[['Def Left Hash',hashes.R],['Middle',hashes.C],['Def Right Hash',hashes.L],['Unknown',hashes.UNK]],total)}${contextTable('RB Alignment to QB',[['Def RB Left',rb.RIGHT],['Def RB Right',rb.LEFT],['Pistol / Center',rb.CENTER],['Split Backs',rb.SPLIT],['Unknown',rb.UNKNOWN]],total)}</div>
      ${runSurfacePanel(selected,total)}
    </div>`;
  };
})();