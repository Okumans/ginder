"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Restaurant } from "@/lib/types";
import SwipeStack from "@/components/SwipeStack";

export default function SwipePage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [swipedCount, setSwipedCount] = useState(0);

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

    const fetchState = async () => {
      try {
        const res = await fetch(
          `/api/rooms/${code}/state?participantId=${participantId}`
        );
        const data = await res.json();

        if (!res.ok || !data.room || data.room.status !== "swiping") {
          if (data.room) {
            if (data.room.status === "bracket" && !isNavigating) {
              isNavigating = true;
              router.push(`/room/${code}/bracket`);
            } else if (data.room.status === "finished" && !isNavigating) {
              isNavigating = true;
              router.push(`/room/${code}/result`);
            } else if (data.room.status === "lobby" && !isNavigating) {
              isNavigating = true;
              router.push(`/room/${code}/lobby`);
            }
          }
          return;
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
      isNavigating = true;
      clearInterval(interval);
    };
  }, [code, participantId, router]);

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

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
      <h1 className="text-center text-xl font-black text-[var(--color-primary)]">
        ปัดเลย!
      </h1>
      <SwipeStack restaurants={restaurants} onSwipe={handleSwipe} />
    </div>
  );
}