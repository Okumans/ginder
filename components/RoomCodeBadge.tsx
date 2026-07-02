"use client";

import { useState } from "react";

interface RoomCodeBadgeProps {
  code: string;
}

export default function RoomCodeBadge({ code }: RoomCodeBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS
      const input = document.createElement("input");
      input.value = code;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-bold text-[var(--color-text)]/60">รหัสห้อง</p>
      <button
        onClick={handleCopy}
        className="group relative rounded-2xl bg-white px-8 py-4 shadow-md transition-shadow hover:shadow-lg"
      >
        <span className="text-3xl font-bold tracking-[0.3em] text-[var(--color-primary)]">
          {code}
        </span>
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[var(--color-text)]/50 opacity-0 transition-opacity group-hover:opacity-100">
          {copied ? "คัดลอกแล้ว!" : "กดเพื่อคัดลอก"}
        </span>
      </button>
    </div>
  );
}