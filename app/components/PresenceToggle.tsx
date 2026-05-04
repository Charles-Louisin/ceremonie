"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

interface Props {
  isPresent: boolean;
  onToggle: () => void;
  ariaLabel?: string;
}

export function PresenceToggle({ isPresent, onToggle, ariaLabel }: Props) {
  const containerRef = useRef<HTMLButtonElement>(null);

  function spawnSparkles() {
    const root = containerRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.left = `${rect.left + rect.width / 2}px`;
    overlay.style.top = `${rect.top + rect.height / 2}px`;
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "9999";
    document.body.appendChild(overlay);

    for (let i = 0; i < 14; i += 1) {
      const sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
      const distance = 50 + Math.random() * 60;
      sparkle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      sparkle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
      sparkle.style.left = "-3px";
      sparkle.style.top = "-3px";
      overlay.appendChild(sparkle);
    }
    setTimeout(() => overlay.remove(), 1000);
  }

  function handleClick() {
    if (!isPresent) spawnSparkles();
    onToggle();
  }

  return (
    <button
      ref={containerRef}
      type="button"
      role="switch"
      aria-checked={isPresent}
      aria-label={ariaLabel ?? "Marquer présent"}
      onClick={handleClick}
      className={[
        "relative inline-flex h-9 w-20 items-center rounded-full border transition-colors",
        isPresent
          ? "border-amber-400 bg-gold-gradient gold-glow"
          : "border-slate-700 bg-slate-900",
      ].join(" ")}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={[
          "ml-1 h-7 w-7 rounded-full shadow-lg",
          isPresent ? "bg-white translate-x-11" : "bg-slate-700 translate-x-0",
        ].join(" ")}
      />
      <span
        className={[
          "absolute inset-0 flex items-center text-[10px] font-bold uppercase tracking-wider",
          isPresent ? "justify-start pl-3 text-amber-950" : "justify-end pr-3 text-slate-400",
        ].join(" ")}
      >
        {isPresent ? "Présent" : "Absent"}
      </span>
    </button>
  );
}
