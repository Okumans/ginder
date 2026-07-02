"use client";

import { motion } from "framer-motion";
import { Restaurant } from "@/lib/types";

interface ResultCardProps {
  restaurant: Restaurant;
}

export default function ResultCard({ restaurant }: ResultCardProps) {
  const priceDisplay =
    restaurant.priceRange === "$"
      ? "💰"
      : restaurant.priceRange === "$$"
        ? "💰💰"
        : "💰💰💰";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
    >
      <h2 className="mb-2 text-center text-5xl">🎉</h2>
      <h2 className="mb-6 text-center text-xl font-bold text-[var(--color-text)]">
        ร้านที่ชนะคือ...
      </h2>
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="h-56 w-full object-cover"
        />
        <div className="p-6">
          <div className="mb-1 flex items-center justify-between">
            <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-0.5 text-xs font-bold text-[var(--color-primary)]">
              {restaurant.cuisine}
            </span>
            <span className="text-lg">{priceDisplay}</span>
          </div>
          <h3 className="mb-2 text-2xl font-black text-[var(--color-text)]">
            {restaurant.name}
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-[var(--color-text)]/70">
            {restaurant.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {restaurant.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--color-secondary)]/10 px-3 py-1 text-xs font-bold text-[var(--color-secondary)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}