/* Week 3 Southeastern Louisiana — incremental Coach Jones note/photo patch. */
(() => {
  const IMG = './assets/coach-jones/sel-week3/qb-headgear-dbl-move.jpg';
  const isSEL = () => typeof prepWeek !== 'undefined' && prepWeek === 'W3';
  const previous = typeof coachJonesNotesPage === 'function' ? coachJonesNotesPage : null;
  if (!previous) return;

  function ensureOverlay(){
    if(document.getElementById('selJonesExtraOverlay')) return;
    const d=document.createElement('div');
    d.id='selJonesExtraOverlay';
    d.style.cssText='display:none;position:fixed;inset:0;z-index:20000;background:rgba(0,0,0,.88);padding:24px;align-items:center;justify-content:center';
    d.innerHTML=`<button onclick="closeSELJonesExtra()" style="position:absolute;top:18px;right:22px;background:#fff;color:#111;border:0;border-radius:8px;padding:9px 12px;font-weight:900;cursor:pointer">Close</button><img src="${IMG}" alt="Coach Jones QB last look board note" style="max-width:94vw;max-height:92vh;object-fit:contain;border-radius:10px;background:#fff">`;
    d.addEventListener('click',e=>{if(e.target===d)closeSELJonesExtra();});
    document.body.appendChild(d);
  }
  window.openSELJonesExtra=()=>{ensureOverlay();document.getElementById('selJonesExtraOverlay').style.display='flex';};
  window.closeSELJonesExtra=()=>{const d=document.getElementById('selJonesExtraOverlay');if(d)d.style.display='none';};

  coachJonesNotesPage=function(){
    let html=previous();
    if(!isSEL()) return html;

    // Add the additional QB last-look tell to the transcribed notes.
    const headings=['QB — Last Look','QB - Last Look','QB Last Look'];
    for(const h of headings){
      const token=`<h3>${h}</h3>`;
      if(html.includes(token)){
        const start=html.indexOf(token);
        const ul=html.indexOf('<ul',start);
        const gt=ul>=0?html.indexOf('>',ul):-1;
        if(gt>=0 && !html.includes('SB taps headgear = DBL move')){
          html=html.slice(0,gt+1)+`<li><b>SB taps headgear = DBL move.</b></li>`+html.slice(gt+1);
        }
        const end=html.indexOf('</div>',start);
        if(end>=0 && !html.includes('View QB headgear board note')){
          html=html.slice(0,end)+`<div class="jones-card-actions"><button class="jones-board-link" onclick="openSELJonesExtra()">View QB headgear board note</button></div>`+html.slice(end);
        }
        break;
      }
    }

    // Include the new image in Actual Board Notes so every uploaded board can be verified.
    if((html.includes('Actual Board Notes') || html.includes('sel-jones-photos')) && !html.includes('QB Headgear / Double Move')){
      const rawCard=`<div class="sel-jones-photo"><h3>QB Headgear / Double Move</h3><img src="${IMG}" alt="QB headgear double move board note" onclick="openSELJonesExtra()"></div>`;
      if(html.includes('</div></div>')){
        const marker=html.lastIndexOf('</div></div>');
        html=html.slice(0,marker)+rawCard+html.slice(marker);
      } else {
        html+=rawCard;
      }
    }
    return html;
  };
})();
