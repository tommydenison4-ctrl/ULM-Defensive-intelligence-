const ROSTER_URL='https://fausports.com/sports/football/roster';
const BASE='https://fausports.com';
const strip=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const abs=u=>{if(!u)return'';if(u.startsWith('//'))return'https:'+u;if(u.startsWith('/'))return BASE+u;return u};
const first=(re,s)=>{const m=String(s||'').match(re);return m?strip(m[1]||m[2]||''):''};
const attr=(tag,key)=>{const m=String(tag||'').match(new RegExp(`${key}=["']([^"']+)["']`,'i'));return m?m[1]:''};
function imageFromCard(card,name){
  const imgs=[...String(card||'').matchAll(/<img\b[^>]*>/gi)].map(m=>m[0]);
  let best='',score=-999;
  for(const tag of imgs){
    const candidates=['data-src','data-original','data-lazy-src','data-lazy','src'].map(k=>attr(tag,k)).filter(Boolean);
    const ss=attr(tag,'srcset');if(ss)ss.split(',').forEach(x=>candidates.push(x.trim().split(/\s+/)[0]));
    for(let u of candidates){u=abs(u);if(!u||/^data:/i.test(u))continue;let s=0,low=(tag+' '+u).toLowerCase();
      if(/sidearm-roster-player-image|roster-player-image|headshot|portrait/.test(low))s+=200;
      if(String(attr(tag,'alt')).toLowerCase().includes(String(name||'').toLowerCase()))s+=250;
      if(/action|story|news|signing|social|graphic|logo|wordmark|placeholder|default|sponsor/.test(low))s-=500;
      if(s>score){score=s;best=u}
    }
  }
  return score>0?best:'';
}
function playerCards(html){
  const out=[];const re=/<li\b[^>]*class=["'][^"']*sidearm-roster-player[^"']*["'][^>]*>/gi;let m;
  while((m=re.exec(html))){const start=m.index;const end=html.indexOf('</li>',re.lastIndex);if(end<0)break;out.push(html.slice(start,end+5));re.lastIndex=end+5;}
  if(out.length)return out;
  const div=/<div\b[^>]*class=["'][^"']*sidearm-roster-player-container[^"']*["'][^>]*>/gi;while((m=div.exec(html))){const start=m.index;const next=html.indexOf('sidearm-roster-player-container',div.lastIndex);out.push(html.slice(start,next>start?next:Math.min(html.length,start+12000)));if(next>start)div.lastIndex=next;}return out;
}
export default async function handler(req,res){
  try{
    const r=await fetch(ROSTER_URL+'?v='+Date.now(),{cache:'no-store',headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});if(!r.ok)return res.status(r.status).json({error:`FAU roster returned ${r.status}`});
    const html=await r.text(),cards=playerCards(html),players=[],seen=new Set();
    for(const card of cards){
      const pm=card.match(/<a\b[^>]+href=["']([^"']*\/sports\/football\/roster\/[^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/i);if(!pm)continue;
      const profile=abs(pm[1]);let name=first(/class=["'][^"']*sidearm-roster-player-name[^"']*["'][\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i,card)||strip(pm[2]);
      if(!name||/full bio|view/i.test(name))continue;const key=profile||name;if(seen.has(key))continue;seen.add(key);
      const number=first(/class=["'][^"']*sidearm-roster-player-jersey-number[^"']*["'][^>]*>([\s\S]*?)<\//i,card);
      const position=first(/class=["'][^"']*sidearm-roster-player-position-short[^"']*["'][^>]*>([\s\S]*?)<\//i,card)||first(/class=["'][^"']*sidearm-roster-player-position-long-short[^"']*["'][^>]*>([\s\S]*?)<\//i,card);
      const height=first(/class=["'][^"']*sidearm-roster-player-height[^"']*["'][^>]*>([\s\S]*?)<\//i,card);
      const weight=first(/class=["'][^"']*sidearm-roster-player-weight[^"']*["'][^>]*>([\s\S]*?)<\//i,card).replace(/\s*lbs?\.?$/i,'');
      const cls=first(/class=["'][^"']*sidearm-roster-player-academic-year[^"']*["'][^>]*>([\s\S]*?)<\//i,card);
      const hometown=first(/class=["'][^"']*sidearm-roster-player-hometown[^"']*["'][^>]*>([\s\S]*?)<\//i,card);
      const image=imageFromCard(card,name);
      players.push({number,name,position,height,weight,class:cls,hometown,profile,image,source:'Official Florida Atlantic 2026 roster'});
    }
    res.setHeader('Cache-Control','no-store, max-age=0');res.status(200).json({season:2026,count:players.length,players,source:ROSTER_URL});
  }catch(e){res.status(500).json({error:e?.message||'FAU roster scrape failed'})}
}
