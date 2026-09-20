const ROSTER_URL='https://fausports.com/sports/football/roster';
const BASE='https://fausports.com';
const strip=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const abs=u=>{u=String(u||'').trim();if(!u)return'';if(u.startsWith('//'))return'https:'+u;if(u.startsWith('/'))return BASE+u;return u};
function attr(tag,key){const m=String(tag||'').match(new RegExp(key+'=["\\']([^"\\']+)["\\']','i'));return m?m[1]:''}
function imageFrom(block){
  const tags=[...String(block||'').matchAll(/<img\b[^>]*>/gi)].map(m=>m[0]);
  let best='';
  for(const tag of tags){
    const low=tag.toLowerCase();
    if(!/sidearm-roster-player-image|roster-player-image|headshot|portrait/.test(low))continue;
    const vals=['data-src','data-original','data-lazy-src','src'].map(k=>attr(tag,k)).filter(Boolean);
    const ss=attr(tag,'srcset'); if(ss) ss.split(',').forEach(x=>vals.push(x.trim().split(/\s+/)[0]));
    for(const v of vals){const u=abs(v);if(u&&!/logo|placeholder|default|sponsor|icon|story|news|signing|social|graphic/i.test(u)){best=u;break}}
    if(best)break;
  }
  if(!best){
    for(const m of String(block||'').matchAll(/<img\b[^>]*>/gi)){
      const tag=m[0],alt=strip(attr(tag,'alt'));
      if(!alt)continue;
      const vals=['data-src','data-original','data-lazy-src','src'].map(k=>attr(tag,k)).filter(Boolean);
      for(const v of vals){const u=abs(v);if(u&&!/logo|placeholder|default|sponsor|icon|story|news|signing|social|graphic/i.test(u)){best=u;break}}
      if(best)break;
    }
  }
  return best;
}
function field(block,cls){const re=new RegExp('<[^>]*class=["\\'][^"\\']*'+cls+'[^"\\']*["\\'][^>]*>([\\s\\S]*?)<\\/[^>]+>','i');const m=String(block||'').match(re);return m?strip(m[1]):''}
function parse(html){
  const players=[];
  const re=/<li\b[^>]*class=["'][^"']*sidearm-roster-player[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while((m=re.exec(html))){
    const b=m[1];
    const link=[...b.matchAll(/<a\b[^>]+href=["']([^"']*\/sports\/football\/roster\/[^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(x=>({href:x[1],label:strip(x[2])})).find(x=>x.label&&!/^jersey number/i.test(x.label)&&!/full bio/i.test(x.label));
    if(!link)continue;
    const name=link.label;
    const number=(field(b,'sidearm-roster-player-jersey-number').match(/\d{1,2}/)||[])[0]||'';
    const position=field(b,'sidearm-roster-player-position').replace(/^Position\s*/i,'').trim();
    const cls=field(b,'sidearm-roster-player-academic-year').replace(/^Academic Year\s*/i,'').trim();
    const hometown=field(b,'sidearm-roster-player-hometown').replace(/^Hometown\s*/i,'').trim();
    const profile=abs(link.href);
    const image=imageFrom(b);
    players.push({name,number,position,class:cls,hometown,profile,image});
  }
  return players;
}
export default async function handler(req,res){
  try{
    const r=await fetch(ROSTER_URL+'?view=2&v='+Date.now(),{cache:'no-store',redirect:'follow',headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
    if(!r.ok)throw new Error('FAU roster '+r.status);
    const html=await r.text();
    const players=parse(html);
    if(!players.length)throw new Error('No FAU roster cards parsed');
    res.setHeader('Cache-Control','public, s-maxage=21600, stale-while-revalidate=86400');
    res.status(200).json({season:2026,players});
  }catch(e){res.status(500).json({season:2026,players:[],error:e?.message||'FAU roster parse failed'})}
}
