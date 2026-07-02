# UX Design: AraiKeeDai (อะไรก็ได้)

This document describes the page flows, wireframes, and design system choices for the AraiKeeDai UI.

---

## 1. Design System & Theme

### Color Palette (Premium Dark Mode)
- **Background:** Deep space navy `#0B0F19` with a subtle radial gradient of `#1E293B`.
- **Surface Cards (Glassmorphism):** Semi-transparent `#1F2937` with `backdrop-filter: blur(12px)` and a thin glowing border `#374151`.
- **Primary / Accent:** Electric Purple `#8B5CF6` and Neon Cyan `#06B6D4` (used for gradient text and highlights).
- **Affirmative (Yes/Like):** Vibrant Emerald `#10B981` / Glowing Green.
- **Negative (No/Dislike):** Coral Pink `#EF4444` / Rose Pink.

### Typography
- **Primary Font:** `Outfit` or `Inter` (Google Fonts)
- **Headings:** Bold weights with linear gradient text.

---

## 2. Screen & Page Flow

### 2.1. Home Screen (SCR-HOME)
- **Header:** App Logo `AraiKeeDai` with glowing text.
- **Action Cards:**
  - **Create Room Card:** Input host nickname -> "Create Room" button (Electric Purple).
  - **Join Room Card:** Input participant nickname and 4-letter Room Code -> "Join Room" button (Neon Cyan).

### 2.2. Room Lobby (SCR-LOBBY)
- **Room Code Display:** Big bold letters, e.g., `ROOM CODE: X8Y2` with a robust copy button (including textarea selection copy buffer fallback).
- **Publicity Toggle:** Checkbox toggle for Room Publicity (Public or Private) to control listing on the Home Screen.
- **Interactive Map Pin Selector:**
  - An SVG-based vector map of Central Bangkok with major roads and landmarks (Siam Square, Silom, Ari, etc.).
  - Host can click on the map to drop a location pin. A glowing radius indicator (dashed circle) shows the filtered distance coverage in real-time.
  - Guests view the pinned map location in read-only mode.
- **Lobby Content (Split layout):**
  - **Left Panel (Settings):** If Host, editable inputs (timer, card limit, category chips, distance slider, map pin). If Participant, read-only list of settings.
  - **Right Panel (Members List):** Dynamic lists of nicknames currently in the room. A green dot `🟢` indicates active, or a checkmark if ready.
- **Action Button:**
  - **Host:** "Start Swiping" (enabled when >= 1 other participant is connected or if simulating bots).
  - **Participant:** "Waiting for Host..." message.

### 2.3. Swiping Interface (SCR-SWIPE)
- **Top Bar:** Progress bar showing `Card X of Y` + Timer countdown (circular graphic or glowing bar).
- **Swipe Card:** Centered, floating card with:
  - High-res main food/restaurant photo.
  - Title and Price indicator (`$$`, `฿฿`).
  - Brief description & tag badges (e.g. `Buffet`, `Japanese`).
  - Mini menu highlights list (e.g., "🍣 Salmon Sashimi - ฿180").
- **Action Buttons (Bottom):**
  - **Left (Dislike):** Red circular button with "✕" icon.
  - **Right (Like):** Green circular button with "♥" icon.
  - *Swiping gestures (drag left/right) also fully supported on touch/mouse.*

### 2.4. Waiting Screen (SCR-WAITING)
- Shows a list of users who are `Swiping ✍️` vs `Done ✅` with progress updates.
- A progress indicator keeps users engaged.

### 2.5. Bracket Tournament (SCR-BRACKET)
- **Header:** "TIEBREAKER ROUND: Choose one!" or "BRACKET STAGE: Match X/Y".
- **Matchup Display:** Two cards side-by-side (Restaurant A vs Restaurant B).
- **Voter Bar:** Shows progress of votes in real-time (e.g. `3 of 4 votes submitted`).
- **Bracket Progress Tree:** A visual tree diagram (simplified) showing the 8 seeds progressing to the final.

### 2.6. Winner Screen (SCR-WINNER)
- Confetti explosion animation.
- Winner card featured in the center with a premium glowing border.
- **Action Buttons:**
  - "Find on Google Maps" (launches map search for restaurant name).
  - "Start New Session" (returns to home screen).
