# AGENTS.md — Ginder (กินเด้อ)

Next.js 15 App Router, TypeScript, Tailwind CSS v4, framer-motion, canvas-confetti.

## Commands

```bash
npm run dev      # next dev --turbopack
npm run build    # next build --turbopack (typecheck + compile)
npm run lint     # eslint
```

- `build` also type-checks; no separate `tsc` script.
- Turbopack is always enabled (`dev` and `build` both use `--turbopack`).

## Architecture

**12 route files, single flat project (no monorepo).**

```
lib/           types.ts, store.ts, roomLogic.ts, mockData.ts
components/    all reusable UI (10 files)
app/           pages + API routes
  api/rooms/   7 route handlers (POST create/join/start/swipe/bracket-vote/new-round, GET state)
  room/[code]/ lobby, swipe, waiting, bracket, result
```

## Key conventions

### Server state

- **In-memory only** — `lib/store.ts` holds a single `Map<string, Room>`. No database, resets on restart.
- Mutations modify the `Room` object **in place**, then call `saveRoom(room)` to write it back to the map.
- Room codes are always stored and looked up in UP

### Next.js 15 async params

API routes and pages that use `[code]` dynamic segments **must await params**:

```ts
// API route
export async function GET(req, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  ...
}

// Page
export default function Page() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
}
```

### Client vs server

- **All game pages are `"use client"`** — they poll, use localStorage, and navigate with `useRouter`.
- **API routes are server-side** (default, no directive needed).
- Landing, create, and join pages are static (prerendered client components).

### Polling pattern

Every game page (lobby/swipe/waiting/bracket/result) polls `GET /api/rooms/[code]/state?participantId=xxx` every 1.5 seconds. When the room `status` changes, the page **auto-redirects** via `router.push()` to the next screen. Use a `isNavigating` flag in the cleanup to prevent duplicate redirects on unmount.

### Participant identity

- `participantId` is generated server-side via `crypto.randomUUID()` on create/join.
- Stored client-side in `localStorage` with key `ginder_pid_<code>`.
- Pages read it from localStorage on mount; redirect to `/` if missing.

### Styling

- **Tailwind v4 (CSS-first config).** No `tailwind.config.ts`. Theme is defined in `app/globals.css` via `@theme inline`.
- Custom CSS variables (`--color-primary`, `--color-secondary`, `--color-bg`, `--color-text`) are registered as Tailwind theme tokens, so they work as both `bg-[var(--color-primary)]` and `bg-(--color-primary)`.
- Font: Comic Neue (loaded via `next/font/google` in layout.tsx) with Comic Sans MS fallback.
- Every page is wrapped in a centered `max-w-lg` container in the root layout.

### TypeScript / ESLint

- Strict mode enabled.
- `@/*` import alias maps to project root.
- ESLint flat config (`eslint.config.mjs`) extends `next/core-web-vitals` and `next/typescript`.
- No `any` — use specific types (e.g. `MouseEvent | TouchEvent | PointerEvent` for framer-motion drag handlers).

### Components

`framer-motion` for animations: `whileTap={{scale:0.95}}` on buttons, drag-to-swipe on cards, fade-in on list items. `canvas-confetti` fires on the result page mount.

### Result logic

See `lib/roomLogic.ts` for the exact implementations of `computeResult`, `startBracket`, `maybeAdvanceBracket`, and `shuffle`. Bracket matches use random tiebreak for tied votes; byes auto-resolve immediately.

## Gotchas

- **Room codes are 6 uppercase chars** excluding ambiguous letters (`0/O`, `1/I/L`). Always `.toUpperCase()` when looking up.
- **Bracket `restaurantAId`/`restaurantBId` can be `null`** (meaning a bye). UI must handle the null case.
- **Swipes record `"like" | "pass"`, not booleans.**
- Confirm `npm run build` passes before considering work done — it catches type errors.