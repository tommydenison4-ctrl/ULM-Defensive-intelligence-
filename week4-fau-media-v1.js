/* Week 4 FAU production bridge: load the approved 54-player roster layer once. */
(()=>{
  const src='./week4-approved-roster-v4.js?v=20260920approved54';
  if(document.querySelector(`script[src="${src}"]`))return;
  const s=document.createElement('script');
  s.src=src;s.async=false;
  s.onload=()=>{try{if(typeof prepWeek!=='undefined'&&prepWeek==='W4'){if(typeof window.__installFAUApprovedRoster==='function')window.__installFAUApprovedRoster();if(typeof render==='function')render()}}catch(e){console.error('FAU approved roster layer render failed',e)}};
  s.onerror=()=>console.error('FAU approved roster layer failed to load',src);
  document.head.appendChild(s);
})();
