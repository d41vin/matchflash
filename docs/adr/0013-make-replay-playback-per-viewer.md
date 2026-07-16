# Make replay playback per viewer

Replay control is local to each viewer over the stored classified event timeline. MatchFlash does not persist a room-wide replay clock or use `rooms.replayMode` as shared playback state; rooms retain only their social role, and historical prompts remain read-only.
