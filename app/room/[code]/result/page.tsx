"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Room, Restaurant } from "@/lib/types";
import { getRestaurantById } from "@/lib/mockData";
import confetti from "canvas-confetti";
import ResultCard from "@/components/ResultCard";
import Button from "@/components/Button";

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const [room, setRoom] = useState<Room | null>(null);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const confettiFired = useRef(false);

  const participantId =
    typeof window !== "undefined"
      ? localStorage.getItem(`ginder_pid_${code}`) ?? null
      : null;

  const isLeader = room ? room.leaderId === participantId : false;

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

        if (data.room.winnerId && !winner) {
          const w = getRestaurantById(data.room.winnerId);
          setWinner(w ?? null);

          if (!confettiFired.current) {
            confettiFired.current = true;
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#8C2333", "#C75860", "#FFE4E3", "#FFD700"],
            });
            setTimeout(() => {
              confetti({
                particleCount: 50,
                spread: 100,
                origin: { y: 0.5, x: 0.3 },
                colors: ["#8C2333", "#C75860"],
              });
              confetti({
                particleCount: 50,
                spread: 100,
                origin: { y: 0.5, x: 0.7 },
                colors: ["#8C2333", "#C75860"],
              });
            }, 400);
          }
        }

        // Non-leader: auto-redirect when new round starts
        if (!isLeader && data.room.status === "lobby" && !isNavigating) {
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
  }, [code, participantId, router, winner, isLeader]);

  const handleNewRound = async () => {
    if (!participantId) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/rooms/${code}/new-round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      });

      if (res.ok) {
        router.push(`/room/${code}/lobby`);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!winner) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-lg text-[var(--color-text)]/40">กำลังโหลดผลลัพธ์...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 py-6">
      <ResultCard restaurant={winner} />

      {isLeader && (
        <Button size="lg" onClick={handleNewRound} disabled={loading}>
          {loading ? "กำลังเริ่ม..." : "เริ่มรอบใหม่"}
        </Button>
      )}

      {!isLeader && (
        <p className="text-sm text-[var(--color-text)]/40">
          รอหัวหน้าห้องเริ่มรอบใหม่...
        </p>
      )}
    </div>
  );
}