# Actor List: Ginder (อะไรก็ได้)

This document describes the user roles and actors participating in the Ginder application.

---

## 1. Actor Directory

| Actor Name | Type | Description |
|------------|------|-------------|
| **Group Host** | Human | The user who initializes the room, configures settings, shares the room code, and controls step transitions. |
| **Participant** | Human | Friends who join an existing room via a room code and vote on restaurants. |
| **System** | Automated | The core software engine that syncs status, serves cards, evaluates vote scores, builds brackets, and displays winners. |

---

## 2. Actor Roles & Permissions

### Group Host
- Access home page.
- Create a new room session.
- Configure and modify room parameters:
  - Location/Zone
  - Distance limit (radius)
  - Categories to include
  - Card counts
  - Swiping countdown timers
- View real-time list of members in the lobby.
- Trigger the transition from Lobby → Swiping.
- Swipe left/right on cards.
- Vote in bracket matchups.

### Participant
- Access home page.
- Join a room session using a 4-character room code.
- View real-time list of members in the lobby.
- View the room settings (read-only).
- Swipe left/right on cards.
- Vote in bracket matchups.

### System
- Generate unique 4-character room codes.
- Query and filter restaurant cards from the database based on room constraints.
- Broadcast real-time user joins, settings changes, and stage transitions to all participants.
- Count and tally votes.
- Assess consensus:
  - Detect unanimous matches.
  - Automatically construct bracket matchups (Knockout/Single Elimination seeds) if ties/no-consensus exist.
- Break voting ties in bracket stages using consistent business rules.
- Display final winner results.
