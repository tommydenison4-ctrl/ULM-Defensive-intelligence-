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

## v54 — TE / H Alignment Structure

Added a second run-game visual directly under the existing Run Game Explorer diagram.

The companion visual:
- uses the same active run filters
- keeps the defense-centric left/right view
- plots TE/Y alignment by side using `pff_TEALIGNMENT`
- plots H-back alignment using FB/H-back tags from `pff_RBALIGNMENT` / `pff_RBSINBACKFIELD`
- shows raw alignment volume plus YPP inside each Y/H bubble
- adds ULM `Y Location` cards underneath when the validated hybrid language is available
- includes Y-location volume, YPP and median YPP

The existing run-gap visual is unchanged.

The TE / H Alignment Structure is also available as its own item in the custom scouting report builder.

## v56 — ULM Surface Structure rebuild

The prior TE/H alignment diagram was removed and rebuilt because it was inferring alignment from PFF RB/TE fields that are not present in the user-supplied hybrid.

This version uses the ULM formation language itself.

Rules:
- Y/U/H markers are shown only when the ULM formation name explicitly contains those players and an alignment word such as OFF, HIP, STING or WING.
- Examples supported directly from the file include Y OFF, YU OFF, YH OFF, U OFF, U HIP, U STING, H HIP and H OFF.
- The diagram is normalized to one formation surface. It does not claim defense-left/defense-right or field/boundary side when the ULM source does not provide that.
- EMPTY formations never draw an RB.
- Personnel controls RB count for non-empty structures.
- The card still displays ULM Y Location, Backfield and Motion as labels, but those fields are not converted into invented player coordinates.
- When multiple formations are included by the active Run Game filters, the visual shows the top 10 formations in that filtered sample as separate structure cards rather than blending incompatible structures together.

## v57 — simplified TE / H structure

Corrected the v56 behavior:

- There is now ONE companion TE/H diagram, not ten formation cards.
- If ULM Formation is set to All, the diagram shows only the most-used formation in the current filtered run sample.
- Selecting a specific ULM Formation in the existing Run Game filter changes the diagram to that formation.
- The diagram never infers two conventional RBs from personnel count.
- In 20/21-type structures, an H/U can be the second back in the personnel grouping, so drawing two RBs plus an H/U duplicated the structure. v57 prevents that.
- Empty formations show no RB.
- Y/U/H placement still comes only from explicit ULM formation-name language.

## v58 — TE / H structure now shows where the run goes

Added run-destination information to the companion TE / H structure diagram:

- gold arrow shows the most-used run path for the current structure sample
- bottom lane markers show all eight run lanes in defensive orientation
- each lane shows filtered run volume
- a summary grid below the diagram shows every lane with volume or percentage (toggle aware), plus YPP and median YPP

Behavior:
- still one structure diagram only
- if ULM Formation = All, the diagram uses the most common current formation in the filtered run sample
- if a specific ULM Formation is selected, the run path and lane stats are based only on that formation
- no second conventional RB is inferred from personnel

## v62 — personnel-aware TE surface

Corrected the surface drawing so the diagram cannot create more TEs than the tagged play data supports.

- TE count is derived first from ULM `TE` / PFF `pff_TES`; personnel is fallback only.
- 11 personnel / one tagged TE draws one TE marker.
- 12 personnel / two tagged TEs can draw two TE markers.
- 13 personnel can draw three.
- `DUO YH OFF` with one tagged TE is drawn as one `Y/H OFF` player, not a generic attached TE plus a second H.
- `TREY Y OFF` in 11 personnel draws one Y; if a filtered sample is actually 12 personnel with two tagged TEs, the second TE is then added.
- `ACE YU OFF` in a two-TE sample draws Y + U.


## v64
Formation + personnel aware TE/H structure. Mixed-personnel formations receive a Structure Personnel selector; PRO - OPEN split-surface 12p can show one TE each side; CLOSED - CLOSED always splits its two TEs.


## v65 — shell-aware Y/H logic
- Treats Y and H as separate players when both appear in the formation name.
- In 2x2 shells, explicit pairs like `YH OFF`, `YU OFF`, `Y OFF H HIP`, and `Y OFF U HIP` are split across the formation rather than stacked on one side.
- Uses the formation shell (`2x2`, `3x1`, `2x1`, etc.) as the first guide, then personnel and ULM modifiers.
- Structure card now shows tagged TE count versus named surface players shown.
