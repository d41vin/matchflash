# 10 — Bounded room chat

**What to build:** Lightweight room-scoped chat using the installed message primitives, with membership and time-bound safeguards.

**Blocked by:** 09 — Social Rooms and standings.

**Status:** ready-for-agent

- [ ] Authenticated members can send and read bounded room chat history using the message and message-scroller experience.
- [ ] Non-members cannot write, server-side rate limiting rejects excessive sends, and frozen Rooms reject new messages.
- [ ] The mobile chat interaction does not obscure the core Match Room experience.
