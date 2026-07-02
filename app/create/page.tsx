"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";

export default function CreatePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError("กรุณาใส่ชื่อผู้ใช้");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด");
        return;
      }

      localStorage.setItem(`ginder_pid_${data.code}`, data.participantId);
      router.push(`/room/${data.code}/lobby`);
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-[var(--color-primary)]">สร้างห้อง</h1>
        <p className="mt-1 text-sm text-[var(--color-text)]/50">ใส่ชื่อของคุณเพื่อสร้างห้องใหม่</p>
      </div>

      <div className="w-full max-w-sm">
        <TextInput
          label="ชื่อผู้ใช้"
          value={username}
          onChange={setUsername}
          placeholder="เช่น โบ๊ท"
          error={error}
          maxLength={20}
        />
      </div>

      <Button size="lg" onClick={handleSubmit} disabled={loading || !username.trim()}>
        {loading ? "กำลังสร้าง..." : "สร้างห้อง"}
      </Button>
    </div>
  );
}