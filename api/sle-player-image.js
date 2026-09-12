export default async function handler(req,res){
  try{
    const raw=Array.isArray(req.query.url)?req.query.url[0]:req.query.url;
    if(!raw){res.status(400).send('Missing url');return}
    let u;try{u=new URL(raw)}catch{res.status(400).send('Bad url');return}
    if(!['lionsports.net','www.lionsports.net'].includes(u.hostname)){res.status(403).send('Host not allowed');return}

    const r=await fetch(u.toString(),{cache:'no-store',headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
    if(!r.ok){res.status(r.status).send('Profile fetch failed');return}
    const html=await r.text();
    const dec=s=>String(s||'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
    const patterns=[
      /<img[^>]+(?:data-src|src)=["']([^"']*images\.sidearmdev\.com\/convert\?[^"']+)["'][^>]*>/i,
      /(?:data-src|src)=["']([^"']*images\.sidearmdev\.com\/convert\?[^"']+)["']/i,
      /(https:\/\/images\.sidearmdev\.com\/convert\?[^"'<>\s]+)/i,
      /(https:\/\/dxbhsrqyrr690\.cloudfront\.net\/[^"'<>\s]+\.(?:jpg|jpeg|png|webp))/i,
      /<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i
    ];
    let image='';for(const p of patterns){const m=html.match(p);if(m&&m[1]){image=dec(m[1]);break}}
    if(!image){res.status(404).send('No player image found');return}

    const out=new URL(image,u);
    if(!['images.sidearmdev.com','dxbhsrqyrr690.cloudfront.net'].includes(out.hostname)){
      res.status(403).send('Image host not allowed');return;
    }

    const ir=await fetch(out.toString(),{headers:{'user-agent':'Mozilla/5.0','referer':'https://lionsports.net/','accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'}});
    if(!ir.ok){res.status(ir.status).send('Image fetch failed');return}
    const buf=Buffer.from(await ir.arrayBuffer());
    res.setHeader('Content-Type',ir.headers.get('content-type')||'image/jpeg');
    res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');
    res.status(200).send(buf);
  }catch(e){res.status(500).send(e?.message||'Image resolver failed')}
}
