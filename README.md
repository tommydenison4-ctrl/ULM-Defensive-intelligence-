# ULM Defensive Intelligence — Mississippi State v30

Coach Notes are now append-only history instead of one editable shared note.

What changed:
- Every save creates a new Supabase row.
- Existing notes are never overwritten by a later coach update.
- All notes for the player load in chronological order.
- Each entry shows the author and timestamp.
- The text box is only for adding a new note.
- The button now says `Add Note`.
- After a note saves, the text box clears and the new note is added to the thread.
- Notes remain shared across devices.

No database schema change is required. The existing `defensive_player_notes` table and current SELECT / INSERT policies are sufficient for adding and reading note history.
