# Ginder (กินเด้อ) — MVP Specification

This is the build-ready scope for v1. It cuts the full plan down to what's needed to demo the complete core loop end-to-end, with exact API contracts and page specs so implementation can start directly from this doc.

---

## 1. MVP Scope

### In scope
- Create room (leader) → get 6-char code
- Join room (member) → enter code + username
- Lobby with live participant list + leader-only "Start" button
- Swipe stack (10 restaurants per round, fixed for MVP — not 10–15 variable)
- Waiting screen with live progress ("2 / 4 finished")
- Consensus result OR sudden-death bracket (single elimination, majority vote, random tiebreak)
- Result screen with winner + "New Round" (reuses same room code + participants, new pool)
- Full Thai mock dataset (30 restaurants)
- Full visual style: primary/secondary/bg colors, Comic Sans, card swipe animation, confetti

### Explicitly out of scope for MVP (future work)
- Persistent storage (DB) — in-memory only, resets on server restart
- Auth / accounts / saved history across sessions
- Reconnect-after-disconnect handling (if a tab closes mid-round, that participant is just stuck — acceptable for MVP)
- Room expiry/cleanup job (rooms live forever in memory until restart)
- Kicking participants / room privacy settings
- Variable pool size input by leader (hardcoded to 10 for MVP)
- Images: MVP uses **static Unsplash-style placeholder image URLs** per cuisine category (not unique photography per restaurant) to avoid asset management overhead
- Mobile app / PWA installability — MVP is just responsive web

---

## 2. User-Facing Flow (exact screens)

```
/                     Landing
  → [สร้างห้อง]  (Create Room)  → /create
  → [เข้าร่วมห้อง] (Join Room)   → /join

/create               Enter leader's username → submit
  → POST /api/rooms → redirect /room/[code]/lobby

/join                 Enter room code + username → submit
  → POST /api/rooms/[code]/join → redirect /room/[code]/lobby

/room/[code]/lobby    Shows room code big, participant list (polls every 1.5s)
                      Leader sees [เริ่มเลย!] (Start) button (disabled if <2 participants)
                      Non-leaders see "รอหัวหน้าห้องเริ่มเกม..." (waiting for leader)
  → leader clicks Start → POST /api/rooms/[code]/start
  → all clients poll, detect status=="swiping", auto-redirect to /room/[code]/swipe

/room/[code]/swipe    Card stack of this participant's 10 restaurants (shuffled order)
                      Swipe right = like, left = pass (buttons as fallback for non-touch)
  → on last card swiped → POST marks finishedSwiping=true → redirect /room/[code]/waiting

/room/[code]/waiting  "รอเพื่อนคนอื่น... (2/4)" progress bar, polling
  → when status becomes "bracket" → redirect /room/[code]/bracket
  → when status becomes "finished" → redirect /room/[code]/result

/room/[code]/bracket  Current round's match(es). If multiple matches in this round,
                      participant votes on ALL of them before waiting.
                      After voting: "รอผลโหวต..." until round advances or bracket finishes.
  → polls; when bracket.round increments, show next round;
    when status=="finished", redirect /room/[code]/result

/room/[code]/result   🎉 Winning restaurant card, confetti burst, full details
                      [เริ่มรอบใหม่] (New Round) button → resets pool, status→lobby-ish
                      (kept simple: New Round takes everyone back to /lobby with same
                      participants, new 10-restaurant pool, status reset to "lobby")
```

---

## 3. Data Store (in-memory)

`/lib/store.ts`

```ts
import { Room } from "./types";

// Single process-wide in-memory map. Reset on server restart.
const rooms = new Map<string, Room>();

export function createRoom(room: Room) { rooms.set(room.code, room); }
export function getRoom(code: string): Room | undefined { return rooms.get(code.toUpperCase()); }
export function saveRoom(room: Room) { rooms.set(room.code, room); }
export function roomExists(code: string) { return rooms.has(code.toUpperCase()); }
```

- Room code generation: 6 uppercase alphanumeric chars, excluding ambiguous characters (`0/O`, `1/I/L`), regenerate on collision.
- Participant ID: `crypto.randomUUID()`, stored client-side in `localStorage` (`ginder_pid_[code]`) so refresh doesn't lose identity.

---

## 4. Types

`/lib/types.ts`

```ts
export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: "$" | "$$" | "$$$";
  tags: string[];
  description: string;
  imageUrl: string;
}

export interface Participant {
  id: string;
  username: string;
  isLeader: boolean;
  finishedSwiping: boolean;
}

export type RoomStatus = "lobby" | "swiping" | "bracket" | "finished";

export interface BracketMatch {
  id: string;
  round: number;
  restaurantAId: string | null; // null = "bye"
  restaurantBId: string | null;
  votes: Record<string, string>; // participantId -> restaurantId
  winnerId?: string;
}

export interface Bracket {
  round: number;
  matches: BracketMatch[];       // current round's matches
  history: BracketMatch[][];     // completed rounds, oldest first
}

export interface Room {
  code: string;
  leaderId: string;
  status: RoomStatus;
  restaurantPool: string[];                      // 10 restaurant IDs, shared pool
  participantOrder: Record<string, string[]>;     // participantId -> shuffled restaurantPool
  participants: Record<string, Participant>;
  swipes: Record<string, Record<string, "like" | "pass">>;
  bracket?: Bracket;
  winnerId?: string;
  createdAt: number;
}
```

---

## 5. API Contracts

All responses: `200` on success with JSON body, `4xx` with `{ error: string }` on failure.

### `POST /api/rooms`
Create a room.
```json
// request
{ "username": "โบ๊ท" }

// response
{
  "code": "GIN482",
  "participantId": "uuid-...",
  "room": { /* full Room object */ }
}
```

### `POST /api/rooms/[code]/join`
```json
// request
{ "username": "แนน" }

// response 200
{ "participantId": "uuid-...", "room": { /* full Room */ } }

// response 404 if room doesn't exist
{ "error": "ไม่พบห้องนี้" }

// response 400 if room already started (status != "lobby")
{ "error": "เกมเริ่มไปแล้ว เข้าร่วมไม่ได้" }

// response 400 if username taken in this room
{ "error": "ชื่อนี้มีคนใช้แล้วในห้องนี้" }
```

### `POST /api/rooms/[code]/start`
Leader only. Requires `participantId` in body to verify leader.
```json
// request
{ "participantId": "uuid-of-leader" }

// response 200
{ "room": { /* status now "swiping", restaurantPool populated, participantOrder assigned */ } }

// response 403 if not leader
{ "error": "เฉพาะหัวหน้าห้องเท่านั้นที่เริ่มได้" }

// response 400 if <2 participants
{ "error": "ต้องมีอย่างน้อย 2 คนถึงจะเริ่มได้" }
```
Server logic on start: pick 10 random restaurant IDs from the 30-item mock dataset → `restaurantPool`; for each participant, generate a shuffled copy → `participantOrder[pid]`.

### `GET /api/rooms/[code]/state?participantId=xxx`
Polled every 1.5s by all clients on lobby/swipe/waiting/bracket/result screens.
```json
// response 200
{
  "room": { /* full Room, minus other participants' individual swipe details if you want to hide them — MVP: fine to include, no strategic harm */ },
  "restaurants": [ /* full Restaurant objects for room.restaurantPool, resolved from mock data */ ],
  "yourOrder": [ "r7", "r2", "r19", ... ]   // this participant's shuffled card order
}
```

### `POST /api/rooms/[code]/swipe`
```json
// request
{ "participantId": "uuid", "restaurantId": "r7", "direction": "like" }

// response 200
{ "room": { /* updated */ } }
```
Server logic: record swipe; if this was participant's last card in their order, set `finishedSwiping = true`. After recording, check: if **all** participants have `finishedSwiping = true` and `status == "swiping"` → run `computeResult()` (see §6), which mutates `status` to either `"finished"` or `"bracket"`.

### `POST /api/rooms/[code]/bracket-vote`
```json
// request
{ "participantId": "uuid", "matchId": "m1", "restaurantId": "r7" }

// response 200
{ "room": { /* updated */ } }
```
Server logic: record vote on the match. If **all** participants have voted on **all** matches in the current round → tally winners per match (majority; tie = random), build next round (or set `status: "finished"` + `winnerId` if this was the final).

### `POST /api/rooms/[code]/new-round`
Leader only.
```json
// request
{ "participantId": "uuid-of-leader" }

// response 200
{ "room": { /* status reset to "lobby", new empty swipes/bracket, participants kept as-is */ } }
```

---

## 6. Result Computation (exact algorithm for MVP)

```ts
function computeResult(room: Room) {
  const pids = Object.keys(room.participants);
  const pool = room.restaurantPool;

  const likeCounts = pool.map(rid => ({
    rid,
    likes: pids.filter(pid => room.swipes[pid]?.[rid] === "like").length
  }));

  const unanimous = likeCounts.filter(r => r.likes === pids.length);

  if (unanimous.length === 1) {
    room.winnerId = unanimous[0].rid;
    room.status = "finished";
    return;
  }

  // 2+ unanimous OR 0 unanimous both go to sudden death,
  // just with a different candidate pool — keeps logic uniform for MVP.
  const candidates = unanimous.length > 1
    ? unanimous.map(r => r.rid)
    : [...likeCounts].sort((a, b) => b.likes - a.likes).slice(0, 4).map(r => r.rid);
    // MVP hardcodes K=4 for sudden death (simpler than full's variable K=4/8)

  startBracket(room, candidates);
}

function startBracket(room: Room, candidateIds: string[]) {
  // pad to next power of 2 with byes (null)
  let size = 1;
  while (size < candidateIds.length) size *= 2;
  const padded = [...candidateIds];
  while (padded.length < size) padded.push(null as any);
  shuffle(padded);

  const matches: BracketMatch[] = [];
  for (let i = 0; i < padded.length; i += 2) {
    matches.push({
      id: `m${i / 2}-r1`,
      round: 1,
      restaurantAId: padded[i],
      restaurantBId: padded[i + 1],
      votes: {},
    });
  }
  // auto-resolve byes immediately
  matches.forEach(m => {
    if (m.restaurantAId && !m.restaurantBId) m.winnerId = m.restaurantAId;
    if (m.restaurantBId && !m.restaurantAId) m.winnerId = m.restaurantBId;
  });

  room.bracket = { round: 1, matches, history: [] };
  room.status = "bracket";

  maybeAdvanceBracket(room); // in case all matches were byes (candidates <=2)
}
```

Bracket advance (called after every vote, and after `startBracket`):
```ts
function maybeAdvanceBracket(room: Room) {
  const b = room.bracket!;
  const pids = Object.keys(room.participants);

  // resolve any match where everyone has voted but winnerId not yet set
  b.matches.forEach(m => {
    if (m.winnerId) return;
    const voteCounts: Record<string, number> = {};
    pids.forEach(pid => {
      const v = m.votes[pid];
      if (v) voteCounts[v] = (voteCounts[v] || 0) + 1;
    });
    const allVoted = pids.every(pid => m.votes[pid]);
    if (allVoted) {
      const entries = Object.entries(voteCounts);
      const max = Math.max(...entries.map(([, c]) => c));
      const top = entries.filter(([, c]) => c === max).map(([rid]) => rid);
      m.winnerId = top[Math.floor(Math.random() * top.length)]; // random tiebreak
    }
  });

  const allResolved = b.matches.every(m => m.winnerId);
  if (!allResolved) return;

  b.history.push(b.matches);
  const winners = b.matches.map(m => m.winnerId!);

  if (winners.length === 1) {
    room.winnerId = winners[0];
    room.status = "finished";
    return;
  }

  const nextMatches: BracketMatch[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    nextMatches.push({
      id: `m${i / 2}-r${b.round + 1}`,
      round: b.round + 1,
      restaurantAId: winners[i],
      restaurantBId: winners[i + 1] ?? null,
      votes: {},
    });
  }
  nextMatches.forEach(m => {
    if (m.restaurantAId && !m.restaurantBId) m.winnerId = m.restaurantAId;
  });
  b.round += 1;
  b.matches = nextMatches;

  maybeAdvanceBracket(room); // handle chained byes
}
```

---

## 7. Mock Dataset Requirement

`/lib/mockData.ts` — exactly 30 `Restaurant` entries, all Thai-language `name`/`description`/`tags`, spanning at least these cuisines so swipe results feel varied: อีสาน, ไทยภาคกลาง, ญี่ปุ่น, เกาหลี, จีน, อิตาเลียน, สตรีทฟู้ด, ของหวาน, ชาบู/ปิ้งย่าง, ซีฟู้ด. Use category-based placeholder image URLs (e.g. a fixed Unsplash source URL per cuisine) rather than sourcing 30 unique photos.

---

## 8. Pages/Components File Tree (MVP)

```
/app
  page.tsx
  create/page.tsx
  join/page.tsx
  room/[code]/lobby/page.tsx
  room/[code]/swipe/page.tsx
  room/[code]/waiting/page.tsx
  room/[code]/bracket/page.tsx
  room/[code]/result/page.tsx
  api/rooms/route.ts
  api/rooms/[code]/join/route.ts
  api/rooms/[code]/start/route.ts
  api/rooms/[code]/state/route.ts
  api/rooms/[code]/swipe/route.ts
  api/rooms/[code]/bracket-vote/route.ts
  api/rooms/[code]/new-round/route.ts
  globals.css

/components
  Button.tsx
  TextInput.tsx
  RoomCodeBadge.tsx
  ParticipantPill.tsx
  SwipeCard.tsx
  SwipeStack.tsx
  ProgressBar.tsx
  BracketMatchCard.tsx
  ResultCard.tsx

/lib
  types.ts
  store.ts
  mockData.ts
  roomLogic.ts     (computeResult, startBracket, maybeAdvanceBracket, shuffle, code gen)
```

---

## 9. Visual Spec Recap (for MVP build)

- CSS variables in `globals.css`:
  ```css
  :root {
    --color-primary: #8C2333;
    --color-secondary: #C75860;
    --color-bg: #FFE4E3;
    --color-text: #3A1218;
    --font-main: "Comic Sans MS", "Comic Neue", cursive, sans-serif;
  }
  ```
- Every page: `background: var(--color-bg)`, big rounded card in center, generous whitespace (minimalist).
- Swipe card: `framer-motion` `drag="x"`, rotate proportional to drag X, LIKE/NOPE stamp fades in past ±80px threshold, fly-off + next card scales up on release.
- Result page: `canvas-confetti` burst in `--color-primary`/`--color-secondary` on mount.
- Buttons: solid `--color-primary` bg, `--color-bg` text, pill-shaped, slight scale-up on hover/tap (`whileTap={{scale:0.95}}`).

---

## 10. Manual Acceptance Test (walkthrough to confirm MVP works)

1. Open `/`, click Create Room, enter "Leader" → land on lobby, see code.
2. Open a second browser/incognito tab, go to `/join`, enter code + "Friend1" → appears in leader's lobby list within ~2s.
3. Repeat for "Friend2".
4. Leader clicks Start → all 3 tabs auto-navigate to swipe screen within ~2s.
5. Each tab swipes through its 10 cards (mix likes/passes so at least once you get 0 consensus, and test again so you get 1 consensus, to hit both code paths).
6. Confirm: consensus case → all 3 land on result screen with same winner. No-consensus case → all 3 land on bracket screen, matches match across tabs, voting advances rounds in sync, ends on result screen.
7. Click "New Round" → all tabs return to lobby with same participants, new pool.

---

Ready to scaffold this into an actual Next.js project on request.
