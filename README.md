# ULM Defensive Intelligence — Mississippi State v41

Custom Scouting Report Builder

The Print / Save PDF center now includes a third mode: Build Your Own Scouting Report.

Workflow:
- Click Add beside any scouting view, chart/diagram, or player.
- The item immediately appears in Report Contents.
- Items print in the exact order shown.
- Use up/down arrows to reorder sections.
- Remove individual sections with X.
- Search the library by chart/view/player name, jersey number, or position.
- Player choices are grouped by position.

Available report sections:
- Dashboard Overview
- Personnel & Formations
- Run Game Explorer
- Passing Heat Map
- Coverage Response
- Situations / Down & Distance
- Rush Count
- Pressure Response
- Any individual offensive player profile

Custom player sections include:
- player photo and identity
- position-specific season metrics
- top production
- recent staff notes with author attribution

The generated report removes interactive controls and prints as a clean ULM-branded PDF/report.

Update in v42: RB Left / RB Right now use defensive perspective labels and filtering (Def RB Left / Def RB Right) across the run-game explorer and context tables.

v43 Run Visual update:
- Kept the existing Run Game Explorer visual exactly as the base.
- Added a QB marker in the backfield.
- Added RB marker(s) into that same live SVG.
- Def RB Left moves the RB to the defense's left.
- Def RB Right moves the RB to the defense's right.
- Pistol / Center puts the RB directly behind the QB.
- Split Backs draws two RBs.
- All RB Alignments remains neutral/centered.
- Fixed RB-side filter state so the dropdown remains defense-centric after selection.


v44 update:
- Added more top field space in the Run Game Explorer visual.
- Moved the QB and RB deeper into the backfield for a cleaner gun look.
- Kept a simple under-center fallback when the selected formation label includes 'under'.


v45 update:
- In the Run Game Explorer visual, QB now aligns right beside the RB when Def RB Left or Def RB Right is selected.
- Center/All/Unknown views remain neutral.
- Under-center fallback remains in place.


v46 update:
- Flipped run-gap labels on the Run Game visual into true defensive perspective.
- The field visual now reads left-to-right as Def Left D through Def Right D.
- The gap summary boxes underneath the visual now match that same defensive ordering.
