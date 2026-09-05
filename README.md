

## v67 — Mississippi State 2 Deep tab

Added a dedicated `Mississippi State 2 Deep` navigation tab for the opponent offense.

- Uses the Week 1 projected offensive two-deep.
- Includes first- and second-team players only.
- Clicking a player name opens that player's existing Mississippi State Player Intelligence drawer/profile.
- Name matching uses the live roster and tolerates common suffix differences such as III/II/IV.

## v68 — Coach Jones Notes

Added a dedicated Coach Jones Notes tab.

- Default view: transcribed notes organized by Formations, Personnel / Alignment Keys, Kamario Taylor Last Look, and Situational / Tally Notes.
- Second click: Raw Images view containing the four original uploaded photographs.
- The photographs are embedded directly inside index.html so the tab works locally and after deployment.
- Unclear handwriting is marked as unclear instead of being guessed.

## Week 2 — UAB Prep
- Added Week 1 / Week 2 opponent tabs modeled after the Special Teams prep workflow.
- Week 1 Mississippi State remains fully preserved.
- Week 2 UAB is the default/current prep workspace.
- UAB data is isolated so roster, depth chart, hybrid tags and PFF files can be added without overwriting Mississippi State.
- Until UAB files are supplied, Week 2 intentionally shows a staging page instead of mislabeled Mississippi State analytics.

## v3 — Live UAB Week 2

- Week 2 UAB now loads directly from `Defensive Intelligence / Opponents / UAB` in Supabase.
- Original uploaded filenames are used; no renaming required.
- `play_feed (17).csv` is the live 975-play source.
- 2026 Week 1 is detected as game id 31055 / 2026-09-03 (86 plays).
- Default analytics view is 50% 2026 Week 1 and 50% historical using equalized play equivalents.
- Toggle options: Weighted 50/50, 2026 Week 1, Historical, All Raw.
- A 975-row UAB ULM-language layer is embedded into the app. The first 889 rows preserve the existing UAB hybrid; the 86 new 2026 plays are assigned ULM labels from the closest matching historical UAB PFF structure.
- Mississippi State Week 1 remains independently loadable from its existing Supabase folder.
- UAB Player Intelligence currently builds a safe PFF-based player index until a current roster/depth chart is added.

## v4 — UAB Current Roster + Depth Chart

- Added 54 current 2026 UAB offensive roster players from UAB's official game notes/roster.
- Added current Week 2 UAB offensive two-deep from Ourlads (updated Sept. 3, 2026).
- Week 2 depth-chart names open Player Intelligence directly.
- PFF attachment is matched by player name, never by current jersey number alone.
- Added `roster.json` and `depth-chart.json` to the build for optional Supabase upload later.
- Week 1 Mississippi State roster/depth behavior remains isolated.

## v5 — Full Week 2 UAB Build

- Full Week 2 UAB package preserved in dark mode.
- Week 2 now loads `roster.json` live from Supabase with embedded fallback.
- Week 2 now loads `depth-chart.json` live from Supabase with embedded fallback.
- Existing UAB PFF files continue to load live from `Defensive Intelligence / Opponents / UAB`.
- Weighted 50/50, 2026 Week 1, Historical, and All Raw views remain intact.
- 975-play UAB ULM-language hybrid remains included.
- Week 1 Mississippi State stays isolated and preserved.

## v6 — Run Game Second Formation Visual

- Restored the second ULM formation structure visual directly beneath the main green run diagram.
- Uses the same formation + personnel + shell / Y-H-U logic from the Mississippi State build.
- The visual follows the active ULM Formation filter.
- If a formation is not explicitly selected, it uses the most common formation in the current filtered run sample.
- Added a fallback so the second visual does not silently disappear if the primary structure renderer returns no markup.
