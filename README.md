

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

## v17 — UAB 2 Deep Dark-Mode Fix

- Removed the white alternating rows from the UAB 2 Deep table.
- Position labels, player names, and backup names remain readable in dark mode.
- Jersey numbers retain the ULM maroon accent.
- Class/year text uses a muted gray treatment.
- Hover states remain visible without washing out the row.
- No depth-chart data or Player Intelligence logic changed.

## v18 — Refined UAB Depth-Chart Colors

- Reworked the depth-chart palette for stronger contrast and a cleaner staff-dashboard look.
- Alternating rows now use two close dark navy tones instead of black/white contrast.
- Position labels use ULM gold.
- Player names stay bright white.
- Jersey numbers use a brighter maroon/red accent so they remain legible on dark rows.
- Class/year text remains muted blue-gray.
- Table header now uses gold labels on navy for clearer hierarchy.

## v19 — Single-Color Depth Chart

- Removed alternating depth-chart rows completely.
- Every body row now uses the same dark navy background.
- Position = gold, player name = white, jersey = bright maroon/red, class/year = muted gray.
- Hover uses one subtle darker/lighter navy state only.

## v20 — Actual Game Starter Depth-Chart Change

- UAB LG is now game-corrected to #66 Donovan Lawrence as the actual starter.
- Donovan Lawrence is labeled `ACTUAL GAME STARTER · 86 snaps`.
- #59 Jaden Ligon is moved to second and labeled `PRE-GAME LISTED STARTER`.
- The entire LG row is highlighted in gold/maroon to match the depth-chart change treatment used across the other staff apps.
- The correction is applied even if the live Supabase depth-chart file still has the pre-game order.
- Player links and the rest of the UAB depth chart remain unchanged.

## v21 — Mortensen-era UAB sample enforcement

- UAB 2025 team analytics are now restricted to Alex Mortensen's interim-head-coach games beginning with Memphis; every pre-Memphis 2025 game is excluded from the active defensive-intelligence sample.
- 2026 remains isolated in its own current-season view, with the existing 50/50 toggle blending only 2026 with the Mortensen-interim 2025 cohort.
- The full 975-row play feed is retained only in memory long enough to preserve exact row alignment with the ULM hybrid; analytics are filtered after that mapping is established.
- UAB team pages no longer display unfiltered full-package PFF aggregate tables that could leak pre-Mortensen 2025 data. Dashboard passing, personnel/formations, run game, pass game, pressure, situations, coverage and rush-count views now use the eligible play-level sample for Week 2.
- UAB player 2025 views are also restricted to the Mortensen-interim cohort; unfiltered all-loaded PFF summary cards are hidden in Week 2.
- The v20 Donovan Lawrence / Jaden Ligon depth-chart game-starter correction remains unchanged.


## v22 — Mortensen Toggle + ULM Language Repair

- 2025 UAB scouting data is limited to Mortensen interim-head-coach games beginning with Memphis; pre-Memphis 2025 rows stay out of every active scouting view.
- Fixed the 2025 / 2026 / Weighted 50/50 toggle so Personnel & Formations and all play-feed-derived scouting pages recalculate from the active cohort.
- Weighted mode keeps literal play counts while rates, shares, and formation rankings are blended 50/50 behind the scenes.
- Rebuilt the UAB ULM hybrid as a full 975-row row-aligned translator so filtering no longer breaks ULM terminology.
- The supplied ULM hybrid is authoritative for manual tags. Missing 2026 defensive response language is filled from raw PFF using the learned ULM translations: coverage, front, front type, stunt, and pressure type.
- Coverage heat maps, formation-vs-coverage charts, rush-count coverage, and pressure response now prefer ULM translated language rather than leaking raw PFF labels.
- Run-game personnel filters now use ULM Personnel language.
- Donovan Lawrence / Jaden Ligon game-starter depth-chart correction remains preserved.

## v23 — Coach Jones Tips & Reminders

- Renamed the staff tab to `Coach Jones Tips & Reminders`.
- Added the five Week 2 UAB whiteboard notes as a dedicated UAB view while preserving the Week 1 Mississippi State notes.
- Transcribed the board into five staff sections: D & D Tendencies, Pre-Snap, Formations, Personnel, and QB.
- Each transcribed section includes a `View actual board note` button that opens the corresponding original photograph in an in-app lightbox.
- Added an `Actual Board Notes` view showing all five original images with section labels; every photograph is embedded directly inside `index.html` for Vercel/local reliability.
- No scouting data, play-count logic, ULM translation logic, depth-chart correction, or analytics math was changed in this version.


## v24 — Coach Jones Notes Correctly Scoped by Opponent

- Coach Jones Tips & Reminders is visible in both Week 1 and Week 2 workspaces.
- Week 1 Mississippi State keeps the existing Mississippi State notes and original board images unchanged.
- Week 2 UAB shows the five new UAB board-note transcriptions and their matching original photographs.
- The tab content switches by opponent; UAB notes no longer hide behind the Week 1-only navigation rule.
