"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, User } from "lucide-react";
import { useGala } from "../lib/store";
import type { TableGala } from "../lib/types";
import { TableCard } from "./TableCard";
import { PresenceToggle } from "./PresenceToggle";

export function TablesTab() {
  const { state } = useGala();
  const [selected, setSelected] = useState<TableGala | null>(null);

  const completes = state.tables.filter((t) => {
    const inv = state.invites.filter((g) => g.tableId === t.id);
    if (inv.length === 0) return false;
    const presentPersons = inv
      .filter((g) => g.estPresent)
      .reduce((sum, g) => sum + (g.nbPersonnes ?? 1), 0);
    return presentPersons >= t.capacite;
  }).length;

  const enCours = state.tables.length - completes;

  return (
    <section className="flex flex-1 flex-col gap-4 px-4 pt-2 pb-24 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 mx-auto w-full max-w-5xl">
        {state.tables.map((t) => (
          <TableCard
            key={t.id}
            table={t}
            compact
            onClick={() => setSelected(t)}
          />
        ))}
      </div>

      <footer className="mt-auto pt-4 text-center text-[11px] uppercase tracking-[0.25em] text-amber-200/70">
        <span className="font-semibold text-amber-200">{completes}</span> tables complètes
        <span className="mx-2 text-amber-200/40">|</span>
        <span className="font-semibold text-amber-200">{enCours}</span> tables en cours
      </footer>

      <AnimatePresence>
        {selected ? (
          <TableDetailModal
            table={selected}
            onClose={() => setSelected(null)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

interface ModalProps {
  table: TableGala;
  onClose: () => void;
}

function TableDetailModal({ table, onClose }: ModalProps) {
  const { state, toggleInvitePresent } = useGala();
  const invites = state.invites.filter((g) => g.tableId === table.id);
  const hotesse = state.invites.find((g) => g.id === table.hotesseInviteId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-amber-400/25 bg-slate-950/95 p-5 gold-glow"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 rounded-full p-1.5 text-amber-200/70 hover:bg-amber-400/10 hover:text-amber-200"
        >
          <X size={18} />
        </button>

        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-amber-200/60">Table</p>
          <h2 className="font-display mt-1 text-2xl uppercase tracking-widest text-gold-gradient">
            {table.nom}
          </h2>
          {hotesse ? (
            <p className="mt-2 text-xs text-amber-200/80">
              Hôtesse · <span className="font-semibold text-amber-200">{hotesse.nom}</span>
            </p>
          ) : null}
        </div>

        <ul className="mt-5 space-y-2 max-h-[55vh] overflow-y-auto pr-1">
          {invites.length === 0 ? (
            <li className="rounded-xl border border-amber-400/15 p-4 text-center text-sm text-amber-100/60">
              Aucun invité affecté à cette table.
            </li>
          ) : null}
          {invites.map((g) => (
            <li
              key={g.id}
              className={[
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2 border",
                g.estPresent
                  ? "border-amber-300/35 bg-amber-50/90"
                  : "border-slate-800 bg-slate-900/60",
              ].join(" ")}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={[
                    "flex h-7 w-7 items-center justify-center rounded-full",
                    g.estPresent
                      ? "bg-amber-300/90 text-amber-900"
                      : "bg-slate-800 text-slate-500",
                  ].join(" ")}
                >
                  <User size={14} />
                </span>
                <span
                  className={[
                    "truncate text-sm font-medium",
                    g.estPresent ? "text-amber-900" : "text-slate-300",
                  ].join(" ")}
                >
                  {g.nom}
                  {g.nbPersonnes > 1 ? (
                    <span
                      className={[
                        "ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                        g.estPresent
                          ? "bg-amber-900/15 text-amber-900"
                          : "bg-slate-700 text-slate-300",
                      ].join(" ")}
                    >
                      × {g.nbPersonnes}
                    </span>
                  ) : null}
                  {g.id === hotesse?.id ? (
                    <span className="ml-1 rounded-full bg-amber-200/30 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-amber-300">
                      Hôtesse
                    </span>
                  ) : null}
                </span>
              </div>
              <PresenceToggle
                isPresent={g.estPresent}
                onToggle={() => toggleInvitePresent(g.id)}
              />
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
