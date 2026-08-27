# ULM Defensive Intelligence — Mississippi State v25

Shared Coach Notes schema fix:
- Removed the `player_number` requirement from Supabase writes.
- Notes now key off `team + season + player_name`.
- This matches the table currently created in Supabase.
- Existing shared-note behavior remains unchanged:
  - created_by
  - created_at
  - updated_by
  - updated_at
  - shared cross-device loading/saving
  - local fallback if cloud save is unavailable
