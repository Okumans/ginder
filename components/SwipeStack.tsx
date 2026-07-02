"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Restaurant } from "@/lib/types";
import SwipeCard from "./SwipeCard";

interface SwipeStackProps {
  restaurants: Restaurant[];
  onSwipe: (restaurantId: string, direction: "like" | "pass") => void;
}

export default function SwipeStack({ restaurants, onSwipe }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const remaining = Math.max(0, restaurants.length - currentIndex);

  const handleSwipe = (direction: "like" | "pass") => {
    const restaurant = restaurants[currentIndex];
    if (!restaurant) return;

    onSwipe(restaurant.id, direction);

    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
    }, 300);
  };

  const visibleCards = restaurants.slice(currentIndex, currentIndex + 3);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="relative mx-auto aspect-[3/4] w-full">
        <AnimatePresence>
          {visibleCards.map((restaurant, i) => (
            <SwipeCard
              key={restaurant.id}
              restaurant={restaurant}
              onSwipe={handleSwipe}
              isTop={i === 0}
            />
          ))}
        </AnimatePresence>

        {visibleCards.length === 0 && (
          <div className="flex h-full items-center justify-center rounded-3xl bg-white/50 text-lg font-bold text-[var(--color-text)]/40">
            หมดแล้ว!
          </div>
        )}
      </div>

      {/* Counter */}
      <p className="mt-4 text-center text-sm font-bold text-[var(--color-text)]/50">
        {remaining} / {restaurants.length} ร้านที่เหลือ
      </p>

      {/* Fallback buttons */}
      <div className="mt-4 flex justify-center gap-6">
        <button
          onClick={() => handleSwipe("pass")}
          disabled={visibleCards.length === 0}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-lg transition-transform active:scale-90 disabled:opacity-30"
        >
          👎
        </button>
        <button
          onClick={() => handleSwipe("like")}
          disabled={visibleCards.length === 0}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-2xl shadow-lg transition-transform active:scale-90 disabled:opacity-30"
        >
          👍
        </button>
      </div>
    </div>
  );
}