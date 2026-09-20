/* Week 4 v3: official FAU bio portraits only; never action/signing graphics. */
(() => {
  const oldPhoto=typeof photo==='function'?photo:null;
  const isW4=()=>typeof prepWeek!=='undefined'&&prepWeek==='W4';
  photo=function(p){
    if(!isW4())return oldPhoto?oldPhoto(p):'';
    const name=String(p?.name||'').trim();
    if(!name)return '<div class="initials">?</div>';
    const src=`/api/fau-player-image?name=${encodeURIComponent(name)}&v=20260920w4bio1`;
    return `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" data-fau-bio-v3="1" style="width:100%;height:100%;object-fit:cover;object-position:50% 12%;image-rendering:auto" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="initials" style="display:none">${initials(name)}</div>`;
  };
})();
