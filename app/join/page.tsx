"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode || trimmedCode.length !== 6) {
      setError("รหัสห้องต้องมี 6 ตัวอักษร");
      return;
    }
    if (!username.trim()) {
      setError("กรุณาใส่ชื่อผู้ใช้");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/rooms/${trimmedCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด");
        return;
      }

      localStorage.setItem(`ginder_pid_${trimmedCode}`, data.participantId);
      router.push(`/room/${trimmedCode}/lobby`);
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-[var(--color-primary)]">เข้าร่วมห้อง</h1>
        <p className="mt-1 text-sm text-[var(--color-text)]/50">
          ใส่รหัสห้อง 6 ตัว และชื่อของคุณ
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <TextInput
          label="รหัสห้อง"
          value={code}
          onChange={setCode}
          placeholder="เช่น GIN482"
          error={error}
          maxLength={6}
          autoUppercase
        />
        <TextInput
          label="ชื่อผู้ใช้"
          value={username}
          onChange={setUsername}
          placeholder="เช่น แนน"
          maxLength={20}
        />
      </div>

      <Button
        size="lg"
        onClick={handleSubmit}
        disabled={loading || code.trim().length !== 6 || !username.trim()}
      >
        {loading ? "กำลังเข้าร่วม..." : "เข้าร่วมห้อง"}
      </Button>
    </div>
  );
}