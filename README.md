# ULM Defensive Intelligence — Mississippi State v50

Fixes the two issues seen in v49:

1. ULM Language showed red when opening index.html locally in Safari.
   - The hybrid language is now embedded directly inside index.html.
   - It no longer depends on Safari allowing a file:// page to fetch a sibling CSV.

2. The v49 validation threshold rejected the real hybrid by a tiny margin.
   - The old check included fields ULM manually re-charted (gain/down/hash).
   - v50 validates only stable identifiers that match the source play feed:
     run/pass, ball carrier, target, PFF personnel, PFF formation group.
   - The hybrid must still clear a 97% stable-field match before ULM language is enabled.

Personnel & Formations now shows the ULM terminology first:
- Formation
- Personnel
- Backfield
- Form Var
- Motion
- Y Location

The original PFF Personnel and Formation Groups remain below as reference.

All v47/v49 features remain intact.

## v51 — Top 10 formation defensive-response charts

Added to Personnel & Formations, directly beneath ULM Formation Language:

- Top 10 ULM Formations by raw play volume
- Rush Count Against Top 10 Formations
  - Rush 3
  - Rush 4
  - Rush 5
  - Rush 6
  - Rush 7+
- Top Coverages Against Top 10 Formations
  - six most-used coverage families across the top formations
  - raw volume stacked by formation
- Top Coverage Calls by Formation
  - top three coverage families for each formation
- Man vs Zone Against Top 10 Formations
  - pass plays only
  - raw call volume

The new formation-defense chart group is also selectable in the custom scouting report builder.

All calculations are derived from the existing PFF play feed combined with the validated ULM Formation labels from the user's 999-play hybrid file.

## v52 — Results are YPP, not volume

Clarification applied:

- The Top 10 ULM formations are still selected and ranked by total play volume.
- Every defensive-response result below that ranking is now shown as offensive yards per play.

Result charts:
- YPP by Rush 3 / 4 / 5 / 6 / 7+ against each top formation
- YPP versus the most-used coverage families against each top formation
- Top three called coverages for each formation with their YPP result
- Man YPP versus Zone YPP against each top formation

The result charts no longer use raw call volume as the result measure.

## v53 — formation charts moved to the correct football sections

Personnel & Formations:
- keeps only the Top 10 ULM Formations by raw play volume

Rush Count:
- contains YPP by Rush 3 / 4 / 5 / 6 / 7+ for those top 10 formations

Pass Game:
- contains Pass YPP vs the most-used coverage families for those top 10 formations
- contains the Top 3 coverage-call YPP result cards by formation
- contains a general Man vs Zone Pass YPP chart by formation

The custom scouting report builder now has separate selectable items for each of those chart groups.
