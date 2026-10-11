# Louisiana Tech · Week 7

October 17, 2026, from the existing Command Center schedule.

Depth chart: Ourlads posting updated 10/10/2026 9:08 AM ET. `depth-chart.json` is a local snapshot, not a PFF dataset or full official roster.

`upload-manifest.json` specifies proposed public Supabase Storage paths and filenames for the next upload. No folders, tables, files or permissions were created in Supabase. Edit storageBase and files to match the actual uploads; file values can be strings or arrays of candidate names. Reload checks this manifest and then each dataset independently. Missing files stay pending; prior opponents are never used as fallbacks. Play feeds must identify LATU in the appropriate offense/defense field and the 2026 season. The existing project uses LATU in its PFF feeds.

Expected uploads:

- plays: `play_feed.csv`
- qb: `pff-qb.csv`
- routes: `pff-routes.csv`
- dropbacks: `pff-dropbacks.csv`
- passOverall: `pff-pass-overall.csv`
- pressure: `pff-pressure.csv`
- receiving: `pff-receiving.csv`
- rushing: `pff-rushing.csv`
- runConcepts: `pff-run-concepts.csv`
- runDirections: `pff-run-directions.csv`
- runBlocking: `pff-run-blocking.csv`
- passBlocking: `pff-pass-blocking.csv`
- formations: `pff-formations.csv`
- personnel: `pff-personnel.csv`
- personnelByWeek: `pff-personnel-by-week.csv`
- personnel10: `pff-personnel-10-player.csv`
- personnel11: `pff-personnel-11-player.csv`
- personnel12: `pff-personnel-12-player.csv`
- personnel20: `pff-personnel-20-player.csv`
- personnel21: `pff-personnel-21-player.csv`
- personnelPlayers: `pff-personnel-player-summary.csv`
- Roster: `roster.json` (array or {players: [...]})
