"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-8 text-center">
      <div>
        <h1 className="text-6xl font-black text-[var(--color-primary)]">
          🍜 กินเด้อ
        </h1>
        <p className="mt-3 text-lg text-[var(--color-text)]/60">
          โหวตหาร้านอาหารกับเพื่อน จบที่ร้านเดียว!
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button size="lg" onClick={() => router.push("/create")}>
          สร้างห้อง
        </Button>
        <Button size="lg" variant="secondary" onClick={() => router.push("/join")}>
          เข้าร่วมห้อง
        </Button>
      </div>
    </div>
  );
}