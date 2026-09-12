const ROSTER_URL='https://lionsports.net/sports/football/roster/2026';

const strip=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const dec=s=>String(s||'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const abs=(u,base='https://lionsports.net')=>{if(!u)return'';if(u.startsWith('//'))return'https:'+u;if(u.startsWith('/'))return new URL(u,base).toString();return u};
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');

async function fetchHtml(url){
  const r=await fetch(url,{cache:'no-store',headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
  if(!r.ok)throw new Error(`fetch ${r.status}`);
  return r.text();
}

function rosterBlocks(html){
  return html.split(/<li[^>]+class=["'][^"']*sidearm-roster-player[^"']*["'][^>]*>/i).slice(1).map(raw=>(raw.split('</li>')[0]||raw));
}

function findRosterBlock(html,name){
  const target=norm(name);
  if(!target)return'';
  for(const b of rosterBlocks(html)){
    if(norm(strip(b)).includes(target))return b;
  }
  return'';
}

function profileFromBlock(b){
  const m=String(b||'').match(/href=["']([^"']*\/sports\/football\/roster\/[^"']+)["']/i);
  return m?.[1]?abs(dec(m[1])):'';
}

function candidateFromImgTag(tag,base){
  const attrs=['data-src','data-original','data-lazy-src','data-lazy','data-image','src'];
  for(const a of attrs){
    const re=new RegExp(`${a}=["']([^"']+)["']`,'i');
    const m=tag.match(re);if(m?.[1])return abs(dec(m[1]),base);
  }
  const ss=tag.match(/srcset=["']([^"']+)["']/i);
  if(ss?.[1]){
    const first=ss[1].split(',')[0].trim().split(/\s+/)[0];
    if(first)return abs(dec(first),base);
  }
  return'';
}

function scoreImage(tag,url,name){
  const t=String(tag||'').toLowerCase(),u=String(url||'').toLowerCase();
  let s=0;
  if(norm(t).includes(norm(name)))s+=100;
  if(/sidearm-roster-player-image|roster-player-image/.test(t))s+=80;
  if(/images\.sidearmdev\.com\/convert/.test(u))s+=35;
  if(/dxbhsrqyrr690\.cloudfront\.net/.test(u))s+=30;
  if(/player|roster|football/.test(u))s+=10;
  if(/logo|wordmark|header|footer|sponsor|icon|placeholder|default/.test(u))s-=100;
  return s;
}

function bioImageFromRosterBlock(b,name){
  if(!b)return'';
  const tags=[...b.matchAll(/<img\b[^>]*>/gi)].map(m=>m[0]);
  const scored=[];
  for(const tag of tags){
    const url=candidateFromImgTag(tag,ROSTER_URL);if(!url)continue;
    scored.push({url,score:scoreImage(tag,url,name)});
  }
  scored.sort((a,b)=>b.score-a.score);
  return scored[0]?.url||'';
}

function imageFromProfile(html,base){
  const patterns=[
    /<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i,
    /<img[^>]+(?:data-src|data-original|data-lazy-src|data-lazy|src)=["']([^"']*images\.sidearmdev\.com\/convert\?[^"']+)["'][^>]*>/i,
    /(https:\/\/dxbhsrqyrr690\.cloudfront\.net\/[^"'<>\s]+\.(?:jpg|jpeg|png|webp))/i
  ];
  for(const p of patterns){const m=html.match(p);if(m?.[1])return abs(dec(m[1]),base)}
  return'';
}

async function proxyImage(image,res){
  const out=new URL(image,'https://lionsports.net');
  if(!['images.sidearmdev.com','dxbhsrqyrr690.cloudfront.net'].includes(out.hostname)){
    res.status(403).send('Image host not allowed');return;
  }
  const ir=await fetch(out.toString(),{headers:{'user-agent':'Mozilla/5.0','referer':'https://lionsports.net/','accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'}});
  if(!ir.ok){res.status(ir.status).send('Image fetch failed');return}
  const buf=Buffer.from(await ir.arrayBuffer());
  res.setHeader('Content-Type',ir.headers.get('content-type')||'image/jpeg');
  res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');
  res.status(200).send(buf);
}

export default async function handler(req,res){
  try{
    const raw=Array.isArray(req.query.url)?req.query.url[0]:req.query.url;
    const name=Array.isArray(req.query.name)?req.query.name[0]:req.query.name;

    // First choice: official roster-card portrait/bio headshot.
    if(name){
      const rosterHtml=await fetchHtml(ROSTER_URL);
      const block=findRosterBlock(rosterHtml,name);
      const bio=bioImageFromRosterBlock(block,name);
      if(bio){await proxyImage(bio,res);return}
      const profile=profileFromBlock(block);
      if(profile){
        const ph=await fetchHtml(profile);
        const fallback=imageFromProfile(ph,profile);
        if(fallback){await proxyImage(fallback,res);return}
      }
    }

    // URL fallback for older callers.
    if(raw){
      let u;try{u=new URL(raw)}catch{res.status(400).send('Bad url');return}
      if(!['lionsports.net','www.lionsports.net'].includes(u.hostname)){res.status(403).send('Host not allowed');return}
      const html=await fetchHtml(u.toString());
      const image=imageFromProfile(html,u.toString());
      if(image){await proxyImage(image,res);return}
    }

    res.status(404).send('No official player bio image found');
  }catch(e){res.status(500).send(e?.message||'Image resolver failed')}
}
