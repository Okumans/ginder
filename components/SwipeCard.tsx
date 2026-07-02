"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Restaurant } from "@/lib/types";

interface SwipeCardProps {
  restaurant: Restaurant;
  onSwipe: (direction: "like" | "pass") => void;
  isTop: boolean;
}

export default function SwipeCard({ restaurant, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-25, 25]);
  const likeOpacity = useTransform(x, [60, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, -60], [1, 0]);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe("like");
    } else if (info.offset.x < -threshold) {
      onSwipe("pass");
    }
  };

  const priceDisplay =
    restaurant.priceRange === "$"
      ? "💰"
      : restaurant.priceRange === "$$"
        ? "💰💰"
        : "💰💰💰";

  return (
    <motion.div
      ref={cardRef}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      className={`absolute inset-0 rounded-3xl bg-white shadow-xl overflow-hidden ${
        isTop ? "z-10 cursor-grab active:cursor-grabbing" : "z-0"
      }`}
      initial={false}
      animate={{
        scale: isTop ? 1 : 0.95,
        y: isTop ? 0 : 8,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Stamps */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute left-6 top-8 z-20 rounded-lg border-4 border-green-500 px-4 py-2 text-3xl font-black text-green-500"
      >
        LIKE ✅
      </motion.div>
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute right-6 top-8 z-20 rounded-lg border-4 border-red-500 px-4 py-2 text-3xl font-black text-red-500"
      >
        NOPE ❌
      </motion.div>

      {/* Image */}
      <div className="relative h-52 w-full bg-gray-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[var(--color-text)]">
            {restaurant.cuisine}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-bold text-[var(--color-text)]">
            {restaurant.name}
          </h3>
          <span className="text-sm">{priceDisplay}</span>
        </div>

        <p className="text-sm leading-relaxed text-[var(--color-text)]/70">
          {restaurant.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5">
          {restaurant.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-primary)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}