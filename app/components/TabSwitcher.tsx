"use client";

import { motion } from "framer-motion";

export type TabId = "checkin" | "tables";

interface Props {
  active: TabId;
  onChange: (id: TabId) => void;
}

const tabs: { id: TabId; label: string }[] = [
  { id: "checkin", label: "Check-in (Entrée)" },
  { id: "tables", label: "Vue des tables" },
];

export function TabSwitcher({ active, onChange }: Props) {
  return (
    <div className="mx-auto w-fit rounded-full p-1 glass-card relative">
      <div className="relative flex">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={[
                "relative z-10 px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-widest transition-colors",
                isActive ? "text-amber-950" : "text-amber-200/70 hover:text-amber-100",
              ].join(" ")}
            >
              {isActive ? (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-gold-gradient gold-glow"
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                />
              ) : null}
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
