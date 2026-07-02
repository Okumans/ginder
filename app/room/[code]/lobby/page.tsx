"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Room } from "@/lib/types";
import RoomCodeBadge from "@/components/RoomCodeBadge";
import ParticipantPill from "@/components/ParticipantPill";
import Button from "@/components/Button";

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const participantId =
    typeof window !== "undefined"
      ? localStorage.getItem(`ginder_pid_${code}`) ?? ""
      : "";

  const participant = room?.participants[participantId];
  const isLeader = participant?.isLeader ?? false;
  const participantCount = room ? Object.keys(room.participants).length : 0;

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

        if (!res.ok) {
          setError(data.error ?? "ไม่พบห้อง");
          return;
        }

        setRoom(data.room);

        if (data.room.status === "swiping") {
          router.push(`/room/${code}/swipe`);
        }
      } catch {
        setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      }
    };

    poll();
    const interval = setInterval(poll, 1500);
    return () => clearInterval(interval);
  }, [code, participantId, router]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${code}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ไม่สามารถเริ่มเกมได้");
        return;
      }

      setRoom(data.room);
      router.push(`/room/${code}/swipe`);
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  if (!room) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-lg text-[var(--color-text)]/40">กำลังโหลด...</p>
      </div>
    );
  }

  const participants = Object.values(room.participants);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6">
      <RoomCodeBadge code={code} />

      <div className="w-full max-w-sm">
        <h2 className="mb-3 text-center text-sm font-bold text-[var(--color-text)]/50">
          ผู้เข้าร่วม ({participantCount} คน)
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {participants.map((p) => (
            <ParticipantPill
              key={p.id}
              username={p.username}
              isLeader={p.isLeader}
              isSelf={p.id === participantId}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isLeader ? (
        <Button
          size="lg"
          onClick={handleStart}
          disabled={loading || participantCount < 2}
        >
          {loading
            ? "กำลังเริ่ม..."
            : participantCount < 2
              ? "ต้องมีอย่างน้อย 2 คน"
              : "เริ่มเลย!"}
        </Button>
      ) : (
        <p className="text-center text-sm text-[var(--color-text)]/40">
          รอหัวหน้าห้องเริ่มเกม...
        </p>
      )}
    </div>
  );
}