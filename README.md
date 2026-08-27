# ULM Defensive Intelligence — Mississippi State v26

Shared Coach Notes identity fix.

What was wrong:
- Supabase successfully received the notes.
- The screenshot showed `player_name = NULL`.
- Because the rows had no player identity, another device could not query the note for Kamario Taylor.

What changed:
- Added a robust player-name resolver using the roster object's available identity fields.
- All note saves now write a real `player_name`.
- All note loads query using the same resolved player name.
- Added a guard that prevents any future note from being written with a blank player identity.
- Existing timestamp / author / shared-note behavior is unchanged.

The two existing NULL-player rows in Supabase can be deleted later; v26 will not use them.
