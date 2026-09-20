/* FAU Week 4 durable headshots + shared cross-tab filters. */
(() => {
  const state = { play:'ALL', down:'ALL', distance:'ALL', personnel:'ALL', formation:'ALL', hash:'ALL', qb:'ALL' };
  let master = [];
  let rendering = false;
  let portraitMap = new Map();
  const EMBEDDED_PORTRAITS={"Caden Veltkamp":"./player-images/caden-veltkamp.jpg","Easton Messer":"./player-images/easton-messer.jpg","Drew Devillier":"./player-images/drew-devillier.jpg","RJ Garcia II":"./player-images/rj-garcia-ii.jpg","Vincent Fiacable":"./player-images/vincent-fiacable.jpg","AJ Johnson":"./player-images/aj-johnson.jpg","Brooks Johnson":"./player-images/brooks-johnson.jpg","Tucker Holloway":"./player-images/tucker-holloway.jpg","Ja'Kavion Nonar":"./player-images/ja-kavion-nonar.jpg","Dominique Henry":"./player-images/dominique-henry.jpg","Ovie Dubre":"./player-images/ovie-dubre.jpg","Joshua Harriott":"./player-images/joshua-harriott.jpg","Ben Galloway":"./player-images/ben-galloway.jpg","Marcus Vinson":"./player-images/marcus-vinson.jpg","Germanuel Tanelus":"./player-images/germanuel-tanelus.jpg","Kelby Valsin":"./player-images/kelby-valsin.jpg","Kortez Winslow":"./player-images/kortez-winslow.jpg","Brady Tillman III":"./player-images/brady-tillman-iii.jpg","Braden Cunningham":"./player-images/braden-cunningham.jpg","Mauricio Hinds":"./player-images/mauricio-hinds.jpg","Keon Rohe":"./player-images/keon-rohe.jpg","Almari Brown":"./player-images/almari-brown.jpg","Kaden Shields-Dutton":"./player-images/kaden-shields-dutton.jpg","Michael Valentino":"./player-images/michael-valentino.jpg","Carson Osmus":"./player-images/carson-osmus.jpg","Aiden Jones":"./player-images/aiden-jones.jpg","Vincent Forney":"./player-images/vincent-forney.jpg","Chase Hanning":"./player-images/chase-hanning.jpg","Ethan Ervin":"./player-images/ethan-ervin.jpg","Rain Banick":"./player-images/rain-banick.jpg","Jordan Magwood":"./player-images/jordan-magwood.jpg","Branden Hoch":"./player-images/branden-hoch.jpg","Logan Husband":"./player-images/logan-husband.jpg","Landon Rapkiewicz":"./player-images/landon-rapkiewicz.jpg","Aqil Meredith-Smith":"./player-images/aqil-meredith-smith.jpg","Leonard Farrow":"./player-images/leonard-farrow.jpg","Owen Cheatham":"./player-images/owen-cheatham.jpg","Antojuan Woody":"./player-images/antojuan-woody.jpg","Owen Pollock":"./player-images/owen-pollock.jpg","Aedyn Buchanan":"./player-images/aedyn-buchanan.webp","Elijah West":"./player-images/elijah-west.jpg","Nicsaint Joseph Jr.":"./player-images/nicsaint-joseph-jr.jpg","Alejandro Schmitt":"./player-images/alejandro-schmitt.jpg","JJ Rochford":"./player-images/jj-rochford.jpg","Peter Cannon":"./player-images/peter-cannon.jpg","Maika Kurkowski":"./player-images/maika-kurkowski.jpg","Grayson Gibson":"./player-images/grayson-gibson.jpg","Spencer Martin":"./player-images/spencer-martin.jpg","Aiden Ford":"./player-images/aiden-ford.png","Dveyoun Bonwell-Witte":"./player-images/dveyoun-bonwell-witte.jpg","Jaylen Gamble":"./player-images/jaylen-gamble.jpg"};
  const clean = v => String(v ?? '').trim();
  const field = (r, ...keys) => { for (const key of keys) if (clean(r?.[key])) return clean(r[key]); return ''; };
  const upper = v => clean(v).toUpperCase();
  const distinct = (rows, getter) => [...new Set(rows.map(getter).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}));
  const slug = s => clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const runPass = r => upper(field(r,'pff_RUNPASS','Play Type')) === 'R' ? 'RUN' : upper(field(r,'pff_RUNPASS','Play Type')) === 'P' ? 'PASS' : upper(field(r,'pff_RUNPASS','Play Type'));
  const down = r => field(r,'pff_DOWN','Down');
  const distance = r => Number(field(r,'pff_DISTANCE','Distance'));
  const distanceBucket = r => {
    const d=distance(r); if(!Number.isFinite(d)) return '';
    if(d<=3)return '1–3'; if(d<=6)return '4–6'; if(d<=9)return '7–9'; if(d<=12)return '10–12'; return '13+';
  };
  const personnel = r => field(r,'pff_OFFPERSONNELBASIC','Personnel');
  const formation = r => {
    const raw=field(r,'Formation','pff_OFFENSIVE_FORMATION_NAME','pff_STARTING_OFFENSIVE_FORMATION_NAME','pff_OFFFORMATIONGROUP');
    try { return typeof scoutFormation==='function' ? scoutFormation(raw) : raw; } catch { return raw; }
  };
  const hash = r => upper(field(r,'pff_HASH','Hash','pff_FIELDHASH'));
  const qb = r => field(r,'pff_PASSER','Passer','pff_QB');
  const matches = r =>
    (state.play==='ALL'||runPass(r)===state.play) &&
    (state.down==='ALL'||down(r)===state.down) &&
    (state.distance==='ALL'||distanceBucket(r)===state.distance) &&
    (state.personnel==='ALL'||personnel(r)===state.personnel) &&
    (state.formation==='ALL'||formation(r)===state.formation) &&
    (state.hash==='ALL'||hash(r)===state.hash) &&
    (state.qb==='ALL'||qb(r)===state.qb);

  const option = (value,label,current) => `<option value="${esc(value)}" ${value===current?'selected':''}>${esc(label)}</option>`;
  const select = (key,label,values) => `<label><span>${label}</span><select onchange="setFAUGlobalFilter('${key}',this.value)">${option('ALL','All',state[key])}${values.map(v=>option(v,v,state[key])).join('')}</select></label>`;
  function bar(){
    const rows=master;
    const filtered=rows.filter(matches);
    return `<section class="fau-global-filters no-print"><div class="fau-filter-heading"><div><b>FILTER THIS VIEW</b><small>Every data tab uses the same selection</small></div><strong>${filtered.length} / ${rows.length} plays</strong></div><div class="fau-filter-grid">
      ${select('play','Run / Pass',['RUN','PASS'])}${select('down','Down',distinct(rows,down))}${select('distance','Distance',['1–3','4–6','7–9','10–12','13+'])}${select('personnel','Personnel',distinct(rows,personnel))}${select('formation','Formation',distinct(rows,formation))}${select('hash','Hash',distinct(rows,hash))}${select('qb','Quarterback',distinct(rows,qb))}
      <button onclick="resetFAUGlobalFilters()">Reset All</button></div></section>`;
  }
  window.setFAUGlobalFilter=(key,value)=>{ if(key in state){state[key]=value; render();} };
  window.resetFAUGlobalFilters=()=>{Object.keys(state).forEach(k=>state[k]='ALL');render();};

  const style=document.createElement('style');
  style.textContent=`#reviewBuildBanner{display:none!important}.fau-global-filters{margin:0 0 16px;padding:13px;border:1px solid #33495d;border-radius:13px;background:linear-gradient(145deg,#0d1b29,#13283a);box-shadow:0 8px 22px rgba(0,0,0,.16)}.fau-filter-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;color:#fff}.fau-filter-heading b{display:block;font-size:11px;letter-spacing:.11em;color:#eba800}.fau-filter-heading small{display:block;margin-top:2px;color:#aab9c6}.fau-filter-heading strong{font-size:12px}.fau-filter-grid{display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:8px}.fau-filter-grid label span{display:block;margin:0 0 4px;font-size:8px;font-weight:950;letter-spacing:.08em;text-transform:uppercase;color:#aab9c6}.fau-filter-grid select,.fau-filter-grid button{width:100%;height:37px;border:1px solid #4b6072;border-radius:8px;background:#f8fafb;color:#142433;padding:7px 9px;font-weight:850}.fau-filter-grid button{align-self:end;background:#8a2432;color:#fff;border-color:#eba800}@media(max-width:950px){.fau-filter-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.fau-filter-grid{grid-template-columns:1fr}}`;
  document.head.appendChild(style);

  async function installPortraits(){
    try{
      const byName=new Map(Object.entries(EMBEDDED_PORTRAITS).map(([name,file])=>[slug(name),file]));
      portraitMap=byName;
      const apply=()=>{ if(!Array.isArray(roster))return; roster.forEach(p=>{const src=byName.get(slug(p.name));if(src){p.image=src;p.supabaseImageBackup='';}}); };
      apply();
      const oldPhoto=photo;
      photo=function(p){
        const name=clean(p?.name), number=clean(p?.number), profile=clean(p?.profile);
        const local=byName.get(slug(name));
        if(!local)return oldPhoto(p);
        const api=`/api/fau-player-image?name=${encodeURIComponent(name)}&number=${encodeURIComponent(number)}&profile=${encodeURIComponent(profile)}&v=durable2`;
        return `<img src="${esc(local)}" alt="${esc(name)}" loading="lazy" data-backup="${esc(api)}" style="width:100%;height:100%;object-fit:contain;object-position:center bottom" onerror="if(!this.dataset.tried){this.dataset.tried='1';this.src=this.dataset.backup}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div class="initials" style="display:none">${initials(name)}</div>`;
      };
      render();
    }catch(e){ console.warn('FAU local portraits unavailable',e); }
  }

  const baseRender=render;
  render=function(){
    if(rendering)return baseRender.apply(this,arguments);
    if(typeof prepWeek==='undefined')return baseRender.apply(this,arguments);
    rendering=true;
    if(Array.isArray(roster)&&portraitMap.size)roster.forEach(p=>{const src=portraitMap.get(slug(p.name));if(src)p.image=src;});
    if(Array.isArray(datasets?.plays) && datasets.plays.length && datasets.plays!==master && !datasets.plays.__fauFiltered) master=datasets.plays;
    const live=datasets.plays;
    const filtered=(master||[]).filter(matches); filtered.__fauFiltered=true;
    datasets.plays=filtered;
    try{ baseRender.apply(this,arguments); }
    finally{ datasets.plays=live; rendering=false; }
    const app=document.getElementById('app');
    if(app&&master.length)app.insertAdjacentHTML('afterbegin',bar());
  };
  installPortraits();
})();
