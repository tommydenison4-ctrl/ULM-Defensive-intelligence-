/* Week 4 FAU production bridge: load the approved 54-player roster + exact official bio-headshot layer. */
(() => {
  const src='./week4-photo-exact-v2.js?v=20260920prod54';
  if(document.querySelector(`script[src="${src}"]`)) return;
  const s=document.createElement('script');
  s.src=src;
  s.async=false;
  s.onload=()=>{
    try{
      if(typeof prepWeek!=='undefined'&&prepWeek==='W4'&&typeof render==='function') render();
    }catch(e){console.error('FAU approved production layer render failed',e)}
  };
  s.onerror=()=>console.error('FAU approved production layer failed to load',src);
  document.head.appendChild(s);
})();
