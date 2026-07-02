"use client";

import { motion } from "framer-motion";
import { BracketMatch, Restaurant } from "@/lib/types";

interface BracketMatchCardProps {
  match: BracketMatch;
  restaurantA?: Restaurant;
  restaurantB?: Restaurant;
  onVote: (matchId: string, restaurantId: string) => void;
  hasVoted: Record<string, string>;
  disabled: boolean;
}

function MiniCard({
  restaurant,
  isSelected,
  isWinner,
  onSelect,
  disabled,
}: {
  restaurant?: Restaurant;
  isSelected: boolean;
  isWinner: boolean;
  onSelect?: () => void;
  disabled: boolean;
}) {
  if (!restaurant) {
    return (
      <div className="flex w-full items-center justify-center rounded-2xl bg-white/50 p-6 text-center text-sm font-bold text-[var(--color-text)]/40">
        ผ่านเข้ารอบ
      </div>
    );
  }

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className={`relative w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition-all ${
        isSelected
          ? "ring-3 ring-[var(--color-primary)]"
          : "ring-1 ring-transparent hover:ring-[var(--color-primary)]/30"
      } ${isWinner ? "ring-3 ring-green-500" : ""} ${disabled && !isSelected && !isWinner ? "opacity-60" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={restaurant.imageUrl}
        alt={restaurant.name}
        className="h-28 w-full object-cover"
        draggable={false}
      />
      <div className="p-3">
        <h4 className="text-sm font-bold text-[var(--color-text)]">
          {restaurant.name}
        </h4>
        <p className="text-xs text-[var(--color-text)]/50">{restaurant.cuisine}</p>
      </div>
      {isWinner && (
        <div className="absolute right-2 top-2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
          ชนะ 🏆
        </div>
      )}
      {isSelected && !isWinner && (
        <div className="absolute right-2 top-2 rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs font-bold text-white">
          โหวตแล้ว ✓
        </div>
      )}
    </motion.button>
  );
}

export default function BracketMatchCard({
  match,
  restaurantA,
  restaurantB,
  onVote,
  hasVoted,
  disabled,
}: BracketMatchCardProps) {
  const myVote = hasVoted[match.id];

  return (
    <div className="rounded-3xl bg-[var(--color-bg)]/50 p-4">
      <p className="mb-2 text-center text-xs font-bold text-[var(--color-text)]/40">
        รอบที่ {match.round} — คู่ที่ {match.id.split("-")[0].replace("m", "")}
      </p>
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col items-center gap-1">
          <MiniCard
            restaurant={restaurantA}
            isSelected={myVote === match.restaurantAId}
            isWinner={match.winnerId === match.restaurantAId}
            onSelect={() => match.restaurantAId && onVote(match.id, match.restaurantAId)}
            disabled={disabled || match.winnerId !== undefined}
          />
        </div>
        <div className="flex items-center text-lg font-black text-[var(--color-text)]/30">
          VS
        </div>
        <div className="flex flex-1 flex-col items-center gap-1">
          <MiniCard
            restaurant={restaurantB}
            isSelected={myVote === match.restaurantBId}
            isWinner={match.winnerId === match.restaurantBId}
            onSelect={() => match.restaurantBId && onVote(match.id, match.restaurantBId)}
            disabled={disabled || match.winnerId !== undefined}
          />
        </div>
      </div>
      {match.winnerId && (
        <p className="mt-2 text-center text-sm font-bold text-green-600">
          ผลโหวตออกแล้ว!
        </p>
      )}
    </div>
  );
}