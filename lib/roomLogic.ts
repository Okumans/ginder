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

  const candidates =
    unanimous.length > 1
      ? unanimous.map((r) => r.rid)
      : [...likeCounts]
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 4)
          .map((r) => r.rid);

  startBracket(room, candidates);
}

export function startBracket(room: Room, candidateIds: string[]): void {
  let size = 1;
  while (size < candidateIds.length) size *= 2;
  const padded: (string | null)[] = [...candidateIds];
  while (padded.length < size) padded.push(null);
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

  matches.forEach((m) => {
    if (m.restaurantAId && !m.restaurantBId) m.winnerId = m.restaurantAId;
    if (m.restaurantBId && !m.restaurantAId) m.winnerId = m.restaurantBId;
  });

  room.bracket = { round: 1, matches, history: [] };
  room.status = "bracket";

  maybeAdvanceBracket(room);
}

export function maybeAdvanceBracket(room: Room): void {
  const b = room.bracket!;
  const pids = Object.keys(room.participants);

  b.matches.forEach((m) => {
    if (m.winnerId) return;
    const voteCounts: Record<string, number> = {};
    pids.forEach((pid) => {
      const v = m.votes[pid];
      if (v) voteCounts[v] = (voteCounts[v] || 0) + 1;
    });
    const allVoted = pids.every((pid) => m.votes[pid]);
    if (allVoted) {
      const entries = Object.entries(voteCounts);
      const max = Math.max(...entries.map(([, c]) => c));
      const top = entries.filter(([, c]) => c === max).map(([rid]) => rid);
      m.winnerId = top[Math.floor(Math.random() * top.length)];
    }
  });

  const allResolved = b.matches.every((m) => m.winnerId);
  if (!allResolved) return;

  b.history.push(b.matches);
  const winners = b.matches.map((m) => m.winnerId!);

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
  nextMatches.forEach((m) => {
    if (m.restaurantAId && !m.restaurantBId) m.winnerId = m.restaurantAId;
  });
  b.round += 1;
  b.matches = nextMatches;

  maybeAdvanceBracket(room);
}