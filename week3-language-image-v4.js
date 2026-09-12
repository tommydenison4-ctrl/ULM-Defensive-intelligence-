/* Week 3 v4: restore ULM formation language in run game + stronger Southeastern images */
(() => {
  const isW3=()=>typeof prepWeek!=='undefined'&&prepWeek==='W3';
  const MAP={
    'PRO - CLOSED':'I-FLUTE','PRO - OPEN':'SPIN','PRO - PRO':'DIAMOND',
    'QUADS WING - NIX':'FLANK','QUAY - NIX':'TRIO XTRA','QUAY - OPEN':'TRIO XTRA',
    'SLOT - CLOSED':'FLANK FIB','SLOT - OPEN':'TRIO','SLOT - PRO':'DUO','SLOT - SLOT':'DICE','SLOT - WING':'FLANK FIB',
    'TOAD WING - OPEN':'TOP','TREY - CLOSED':'FLANK','TREY - NIX':'TRIPS XTRA','TREY - OPEN':'TRIO','TREY - PRO':'TRUST FIB','TREY - SLOT':'TRUST',
    'TRIPS - CLOSED':'FIST','TRIPS - NIX':'REVIEW','TRIPS - OPEN':'TOP','TRIPS - SLOT':'TOP',
    'QUADS - OPEN':'REVIEW','QUADS - NIX':'REVIEW','TRIPS - PRO':'REVIEW','OTHER':'REVIEW'
  };
  const ulm=s=>MAP[String(s||'').trim().toUpperCase()]||String(s||'').trim();

  function relabelRunLanguage(root=document){
    if(!isW3())return;
    const runPage=[...root.querySelectorAll?.('h3')||[]].find(x=>x.textContent.trim()==='Run Game Explorer');
    if(!runPage)return;
    const card=runPage.closest('.card')||document;
    card.querySelectorAll('label').forEach(l=>{
      if(l.firstChild?.textContent?.trim()==='Formation'){
        const sel=l.querySelector('select');
        if(sel) [...sel.options].forEach(o=>{if(o.value!=='ALL')o.textContent=ulm(o.value)});
      }
    });
    card.querySelectorAll('.sle-structure-summary b').forEach(el=>{
      let t=el.textContent;
      Object.entries(MAP).forEach(([p,u])=>{t=t.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),u)});
      el.textContent=t;
    });
    card.querySelectorAll('.sle-structure-summary span').forEach(el=>{
      let t=el.textContent;
      Object.entries(MAP).forEach(([p,u])=>{t=t.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),u)});
      el.textContent=t;
    });
    const crumbs=card.querySelectorAll('.run-filter-note,.subtle');
    crumbs.forEach(el=>{
      let t=el.textContent;
      Object.entries(MAP).forEach(([p,u])=>{t=t.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),u)});
      el.textContent=t;
    });
  }

  const oldPhoto=typeof photo==='function'?photo:null;
  if(oldPhoto) photo=function(p){
    if(!isW3())return oldPhoto(p);
    const name=String(p?.name||'');
    const profile=String(p?.profile||'');
    const direct=String(p?.image||p?.photo||p?.headshot||'').trim();
    const resolver=profile?`/api/sle-player-image?url=${encodeURIComponent(profile)}`:'';
    const primary=resolver||direct;
    if(!primary)return `<div class="initials">${initials(name)}</div>`;
    const backup=direct&&direct!==primary?direct:'';
    return `<img src="${esc(primary)}" alt="${esc(name)}" loading="lazy" referrerpolicy="no-referrer" data-backup="${esc(backup)}" onerror="if(this.dataset.backup&&!this.dataset.tried){this.dataset.tried='1';this.src=this.dataset.backup}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div class="initials" style="display:none">${initials(name)}</div>`;
  };

  const oldRender=typeof render==='function'?render:null;
  if(oldRender) render=function(){const out=oldRender.apply(this,arguments);setTimeout(()=>relabelRunLanguage(document),0);return out};
  const obs=new MutationObserver(()=>relabelRunLanguage(document));
  window.addEventListener('DOMContentLoaded',()=>{obs.observe(document.body,{childList:true,subtree:true});setTimeout(()=>relabelRunLanguage(document),200)});
  if(document.readyState!=='loading'){obs.observe(document.body,{childList:true,subtree:true});setTimeout(()=>relabelRunLanguage(document),200)}
})();
