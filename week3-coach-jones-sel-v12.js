/* Week 3 Southeastern Louisiana — Coach Jones Tips & Reminders.
   Keeps Week 1 Mississippi State and Week 2 UAB notes unchanged. */
(() => {
  const isSELJonesWeek = () => typeof prepWeek !== 'undefined' && prepWeek === 'W3';
  const oldJonesPage = typeof coachJonesNotesPage === 'function' ? coachJonesNotesPage : null;
  const oldUpdatePrepChrome = typeof updatePrepChrome === 'function' ? updatePrepChrome : null;

  function ensureSELJonesStyles(){
    if(document.getElementById('selJonesW3Styles')) return;
    const st=document.createElement('style');
    st.id='selJonesW3Styles';
    st.textContent=`
      .sel-jones-doc{display:flex;flex-direction:column;gap:12px;max-width:980px}
      .sel-jones-doc .jones-card{width:100%;background:#f7f9fb!important;border-color:#d7dee6!important;color:#142434!important}
      .sel-jones-doc .jones-card h3{color:#8a2432!important;margin:0 0 8px}
      .sel-jones-doc .jones-card ul{margin:0;padding-left:20px}
      .sel-jones-doc .jones-card li{color:#142434!important;margin:7px 0;line-height:1.45;font-size:13px}
      .sel-jones-doc .jones-source-note{color:#536273!important;font-size:10px;line-height:1.45;margin-top:8px}
      .sel-jones-sequence{font-size:11px;color:#9db0c1;margin:0 0 12px;max-width:980px}
    `;
    document.head.appendChild(st);
  }

  function card(title, bullets, note=''){
    return `<div class="jones-card"><h3>${title}</h3><ul>${bullets.map(x=>`<li>${x}</li>`).join('')}</ul>${note?`<div class="jones-source-note">${note}</div>`:''}</div>`;
  }

  function selJonesText(){
    return `<div class="sel-jones-sequence">Southeastern Louisiana Week 3 board notes · ordered for the staff document exactly as requested.</div>
      <div class="sel-jones-doc">
        ${card('Philosophy',[
          'They make you defend the width of the field.'
        ])}

        ${card('My Personal Opinion',[
          'Great scheme.',
          'Great screen game.',
          'Best blocking WRs we’ve seen. They relish their role, especially #14.',
          'Field screen to #73.',
          'Any guard up = pass.'
        ])}

        ${card('QB — Last Look',[
          'Good touch &amp; poise.',
          'Adequate move-around ability.'
        ])}

        ${card('Formations',[
          'Bunch — 9 / 88 / 14 = #9.',
          '2x2 = QB draw.',
          'Stack = run.',
          '4 to a side = sprint out.',
          'Motion to empty = slants backside.',
          'Wide open bunch = 100% pass.',
          'Wide stack = 100% run.',
          'Rat / Snake to #9.'
        ],'The parenthetical after “Stack = Run” is not fully legible in the supplied board photo, so it is not expanded here.')}

        ${card('Personnel',[
          '#14 takes you to a lot of plays.',
          '#2 is their gadget guy.',
          '#9 has speed / good P.R.',
          '#5 is loose with the ball.',
          '#88 / #85 are good TEs; #30 also.',
          '#14 &amp; #88 to the same side = you are hot.',
          '#9 in bunch = hot (Rat / Snake).',
          '#9 on point in bunch = vertical.',
          '#88 deep = flat.'
        ])}

        ${card('Motion',[
          'Orbit = opposite.',
          'Across = to.'
        ])}

        ${card('D/D',[
          '2nd &amp; long = screen.',
          '3rd &amp; long = 95% (3x1).'
        ])}
      </div>
      <div class="jones-source-note" style="max-width:980px;margin-top:12px">Transcribed from the five Coach Jones Southeastern Louisiana board photos supplied for Week 3. Wording is kept close to the board; unclear material is not guessed.</div>`;
  }

  coachJonesNotesPage = function(){
    if(!isSELJonesWeek()) return oldJonesPage ? oldJonesPage() : '';
    ensureSELJonesStyles();
    return `<div class="page-title"><h2>Coach Jones Tips &amp; Reminders</h2><p>Southeastern Louisiana Week 3 board notes and staff reminders.</p></div>${selJonesText()}`;
  };

  if(oldUpdatePrepChrome){
    updatePrepChrome = function(){
      oldUpdatePrepChrome();
      if(isSELJonesWeek()) document.querySelectorAll('.nav[data-page="jones"]').forEach(b=>b.style.display='');
    };
  }

  const showJones=()=>{
    ensureSELJonesStyles();
    if(isSELJonesWeek()) document.querySelectorAll('.nav[data-page="jones"]').forEach(b=>b.style.display='');
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(showJones,0));
  else setTimeout(showJones,0);
})();
