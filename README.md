# ULM Defensive Intelligence — Mississippi State

Standalone defensive-staff workspace.

## Live roster source
The app reads the same current roster used by Special Teams:

`Supabase Storage / Special Teams / Current / roster.json`

The Vercel route `/api/roster` proxies that public Storage object. The browser also has a direct Storage fallback.

## Deploy
Upload the full contents of this folder to a new GitHub repository and connect that repository to a new Vercel project. No Supabase keys are required for the roster because the existing Storage object is public.

## Current build
- Mississippi State is the active opponent.
- Player Intelligence is the default landing view.
- Position groups: QB, RB, WR, TE, OL.
- Player profile facets: Overview, Usage & Alignment, Tendencies, Game Log.
- Roster identity, photos, bios, official profile links, class, hometown and previous school come from the existing shared `roster.json`.
- PFF-specific offensive production is intentionally not fabricated. Those fields activate when the Mississippi State offensive PFF source is connected next.
