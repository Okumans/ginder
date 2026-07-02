# Ginder

Swipe together with friends to match on where to eat. No more "whatever, anything's fine."

A Tinder-style, client-only web app for group food decisions: everyone swipes on restaurant cards, and if the group doesn't unanimously agree, a seeded elimination bracket (with a synced "flashing decider" for ties) settles it.

## How it works

1. **Create or join a room** — a 4-character code or a scannable QR code.
2. **Host tunes the search**: pin a location on the map, set a distance radius, food categories, and card count. Data source can be the curated Bangkok dataset (117 real spots) or **live nearby places from OpenStreetMap** (via the Overpass API).
3. **Everyone swipes** — 60 seconds, like/pass on each card (drag, buttons, or arrow keys).
4. **Elimination logic**:
   - Everyone liked exactly one thing → instant winner.
   - Everyone liked multiple things → bracket among just those.
   - No unanimous pick → top 8 by vote count seed a bracket (ties at the cutoff broken randomly).
   - Bracket rounds: 30s per match, majority vote wins; a tie triggers a synced flashing animation that lands on the winner for everyone at once.
5. **Winner reveal** — confetti, a link to Google Maps, and a native share button.

No backend server — real-time sync between browser tabs/devices in the same room uses `BroadcastChannel` (same browser profile only) plus `localStorage` for the public-room list.

## Tech stack

- React 19 + Vite
- Plain CSS (no framework) — custom comic-flashy brand system in `src/index.css`
- [Gleo](https://github.com/ghybs/gleo) (WebGL map, loaded from CDN — see `index.html`) for the location picker
- [Overpass API](https://overpass-api.de/) for optional live restaurant data
- `qrcode` (lazy-loaded) for the room-join QR code

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run lint     # oxlint
```

Open the app in two tabs (or one normal + one private window in the *same browser*) to test multiplayer — or enable the built-in bot simulator in the lobby to demo it solo.

## Deployment

Ships as a static build behind nginx in Docker (see `Dockerfile`, `nginx.conf`, `docker-compose.yml`). The `cloudflared` service in `docker-compose.yml` runs a Cloudflare Tunnel using credentials mounted from a local `cloudflared/` directory (not committed — generate your own with `cloudflared tunnel create` and `cloudflared tunnel route dns`).

```bash
docker compose up -d --build
```

## Project docs

`docs/` has the original hackathon planning artifacts (spec, user stories, data model, architecture, test plan) from Team 2's Tech ESC Hackathon submission — see `Team 2 _ Tech ESC Hackathon.md` for the original brief.
