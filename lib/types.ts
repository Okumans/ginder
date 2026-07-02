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
  restaurantAId: string | null;
  restaurantBId: string | null;
  votes: Record<string, string>;
  winnerId?: string;
  tied?: boolean;
  tieCandidates?: string[];
  startedAt?: number;
}

export interface Bracket {
  round: number;
  matches: BracketMatch[];
  history: BracketMatch[][];
  activeMatchIndex: number;
}

export interface Room {
  code: string;
  leaderId: string;
  status: RoomStatus;
  restaurantPool: string[];
  participantOrder: Record<string, string[]>;
  participants: Record<string, Participant>;
  swipes: Record<string, Record<string, "like" | "pass">>;
  bracket?: Bracket;
  winnerId?: string;
  createdAt: number;
  swipeStartedAt?: number;
}