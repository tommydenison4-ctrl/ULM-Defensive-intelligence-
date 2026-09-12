const ROSTER_URL='https://lionsports.net/sports/football/roster';

function strip(s=''){return s.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim()}
function abs(u=''){if(!u)return'';if(u.startsWith('//'))return'https:'+u;if(u.startsWith('/'))return'https://lionsports.net'+u;return u}
function first(re,s){let m=s.match(re);return m?strip(m[1]||m[2]||''):''}

export default async function handler(req,res){
  try{
    const r=await fetch(`${ROSTER_URL}?v=${Date.now()}`,{cache:'no-store',headers:{'user-agent':'Mozilla/5.0'}});
    if(!r.ok)return res.status(r.status).json({error:`Lionsports roster returned ${r.status}`});
    const html=await r.text();
    const blocks=html.split(/<li[^>]+class="[^"]*sidearm-roster-player[^"]*"[^>]*>/i).slice(1);
    const players=[];
    for(const raw of blocks){
      const b=raw.split('</li>')[0]||raw;
      const profile=abs((b.match(/href="([^"]*\/sports\/football\/roster\/[^"]+)"/i)||[])[1]||'');
      const name=first(/class="[^"]*sidearm-roster-player-name[^"]*"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i,b)||first(/<h3[^>]*>([\s\S]*?)<\/h3>/i,b);
      const number=first(/class="[^"]*sidearm-roster-player-jersey-number[^"]*"[^>]*>([\s\S]*?)<\//i,b);
      const position=first(/class="[^"]*sidearm-roster-player-position-short[^"]*"[^>]*>([\s\S]*?)<\//i,b)||first(/class="[^"]*sidearm-roster-player-position-long-short[^"]*"[^>]*>([\s\S]*?)<\//i,b);
      const height=first(/class="[^"]*sidearm-roster-player-height[^"]*"[^>]*>([\s\S]*?)<\//i,b);
      const weight=first(/class="[^"]*sidearm-roster-player-weight[^"]*"[^>]*>([\s\S]*?)<\//i,b).replace(/\s*lbs?\.?$/i,'');
      const cls=first(/class="[^"]*sidearm-roster-player-academic-year[^"]*"[^>]*>([\s\S]*?)<\//i,b)||first(/class="[^"]*sidearm-roster-player-class-hometown[^"]*"[^>]*>([\s\S]*?)<\//i,b).split(' ')[0];
      const hometown=first(/class="[^"]*sidearm-roster-player-hometown[^"]*"[^>]*>([\s\S]*?)<\//i,b);
      let image='';
      const im=b.match(/<img[^>]+(?:data-src|src)="([^"]+)"[^>]*>/i); if(im) image=abs(im[1]);
      if(name)players.push({number,name,position,height,weight,class:cls,hometown,profile,image,source:'Official Southeastern Louisiana 2026 roster'});
    }
    const seen=new Set();
    const clean=players.filter(p=>{let k=(p.name+'|'+p.number+'|'+p.position).toLowerCase();if(seen.has(k))return false;seen.add(k);return true});
    res.setHeader('Cache-Control','no-store, max-age=0');
    res.status(200).json({season:2026,players:clean,source:ROSTER_URL,count:clean.length});
  }catch(e){res.status(500).json({error:e?.message||'Roster scrape failed'})}
}
