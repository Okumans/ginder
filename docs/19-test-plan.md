# Test Plan: Ginder (อะไรก็ได้)

This document outlines the testing strategy, test scenarios, and acceptance criteria for validating the Ginder prototype.

---

## 1. Test Objectives & Strategy

The primary objective is to verify that a group of users can create, join, configure a session, swipe restaurant cards, and resolve their preferences either through a direct win or a tournament bracket.

### Testing Scope
- **Interface testing:** Swiping gestures, settings forms, responsive styles.
- **State synchronization:** Nicknames appearing in lobby, settings syncing, swipe tallies, bracket votes.
- **Consensus logic:** Unanimous winner detection, seeded bracket Generation (1st-8th, 2nd-7th, etc.), tie-breaking logic.
- **Simulation testing:** Bot characters spawning and auto-swiping to verify single-user testing correctness.

---

## 2. Test Scenarios

### TS-001: Room Creation & Settings Sync
- **Preconditions:** Open App in two separate tabs (Tab A: Host, Tab B: Guest).
- **Steps:**
  1. Tab A: Host creates room with code `ABCD`, enters nickname "HostUser".
  2. Tab B: Guest enters code `ABCD`, nickname "GuestUser".
  3. Tab A: Host updates category checks (check "Japanese", "Dessert"), increases distance to 10km.
- **Expected Results:**
  - Tab B immediately lists "HostUser" and "GuestUser" in the lobby.
  - Tab B shows updated settings: 10km, "Japanese" and "Dessert" categories active.

### TS-002: Swiping & Unanimous Consensus (Direct Winner)
- **Preconditions:** Tab A and Tab B connected in lobby. Settings card count = 3.
- **Steps:**
  1. Host starts swiping. Both tabs transition.
  2. Tab A and Tab B swipe "Like" on Restaurant 1 (e.g. Siam Buffet) and "Dislike" on other cards.
- **Expected Results:**
  - Once both users finish swiping, the app detects unanimous consent on Restaurant 1.
  - Both tabs immediately transition to the Winner Screen showing Siam Buffet.

### TS-003: Swiping & Seeded Bracket Tournament Generation
- **Preconditions:** Host creates room with 4 mock bots enabled. Card count = 10.
- **Steps:**
  1. Host starts swiping.
  2. Host swipes "Like" on restaurants R1, R2, R3, R4.
  3. Mock bots swipe randomly in the background (completing instantly).
  4. System tallies results.
- **Expected Results:**
  - Since multiple people liked different options and no single restaurant is liked by 100% of participants, the bracket tournament starts.
  - Bracket matches (pairwise) are generated. The UI shows Restaurant A vs Restaurant B.
  - User can click a choice to vote. Votes are tallied and the winner advances.

### TS-004: Bracket Tie Resolution
- **Preconditions:** In a bracket round matchup (Restaurant A vs Restaurant B).
- **Steps:**
  1. 2 participants vote: 1 for Restaurant A, 1 for Restaurant B.
  2. Match completes with a 1-1 tie.
- **Expected Results:**
  - System resolves the tie by advancing the restaurant with the higher initial swipe count. If both had the same swipe count, it selects one randomly and advances it, without crashing.
