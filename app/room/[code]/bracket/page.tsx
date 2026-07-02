"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Room, Restaurant } from "@/lib/types";
import BracketMatchCard from "@/components/BracketMatchCard";

type FlashState = "none" | "flashingLeft" | "flashingRight" | "winnerLeft" | "winnerRight";

export default function BracketPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const [room, setRoom] = useState<Room | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [hasVoted, setHasVoted] = useState<Record<string, string>>({});
  const [prevRound, setPrevRound] = useState(0);
  const [prevMatchIndex, setPrevMatchIndex] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashState, setFlashState] = useState<FlashState>("none");
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const participantId =
    typeof window !== "undefined"
      ? localStorage.getItem(`ginder_pid_${code}`) ?? null
      : null;

  const isNavigating = useRef(false);

  const startFlashAnimation = useCallback((roomData: Room) => {
    const bracket = roomData.bracket;
    if (!bracket) return;

    const active = bracket.matches[bracket.activeMatchIndex];
    if (!active?.tied || !active.tieCandidates) return;

    const finalLeft = active.winnerId === active.restaurantAId;

    let step = 0;
    let showLeft = false;

    const tick = () => {
      step++;
      if (step <= 6) {
        showLeft = !showLeft;
        setFlashState(showLeft ? "flashingLeft" : "flashingRight");
        flashTimer.current = setTimeout(tick, 100);
      } else if (step <= 10) {
        showLeft = !showLeft;
        setFlashState(showLeft ? "flashingLeft" : "flashingRight");
        const delay = 200 + (step - 6) * 200;
        flashTimer.current = setTimeout(tick, delay);
      } else {
        setFlashState(finalLeft ? "winnerLeft" : "winnerRight");
      }
    };

    tick();
  }, []);

  useEffect(() => {
    if (!participantId) {
      router.push("/");
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/rooms/${code}/state?participantId=${participantId}`
        );
        const data = await res.json();

        if (!res.ok || !data.room) return;

        setRoom(data.room);
        setRestaurants(data.restaurants);

        if (data.timers?.bracketMatchRemaining !== undefined) {
          setCountdown(data.timers.bracketMatchRemaining);
        }

        if (data.room.bracket) {
          const br = data.room.bracket;
          const activeMatch = br.matches[br.activeMatchIndex];

          if (br.round !== prevRound) {
            setPrevRound(br.round);
            setPrevMatchIndex(br.activeMatchIndex);
            setHasVoted({});
            setFlashState("none");
          } else if (br.activeMatchIndex !== prevMatchIndex) {
            setPrevMatchIndex(br.activeMatchIndex);
            setHasVoted({});
            setFlashState("none");

            if (activeMatch?.tied && activeMatch.winnerId) {
              startFlashAnimation(data.room);
            }
          }

          if (activeMatch?.tied && activeMatch.winnerId && flashState === "none") {
            startFlashAnimation(data.room);
          }
        }

        if (data.room.status === "finished" && !isNavigating.current) {
          isNavigating.current = true;
          if (flashTimer.current) clearTimeout(flashTimer.current);
          router.push(`/room/${code}/result`);
        } else if (data.room.status === "lobby" && !isNavigating.current) {
          isNavigating.current = true;
          if (flashTimer.current) clearTimeout(flashTimer.current);
          router.push(`/room/${code}/lobby`);
        }
      } catch {
        // ignore
      }
    };

    poll();
    const interval = setInterval(poll, 1500);
    return () => {
      isNavigating.current = true;
      if (flashTimer.current) clearTimeout(flashTimer.current);
      clearInterval(interval);
    };
  }, [code, participantId, router, prevRound, prevMatchIndex, flashState, startFlashAnimation]);

  const hasCountdown = countdown !== null;
  useEffect(() => {
    if (!hasCountdown) return;
    const tick = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [hasCountdown]);

  const handleVote = useCallback(
    async (matchId: string, restaurantId: string) => {
      if (!participantId) return;

      try {
        const res = await fetch(`/api/rooms/${code}/bracket-vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantId, matchId, restaurantId }),
        });
        if (res.ok) {
          const data = await res.json();
          setRoom(data.room);
          setRestaurants(data.restaurants);
          setHasVoted((prev) => ({ ...prev, [matchId]: restaurantId }));
        }
      } catch {
        // ignore — vote not recorded, UI stays clickable
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

  const bracket = room.bracket;
  const activeMatch = bracket.matches[bracket.activeMatchIndex];
  const totalMatches = bracket.matches.length;

  if (!activeMatch) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-[var(--color-text)]">
            🏆 รอบชี้ชะตา
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text)]/40">
            รอบที่ {bracket.round} — กำลังโหลดคู่ถัดไป...
          </p>
        </div>
      </div>
    );
  }

  const resA = restaurants.find((r) => r.id === activeMatch.restaurantAId);
  const resB = restaurants.find((r) => r.id === activeMatch.restaurantBId);

  const isTieFlashing =
    flashState === "flashingLeft" || flashState === "flashingRight";
  const isTieFinal =
    flashState === "winnerLeft" || flashState === "winnerRight";

  const hasVotedThisMatch = !!hasVoted[activeMatch.id];
  const matchResolved = !!activeMatch.winnerId;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 py-6">
      <div className="text-center">
        <h1 className="text-2xl font-black text-[var(--color-text)]">
          🏆 รอบชี้ชะตา
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text)]/40">
          รอบที่ {bracket.round} — เลือกร้านที่อยากกิน
        </p>
      </div>

      {isTieFlashing && (
        <div className="rounded-full bg-amber-100 px-4 py-1 text-sm font-bold text-amber-700">
          คะแนนเท่ากัน! กำลังสุ่ม...
        </div>
      )}

      {hasVotedThisMatch && !matchResolved && (
        <p className="text-center text-sm font-bold text-[var(--color-secondary)]">
          รอผลโหวต...
        </p>
      )}

      {!isTieFlashing && matchResolved && !isTieFinal && (
        <div className="rounded-full bg-green-100 px-4 py-1 text-sm font-bold text-green-700">
          🎉 ผลโหวตออกแล้ว!
        </div>
      )}

      {isTieFinal && (
        <div className="rounded-full bg-green-100 px-4 py-1 text-sm font-bold text-green-700">
          🎉 สุ่มได้ร้านแล้ว!
        </div>
      )}

      {bracket.activeMatchIndex < totalMatches && (
        <div className="flex w-full max-w-md flex-col gap-3">
          <BracketMatchCard
            match={activeMatch}
            restaurantA={resA}
            restaurantB={resB}
            onVote={handleVote}
            hasVoted={hasVoted}
            disabled={matchResolved || hasVotedThisMatch}
            countdown={countdown ?? undefined}
            matchIndex={bracket.activeMatchIndex}
            totalMatches={totalMatches}
            flashState={flashState}
          />
        </div>
      )}

      {bracket.activeMatchIndex >= totalMatches && (
        <p className="text-center text-lg text-[var(--color-text)]/40">
          กำลังดำเนินการ...
        </p>
      )}
    </div>
  );
}