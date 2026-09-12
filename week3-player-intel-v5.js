/* Week 3 v5: robust Southeastern player/PFF identity matching and live card stats */
(() => {
  const isW3=()=>typeof prepWeek!=='undefined'&&prepWeek==='W3';
  const clean=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const yr=r=>String(r?.pff_GAMESEASON||r?.pff_GAMEDATE||'').slice(0,4);
  const num0=v=>{const n=parseFloat(String(v??'').replace(/[%,$]/g,''));return Number.isFinite(n)?n:0};
  const jersey=v=>String(v??'').replace(/^0+/,'').replace(/\D/g,'');
  const tokenJerseyW3=t=>{const m=String(t||'').toUpperCase().match(/\bLASE\s+0*(\d{1,2})\b/);return m?String(parseInt(m[1],10)):''};
  const compatible=(p,expected)=>{const pos=normPos(p?.position);if(expected==='QB')return pos==='QB';if(expected==='TARGET')return ['WR','TE','RB'].includes(pos);if(expected==='CARRIER')return ['RB','QB','WR'].includes(pos);return true};

  function exactSummaryRows(p){
    const out=[];
    for(const k of ['qb','receiving','rushing','passBlocking','runBlocking','routes','dropbacks','pressure']){
      for(const r of (datasets?.[k]||[])) if(clean(r?.Name)===clean(p?.name)) out.push(r);
    }
    return out;
  }
  function historicalJersey(p){const row=exactSummaryRows(p)[0];return row?jersey(row['#']):''}
  function rowJerseyForPlayer(r,p){return yr(r)==='2026'?jersey(p?.number):(historicalJersey(p)||jersey(p?.number))}
  function tokenMatchesW3(token,p,expected=''){
    if(!token||!p||!compatible(p,expected))return false;
    if(clean(token)===clean(p.name))return true;
    const tj=tokenJerseyW3(token),pj=rowJerseyForPlayer({pff_GAMESEASON:'2026'},p);
    return !!tj&&!!pj&&tj===pj;
  }
  function rowTokenMatches(r,token,p,expected=''){
    if(!token||!p||!compatible(p,expected))return false;
    if(clean(token)===clean(p.name))return true;
    const tj=tokenJerseyW3(token),pj=rowJerseyForPlayer(r,p);
    return !!tj&&!!pj&&tj===pj;
  }

  const oldFindRow=typeof findPlayerRow==='function'?findPlayerRow:null;
  findPlayerRow=function(key,name){
    if(!isW3())return oldFindRow?oldFindRow(key,name):null;
    const p=typeof name==='object'?name:(roster||[]).find(x=>clean(x.name)===clean(name));
    const rows=datasets?.[key]||[];
    let hit=rows.find(r=>clean(r?.Name)===clean(p?.name||name));
    if(hit)return hit;
    const aliases=[...(p?.aliases||[]),p?.name].filter(Boolean).map(clean);
    hit=rows.find(r=>aliases.includes(clean(r?.Name)));if(hit)return hit;
    const pj=jersey(p?.number);
    if(pj)hit=rows.find(r=>jersey(r?.['#'])===pj && (!r?.POS||normPos(r.POS)===normPos(p?.position)));
    return hit||null;
  };
  const oldFindRows=typeof findPlayerRows==='function'?findPlayerRows:null;
  findPlayerRows=function(key,name){
    if(!isW3())return oldFindRows?oldFindRows(key,name):[];
    const one=findPlayerRow(key,name);return one?[one]:[];
  };

  const oldToken=typeof playerTokenMatch==='function'?playerTokenMatch:null;
  playerTokenMatch=function(token,p,expected=''){
    if(!isW3())return oldToken?oldToken(token,p,expected):false;
    return tokenMatchesW3(token,p,expected);
  };

  const oldPlays=typeof playsForPlayer==='function'?playsForPlayer:null;
  playsForPlayer=function(value){
    if(!isW3())return oldPlays?oldPlays(value):[];
    const p=typeof value==='object'&&value?value:(roster||[]).find(x=>clean(x.name)===clean(value));
    if(!p)return[];
    return (datasets.plays||[]).filter(r=>
      rowTokenMatches(r,r.pff_PASSER,p,'QB')||
      rowTokenMatches(r,r.pff_BALLCARRIER,p,'CARRIER')||
      rowTokenMatches(r,r.pff_PASSRECEIVERTARGET,p,'TARGET')||
      rowTokenMatches(r,r.pff_OFFPLAYERS,p,'')
    );
  };

  function passerRows(p){return (datasets.plays||[]).filter(r=>rowTokenMatches(r,r.pff_PASSER,p,'QB'))}
  function targetRows(p){return (datasets.plays||[]).filter(r=>rowTokenMatches(r,r.pff_PASSRECEIVERTARGET,p,'TARGET'))}
  function carryRows(p){return (datasets.plays||[]).filter(r=>String(r.pff_RUNPASS||'').toUpperCase()==='R'&&rowTokenMatches(r,r.pff_BALLCARRIER,p,'CARRIER'))}
  function offRows(p){return (datasets.plays||[]).filter(r=>rowTokenMatches(r,r.pff_OFFPLAYERS,p,''))}
  function passAttempt(r){return ['COMPLETE','INCOMPLETE','INTERCEPTION','THROWN AWAY','HIT AS THREW','BATTED PASS'].includes(String(r.pff_PASSRESULT||'').toUpperCase())}
  function passTD(r){return String(r.pff_PASSRESULT||'').toUpperCase()==='COMPLETE'&&String(r.pff_TOUCHDOWN||'').trim()!==''}
  function recTD(r){return String(r.pff_PASSRESULT||'').toUpperCase()==='COMPLETE'&&String(r.pff_TOUCHDOWN||'').trim()!==''}
  function fmtn(v,d=1){return Number.isFinite(+v)?(+v).toFixed(d):'—'}

  const oldCard=typeof cardMetricsFAU==='function'?cardMetricsFAU:null;
  cardMetricsFAU=function(p){
    if(!isW3())return oldCard?oldCard(p):[];
    const pos=normPos(p.position);
    if(pos==='QB'){
      const rows=passerRows(p),att=rows.filter(passAttempt).length,comp=rows.filter(r=>String(r.pff_PASSRESULT||'').toUpperCase()==='COMPLETE').length;
      const yds=rows.filter(r=>String(r.pff_PASSRESULT||'').toUpperCase()==='COMPLETE').reduce((s,r)=>s+num0(r.pff_GAINLOSSNET??r.pff_GAINLOSS),0);
      const td=rows.filter(passTD).length,intc=rows.filter(r=>String(r.pff_PASSRESULT||'').toUpperCase()==='INTERCEPTION').length;
      if(rows.length)return [['CMP %',att?fmtn(100*comp/att,1)+'%':'—'],['YDS',Math.round(yds)],['YDS/ATT',att?fmtn(yds/att,1):'—'],['TD',td],['INT',intc],['DB',rows.length]];
      const q=findPlayerRow('qb',p);if(q)return [['CMP %',q['COMP%']],['YDS',q['PASS YDS']],['YDS/ATT',q['PASS YPA']],['TD',q['PASS TD']],['INT',q.INT],['DB',q.DB]];
    }
    if(['WR','TE'].includes(pos)){
      const rows=targetRows(p),rec=rows.filter(r=>String(r.pff_PASSRESULT||'').toUpperCase()==='COMPLETE'),yds=rec.reduce((s,r)=>s+num0(r.pff_GAINLOSSNET??r.pff_GAINLOSS),0),td=rec.filter(recTD).length;
      if(rows.length)return [['TARGETS',rows.length],['REC',rec.length],['YDS',Math.round(yds)],['YPR',rec.length?fmtn(yds/rec.length,1):'—'],['TD',td],['CATCH %',fmtn(100*rec.length/rows.length,1)+'%']];
      const rr=findPlayerRow('receiving',p);if(rr)return [['TARGETS',rr.TGT],['REC',rr.REC],['YDS',rr['REC YDS']],['YPR',rr.YPR],['TD',rr['REC TD']],['YAC',rr.YAC]];
    }
    if(pos==='RB'){
      const cr=carryRows(p),tr=targetRows(p),rec=tr.filter(r=>String(r.pff_PASSRESULT||'').toUpperCase()==='COMPLETE'),rushY=cr.reduce((s,r)=>s+num0(r.pff_GAINLOSSNET??r.pff_GAINLOSS),0),recY=rec.reduce((s,r)=>s+num0(r.pff_GAINLOSSNET??r.pff_GAINLOSS),0);
      if(cr.length||tr.length)return [['CARRIES',cr.length],['RUSH YDS',Math.round(rushY)],['YPC',cr.length?fmtn(rushY/cr.length,1):'—'],['TARGETS',tr.length],['REC YDS',Math.round(recY)],['REC',rec.length]];
      const ru=findPlayerRow('rushing',p);if(ru)return [['CARRIES',ru.ATT],['RUSH YDS',ru['RUSH YDS']],['YPC',ru.YPC],['TD',ru['RUN TD']],['FUM',ru.FUM],['STUFF',ru.STUFF]];
    }
    if(pos==='OL'){
      const pb=findPlayerRow('passBlocking',p),rb=findPlayerRow('runBlocking',p),sn=offRows(p).length;
      if(pb)return [['PBLK',pb.PBLK],['PBLK GRD',pb['PBLK GRD']],['PRESSURES',pb.PR],['SACKS',pb.SK],['HITS',pb.HT],['RBLK GRD',rb?.['RBLK GRD']]];
      if(sn)return [['PLAYS',sn],['NO.',p.number],['GROUP','OL'],['CLASS',p.class||'—']];
    }
    const pl=playsForPlayer(p);return [['PLAYS',pl.length],['NO.',p.number],['GROUP',pos],['CLASS',p.class||'—']];
  };

  const oldNote=typeof playerSeasonSampleNote==='function'?playerSeasonSampleNote:null;
  if(oldNote)playerSeasonSampleNote=function(p){
    if(!isW3())return oldNote(p);
    const n=playsForPlayer(p).length, lab=analysisMode==='current'?'2026':analysisMode==='historical'?'2025':'2025 + 2026';
    return `${n} matched ${lab} Southeastern Louisiana play-feed events`;
  };
})();
