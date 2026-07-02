"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Room } from "@/lib/types";
import ProgressBar from "@/components/ProgressBar";

export default function WaitingPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const [room, setRoom] = useState<Room | null>(null);

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

        if (data.room.status === "bracket" && !isNavigating) {
          isNavigating = true;
          router.push(`/room/${code}/bracket`);
        } else if (data.room.status === "finished" && !isNavigating) {
          isNavigating = true;
          router.push(`/room/${code}/result`);
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
  }, [code, participantId, router]);

  const pids = room ? Object.keys(room.participants) : [];
  const finishedCount = room
    ? pids.filter((pid) => room.participants[pid].finishedSwiping).length
    : 0;
  const total = pids.length;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-black text-[var(--color-text)]">
          รอเพื่อนคนอื่น...
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text)]/40">
          กำลังรอทุกคนเลือกเสร็จ
        </p>
      </div>

      <div className="w-full max-w-sm">
        <ProgressBar current={finishedCount} total={total} />
      </div>
    </div>
  );
}