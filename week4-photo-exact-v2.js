/* Week 4 FAU: exact official bio portraits by player profile/name/jersey. */
(() => {
  const isW4=()=>typeof prepWeek!=='undefined'&&prepWeek==='W4';
  const previousPhoto=typeof photo==='function'?photo:null;
  window.photo=function(p){
    if(!isW4())return previousPhoto?previousPhoto(p):'';
    const name=String(p?.name||'').trim();
    const number=String(p?.number||'').trim();
    const profile=String(p?.profile||'').trim();
    if(!name)return '<div class="initials">?</div>';
    const src=`/api/fau-player-image?name=${encodeURIComponent(name)}&number=${encodeURIComponent(number)}&profile=${encodeURIComponent(profile)}&v=20260920clean2`;
    return `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;object-position:center bottom;image-rendering:auto" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="initials" style="display:none">${initials(name)}</div>`;
  };
})();
