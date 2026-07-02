"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Restaurant } from "@/lib/types";
import SwipeStack from "@/components/SwipeStack";

export default function SwipePage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [swipedCount, setSwipedCount] = useState(0);
  const [swipeRemaining, setSwipeRemaining] = useState<number | null>(null);
  const isNavigating = useRef(false);

  const participantId =
    typeof window !== "undefined"
      ? localStorage.getItem(`ginder_pid_${code}`) ?? null
      : null;

  useEffect(() => {
    if (!participantId) {
      router.push("/");
      return;
    }

    isNavigating.current = false;

    const fetchState = async () => {
      try {
        const res = await fetch(
          `/api/rooms/${code}/state?participantId=${participantId}`
        );
        const data = await res.json();

        if (!res.ok || !data.room || data.room.status !== "swiping") {
          if (data.room) {
            if (data.room.status === "bracket" && !isNavigating.current) {
              isNavigating.current = true;
              router.push(`/room/${code}/bracket`);
            } else if (data.room.status === "finished" && !isNavigating.current) {
              isNavigating.current = true;
              router.push(`/room/${code}/result`);
            } else if (data.room.status === "lobby" && !isNavigating.current) {
              isNavigating.current = true;
              router.push(`/room/${code}/lobby`);
            }
          }
          return;
        }

        if (data.timers) {
          setSwipeRemaining(data.timers.swipeRemaining);
        }

        const resolved = data.restaurants.filter((r: Restaurant) =>
          data.yourOrder.includes(r.id)
        );
        const ordered = data.yourOrder
          .map((rid: string) => resolved.find((r: Restaurant) => r.id === rid))
          .filter(Boolean) as Restaurant[];

        setRestaurants(ordered);
      } catch {
        // ignore polling errors
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => {
      isNavigating.current = true;
      clearInterval(interval);
    };
  }, [code, participantId, router]);

  // Countdown tick (more responsive than poll)
  const hasTimer = swipeRemaining !== null;
  useEffect(() => {
    if (!hasTimer) return;
    const tick = setInterval(() => {
      setSwipeRemaining((prev) => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [hasTimer]);

  // Auto-finish on timer expiry
  useEffect(() => {
    if (swipeRemaining === 0 && !isNavigating.current) {
      const autoSubmit = async () => {
        if (!participantId) return;
        const unswiped = restaurants.filter(
          (_, i) => i >= swipedCount
        );
        for (const r of unswiped) {
          await fetch(`/api/rooms/${code}/swipe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              participantId,
              restaurantId: r.id,
              direction: "like",
            }),
          });
        }
        router.push(`/room/${code}/waiting`);
      };
      autoSubmit();
    }
  }, [swipeRemaining, restaurants, swipedCount, participantId, code, router]);

  const handleSwipe = async (restaurantId: string, direction: "like" | "pass") => {
    if (!participantId) return;

    try {
      await fetch(`/api/rooms/${code}/swipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, restaurantId, direction }),
      });

      const newCount = swipedCount + 1;
      setSwipedCount(newCount);

      if (newCount >= restaurants.length) {
        router.push(`/room/${code}/waiting`);
      }
    } catch {
      // ignore
    }
  };

  if (restaurants.length === 0) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-lg text-[var(--color-text)]/40">กำลังโหลดร้านอาหาร...</p>
      </div>
    );
  }

  const mins = swipeRemaining !== null ? Math.floor(swipeRemaining / 60) : null;
  const secs = swipeRemaining !== null ? swipeRemaining % 60 : null;
  const timerUrgent = swipeRemaining !== null && swipeRemaining <= 10;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
      <div className="flex w-full max-w-md items-center justify-between">
        <h1 className="text-xl font-black text-[var(--color-primary)]">ปัดเลย!</h1>
        {swipeRemaining !== null && (
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              timerUrgent
                ? "animate-pulse bg-red-100 text-red-600"
                : "bg-white text-[var(--color-text)]/60"
            }`}
          >
            ⏱️ {mins}:{String(secs).padStart(2, "0")}
          </span>
        )}
      </div>
      <SwipeStack restaurants={restaurants} onSwipe={handleSwipe} />
    </div>
  );
}