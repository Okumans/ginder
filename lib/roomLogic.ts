import { Room, BracketMatch } from "./types";
import { roomExists } from "./store";

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateRoomCode(): string {
  let code: string;
  let attempts = 0;
  do {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    attempts++;
    if (attempts > 100) {
      throw new Error("Unable to generate unique room code");
    }
  } while (roomExists(code));
  return code;
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function computeResult(room: Room): void {
  const pids = Object.keys(room.participants);
  const pool = room.restaurantPool;

  const likeCounts = pool.map((rid) => ({
    rid,
    likes: pids.filter((pid) => room.swipes[pid]?.[rid] === "like").length,
  }));

  const unanimous = likeCounts.filter((r) => r.likes === pids.length);

  if (unanimous.length === 1) {
    room.winnerId = unanimous[0].rid;
    room.status = "finished";
    return;
  }

  if (unanimous.length > 1) {
    startBracket(
      room,
      unanimous.map((r) => ({ rid: r.rid, likes: r.likes }))
    );
    return;
  }

  const top8 = pickTopCandidates(likeCounts, 8);
  startBracket(room, top8);
}

function pickTopCandidates(
  likeCounts: { rid: string; likes: number }[],
  k: number
): { rid: string; likes: number }[] {
  const sorted = [...likeCounts].sort((a, b) => b.likes - a.likes);

  if (sorted.length <= k) {
    return sorted;
  }

  const cutoff = sorted[k - 1].likes;
  const above = sorted.filter((r) => r.likes > cutoff);
  const atCutoff = sorted.filter((r) => r.likes === cutoff);

  const needed = k - above.length;
  const selected = shuffle(atCutoff).slice(0, needed);

  return [...above, ...selected].sort((a, b) => b.likes - a.likes);
}

function seedPairings(
  candidates: { rid: string; likes: number }[]
): (string | null)[] {
  // Sort by likes descending (higher likes = lower seed number = better position)
  const sorted = [...candidates].sort((a, b) => b.likes - a.likes);

  let size = 1;
  while (size < sorted.length) size *= 2;

  const padded = sorted.map((c) => c.rid);
  while (padded.length < size) padded.push(null as unknown as string);

  // Seeded placement: 1 vs N, 2 vs N-1, 3 vs N-2, ...
  // Pair positions: (0, size-1), (1, size-2), (2, size-3), ...
  const result: (string | null)[] = [];
  const half = size / 2;
  for (let i = 0; i < half; i++) {
    const leftIdx = i;
    const rightIdx = size - 1 - i;
    result.push(padded[leftIdx] ?? null, padded[rightIdx] ?? null);
  }

  return result;
}

export function startBracket(
  room: Room,
  candidates: { rid: string; likes: number }[]
): void {
  const seeded = seedPairings(candidates);

  const matches: BracketMatch[] = [];
  for (let i = 0; i < seeded.length; i += 2) {
    const a = seeded[i];
    const b = seeded[i + 1];
    const match: BracketMatch = {
      id: `m${i / 2}-r1`,
      round: 1,
      restaurantAId: a,
      restaurantBId: b ?? null,
      votes: {},
      tied: false,
    };

    // Only the first non-bye match starts its timer now
    const isBye = (a && !b) || (b && !a);
    if (!isBye) {
      const firstRealMatch = matches.filter((m) => !m.startedAt && !m.winnerId).length === 0;
      if (firstRealMatch && !match.winnerId) {
        match.startedAt = Date.now();
      }
    }

    if (a && !b) match.winnerId = a;
    if (b && !a) match.winnerId = b;

    matches.push(match);
  }

  room.bracket = { round: 1, matches, history: [], activeMatchIndex: 0 };
  room.status = "bracket";

  maybeAdvanceBracket(room);
}

export function maybeAdvanceBracket(room: Room): void {
  const b = room.bracket!;
  const pids = Object.keys(room.participants);

  try {
    // Find the first unresolved match at or after activeMatchIndex
    // Skip matches that are already resolved (byes)
    while (
      b.activeMatchIndex < b.matches.length &&
      b.matches[b.activeMatchIndex].winnerId !== undefined
    ) {
      b.activeMatchIndex++;
    }

    if (b.activeMatchIndex >= b.matches.length) {
      advanceRound(room);
      return;
    }

    const activeMatch = b.matches[b.activeMatchIndex];

    // Timer enforcement: if 30s passed, random-fill unvoted participants
    if (
      activeMatch.startedAt &&
      Date.now() - activeMatch.startedAt > 30_000
    ) {
      const options: string[] = [];
      if (activeMatch.restaurantAId) options.push(activeMatch.restaurantAId);
      if (activeMatch.restaurantBId) options.push(activeMatch.restaurantBId);

      pids.forEach((pid) => {
        if (!activeMatch.votes[pid] && options.length > 0) {
          activeMatch.votes[pid] = options[Math.floor(Math.random() * options.length)];
        }
      });
    }

    const allVoted = pids.every((pid) => activeMatch.votes[pid]);
    if (!allVoted) return;

    // Tally votes
    const voteCounts: Record<string, number> = {};
    pids.forEach((pid) => {
      const v = activeMatch.votes[pid];
      if (v) voteCounts[v] = (voteCounts[v] || 0) + 1;
    });

    const entries = Object.entries(voteCounts);
    const max = Math.max(...entries.map(([, c]) => c));
    const top = entries.filter(([, c]) => c === max).map(([rid]) => rid);

    if (top.length > 1) {
      // Tie
      activeMatch.tied = true;
      activeMatch.tieCandidates = top;
      activeMatch.winnerId = top[Math.floor(Math.random() * top.length)];
    } else {
      activeMatch.winnerId = top[0];
    }

    // Move to next match
    b.activeMatchIndex++;
    if (b.activeMatchIndex >= b.matches.length) {
      advanceRound(room);
      return;
    }

    // Start timer on the next non-resolved match
    let nextIdx = b.activeMatchIndex;
    while (nextIdx < b.matches.length) {
      const nextMatch = b.matches[nextIdx];
      if (nextMatch.winnerId === undefined) {
        nextMatch.startedAt = Date.now();
        break;
      }
      nextIdx++;
    }

    // Check if all are already resolved (e.g. only byes left)
    if (
      nextIdx >= b.matches.length ||
      b.matches.every((m) => m.winnerId !== undefined)
    ) {
      advanceRound(room);
    }
  } catch (e) {
    console.error("maybeAdvanceBracket error:", e);
  }
}

function advanceRound(room: Room): void {
  const bracket = room.bracket!;

  bracket.history.push(bracket.matches);
  const winners = bracket.matches
    .map((m) => m.winnerId)
    .filter((id): id is string => id != null);

  if (winners.length === 0) {
    room.status = "finished";
    return;
  }

  if (winners.length === 1) {
    room.winnerId = winners[0];
    room.status = "finished";
    return;
  }

  const nextMatches: BracketMatch[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    const a = winners[i];
    const b = winners[i + 1] ?? null;
    const match: BracketMatch = {
      id: `m${i / 2}-r${bracket.round + 1}`,
      round: bracket.round + 1,
      restaurantAId: a,
      restaurantBId: b,
      votes: {},
      tied: false,
    };

    if (a && !b) match.winnerId = a;

    // Start timer on the first non-bye match of the new round
    const isBye = match.winnerId !== undefined;
    if (!isBye && !match.startedAt) {
      const hasActiveTimer = nextMatches.some((m) => m.startedAt);
      if (!hasActiveTimer) {
        match.startedAt = Date.now();
      }
    }

    nextMatches.push(match);
  }

  bracket.round += 1;
  bracket.matches = nextMatches;
  bracket.activeMatchIndex = 0;

  maybeAdvanceBracket(room);
}