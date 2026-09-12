/* Week 3 Southeastern Louisiana fixes: robust roster photos, depth-chart parsing, run formation + backs visual */
(() => {
  const isW3=()=>typeof prepWeek!=='undefined'&&prepWeek==='W3';
  const SLE_BASE=(typeof SUPABASE_BASE!=='undefined'?SUPABASE_BASE:'https://hzrosmevuejjlxigdxmg.supabase.co/storage/v1/object/public')+'/Defensive%20Intelligence/Opponents/Southeastern%20Louisiana/';
  const SLE_DEPTH_URL=SLE_BASE+'depth-chart.json';
  let sleFixDepth=null;

  const css=`
  .sle-structure-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:10px}
  .sle-structure-card{background:#0d1c29;border:1px solid #263d50;border-radius:12px;padding:10px;min-width:0}
  .sle-structure-title{font-size:12px;font-weight:950;color:#f3c443;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sle-structure-sub{font-size:9px;color:#9fb0bf;margin-top:2px;min-height:26px}
  .sle-mini-field{position:relative;height:120px;margin:8px 0;border-radius:10px;background:linear-gradient(180deg,#0e5a38,#0b4d31);border:1px solid #2c7658;overflow:hidden}
  .sle-los{position:absolute;left:10%;right:10%;top:38%;border-top:2px dashed rgba(255,255,255,.75)}
  .sle-ol{position:absolute;top:32%;width:15px;height:15px;border-radius:50%;background:#e8edf1;border:2px solid rgba(0,0,0,.12);transform:translateX(-50%)}
  .sle-qb{position:absolute;top:52%;left:50%;transform:translate(-50%,-50%);width:25px;height:25px;border-radius:50%;display:grid;place-items:center;background:#d7a522;color:#101820;font-size:8px;font-weight:950;border:2px solid #07131d}
  .sle-rb{position:absolute;top:75%;transform:translate(-50%,-50%);min-width:26px;height:26px;padding:0 5px;border-radius:999px;display:grid;place-items:center;background:#8a2432;color:#fff;font-size:8px;font-weight:950;border:2px solid #f3c443}
  .sle-structure-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
  .sle-structure-metrics div{background:#102332;border:1px solid #233b4e;border-radius:7px;padding:5px;text-align:center}
  .sle-structure-metrics b{display:block;color:#fff;font-size:12px}.sle-structure-metrics span{display:block;color:#8ea3b5;font-size:7px;text-transform:uppercase;font-weight:900}
  @media(max-width:1100px){.sle-structure-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:680px){.sle-structure-grid{grid-template-columns:1fr}}
  `;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  function absUrl(v){
    let s=String(v||'').trim();if(!s)return'';
    if(s.startsWith('//'))return'https:'+s;
    if(s.startsWith('/'))return'https://lionsports.net'+s;
    return s;
  }
  function firstVal(o,keys){for(const k of keys){let v=o?.[k];if(v!==undefined&&v!==null&&String(v).trim()!=='')return v}return''}
  function normalizePlayer(p){
    if(!p||typeof p!=='object')return p;
    const q={...p};
    q.name=firstVal(p,['name','fullName','full_name','player','displayName'])||q.name;
    q.number=String(firstVal(p,['number','jersey','jerseyNumber','jersey_number','#'])||q.number||'').replace(/^#/,'');
    q.position=firstVal(p,['position','pos','positionShort','position_short'])||q.position;
    q.height=firstVal(p,['height','ht'])||q.height;
    q.weight=firstVal(p,['weight','wt'])||q.weight;
    q.class=firstVal(p,['class','year','academicYear','academic_year'])||q.class;
    q.hometown=firstVal(p,['hometown','homeTown','home_town'])||q.hometown;
    q.previousSchool=firstVal(p,['previousSchool','previous_school','prevSchool','school'])||q.previousSchool;
    q.profile=absUrl(firstVal(p,['profile','profileUrl','profile_url','bioUrl','bio_url','url','link'])||q.profile);
    let img=firstVal(p,['image','photo','photoUrl','photo_url','imageUrl','image_url','headshot','headshotUrl','headshot_url','portrait','portraitUrl','portrait_url','officialImageSource']);
    if(!img&&p.media&&typeof p.media==='object')img=firstVal(p.media,['image','photo','headshot','url']);
    q.image=absUrl(img||q.image);
    q.supabaseImageBackup=absUrl(firstVal(p,['supabaseImageBackup','imageBackup','image_backup'])||q.supabaseImageBackup);
    return q;
  }

  const originalPhoto=typeof photo==='function'?photo:null;
  photo=function(p){
    const q=normalizePlayer(p||{});
    const fallback=`<div class="initials">${initials(q.name)}</div>`;
    let primary=String(q.image||'').trim();
    let backup=String(q.supabaseImageBackup||'').trim();
    const profile=String(q.profile||'').trim();
    const resolver=profile?`/api/player-image?url=${encodeURIComponent(profile)}`:'';
    if(!primary)primary=resolver;
    else if(!backup&&resolver)backup=resolver;
    if(!primary)return originalPhoto?originalPhoto(q):fallback;
    return `<img src="${esc(primary)}" alt="${esc(q.name)}" loading="lazy" referrerpolicy="no-referrer" data-backup="${esc(backup)}" onerror="if(this.dataset.backup&&!this.dataset.tried){this.dataset.tried='1';this.src=this.dataset.backup}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div class="initials" style="display:none">${initials(q.name)}</div>`;
  };

  async function fetchFixDepth(){
    try{let r=await fetch(SLE_DEPTH_URL+'?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error(r.status);sleFixDepth=await r.json()}catch(e){console.warn('SLE fix depth fetch',e);sleFixDepth=null}
  }

  const fallbackDepth=[
    ['WR-X',['4','Tristan Goodly','Sr.'],['83','Khai Prean','Sr.']],
    ['LT',['73','Isaiah Hayes','Jr.'],['55','Wesley Sandefur','Fr.']],
    ['LG',['63','Corin Boudreaux','Sr.'],['61','Keidrick Bailey Jr.','Fr.']],
    ['C',['65','Riley Whitten','Sr.'],['70','Grayson Zepp','Fr.']],
    ['RG',['78','Logan Potter','5th'],['71','Willie Williams III','Fr.']],
    ['RT',['75','Zach Corrigan','Fr.'],['68','Aaron McMillian','Sr.']],
    ['TE',['88','Lonnie Shinn','So.'],['85','Adyn Wilkinson','Jr.'],['89','Beau Perez','Jr.']],
    ['FB',['30','Zane Hooper','5th']],
    ['WR-Z',['14','Lawson Dixon','Fr.'],['17','Kentrell Prejean','Sr.']],
    ['QB',['6','Kyle Lowe','Sr.'],['15','Issac Mooring III','Jr.'],['8','Cole Welliver','Jr.']],
    ['RB',['2','Kyree Paul','So.'],['9','Deantre Jackson','Sr.'],['33','Chad Elzy Jr.','So.'],['5','Calvin Smith Jr.','So.']],
    ['WR-H',['9','Dkhai Joseph','Jr.'],['82','Desmen Jefferson','Fr.']]
  ];

  function asPlayer(x){
    if(!x)return null;
    if(Array.isArray(x))return [String(x[0]??'').replace(/^#/,''),String(x[1]??''),String(x[2]??'')];
    if(typeof x==='string'){
      let m=x.match(/^#?\s*(\d+)\s+(.+)$/);return m?[m[1],m[2],'']:['',x,''];
    }
    if(typeof x==='object')return [String(firstVal(x,['number','jersey','jerseyNumber','#'])||'').replace(/^#/,''),String(firstVal(x,['name','player','fullName','full_name'])||''),String(firstVal(x,['class','year','academicYear'])||'')];
    return null;
  }
  function rowFromObject(pos,v){
    if(Array.isArray(v)&&v.length&&Array.isArray(v[0]))return [pos,...v.map(asPlayer).filter(x=>x&&x[1])];
    if(Array.isArray(v)&&v.length&&typeof v[0]==='object')return [pos,...v.map(asPlayer).filter(x=>x&&x[1])];
    if(v&&typeof v==='object'){
      let ps=v.players||v.depth||v.entries||v.twoDeep||v.two_deep||[v.first,v.starter,v.second,v.backup,v.third,v.additional].filter(Boolean);
      if(!Array.isArray(ps))ps=[ps];return [pos,...ps.map(asPlayer).filter(x=>x&&x[1])];
    }
    return [pos,...[asPlayer(v)].filter(x=>x&&x[1])];
  }
  function normalizeDepth(d){
    if(!d)return[];
    let src=d;
    for(const k of ['offense','offensive','offenseDepth','offense_depth','offenseDepthChart','offense_depth_chart'])if(src&&src[k]){src=src[k];break}
    if(src?.depthChart?.offense)src=src.depthChart.offense;
    else if(src?.depth_chart?.offense)src=src.depth_chart.offense;
    else if(src?.depthChart&&!Array.isArray(src))src=src.depthChart;
    else if(src?.depth_chart&&!Array.isArray(src))src=src.depth_chart;
    if(Array.isArray(src)){
      let out=[];
      src.forEach(r=>{
        if(Array.isArray(r)&&r.length){let pos=String(r[0]??'');let ps=r.slice(1).map(asPlayer).filter(x=>x&&x[1]);if(pos&&ps.length)out.push([pos,...ps]);return}
        if(r&&typeof r==='object'){
          let pos=String(firstVal(r,['position','pos','label'])||'');
          let ps=r.players||r.depth||r.entries||r.twoDeep||r.two_deep||[r.first,r.starter,r.second,r.backup,r.third,r.additional].filter(Boolean);
          if(!Array.isArray(ps))ps=[ps];ps=ps.map(asPlayer).filter(x=>x&&x[1]);if(pos&&ps.length)out.push([pos,...ps]);
        }
      });return out;
    }
    if(src&&typeof src==='object'){
      let out=[];for(const [k,v] of Object.entries(src)){if(['team','season','source','updated','meta'].includes(k))continue;let row=rowFromObject(k,v);if(row.length>1)out.push(row)}return out;
    }
    return[];
  }

  const oldDepthPage=typeof depthChartPage==='function'?depthChartPage:null;
  depthChartPage=function(){
    if(!isW3())return oldDepthPage?oldDepthPage():'';
    let rows=normalizeDepth(sleFixDepth);if(!rows.length)rows=fallbackDepth;
    const cell=x=>{if(!x)return'—';let [n,name,cls]=asPlayer(x)||['','',''];if(!name)return'—';return `<button class="depth-player" onclick='openFAUProfile(${JSON.stringify(name)})'><span class="depth-no">#${esc(n||'—')}</span><span class="depth-name">${esc(name)}</span>${cls?`<span class="depth-class">${esc(cls)}</span>`:''}</button>`};
    return `<div class="page-title"><h2>Southeastern Louisiana 2 Deep</h2><p>Week 3 offensive depth chart. Supabase is used first, with the published Week 3 depth chart as a safe fallback.</p></div>${dataStatus()}<div class="depth-shell"><div class="depth-card"><div class="depth-head"><div><div class="sub">Week 3 Opponent</div><h3>Southeastern Louisiana Offense</h3></div><div style="text-align:right"><div class="sub">September 19, 2026</div><div style="font-size:11px;font-weight:850">Malone Stadium · 3:30 PM CT</div></div></div><table class="depth-table"><thead><tr><th>Position</th><th>1st</th><th>2nd</th><th>Additional</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="pos">${esc(r[0])}</td><td>${cell(r[1])}</td><td>${cell(r[2])}</td><td>${r.slice(3).map(cell).join(' ')||'—'}</td></tr>`).join('')}</tbody></table><div class="depth-note">Live Supabase depth-chart.json when readable; published Week 3 chart is the fallback.</div></div></div>`;
  };

  function tokenNames(raw,row){
    let toks=String(raw||'').split(/[;,]/).map(s=>s.trim()).filter(Boolean);
    if(!toks.length)return[];
    return toks.map(t=>{
      let m=t.toUpperCase().match(/\bLASE\s+0*(\d{1,2})\b/);if(!m)return t.replace(/^LASE\s+/i,'#');
      let n=String(parseInt(m[1],10));
      let p=(roster||[]).find(x=>String(x.number||'').replace(/^0+/,'')===n&&['RB','HB','TB','FB'].includes(String(x.position||'').toUpperCase()));
      return p?`#${n} ${String(p.name||'').split(' ').slice(-1)[0]}`:`#${n}`;
    });
  }
  function runYpp(rs){let v=rs.map(r=>Number(r.pff_GAINLOSSNET??r.pff_GAINLOSS)).filter(Number.isFinite);return v.length?v.reduce((a,b)=>a+b,0)/v.length:0}
  function pctVal(n,d){return d?100*n/d:0}
  function structureLabel(r){return String(r.pff_OFFENSIVE_FORMATION_NAME||r.pff_STARTING_OFFENSIVE_FORMATION_NAME||r.pff_OFFFORMATION||r.pff_OFFFORMATIONGROUP||r.pff_STARTING_OFFENSIVE_FORMATION_GROUP||'Unknown').trim()||'Unknown'}
  function backsetLabel(r){return String(r.pff_BACKSET||r.pff_RBALIGNMENT||r.pff_RBS_ON_FIELD||'').trim()||'Backfield not tagged'}
  function backsRaw(r){return String(r.pff_RBS_ON_FIELD||r.pff_BALLCARRIER||'').trim()}
  function inferredBackCount(r){let raw=backsRaw(r);if(raw)return Math.max(1,raw.split(/[;,]/).filter(Boolean).length);let p=String(r.pff_OFFPERSONNELBASIC||r.pff_OFF_PERSONNEL_GROUP||'');let m=p.match(/^(\d)/);return m?Math.max(1,Math.min(3,Number(m[1]))):1}
  function miniField(names,count,align){
    let xs=[];count=Math.max(1,Math.min(3,count||1));
    if(count===1){let a=String(align||'').toUpperCase();xs=[a.includes('LEFT')?38:a.includes('RIGHT')?62:50]}
    else if(count===2)xs=[39,61];else xs=[32,50,68];
    let ol=[34,42,50,58,66].map(x=>`<i class="sle-ol" style="left:${x}%"></i>`).join('');
    let rb=xs.map((x,i)=>`<span class="sle-rb" style="left:${x}%">${esc((names[i]||('RB'+(i+1))).replace(/^#/,''))}</span>`).join('');
    return `<div class="sle-mini-field"><div class="sle-los"></div>${ol}<span class="sle-qb">QB</span>${rb}</div>`;
  }
  const oldSecond=typeof runSecondFormationVisual==='function'?runSecondFormationVisual:null;
  runSecondFormationVisual=function(rows,total){
    if(!isW3())return oldSecond?oldSecond(rows,total):'';
    let rs=(rows||[]).filter(r=>String(r.pff_RUNPASS||'').toUpperCase()==='R');
    if(!rs.length)rs=rows||[];
    if(!rs.length)return `<div class="surface-structure-wrap"><div class="surface-structure-head"><div><h3>Formation Structure + Backs Present</h3></div></div><div class="empty">No run snaps for the current filters.</div></div>`;
    let g=new Map();
    rs.forEach(r=>{let f=structureLabel(r),b=backsetLabel(r),br=backsRaw(r),k=[f,b,br].join('||');if(!g.has(k))g.set(k,{f,b,br,rows:[]});g.get(k).rows.push(r)});
    let top=[...g.values()].sort((a,b)=>b.rows.length-a.rows.length).slice(0,8);
    let cards=top.map(x=>{let y=runYpp(x.rows),ex=x.rows.filter(r=>Number(r.pff_GAINLOSSNET??r.pff_GAINLOSS)>=15).length,neg=x.rows.filter(r=>Number(r.pff_GAINLOSSNET??r.pff_GAINLOSS)<=0).length,first=x.rows[0]||{},names=tokenNames(x.br,first),count=Math.max(names.length,inferredBackCount(first));let align=first.pff_RBALIGNMENT||first.pff_BACKSET||'';return `<div class="sle-structure-card"><div class="sle-structure-title">${esc(x.f)}</div><div class="sle-structure-sub">${esc(x.b)}${names.length?` · Backs: ${esc(names.join(', '))}`:''}</div>${miniField(names,count,align)}<div class="sle-structure-metrics"><div><b>${x.rows.length}</b><span>Runs</span></div><div><b>${y.toFixed(2)}</b><span>YPP</span></div><div><b>${pctVal(ex,x.rows.length).toFixed(1)}%</b><span>Expl</span></div><div><b>${pctVal(neg,x.rows.length).toFixed(1)}%</b><span>Neg</span></div></div></div>`}).join('');
    return `<div class="surface-structure-wrap"><div class="surface-structure-head"><div><h3>Formation Structure + Backs Present</h3><div class="subtle">Top run structures from the active Southeastern sample. The backfield is drawn from PFF RBS on field / backset / RB alignment, so the backs are visible even without a Week 3 ULM hybrid file.</div></div></div><div class="sle-structure-grid">${cards}</div></div>`;
  };

  const previousLoad=typeof loadOpponentData==='function'?loadOpponentData:null;
  loadOpponentData=async function(){
    if(previousLoad)await previousLoad();
    if(!isW3())return;
    roster=(roster||[]).map(normalizePlayer);
    await fetchFixDepth();
    if(typeof render==='function')render();
  };

  document.addEventListener('DOMContentLoaded',()=>{if(isW3())fetchFixDepth().then(()=>{if(typeof render==='function')render()})});
})();
