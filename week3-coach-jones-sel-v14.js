/* Week 3 Southeastern Louisiana — authoritative Coach Jones page with verified board images. */
(() => {
  const isSEL = () => typeof prepWeek !== 'undefined' && prepWeek === 'W3';
  const oldPage = typeof coachJonesNotesPage === 'function' ? coachJonesNotesPage : null;
  let view='text';
  const P='/assets/coach-jones/sel-week3/';
  const photos=[
    ['Philosophy / QB / Formations',P+'philosophy-qb-formations.jpg'],
    ['My Personal Opinion',P+'personal-opinion.jpg'],
    ['Personnel',P+'personnel.jpg'],
    ['Motion',P+'motion.jpg'],
    ['D/D',P+'down-distance.jpg'],
    ['QB Headgear / Double Move',P+'qb-headgear-dbl-move.jpg']
  ];
  function card(title,items,i){return `<div class="jones-card"><h3>${title}</h3><ul>${items.map(x=>`<li>${x}</li>`).join('')}</ul>${i==null?'':`<div class="jones-card-actions"><button class="jones-board-link" onclick="openSELJonesBoard(${i})">View actual board note</button></div>`}</div>`;}
  function text(){return `<div class="jones-grid">
    ${card('Philosophy',['They make you defend the width of the field.'],0)}
    ${card('My Personal Opinion',['Great scheme.','Great screen game.','Best blocking WRs we\'ve seen — they relish their role, especially #14.','Field screen to #73.','Any guard up = pass.'],1)}
    ${card('QB — Last Look',['Good touch & poise.','Adequate move-around ability.','SB taps headgear = DBL move.'],5)}
    ${card('Formations',['Bunch 9 / 88 / 14 = #9.','2×2 = QB draw.','Stack = run.','4 to a side = sprint out.','Motion to empty = slants backside.','Wide open bunch = 100% pass.','Wide stack = 100% run.','Rat / Snake to #9.'],0)}
    ${card('Personnel',['#14 takes you to a lot of plays.','#2 is their gadget guy.','#9 has speed / good PR.','#5 is loose with the ball.','#88 / #85 are good TEs; #30 also.','#14 & #88 to same side = you are hot.','#9 in bunch = hot (Rat / Snake).','#9 on point in bunch = vertical.','#88 deep = flat.'],2)}
    ${card('Motion',['Orbit = opposite.','Across = to.'],3)}
    ${card('D / D',['2nd & long = screen.','3rd & long = 95% 3×1.'],4)}
  </div>`;}
  function raw(){return `<div class="sel-jones-photos">${photos.map((p,i)=>`<div class="sel-jones-photo"><h3>${p[0]}</h3><img src="${p[1]}" alt="${p[0]} board note" loading="lazy" onclick="openSELJonesBoard(${i})"></div>`).join('')}</div>`;}
  function styles(){if(document.getElementById('selJonesV14Styles'))return;const s=document.createElement('style');s.id='selJonesV14Styles';s.textContent=`.sel-jones-photos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.sel-jones-photo{background:#0f1b28;border:1px solid #24384a;border-radius:12px;padding:12px}.sel-jones-photo h3{margin:0 0 10px;color:#eef4f8}.sel-jones-photo img{width:100%;max-height:540px;object-fit:contain;background:#fff;border-radius:8px;cursor:zoom-in}.sel-jones-toggle{display:flex;gap:8px;margin:0 0 14px}.sel-jones-toggle button{background:#122232;color:#eef4f8;border:1px solid #324a5f;border-radius:8px;padding:9px 12px;font-weight:900;cursor:pointer}.sel-jones-toggle button.active{background:#7f1128;border-color:#d5a81b}.sel-jones-lightbox{display:none;position:fixed;inset:0;z-index:30000;background:rgba(0,0,0,.9);align-items:center;justify-content:center;padding:20px}.sel-jones-lightbox img{max-width:95vw;max-height:94vh;object-fit:contain;background:#fff;border-radius:8px}.sel-jones-lightbox button{position:absolute;right:20px;top:16px;border:0;border-radius:8px;padding:9px 12px;font-weight:900;cursor:pointer}`;document.head.appendChild(s);}
  function box(){styles();let d=document.getElementById('selJonesV14Lightbox');if(!d){d=document.createElement('div');d.id='selJonesV14Lightbox';d.className='sel-jones-lightbox';d.innerHTML='<button onclick="closeSELJonesBoard()">Close</button><img alt="Coach Jones board note">';d.addEventListener('click',e=>{if(e.target===d)closeSELJonesBoard();});document.body.appendChild(d);}return d;}
  window.openSELJonesBoard=i=>{const d=box();d.querySelector('img').src=photos[i][1];d.style.display='flex';};
  window.closeSELJonesBoard=()=>{const d=document.getElementById('selJonesV14Lightbox');if(d)d.style.display='none';};
  window.setSELJonesV14View=v=>{view=v==='raw'?'raw':'text';if(typeof render==='function')render();};
  coachJonesNotesPage=function(){if(!isSEL())return oldPage?oldPage():'';styles();return `<div class="page-title"><h2>Coach Jones Tips &amp; Reminders</h2><p>Southeastern Louisiana Week 3 board notes and staff reminders.</p></div><div class="sel-jones-toggle"><button class="${view==='text'?'active':''}" onclick="setSELJonesV14View('text')">Transcribed Tips</button><button class="${view==='raw'?'active':''}" onclick="setSELJonesV14View('raw')">Actual Board Notes</button></div>${view==='raw'?raw():text()}`;};
})();
