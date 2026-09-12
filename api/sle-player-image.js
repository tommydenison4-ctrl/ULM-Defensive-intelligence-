const ROSTER_URL='https://lionsports.net/sports/football/roster/2026';

const strip=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const dec=s=>String(s||'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const abs=(u,base='https://lionsports.net')=>{if(!u)return'';if(u.startsWith('//'))return'https:'+u;if(u.startsWith('/'))return new URL(u,base).toString();return u};

async function fetchHtml(url){
  const r=await fetch(url,{cache:'no-store',headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
  if(!r.ok)throw new Error(`fetch ${r.status}`);
  return r.text();
}

function profileFromRoster(html,name){
  const target=String(name||'').trim().toLowerCase();
  if(!target)return'';
  const blocks=html.split(/<li[^>]+class=["'][^"']*sidearm-roster-player[^"']*["'][^>]*>/i).slice(1);
  for(const raw of blocks){
    const b=raw.split('</li>')[0]||raw;
    const txt=strip(b).toLowerCase();
    if(!txt.includes(target))continue;
    const m=b.match(/href=["']([^"']*\/sports\/football\/roster\/[^"']+)["']/i);
    if(m?.[1])return abs(dec(m[1]));
  }
  const escaped=target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re=new RegExp(`href=["']([^"']*\\/sports\\/football\\/roster\\/[^"']+)["'][^>]*>[\\s\\S]{0,500}?${escaped}`,'i');
  const m=html.match(re);return m?.[1]?abs(dec(m[1])):'';
}

function imageFromProfile(html,base){
  const patterns=[
    /<img[^>]+(?:data-src|data-original|data-lazy|src)=["']([^"']*images\.sidearmdev\.com\/convert\?[^"']+)["'][^>]*>/i,
    /(?:data-src|data-original|data-lazy|src)=["']([^"']*images\.sidearmdev\.com\/convert\?[^"']+)["']/i,
    /srcset=["']([^"']*images\.sidearmdev\.com\/convert\?[^"'\s,]+)/i,
    /(https:\/\/images\.sidearmdev\.com\/convert\?[^"'<>\s]+)/i,
    /(https:\/\/dxbhsrqyrr690\.cloudfront\.net\/[^"'<>\s]+\.(?:jpg|jpeg|png|webp))/i,
    /<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i
  ];
  for(const p of patterns){const m=html.match(p);if(m?.[1])return abs(dec(m[1]),base)}
  return'';
}

export default async function handler(req,res){
  try{
    const raw=Array.isArray(req.query.url)?req.query.url[0]:req.query.url;
    const name=Array.isArray(req.query.name)?req.query.name[0]:req.query.name;
    let profile='';
    if(raw){
      let u;try{u=new URL(raw)}catch{res.status(400).send('Bad url');return}
      if(!['lionsports.net','www.lionsports.net'].includes(u.hostname)){res.status(403).send('Host not allowed');return}
      profile=u.toString();
    } else if(name){
      const rosterHtml=await fetchHtml(ROSTER_URL);
      profile=profileFromRoster(rosterHtml,name);
      if(!profile){res.status(404).send('Player profile not found');return}
    } else {res.status(400).send('Missing url or name');return}

    const html=await fetchHtml(profile);
    const image=imageFromProfile(html,profile);
    if(!image){res.status(404).send('No player image found');return}
    const out=new URL(image,profile);
    if(!['images.sidearmdev.com','dxbhsrqyrr690.cloudfront.net'].includes(out.hostname)){res.status(403).send('Image host not allowed');return}
    const ir=await fetch(out.toString(),{headers:{'user-agent':'Mozilla/5.0','referer':'https://lionsports.net/','accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'}});
    if(!ir.ok){res.status(ir.status).send('Image fetch failed');return}
    const buf=Buffer.from(await ir.arrayBuffer());
    res.setHeader('Content-Type',ir.headers.get('content-type')||'image/jpeg');
    res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');
    res.status(200).send(buf);
  }catch(e){res.status(500).send(e?.message||'Image resolver failed')}
}
