# Bound chat to rooms with rate limits and freeze

Chat is an authenticated, room-scoped feature backed by `chatMessages` records containing a room, author, body, and timestamp. The server verifies room membership, enforces the basic send-rate limit, and rejects writes to frozen rooms; broader moderation and room-admin tooling remain explicitly out of scope. The UI uses the installed shadcn message and message-scroller components.
