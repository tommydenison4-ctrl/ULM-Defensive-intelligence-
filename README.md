# ULM Defensive Intelligence — Mississippi State v29

P & 10 correction:
- The prior build incorrectly looked for `P` inside `pff_DOWN`.
- PFF down values are numeric, so that could never produce P & 10.
- P & 10 is now defined as:
  - first offensive play of the possession / drive (`pff_DRIVEPLAY = 1`)
  - 1st down
  - 10 yards to go
- Those plays are separated from ordinary 1 & 10 throughout the standardized D&D views and filters.
