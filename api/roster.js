const ROSTER_URL = 'https://hzrosmevuejjlxigdxmg.supabase.co/storage/v1/object/public/Special%20Teams/Current/roster.json';

export default async function handler(req, res) {
  try {
    const upstream = await fetch(`${ROSTER_URL}?v=${Date.now()}`, { cache: 'no-store' });
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Supabase roster returned ${upstream.status}` });
      return;
    }
    const data = await upstream.json();
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error?.message || 'Roster fetch failed' });
  }
}
