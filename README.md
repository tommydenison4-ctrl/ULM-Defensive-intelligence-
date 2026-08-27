# ULM Defensive Intelligence — Mississippi State v27

Shared Coach Notes final player identity fix.

Root cause:
- The open profile stores `selected` as the player's name string.
- The cloud save code was treating `selected` as a full player object.
- That caused the player identity guard to fail even though the profile clearly showed Kamario Taylor.

Fix:
- `notePlayerName()` now accepts either a player object or a player-name string.
- Save logic resolves the selected roster player before writing.
- Player name is now written correctly to Supabase and used consistently for cross-device loading.
