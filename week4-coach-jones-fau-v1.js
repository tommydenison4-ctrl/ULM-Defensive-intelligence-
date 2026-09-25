/* Week 4 Florida Atlantic — Coach Jones Tips & Reminders.
   Additive only: Weeks 1–3 remain unchanged. */
(() => {
  const isFAUJonesWeek = () => typeof prepWeek !== 'undefined' && prepWeek === 'W4';
  const oldJonesPage = typeof coachJonesNotesPage === 'function' ? coachJonesNotesPage : null;
  const oldUpdatePrepChrome = typeof updatePrepChrome === 'function' ? updatePrepChrome : null;

  function ensureFAUJonesStyles(){
    if(document.getElementById('fauJonesW4Styles')) return;
    const st=document.createElement('style');
    st.id='fauJonesW4Styles';
    st.textContent=`
      .fau-jones-doc{display:flex;flex-direction:column;gap:12px;max-width:1050px}
      .fau-jones-doc .jones-card{width:100%;background:#f7f9fb!important;border:1px solid #d7dee6!important;border-left:5px solid var(--gold)!important;border-radius:14px;padding:15px;color:#142434!important}
      .fau-jones-doc .jones-card h3{color:#8a2432!important;margin:0 0 8px}
      .fau-jones-doc .jones-card ul{margin:0;padding-left:20px}
      .fau-jones-doc .jones-card li{color:#142434!important;margin:7px 0;line-height:1.45;font-size:13px}
      .fau-jones-photos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      .fau-jones-photos a{display:block;background:#08131d;border:1px solid #2b3c49;border-radius:12px;padding:8px}
      .fau-jones-photos img{display:block;width:100%;height:auto;max-height:720px;object-fit:contain;border-radius:8px}
      @media(max-width:760px){.fau-jones-photos{grid-template-columns:1fr}}
    `;
    document.head.appendChild(st);
  }

  function card(title, bullets){
    return `<div class="jones-card"><h3>${title}</h3><ul>${bullets.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
  }

  function fauJonesText(){
    return `<div class="fau-jones-doc">
        ${card('Philosophy',[
          '<b>Tempo:</b> they want to get you back on your heels — align and communicate immediately.',
          '<b>Run is an afterthought:</b> box numbers help determine when they run.',
          '<b>Rotation alert:</b> board cue says “they want to spin it.” Do not overreact to late movement.',
          '<b>Core standard:</b> know what to do and how to do it; get all 11 to the ball with bad intentions; keep them out of the end zone.'
        ])}

        ${card('QB — Last Look',[
          '<b>Last-look guy:</b> make the final pre-snap picture matter.',
          '<b>Hot communication:</b> watch for QB signals to WRs and hand signals.',
          '<b>Accuracy:</b> very accurate passer; board reminder is roughly 70%.',
          '<b>Movement:</b> not a runner — make him move without losing rush-lane discipline.'
        ])}

        ${card('Personnel',[
          '<b>#8:</b> best WR / FAST — locate him every snap.',
          '<b>#2:</b> good WR; transfer noted on the board.',
          '<b>#1:</b> big body, but board notes him as soft / not a great blocker.',
          '<b>TE in bunch:</b> tight alignment = run alert; looser alignment = pass alert.',
          '<b>11 personnel:</b> board notes they do not get as much from it when #1 has to block. If #1 is #2 strong, think screen alert.',
          '<b>Motion to empty / 4 strong:</b> curl alert.'
        ])}

        ${card('Formation Alerts',[
          '<b>22 / stacks:</b> screen or vertical alert.',
          '<b>31:</b> spacing; boundary alert if there is no safety help.',
          '<b>FIB 13 — run:</b> bunch is tight; board also flags cross / vertical action.',
          '<b>FIB 13 — pass:</b> 3-vertical alert.',
          '<b>Duo Y Off:</b> throw away from the TE; run to the TE; check the split.'
        ])}

        <div class="jones-card">
          <h3>Original Board Photos</h3>
          <div class="fau-jones-photos">
            <a href="./assets/coach-jones/fau-week4-board-1.jpg" target="_blank" rel="noopener"><img src="./assets/coach-jones/fau-week4-board-1.jpg" alt="Florida Atlantic Coach Jones board notes — philosophy and quarterback"></a>
            <a href="./assets/coach-jones/fau-week4-board-2.jpg" target="_blank" rel="noopener"><img src="./assets/coach-jones/fau-week4-board-2.jpg" alt="Florida Atlantic Coach Jones board notes — personnel and formations"></a>
          </div>
        </div>
      </div>`;
  }

  coachJonesNotesPage = function(){
    if(!isFAUJonesWeek()) return oldJonesPage ? oldJonesPage() : '';
    ensureFAUJonesStyles();
    return `<div class="page-title"><h2>Coach Jones Tips &amp; Reminders</h2><p>Florida Atlantic · Week 4</p></div>${fauJonesText()}`;
  };

  if(oldUpdatePrepChrome){
    updatePrepChrome = function(){
      oldUpdatePrepChrome();
      if(isFAUJonesWeek()) document.querySelectorAll('.nav[data-page="jones"]').forEach(b=>b.style.display='');
    };
  }

  const showJones=()=>{
    ensureFAUJonesStyles();
    if(isFAUJonesWeek()) document.querySelectorAll('.nav[data-page="jones"]').forEach(b=>b.style.display='');
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(showJones,0));
  else setTimeout(showJones,0);
})();