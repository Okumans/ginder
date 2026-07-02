"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Room, Restaurant } from "@/lib/types";
import BracketMatchCard from "@/components/BracketMatchCard";

export default function BracketPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const [room, setRoom] = useState<Room | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [hasVoted, setHasVoted] = useState<Record<string, string>>({});
  const [prevRound, setPrevRound] = useState(0);

  const participantId =
    typeof window !== "undefined"
      ? localStorage.getItem(`ginder_pid_${code}`) ?? null
      : null;

  useEffect(() => {
    if (!participantId) {
      router.push("/");
      return;
    }

    let isNavigating = false;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/rooms/${code}/state?participantId=${participantId}`
        );
        const data = await res.json();

        if (!res.ok || !data.room) return;

        setRoom(data.room);
        setRestaurants(data.restaurants);

        if (data.room.bracket && data.room.bracket.round !== prevRound) {
          setPrevRound(data.room.bracket.round);
          setHasVoted({});
        }

        if (data.room.status === "finished" && !isNavigating) {
          isNavigating = true;
          router.push(`/room/${code}/result`);
        } else if (data.room.status === "lobby" && !isNavigating) {
          isNavigating = true;
          router.push(`/room/${code}/lobby`);
        }
      } catch {
        // ignore
      }
    };

    poll();
    const interval = setInterval(poll, 1500);
    return () => {
      isNavigating = true;
      clearInterval(interval);
    };
  }, [code, participantId, router, prevRound]);

  const handleVote = useCallback(
    async (matchId: string, restaurantId: string) => {
      if (!participantId) return;

      setHasVoted((prev) => ({ ...prev, [matchId]: restaurantId }));

      try {
        await fetch(`/api/rooms/${code}/bracket-vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantId, matchId, restaurantId }),
        });
      } catch {
        // ignore
      }
    },
    [code, participantId]
  );

  if (!room || !room.bracket) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-lg text-[var(--color-text)]/40">กำลังโหลด...</p>
      </div>
    );
  }

  const matches = room.bracket.matches;
  const allVoted = matches.every((m) => hasVoted[m.id]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 py-6">
      <div className="text-center">
        <h1 className="text-2xl font-black text-[var(--color-text)]">
          🏆 รอบโหวต
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text)]/40">
          รอบที่ {room.bracket.round} — เลือกร้านที่อยากกินในแต่ละคู่
        </p>
      </div>

      {allVoted && !room.bracket.matches.every((m) => m.winnerId) && (
        <p className="text-center text-sm font-bold text-[var(--color-secondary)]">
          รอผลโหวต...
        </p>
      )}

      <div className="flex w-full max-w-md flex-col gap-3">
        {matches.map((match) => {
          const resA = restaurants.find((r) => r.id === match.restaurantAId);
          const resB = restaurants.find((r) => r.id === match.restaurantBId);
          const allResolved = matches.every((m) => m.winnerId);

          return (
            <BracketMatchCard
              key={match.id}
              match={match}
              restaurantA={resA}
              restaurantB={resB}
              onVote={handleVote}
              hasVoted={hasVoted}
              disabled={allResolved || !!hasVoted[match.id]}
            />
          );
        })}
      </div>
    </div>
  );
}