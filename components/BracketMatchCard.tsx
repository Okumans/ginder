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
  countdown?: number;
  matchIndex?: number;
  totalMatches?: number;
  flashState?: "none" | "flashingLeft" | "flashingRight" | "winnerLeft" | "winnerRight";
}

function MiniCard({
  restaurant,
  isSelected,
  isWinner,
  onSelect,
  disabled,
  isFlashing,
}: {
  restaurant?: Restaurant;
  isSelected: boolean;
  isWinner: boolean;
  onSelect?: () => void;
  disabled: boolean;
  isFlashing: boolean;
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
      animate={
        isFlashing
          ? {
              boxShadow: [
                "0 0 0px rgba(197,88,96,0)",
                "0 0 20px rgba(197,88,96,0.6)",
                "0 0 0px rgba(197,88,96,0)",
              ],
            }
          : {}
      }
      transition={
        isFlashing
          ? { duration: 0.3, repeat: Infinity }
          : {}
      }
      className={`relative w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition-all ${
        isSelected
          ? "ring-3 ring-[var(--color-primary)]"
          : "ring-1 ring-transparent hover:ring-[var(--color-primary)]/30"
      } ${isWinner ? "ring-3 ring-green-500" : ""} ${isFlashing ? "ring-3 ring-[var(--color-secondary)]" : ""} ${disabled && !isSelected && !isWinner && !isFlashing ? "opacity-60" : ""}`}
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
  countdown,
  matchIndex,
  totalMatches,
  flashState = "none",
}: BracketMatchCardProps) {
  const myVote = hasVoted[match.id];
  const isTieFlashing = flashState === "flashingLeft" || flashState === "flashingRight";
  const isFinal = flashState === "winnerLeft" || flashState === "winnerRight";

  return (
    <div className="rounded-3xl bg-[var(--color-bg)]/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold text-[var(--color-text)]/40">
          รอบที่ {match.round}
          {matchIndex !== undefined && totalMatches !== undefined
            ? ` — คู่ที่ ${matchIndex + 1} / ${totalMatches}`
            : ""}
        </p>
        {countdown !== undefined && countdown > 0 && !match.winnerId && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              countdown <= 5
                ? "animate-pulse bg-red-100 text-red-600"
                : "bg-white text-[var(--color-text)]/50"
            }`}
          >
            ⏱️ {countdown}วิ
          </span>
        )}
        {match.tied && isTieFlashing && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-600">
            เสมอ! กำลังสุ่ม...
          </span>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col items-center gap-1">
          <MiniCard
            restaurant={restaurantA}
            isSelected={myVote === match.restaurantAId}
            isWinner={isFinal && match.winnerId === match.restaurantAId}
            onSelect={() => match.restaurantAId && onVote(match.id, match.restaurantAId)}
            disabled={disabled || !!match.winnerId}
            isFlashing={isTieFlashing && flashState === "flashingLeft"}
          />
        </div>
        <div className="flex items-center text-lg font-black text-[var(--color-text)]/30">
          VS
        </div>
        <div className="flex flex-1 flex-col items-center gap-1">
          <MiniCard
            restaurant={restaurantB}
            isSelected={myVote === match.restaurantBId}
            isWinner={isFinal && match.winnerId === match.restaurantBId}
            onSelect={() => match.restaurantBId && onVote(match.id, match.restaurantBId)}
            disabled={disabled || !!match.winnerId}
            isFlashing={isTieFlashing && flashState === "flashingRight"}
          />
        </div>
      </div>
      {match.winnerId && !isTieFlashing && (
        <p className="mt-2 text-center text-sm font-bold text-green-600">
          ผลโหวตออกแล้ว!
        </p>
      )}
      {isTieFlashing && (
        <p className="mt-2 text-center text-xs text-[var(--color-text)]/40">
          กำลังตัดสิน...
        </p>
      )}
    </div>
  );
}