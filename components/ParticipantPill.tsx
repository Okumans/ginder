"use client";

import { motion } from "framer-motion";

interface ParticipantPillProps {
  username: string;
  isLeader: boolean;
  isSelf?: boolean;
}

export default function ParticipantPill({
  username,
  isLeader,
  isSelf = false,
}: ParticipantPillProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">
        {username.charAt(0).toUpperCase()}
      </div>
      <span className="font-bold text-[var(--color-text)]">
        {username}
        {isLeader && " 👑"}
        {isSelf && " (คุณ)"}
      </span>
    </motion.div>
  );
}