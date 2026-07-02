"use client";

import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
}: ButtonProps) {
  const baseClasses =
    "rounded-full font-bold transition-colors inline-flex items-center justify-center select-none";

  const sizeClasses = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
  };

  const variantClasses = {
    primary: "bg-[var(--color-primary)] text-[var(--color-bg)] hover:opacity-90",
    secondary:
      "bg-[var(--color-bg)] text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-bg)]",
    ghost:
      "bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10",
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.95 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {children}
    </motion.button>
  );
}