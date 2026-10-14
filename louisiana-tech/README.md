# Louisiana Tech · Week 7

October 17, 2026, from the existing Command Center schedule.

Depth chart: Ourlads posting updated 10/10/2026 9:08 AM ET. `depth-chart.json` is a local snapshot, not a PFF dataset or full official roster.

`upload-manifest.json` points to the existing public Supabase objects under `Defensive Intelligence/Opponents/Louisiana Tech/`. It uses the supplied filenames exactly. Reload checks each dataset independently; missing files stay pending and prior opponents are never used as fallbacks. The uploaded play feed identifies Louisiana Tech as `LATC` in `pff_OFFTEAM` and includes 2026 plays, so the loader filters on `LATC` and season 2026. The PFF summary exports identify the team as `LA TECH` and are already limited to that team.

Existing Supabase objects read by the app:

- Play feed: `play_feed-4.csv`
- Internal defensive-language reference: `GAMES_1-5.csv`
- PFF report exports: `pff-data-14.csv` through `pff-data-29.csv`
- Roster: `roster.json`
- Depth chart: `depth-chat.json`
