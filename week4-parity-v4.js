/* Week 4 Florida Atlantic v4: repair PFF filename loading, treat uploaded sample as 2026-only, and render structured 2-deep like prior weeks. */
(() => {
  const isW4=()=>typeof prepWeek!=='undefined'&&prepWeek==='W4';
  const oldLoad=typeof loadOpponentData==='function'?loadOpponentData:null;
  const oldDepth=typeof depthChartPage==='function'?depthChartPage:null;
  const noPlay=r=>['1','TRUE','T','YES'].includes(String(r?.pff_NOPLAY??'').trim().toUpperCase());

  const keys={plays:25,qb:63,routes:64,dropbacks:65,passOverall:66,pressure:67,receiving:68,rushing:69,runConcepts:70,runDirections:71,runBlocking:72,passBlocking:73,formations:74,personnel:75};
  function candidates(key,n){
    if(key==='plays') return [`play_feed (25).csv`,`play_feed-25.csv`,`play_feed_25.csv`,`play_feed (25)(1).csv`,`play_feed (25)(2).csv`,`play_feed-25 (1).csv`];
    return [`pff-data (${n}).csv`,`pff-data-${n}.csv`,`pff-data_${n}.csv`,`pff-data (${n})(1).csv`,`pff-data (${n})(2).csv`,`pff-data-${n} (1).csv`];
  }
  async function tryKey(key,n){
    if(loadState?.[key]?.ok)return true;
    for(const f of candidates(key,n)){
      try{
        FILES[key]=f;
        await fetchCSV(key);
        if(loadState?.[key]?.ok)return true;
      }catch(e){}
    }
    return false;
  }
  async function repairFiles(){
    if(!isW4())return;
    for(const [k,n] of Object.entries(keys)) await tryKey(k,n);
    let raw=(rawPlayRows&&rawPlayRows.length)?rawPlayRows.slice():((datasets?.plays||[]).slice());
    // Week 4 is intentionally 2026-only; do not throw away the sample when GAMESEASON is blank.
    if(raw.length){rawPlayRows=raw.slice();datasets.plays=raw.filter(r=>!noPlay(r));}
    analysisMode='current';
    const h=document.getElementById('headerStatus');
    if(h){
      const ok=Object.keys(keys).filter(k=>loadState?.[k]?.ok).length;
      h.textContent=`Florida Atlantic live • ${(datasets.plays||[]).length} eligible 2026 plays • no-plays excluded • ${(roster||[]).length} roster players • ${ok}/${Object.keys(keys).length} PFF files`;
    }
  }
  if(oldLoad){
    loadOpponentData=async function(...args){
      const out=await oldLoad.apply(this,args);
      if(isW4()){
        await repairFiles();
        if(typeof render==='function')render();
      }
      return out;
    };
  }

  const DEPTH=[
    {pos:'WR-X',players:[['9','Dominique Henry','RS SR/TR'],['0','Branden Hoch','SO']]},
    {pos:'WR-Z',players:[['2','Kelby Valsin','RS JR/TR'],['3','Tucker Holloway','RS SR/TR']]},
    {pos:'WR-Y',players:[['8','Easton Messer','RS SR/TR'],['6','RJ Garcia II','GR/TR']]},
    {pos:'LT',players:[['57',"Ja'Kavion Nonar",'RS SR/TR'],['73','Kortez Winslow','RS JR/TR']]},
    {pos:'LG',players:[['58','Aiden Jones','RS SO/TR'],['60','Aqil Meredith-Smith','SO/TR']]},
    {pos:'C',players:[['65','Braden Cunningham','RS SO'],['71','Landon Rapkiewicz','RS FR']]},
    {pos:'RG',players:[['62','Vincent Fiacable','RS SR/TR'],['75','Mauricio Hinds','RS SO']]},
    {pos:'RT',players:[['74','Ben Galloway','RS JR/TR'],['64','Vincent Forney','RS SO/TR']]},
    {pos:'TE',players:[['1','AJ Johnson','RS SR/TR'],['11','Brooks Johnson','RS SR/TR']]},
    {pos:'QB',players:[['10','Caden Veltkamp','GR/TR'],['7','Jordan Magwood','RS FR'],['12','Jeremiah Daoud','FR'],['18','Drew Devillier','RS SO/TR']]},
    {pos:'RB',players:[['5','Leonard Farrow','RS SR/TR'],['21','Ethan Ervin','RS FR'],['22','Brady Tillman III','RS JR/TR'],['28','Kaden Shields-Dutton','JR']]}
  ];
  function cell(x){
    if(!x)return '—';
    const [number,name,cls]=x;
    return `<button class="depth-player" onclick='openFAUProfile(${JSON.stringify(name)})'><span class="depth-no">#${esc(number)}</span><span class="depth-name">${esc(name)}</span>${cls?`<span class="depth-class">${esc(cls)}</span>`:''}</button>`;
  }
  depthChartPage=function(){
    if(!isW4())return oldDepth?oldDepth():'';
    return `<div class="page-title"><h2>Florida Atlantic 2 Deep</h2><p>Week 4 offensive depth chart · same in-app format as previous opponent weeks. Click a player to open Player Intelligence.</p></div>${typeof dataStatus==='function'?dataStatus():''}<div class="depth-shell"><div class="depth-card"><div class="depth-head"><div><div class="sub">Week 4 Opponent</div><h3>Florida Atlantic Offense · Air Raid</h3></div><div style="text-align:right"><div class="sub">Updated 09/11/2026</div><div style="font-size:11px;font-weight:850">2026 Current Depth</div></div></div><table class="depth-table"><thead><tr><th>Position</th><th>1st</th><th>2nd</th><th>Additional</th></tr></thead><tbody>${DEPTH.map(r=>`<tr><td class="pos">${esc(r.pos)}</td><td>${cell(r.players[0])}</td><td>${cell(r.players[1])}</td><td>${r.players.slice(2).map(cell).join(' ')||'—'}</td></tr>`).join('')}</tbody></table><div class="depth-note">Source: Florida Atlantic 2026 depth chart. Player names are linked directly into the Week 4 Player Intelligence drawer.</div></div></div>`;
  };

  setTimeout(async()=>{if(isW4()){await repairFiles();if(typeof render==='function')render();}},900);
})();
