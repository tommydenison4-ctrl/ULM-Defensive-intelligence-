const ROSTER_URL='https://lionsports.net/sports/football/roster/2026';

function strip(s=''){return s.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim()}
function abs(u=''){if(!u)return'';if(u.startsWith('//'))return'https:'+u;if(u.startsWith('/'))return'https://lionsports.net'+u;return u}
function first(re,s){let m=s.match(re);return m?strip(m[1]||m[2]||''):''}
function imageFromBlock(b=''){
  const vals=[];
  const attrs=['data-src','data-original','data-lazy-src','data-lazy','data-image','src'];
  for(const a of attrs){const re=new RegExp(`${a}=["']([^"']+)["']`,'ig');let m;while((m=re.exec(b)))vals.push(m[1])}
  const ss=[...b.matchAll(/srcset=["']([^"']+)["']/ig)];for(const x of ss)x[1].split(',').forEach(v=>vals.push(v.trim().split(/\s+/)[0]));
  const clean=[];
  for(let v of vals){v=abs(v);if(!v||/^data:/i.test(v)||/logo|placeholder|spacer|transparent|wordmark|sponsor/i.test(v))continue;if(/sidearmdev|cloudfront|lionsports\.net/i.test(v))clean.push(v)}
  clean.sort((a,b)=>{const sa=(/roster|player|football/i.test(a)?20:0)+(/images\.sidearmdev\.com/i.test(a)?10:0);const sb=(/roster|player|football/i.test(b)?20:0)+(/images\.sidearmdev\.com/i.test(b)?10:0);return sb-sa});
  return clean[0]||'';
}

function getBlocks(html){
  let blocks=html.split(/<li[^>]+class=["'][^"']*sidearm-roster-player[^"']*["'][^>]*>/i).slice(1).map(raw=>raw.split('</li>')[0]||raw);
  if(blocks.length)return blocks;
  blocks=html.split(/<div[^>]+class=["'][^"']*sidearm-roster-player[^"']*["'][^>]*>/i).slice(1).map(raw=>raw.split('</div>')[0]||raw);
  return blocks;
}

export default async function handler(req,res){
  try{
    const r=await fetch(`${ROSTER_URL}?v=${Date.now()}`,{cache:'no-store',headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
    if(!r.ok)return res.status(r.status).json({error:`Lionsports roster returned ${r.status}`});
    const html=await r.text();
    const blocks=getBlocks(html),players=[];
    for(const b of blocks){
      const pm=b.match(/href=["']([^"']*\/sports\/football\/roster\/[^"']+)["']/i);
      const profile=abs(pm?.[1]||'');
      const name=first(/class=["'][^"']*sidearm-roster-player-name[^"']*["'][\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i,b)||first(/<h3[^>]*>([\s\S]*?)<\/h3>/i,b);
      const number=first(/class=["'][^"']*sidearm-roster-player-jersey-number[^"']*["'][^>]*>([\s\S]*?)<\//i,b);
      const position=first(/class=["'][^"']*sidearm-roster-player-position-short[^"']*["'][^>]*>([\s\S]*?)<\//i,b)||first(/class=["'][^"']*sidearm-roster-player-position-long-short[^"']*["'][^>]*>([\s\S]*?)<\//i,b);
      const height=first(/class=["'][^"']*sidearm-roster-player-height[^"']*["'][^>]*>([\s\S]*?)<\//i,b);
      const weight=first(/class=["'][^"']*sidearm-roster-player-weight[^"']*["'][^>]*>([\s\S]*?)<\//i,b).replace(/\s*lbs?\.?$/i,'');
      const cls=first(/class=["'][^"']*sidearm-roster-player-academic-year[^"']*["'][^>]*>([\s\S]*?)<\//i,b)||first(/class=["'][^"']*sidearm-roster-player-class-hometown[^"']*["'][^>]*>([\s\S]*?)<\//i,b).split(' ')[0];
      const hometown=first(/class=["'][^"']*sidearm-roster-player-hometown[^"']*["'][^>]*>([\s\S]*?)<\//i,b);
      const image=imageFromBlock(b);
      if(name)players.push({number,name,position,height,weight,class:cls,hometown,profile,image,source:'Official Southeastern Louisiana 2026 roster'});
    }
    const seen=new Set(),clean=players.filter(p=>{let k=(p.name+'|'+p.number+'|'+p.position).toLowerCase();if(seen.has(k))return false;seen.add(k);return true});
    res.setHeader('Cache-Control','no-store, max-age=0');
    res.status(200).json({season:2026,players:clean,source:ROSTER_URL,count:clean.length});
  }catch(e){res.status(500).json({error:e?.message||'Roster scrape failed'})}
}
