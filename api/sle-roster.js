const ROSTER_URL='https://lionsports.net/sports/football/roster';

function strip(s=''){return String(s||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim()}
function abs(u=''){if(!u)return'';if(u.startsWith('//'))return'https:'+u;if(u.startsWith('/'))return'https://lionsports.net'+u;return u}
function norm(s=''){return strip(s).toLowerCase().replace(/[^a-z0-9]/g,'')}
function first(re,s){const m=String(s||'').match(re);return m?strip(m[1]||m[2]||''):''}

function imageAttrs(tag=''){
  const out=[];
  for(const a of ['data-src','data-original','data-lazy-src','data-lazy','data-image','src']){
    const m=tag.match(new RegExp(`${a}=["']([^"']+)["']`,'i'));if(m?.[1])out.push(abs(m[1]));
  }
  const ss=tag.match(/srcset=["']([^"']+)["']/i);if(ss?.[1])ss[1].split(',').forEach(x=>out.push(abs(x.trim().split(/\s+/)[0])));
  return [...new Set(out)].filter(Boolean);
}
function imgScore(tag,url,name,dist=0){
  const t=String(tag).toLowerCase(),u=String(url).toLowerCase();let s=0;
  if(norm(t).includes(norm(name)))s+=160;
  if(/sidearm-roster-player-image|roster-player-image|sidearm-roster-player-photo/.test(t))s+=120;
  if(/images\.sidearmdev\.com/.test(u))s+=55;
  if(/cloudfront\.net/.test(u))s+=35;
  if(/roster|player|football|headshot|portrait/.test(u))s+=30;
  if(/logo|wordmark|header|footer|sponsor|icon|placeholder|default|facility|stadium|story/.test(u))s-=200;
  s-=Math.min(80,Math.floor(dist/80));
  return s;
}
function bestImageNear(html,anchorIndex,name){
  const start=Math.max(0,anchorIndex-4500),end=Math.min(html.length,anchorIndex+5500),chunk=html.slice(start,end),cands=[];
  for(const m of chunk.matchAll(/<img\b[^>]*>/gi)){
    const tag=m[0],dist=Math.abs((start+(m.index||0))-anchorIndex);
    for(const url of imageAttrs(tag))cands.push({url,score:imgScore(tag,url,name,dist)});
  }
  cands.sort((a,b)=>b.score-a.score);
  return cands.find(x=>x.score>20)?.url||'';
}
function textAround(html,idx){return html.slice(Math.max(0,idx-2200),Math.min(html.length,idx+3500))}

export default async function handler(req,res){
  try{
    const r=await fetch(`${ROSTER_URL}?v=${Date.now()}`,{cache:'no-store',headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
    if(!r.ok)return res.status(r.status).json({error:`Lionsports roster returned ${r.status}`});
    const html=await r.text(),players=[],seenProfile=new Set();
    const re=/<a[^>]+href=["']([^"']*\/sports\/football\/roster\/[^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while((m=re.exec(html))){
      const profile=abs(m[1]);if(!profile||seenProfile.has(profile))continue;
      let name=strip(m[2]);
      const chunk=textAround(html,m.index);
      if(!name||name.length>80||/full bio|view/i.test(name)) name=first(/class=["'][^"']*sidearm-roster-player-name[^"']*["'][\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i,chunk)||first(/<h3[^>]*>([\s\S]*?)<\/h3>/i,chunk);
      if(!name||/coaches|staff|schedule|roster/i.test(name))continue;
      const number=first(/class=["'][^"']*sidearm-roster-player-jersey-number[^"']*["'][^>]*>([\s\S]*?)<\//i,chunk);
      const position=first(/class=["'][^"']*sidearm-roster-player-position-short[^"']*["'][^>]*>([\s\S]*?)<\//i,chunk)||first(/class=["'][^"']*sidearm-roster-player-position-long-short[^"']*["'][^>]*>([\s\S]*?)<\//i,chunk);
      const height=first(/class=["'][^"']*sidearm-roster-player-height[^"']*["'][^>]*>([\s\S]*?)<\//i,chunk);
      const weight=first(/class=["'][^"']*sidearm-roster-player-weight[^"']*["'][^>]*>([\s\S]*?)<\//i,chunk).replace(/\s*lbs?\.?$/i,'');
      const cls=first(/class=["'][^"']*sidearm-roster-player-academic-year[^"']*["'][^>]*>([\s\S]*?)<\//i,chunk);
      const hometown=first(/class=["'][^"']*sidearm-roster-player-hometown[^"']*["'][^>]*>([\s\S]*?)<\//i,chunk);
      const image=bestImageNear(html,m.index,name);
      players.push({number,name,position,height,weight,class:cls,hometown,profile,image,source:'Official Southeastern Louisiana 2026 roster'});
      seenProfile.add(profile);
    }
    const seen=new Set(),clean=players.filter(p=>{const k=norm(p.name)+'|'+String(p.number||'')+'|'+String(p.position||'');if(!p.name||seen.has(k))return false;seen.add(k);return true});
    res.setHeader('Cache-Control','no-store, max-age=0');
    res.status(200).json({season:2026,players:clean,source:ROSTER_URL,count:clean.length});
  }catch(e){res.status(500).json({error:e?.message||'Roster scrape failed'})}
}
