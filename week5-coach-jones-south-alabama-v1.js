/* Week 5 South Alabama — Coach Jones Tips & Reminders. */
(() => {
  const isUSAJonesWeek = () => typeof prepWeek !== 'undefined' && prepWeek === 'W5';
  const priorJonesPage = typeof coachJonesNotesPage === 'function' ? coachJonesNotesPage : null;
  const priorUpdatePrepChrome = typeof updatePrepChrome === 'function' ? updatePrepChrome : null;

  function ensureUSAJonesStyles(){
    if(document.getElementById('usaJonesW5Styles')) return;
    const st=document.createElement('style');
    st.id='usaJonesW5Styles';
    st.textContent=`
      .usa-jones-wrap{display:flex;flex-direction:column;gap:12px;max-width:1050px}
      .usa-jones-card{background:#f7f9fb!important;border:1px solid #d7dee6!important;border-left:5px solid var(--gold)!important;border-radius:14px;padding:15px;color:#142434!important}
      .usa-jones-card h3{margin:0 0 9px;color:#8a2432!important}
      .usa-jones-card ul{margin:0;padding-left:20px}
      .usa-jones-card li{margin:7px 0;line-height:1.45;font-size:13px;color:#142434!important}
      .usa-jones-card b{font-weight:900}
      @media(max-width:760px){.usa-jones-card{padding:13px}}
    `;
    document.head.appendChild(st);
  }

  function card(title, bullets){
    return `<div class="usa-jones-card"><h3>${title}</h3><ul>${bullets.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
  }

  function usaJonesText(){
    return `<div class="usa-jones-wrap">
      ${card('Philosophy',[
        '<b>Run the ball effectively, then RPO.</b>',
        '<b>Reduce splits.</b>',
        '<b>Work to the grass.</b>',
        '<b>Same throws for the QB:</b> defend the hash throw.',
        '<b>Tempo:</b> they play fast and confident.'
      ])}

      ${card('Quarterback',[
        '<b>Very athletic.</b>',
        '<b>Quick release.</b>',
        '<b>Strong arm.</b>'
      ])}

      ${card('Personnel',[
        '<b>OL:</b> really athletic.',
        '<b>#0 RB:</b> very good player.',
        '<b>Run direction:</b> runs happen to the down TE.',
        '<b>RT:</b> run/pass tell.',
        '<b>Guards:</b> bird-dog on gap scheme.',
        '<b>Press man:</b> slot fade / #2 strong alert.',
        '<b>End-over:</b> sprint-out alert.',
        '<b>TE/RB same side:</b> gap-scheme alert.',
        '<b>Motion:</b> takes you to plays.'
      ])}

      ${card('Formation Alerts',[
        '<b>Empty:</b> throws to #3 — strong/weak alert.',
        '<b>22 Duo Y Off:</b> RPO / boots.'
      ])}

      ${card('Splits',[
        '<b>Cut splits:</b> outside.',
        '<b>Regular splits:</b> inside / hash.',
        '<b>Cut splits:</b> RPO alert.',
        '<b>Cut splits both sides:</b> mesh alert.',
        '<b>Hash alert:</b> there is a route that shows up on the hash nearly 100% of the time.'
      ])}

      ${card('Down & Distance',[
        '<b>1st & 10:</b> vertical-pass alert.',
        '<b>4th & 2:</b> picks / free-release back alert.'
      ])}

      ${card('Field Position',[
        '<b>Cross 50:</b> shots.',
        '<b>Red zone:</b> QB draws.'
      ])}
    </div>`;
  }

  coachJonesNotesPage = function(){
    if(!isUSAJonesWeek()) return priorJonesPage ? priorJonesPage() : '';
    ensureUSAJonesStyles();
    return `<div class="page-title"><h2>Coach Jones Tips &amp; Reminders</h2><p>South Alabama · Week 5</p></div>${usaJonesText()}`;
  };

  if(priorUpdatePrepChrome){
    updatePrepChrome = function(){
      priorUpdatePrepChrome();
      if(isUSAJonesWeek()) document.querySelectorAll('.nav[data-page="jones"]').forEach(b=>b.style.display='');
    };
  }

  const reveal=()=>{
    ensureUSAJonesStyles();
    if(isUSAJonesWeek()) document.querySelectorAll('.nav[data-page="jones"]').forEach(b=>b.style.display='');
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(reveal,0));
  else setTimeout(reveal,0);
})();