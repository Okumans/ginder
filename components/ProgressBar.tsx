"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-sm font-bold text-[var(--color-text)]/60">
        <span>{label ?? "ความคืบหน้า"}</span>
        <span>
          {current} / {total} เสร็จแล้ว
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white">
        <motion.div
          className="h-full rounded-full bg-[var(--color-secondary)]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}