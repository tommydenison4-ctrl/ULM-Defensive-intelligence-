

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

## v8 — UAB Player Photos + UI Cleanup
- Populated all 54 current offensive roster records with exact official UAB profile links.
- Populated official UAB Athletics/Sidearm player images; Vili Haapasalo currently uses UAB's own default-player image because the roster page has no player portrait.
- Added aliases for roster/PFF naming differences (Nate/Nathan Rogers, Cam/Cameron Jennings, Rod Robinson II, CD Gill, etc.).
- Week 2 sidebar now says `UAB 2 Deep` instead of `Mississippi State 2 Deep`.
- Fixed Run Concepts and other `.data-table` rows for dark-mode readability.
- App remains Supabase-first: upload the included `roster.json` over the current UAB roster object in Supabase.

## v9 — Player Profile Data + Photo Fix

- Player photos now use the direct official UAB Athletics CloudFront image URL rather than the Sidearm crop proxy.
- Added `referrerpolicy="no-referrer"` and explicit image fallback handling.
- Player game logs, Top Games, week-to-week charts, sample counts, and player-linked play views now use the 975 raw UAB play feed rather than the duplicated 50/50 weighted play-equivalent array.
- This prevents the 2026 Illinois game from being multiplied roughly 10x in player charts.
- Removed stale Mississippi State wording from UAB player profiles.
- UAB player profiles now show raw Week 1 and historical matched-event counts separately.
- Team-level 50/50 weighting remains intact for scouting tendency pages.

## v10 — Supabase Player Images

This matches the reliable Mississippi State pattern: the roster points to image assets controlled by the scouting package rather than hotlinking UAB/Sidearm at runtime.

Week 2 UAB player portraits now resolve from:
`Defensive Intelligence / Opponents / UAB / player-images`

The included `roster.json` already contains those Supabase URLs.
The included `uab-player-image-manifest.csv` maps each current offensive player to:
- exact upload filename
- official UAB source image URL
- final Supabase public URL

No Vercel image fallback is used.

## v11 — Player Identity + Photo Fallback Fix

- Fixes current 2026 UAB player-to-play matching in the raw PFF feed.
- PFF raw play tokens use `ALBI ##` jersey tokens rather than names. For the Sept. 3, 2026 game only, the app now safely resolves those tokens to the current roster by jersey number.
- Historical games remain conservative and are not assigned to current players by jersey number alone.
- This fixes cases such as CJ Smith showing 5 targets / 57 yards in the PFF summary but `0 Week 1` matched plays.
- Player photos now try the Supabase `player-images` object first and automatically fall back to the exact official UAB/Sidearm portrait URL if the Supabase image is missing or misnamed.
- Removed stale `Weighted Week 2 Scout` and `2025 Season Snapshot` labels from UAB player profiles.
- Team-level 50/50 weighting remains unchanged.

## v12 — Direct Official UAB Images

- Reverts the UAB photo layer to the same simple pattern used successfully for Mississippi State.
- `roster.json` now points directly to each player's official UAB Athletics image URL.
- No `player-images` Supabase folder is required for the app to show portraits.
- The previous Supabase image path is preserved only as an optional backup.
- Player data, PFF files, roster, and depth chart remain Supabase-driven.
- Initials appear only if both the official UAB image and optional backup fail.

## v13 — True Counts + Weighted Rates

- Weighted 50/50 mode no longer creates duplicate/synthetic plays.
- UAB always shows the real play count: 975 total, with 86 current-season and 889 historical.
- In Weighted mode, rates/efficiency are blended behind the scenes:
  `50% current-season metric + 50% historical metric`.
- Dashboard YPP, explosive %, negative %, run %, pass YPP, and run YPP use the blended cohort math.
- Visible play counts remain literal.

## v14 — Player Intelligence Data Fix

- Fixed the core mismatch between UAB's raw play-feed tokens (`ALBI ##`) and the current roster.
- All Player Intelligence subpages now use the row-aware current-season resolver, not the old name-only/MSST token matcher.
- Fixes Week 1 receiving/rushing/passing game logs showing zero production despite correct PFF summary totals.
- Week 2 player hero cards now prioritize actual 2026 Week 1 raw-play stats when the player appeared.
- PFF full-sample aggregate stats remain available as a secondary view.
- QB Targets now shows where that quarterback threw the ball rather than looking for the QB as a receiver.
- Routes, coverage splits, game logs, Top Games, rushing, and target heat maps now use the raw 975-play UAB source.
- Team-level 50/50 weighting is unchanged and remains separate from individual player production.

## v15 — Season-Separated Player Intelligence

- Player Intelligence now separates actual UAB seasons instead of blending them.
- Every current player gets a `2026 UAB` tab.
- A `2025 UAB` tab appears only for current players who were on UAB's official 2025 roster.
- 2025 identity uses the player's verified 2025 UAB jersey number, so number changes are handled correctly (for example Ryder Burton: #15 in 2025, #5 in 2026).
- Season totals, game logs, Top Games, routes, targets, rushing, passing, and coverage views are calculated from that season's raw play feed only.
- Transfers who were not at UAB in 2025 do not get a fake 2025 analytics tab.
- PFF summary exports that are not season-separated are retained in a clearly labeled `All Loaded PFF Summary` card and are not presented as 2025 or 2026 season totals.
- Blank PFF values are hidden instead of displaying empty metric boxes.
- Offensive-line season views use raw `pff_OFFPLAYERS` participation to show actual offensive, pass, and run snaps by season.

## v16 — Season Toggle + Hero Stat Contrast Fix

- Fixed the 2025 / 2026 player-season buttons. v15 was calling a nonexistent profile renderer after the click; the toggle now rerenders the existing player drawer directly.
- The selected season remains active while changing Player Intelligence sub-tabs.
- Fixed the washed-out hero metric cards caused by dark-mode variables bleeding into the light player-profile panel.
- Hero stat labels and values now use explicit dark text on the light cards.
- No player-data math or season-identification logic was changed from v15.
