const PDF_URL='https://raw.githubusercontent.com/tommydenison4-ctrl/Command-Center-/main/ULM_Week_4_Florida_Atlantic_Depth_Chart.pdf';
export default async function handler(req,res){
  try{
    const r=await fetch(PDF_URL,{redirect:'follow',headers:{'user-agent':'Mozilla/5.0','accept':'application/pdf,*/*'}});
    if(!r.ok){res.status(r.status).send('Depth chart PDF fetch failed');return}
    const b=Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition','inline; filename="ULM_Week_4_Florida_Atlantic_Depth_Chart.pdf"');
    res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(b);
  }catch(e){res.status(500).send(e?.message||'Depth chart proxy failed')}
}
