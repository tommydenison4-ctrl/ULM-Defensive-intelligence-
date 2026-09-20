/* Week 4 FAU media: exact current-roster card matching only. Never borrow another player's portrait. */
(() => {
  const isW4=()=>typeof prepWeek!=='undefined'&&prepWeek==='W4';
  const norm=s=>String(s||'').toLowerCase().replace(/\b(jr|sr|ii|iii|iv)\b/g,'').replace(/[^a-z0-9]/g,'');
  const jersey=s=>String(s||'').replace(/\D/g,'').replace(/^0+/,'');
  const oldPhoto=typeof photo==='function'?photo:null;
  async function enrich(){
    if(!isW4()||!Array.isArray(roster)||!roster.length)return;
    try{
      const r=await fetch('/api/fau-roster-clean?v=20260920clean1',{cache:'no-store'});if(!r.ok)throw Error(r.status);
      const d=await r.json(),official=Array.isArray(d?.players)?d.players:[];
      const exact=new Map(official.map(p=>[norm(p.name)+'|'+jersey(p.number),p]));
      const byName=new Map();official.forEach(p=>{const k=norm(p.name);if(!byName.has(k))byName.set(k,[]);byName.get(k).push(p)});
      roster=roster.map(p=>{
        const key=norm(p.name)+'|'+jersey(p.number);let o=exact.get(key);
        if(!o){const arr=byName.get(norm(p.name))||[];if(arr.length===1)o=arr[0]}
        if(!o)return {...p,image:'',profile:p.profile||''};
        return {...p,image:o.image||'',profile:o.profile||p.profile||'',height:o.height||p.height||'',weight:o.weight||p.weight||'',class:o.class||p.class||'',hometown:o.hometown||p.hometown||''};
      });
    }catch(e){console.warn('FAU exact media enrichment failed',e);roster=roster.map(p=>({...p,image:''}))}
  }
  photo=function(p){
    if(!isW4())return oldPhoto?oldPhoto(p):'';
    const name=String(p?.name||''),img=String(p?.image||'').trim();
    if(!img)return `<div class="initials">${initials(name)}</div>`;
    const src='/api/fau-image-clean?url='+encodeURIComponent(img)+'&v=20260920clean1';
    return `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:50% 10%;image-rendering:auto" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="initials" style="display:none">${initials(name)}</div>`;
  };
  const oldLoad=typeof loadOpponentData==='function'?loadOpponentData:null;if(oldLoad)loadOpponentData=async function(...a){const out=await oldLoad.apply(this,a);if(isW4()){await enrich();if(typeof render==='function')render()}return out};
  setTimeout(async()=>{if(isW4()){await enrich();if(typeof render==='function')render()}},800);
})();
