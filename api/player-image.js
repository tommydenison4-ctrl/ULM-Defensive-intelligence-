export default async function handler(req,res){
  try{
    const raw=Array.isArray(req.query.url)?req.query.url[0]:req.query.url;
    if(!raw){res.status(400).send('Missing url');return}
    let u;
    try{u=new URL(raw)}catch{res.status(400).send('Bad url');return}
    const allowed=['lionsports.net','www.lionsports.net','uabsports.com','www.uabsports.com'];
    if(!allowed.includes(u.hostname)){res.status(403).send('Host not allowed');return}
    const r=await fetch(u.toString(),{headers:{'user-agent':'Mozilla/5.0','accept':'text/html,application/xhtml+xml'}});
    if(!r.ok){res.status(r.status).send('Profile fetch failed');return}
    const html=await r.text();
    const patterns=[
      /<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["'][^>]*>/i,
      /<meta[^>]+(?:property|name)=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']twitter:image(?::src)?["'][^>]*>/i
    ];
    let image='';
    for(const p of patterns){const m=html.match(p);if(m&&m[1]){image=m[1].replace(/&amp;/g,'&');break}}
    if(!image){res.status(404).send('No profile image found');return}
    const out=new URL(image,u);
    if(!/^https?:$/.test(out.protocol)){res.status(404).send('Invalid image');return}
    res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');
    res.redirect(302,out.toString());
  }catch(e){res.status(500).send(e?.message||'Image resolver failed')}
}
