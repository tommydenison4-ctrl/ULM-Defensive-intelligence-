/* Week 3 v4: defensive-scout formation language + Southeastern image handling */
(() => {
  const isW3=()=>typeof prepWeek!=='undefined'&&prepWeek==='W3';

  // Defensive-scout language used in the Mississippi State/UAB app.
  // This is NOT ULM offensive install language.
  const MAP={
    'TREY - OPEN':'TREY Y OFF',
    'SLOT - PRO':'DUO Y OFF',
    'TRIPS - CLOSED':'TRIPS',
    'TREY - CLOSED':'KING U OFF',
    'TRIPS - OPEN':'TRIPS - OPEN',
    'PRO - PRO':'ACE YU OFF',
    'SLOT - SLOT':'DOUBLES',
    'TRIPS - SLOT':'TRIPS - SLOT',
    'SLOT - WING':'SLOT - WING',
    'TOAD WING - OPEN':'TREY U HIP',
    'PRO - OPEN':'PRO - OPEN',
    'SLOT - CLOSED':'PRO',
    'SLOT - OPEN':'SLOT - OPEN',
    'QUAY - NIX':'TREY Y OFF',
    'QUAY - OPEN':'TREY Y OFF',
    'PRO - WING':'PRO - WING',
    'QUADS WING - NIX':'QUADS WING - NIX',
    'TREY - SLOT':'EMPTY 3x2 Y OFF',
    'TREY - PRO':'ACE YU OFF',
    'PRO - CLOSED':'KING U OFF B HIP',
    'QUADS - OPEN':'EMPTY 4x1 Y OFF',
    'TOAD WING - SLOT':'EMPTY 4x1 T STING',
    'TOAD WING - PRO':'TOAD WING - PRO',
    'TOAD WING - CLOSED':'TOAD WING - CLOSED',
    'TRIPS - WING':'TRIPS - WING',
    'TRIPS - PRO':'TRIPS - PRO',
    'CLOSED - CLOSED':'CLOSED - CLOSED',
    'OPEN - OPEN':'OPEN - OPEN',
    'OPEN - CLOSED':'OPEN - CLOSED',
    'WING - CLOSED':'WING - CLOSED',
    'WING - OPEN':'WING - OPEN',
    'WING - NIX':'WING - NIX',
    'TANK WING - OPEN':'TANK WING - OPEN',
    'OTHER':'OTHER'
  };
  const scout=s=>MAP[String(s||'').trim().toUpperCase()]||String(s||'').trim();
  const escRe=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

  function setTextIfChanged(el,next){
    if(el && el.textContent!==next) el.textContent=next;
  }

  function relabelRunLanguage(root=document){
    if(!isW3())return;
    const runPage=[...(root.querySelectorAll?.('h3')||[])].find(x=>x.textContent.trim()==='Run Game Explorer');
    if(!runPage)return;
    const card=runPage.closest('.card')||document;

    card.querySelectorAll('label').forEach(l=>{
      if(l.firstChild?.textContent?.trim()==='Formation'){
        const sel=l.querySelector('select');
        if(sel)[...sel.options].forEach(o=>{
          if(o.value==='ALL')return;
          setTextIfChanged(o,scout(o.value));
        });
      }
    });

    const replaceText=el=>{
      let t=el.textContent;
      Object.entries(MAP).forEach(([p,u])=>{t=t.replace(new RegExp(escRe(p),'gi'),u)});
      setTextIfChanged(el,t);
    };
    card.querySelectorAll('.sle-structure-summary b,.sle-structure-summary span,.run-filter-note,.subtle').forEach(replaceText);
  }

  // Same-origin image proxy for Week 3 portraits.
  const oldPhoto=typeof photo==='function'?photo:null;
  if(oldPhoto) photo=function(p){
    if(!isW3())return oldPhoto(p);
    const name=String(p?.name||'');
    const profile=String(p?.profile||'').trim();
    const direct=String(p?.image||p?.photo||p?.headshot||'').trim();
    const proxy=profile?`/api/sle-player-image?url=${encodeURIComponent(profile)}`:'';
    const primary=proxy||direct;
    if(!primary)return `<div class="initials">${initials(name)}</div>`;
    const backup=direct&&direct!==primary?direct:'';
    return `<img src="${esc(primary)}" alt="${esc(name)}" loading="lazy" data-backup="${esc(backup)}" onerror="if(this.dataset.backup&&!this.dataset.tried){this.dataset.tried='1';this.src=this.dataset.backup}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div class="initials" style="display:none">${initials(name)}</div>`;
  };

  // Relabel once after each normal app render. Do NOT observe the whole DOM: that caused
  // a MutationObserver feedback loop that starved the sidebar click handlers.
  const oldRender=typeof render==='function'?render:null;
  if(oldRender)render=function(){
    const out=oldRender.apply(this,arguments);
    setTimeout(()=>relabelRunLanguage(document),0);
    return out;
  };

  const start=()=>setTimeout(()=>relabelRunLanguage(document),100);
  window.addEventListener('DOMContentLoaded',start,{once:true});
  if(document.readyState!=='loading')start();
})();
