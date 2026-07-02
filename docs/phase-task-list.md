# Phase Task List: Ginder (อะไรก็ได้)

This document lists the specific tasks required to implement the Ginder prototype, sorted by phase and priority.

---

## Phase 1: Core Setup & Foundation

| Task ID | Description | Priority | Status |
|---------|-------------|----------|--------|
| **P1-T001** | Initialize React (Vite) structure | High | 🟢 Done |
| **P1-T002** | Configure Central Design System (`index.css`) with CSS variables & gradients | High | 🟢 Done |
| **P1-T003** | Create Mock Restaurant Database (`restaurants.js`) with Thai, Japanese, Italian, etc. | Medium | 🟢 Done |

---

## Phase 2: Session & Lobby Sync

| Task ID | Description | Priority | Status |
|---------|-------------|----------|--------|
| **P2-T001** | Develop Room State hook (`useRoomState`) with BroadcastChannel integration | High | 🟢 Done |
| **P2-T002** | Implement Home Screen (Create Room and Join Room forms) | High | 🟢 Done |
| **P2-T003** | Develop Lobby View (Host controls settings, guests read-only, user lists updates) | High | 🟢 Done |

---

## Phase 3: Swiping Experience

| Task ID | Description | Priority | Status |
|---------|-------------|----------|--------|
| **P3-T001** | Develop Swipe Card component with layout, description, menu prices, and tags | High | 🟢 Done |
| **P3-T002** | Implement swipe timer and round transition logic | Medium | 🟢 Done |
| **P3-T003** | Implement swipe decision tallying and consensus calculation | High | 🟢 Done |

---

## Phase 4: Tournament Bracket & Winner Presentation

| Task ID | Description | Priority | Status |
|---------|-------------|----------|--------|
| **P4-T001** | Develop Tournament Bracket UI (displaying pairwise voting side-by-side) | High | 🟢 Done |
| **P4-T002** | Develop bracket advancement and tie-breaking engine | High | 🟢 Done |
| **P4-T003** | Implement Winner View with confetti effects and links to map searches | Medium | 🟢 Done |
| **P4-T004** | Build Simulation Panel on side for single-user multiplayer testing | High | 🟢 Done |
