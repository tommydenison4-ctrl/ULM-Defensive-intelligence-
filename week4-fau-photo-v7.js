/* Week 4 FAU v7: official bio portrait resolver with name + jersey number. */
(()=>{
 const isW4=()=>typeof prepWeek!=='undefined'&&prepWeek==='W4';
 const oldPhoto=typeof photo==='function'?photo:null;
 photo=function(p){
   if(!isW4())return oldPhoto?oldPhoto(p):'';
   const name=String(p?.name||'').trim(), number=String(p?.number||p?.['#']||'').trim();
   if(!name)return '<div class="initials">?</div>';
   const src=`/api/fau-player-image?name=${encodeURIComponent(name)}&number=${encodeURIComponent(number)}&v=20260920w4v7`;
   return `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:50% 12%;image-rendering:auto" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="initials" style="display:none">${initials(name)}</div>`;
 };
})();