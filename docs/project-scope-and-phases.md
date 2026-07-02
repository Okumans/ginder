# Project Scope and Phase Plan: Ginder (อะไรก็ได้)

This document maps out the phases, scope, milestones, and risk assessment for building the Ginder prototype.

---

## 1. Project Scope Statement

### In Scope
- Single-page React application with premium glassmorphic dark mode styling.
- Local multiplayer capability using `BroadcastChannel` real-time sync.
- Configurable lobby with room settings (Zone, Distance, Categories, Card Limit, Timer).
- Interactive Tinder-like card swiping with gesture support.
- Automatic consensus calculation (Direct Win / Bracket Tournament).
- Pairwise bracket matchup voting interface with visual progress.
- Single-player simulation dashboard to demo multi-user swiping with bot characters.
- Comprehensive local restaurant dataset with descriptions, menus, prices, tags, and images.

### Out of Scope
- Production databases, cloud hosting, and real WebSocket servers.
- Live Google Maps API queries (replaced with smart static mock locations and maps links).
- Persistent accounts or login credentials.

---

## 2. Phase Breakdown

### Phase 1: Core Setup & Style Guide
- **Objectives:** Initialize the React-Vite project, build the core CSS variables/design system, and design mock restaurant data.
- **Deliverables:** Working React app, centralized CSS styling file, and rich static dataset of 20+ restaurants.

### Phase 2: Session & Lobby Sync
- **Objectives:** Create home screen, session state controller (`useRoomState`), room lobby, and BroadcastChannel communication.
- **Deliverables:** Nickname registration, lobby settings sync, real-time list of members, and host session triggering.

### Phase 3: Swiping & Matchmaking
- **Objectives:** Build the Tinder swiping page, gesture triggers, timer limits, and consensus logic.
- **Deliverables:** Swiping card component, animated swipe triggers, swipe tally aggregator, and direct-win transition.

### Phase 4: Tournament Bracket & Winner Presentation
- **Objectives:** Implement bracket tree generator, pairwise matchups, voting inputs, tie-breakers, and final winner celebration view.
- **Deliverables:** Tournament bracket view, live voting bars, tie-breaker system, confetti-filled winner card, and simulated companion dashboard.

---

## 3. Milestone Summary

| Milestone | Deliverable | Criteria |
|-----------|-------------|----------|
| **MS-1: Foundation** | Project setup & styles | Web server runs; dark mode fonts and variables active. |
| **MS-2: Room Management** | Shared Lobby | Room creation/joining works, settings sync between multiple tabs. |
| **MS-3: Swipe & Consensus** | Swipe Screen & Results | Users can swipe cards, and the system aggregates results. |
| **MS-4: Bracket Engine** | Tournament & Winner | Bracket voting works; ties are resolved; final winner displays. |
| **MS-5: Simulator Panel** | Companion Dashboard | Host can activate mock friends to test the full flow in a single tab. |

---

## 4. Risk Assessment

- **Risk 1: Multi-tab manual testing is tedious for grading.**
  - *Mitigation:* Create a dedicated "Simulation / Bot Panel" on the side of the app. This panel allows the user to immediately spawn 3 bot friends (e.g. "Bob", "Alice", "Charlie") who join the lobby, and then swipe randomly or mock vote in the background, allowing a single tester to experience the entire app flow (lobby, swiping, bracket rounds) without opening separate tabs.
- **Risk 2: Time limits expire before a user can evaluate cards.**
  - *Mitigation:* Support disabling the swipe timer (setting it to "Unlimited") or make it easily extendable from the lobby settings.
