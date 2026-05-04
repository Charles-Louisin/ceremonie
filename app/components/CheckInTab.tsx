"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2 } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { useGala } from "../lib/store";
import { normalize, formatHeure } from "../lib/utils";
import type { Invite } from "../lib/types";
import { PresenceToggle } from "./PresenceToggle";

export function CheckInTab() {
  const { state, toggleInvitePresent } = useGala();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const filtered = useMemo<Invite[]>(() => {
    const q = normalize(deferred);
    if (!q) return [];
    return state.invites
      .filter((g) => normalize(g.nom).includes(q))
      .slice(0, 30);
  }, [deferred, state.invites]);

  const totalPresents = state.invites
    .filter((g) => g.estPresent)
    .reduce((sum, g) => sum + (g.nbPersonnes ?? 1), 0);
  const total = state.invites.reduce(
    (sum, g) => sum + (g.nbPersonnes ?? 1),
    0,
  );

  return (
    <section className="flex flex-1 flex-col gap-4 px-4 pt-2 pb-24 sm:px-6">
      <div className="relative mx-auto w-full max-w-xl">
        <div className="absolute inset-y-0 left-4 flex items-center text-amber-300/70">
          <Search size={18} />
        </div>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un invité..."
          className="luxe-input pl-11! pr-4 text-sm sm:text-base"
        />
      </div>

      <div className="mx-auto w-full max-w-xl">
        <AnimatePresence mode="popLayout">
          {query.trim() === "" ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-2xl border border-amber-400/15 bg-slate-900/40 p-6 text-center text-sm text-amber-100/60"
            >
              Tapez quelques lettres pour rechercher un invité.
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="none"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-2xl border border-amber-400/15 bg-slate-900/40 p-6 text-center text-sm text-amber-100/60"
            >
              Aucun invité ne correspond à « {query} ».
            </motion.div>
          ) : (
            <motion.ul
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 space-y-3"
            >
              {filtered.map((g) => (
                <InviteRow
                  key={g.id}
                  invite={g}
                  onToggle={() => toggleInvitePresent(g.id)}
                />
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-auto pt-4 text-center text-xs uppercase tracking-[0.25em] text-amber-200/60">
        <span className="font-semibold text-amber-200">{totalPresents}</span>
        <span className="mx-1 text-amber-200/50">/</span>
        <span>{total} invités confirmés</span>
      </footer>
    </section>
  );
}

interface RowProps {
  invite: Invite;
  onToggle: () => void;
}

function InviteRow({ invite, onToggle }: RowProps) {
  const { state } = useGala();
  const table = state.tables.find((t) => t.id === invite.tableId);
  const hotesse = table?.hotesseInviteId
    ? state.invites.find((g) => g.id === table.hotesseInviteId)
    : null;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={[
        "flex items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-colors",
        invite.estPresent
          ? "bg-gradient-to-br from-amber-50/90 to-amber-100/75 border border-amber-300/40 gold-glow"
          : "glass-card",
      ].join(" ")}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={[
              "font-display uppercase tracking-wider text-sm sm:text-base truncate",
              invite.estPresent ? "text-amber-900" : "text-amber-100",
            ].join(" ")}
          >
            {invite.nom}
          </p>
          {invite.nbPersonnes > 1 ? (
            <span
              className={[
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase",
                invite.estPresent
                  ? "bg-amber-900/15 text-amber-900"
                  : "bg-amber-200/15 text-amber-200",
              ].join(" ")}
              title={`${invite.nbPersonnes} personnes`}
            >
              × {invite.nbPersonnes}
            </span>
          ) : null}
        </div>
        <p
          className={[
            "mt-0.5 flex flex-wrap items-baseline gap-x-1 gap-y-0.5 text-xs",
            invite.estPresent ? "text-amber-800/75" : "text-amber-100/55",
          ].join(" ")}
        >
          {table ? (
            <>
              <span>Table</span>
              <span
                className={
                  invite.estPresent
                    ? "font-semibold text-amber-950"
                    : "font-semibold text-amber-200"
                }
              >
                {table.nom}
              </span>
            </>
          ) : (
            <span className={invite.estPresent ? "text-amber-800/70" : ""}>
              Sans table
            </span>
          )}
          {hotesse ? (
            <>
              <span aria-hidden="true">·</span>
              <span>Hôtesse</span>
              <span
                className={
                  invite.estPresent
                    ? "font-semibold text-amber-950"
                    : "font-semibold text-amber-200"
                }
              >
                {hotesse.nom}
              </span>
            </>
          ) : null}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <PresenceToggle
          isPresent={invite.estPresent}
          onToggle={onToggle}
          ariaLabel={`Marquer ${invite.nom} ${invite.estPresent ? "absent" : "présent"}`}
        />
        {invite.estPresent && invite.heureArrivee ? (
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-800/80">
            <CheckCircle2 size={10} /> Arrivé · {formatHeure(invite.heureArrivee)}
          </span>
        ) : null}
      </div>
    </motion.li>
  );
}
