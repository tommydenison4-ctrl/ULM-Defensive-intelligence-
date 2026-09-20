const ALLOWED=['images.sidearmdev.com','fausports.com','www.fausports.com'];
export default async function handler(req,res){
  try{
    const raw=Array.isArray(req.query.url)?req.query.url[0]:req.query.url||'';
    if(!raw){res.status(400).send('Missing url');return}
    const u=new URL(raw,'https://fausports.com');
    if(!ALLOWED.includes(u.hostname)&&!u.hostname.endsWith('.cloudfront.net')){res.status(403).send('Host not allowed');return}
    if(/logo|placeholder|default|sponsor|icon|story|news|signing|social|graphic/i.test(u.pathname)){res.status(404).send('Not a roster portrait');return}
    const r=await fetch(u.toString(),{redirect:'follow',headers:{'user-agent':'Mozilla/5.0','referer':'https://fausports.com/','accept':'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'}});
    if(!r.ok){res.status(r.status).send('Image fetch failed');return}
    const b=Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type',r.headers.get('content-type')||'image/jpeg');
    res.setHeader('Cache-Control','public, s-maxage=21600, stale-while-revalidate=86400');
    res.status(200).send(b);
  }catch(e){res.status(500).send(e?.message||'FAU image proxy failed')}
}
