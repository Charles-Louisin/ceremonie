"use client";

import { useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useGala } from "../../lib/store";
import type { Invite, TableGala } from "../../lib/types";
import { splitInvitationName } from "../../lib/utils";

interface HostessGroup {
  id: string;
  hotesse: Invite;
  displayName: string;
  tables: TableGala[];
}

export function HostessesManager() {
  const { state, upsertTable } = useGala();
  const [adding, setAdding] = useState<string | null>(null);

  const sortedTables = useMemo(
    () => [...state.tables].sort((a, b) => a.nom.localeCompare(b.nom)),
    [state.tables],
  );

  /** Toutes les invitations, candidates valides pour devenir hôtesse. */
  const allCandidates = useMemo(
    () =>
      [...state.invites]
        .flatMap((g) => {
          const names = splitInvitationName(g.nom, g.nbPersonnes ?? 1);
          return names.map((name, index) => ({
            key: `${g.id}::${index}`,
            inviteId: g.id,
            name,
            fullName: g.nom,
            tableId: g.tableId,
          }));
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [state.invites],
  );

  /** Regroupement : pour chaque hôtesse, la liste de ses tables. */
  const groups: HostessGroup[] = useMemo(() => {
    const map = new Map<string, HostessGroup>();
    for (const t of sortedTables) {
      if (!t.hotesseInviteId) continue;
      const hotesse = state.invites.find((g) => g.id === t.hotesseInviteId);
      if (!hotesse) continue;
      const displayName = t.hotesseNom ?? hotesse.nom;
      const groupId = `${hotesse.id}::${displayName}`;
      const existing = map.get(groupId);
      if (existing) {
        existing.tables.push(t);
      } else {
        map.set(groupId, { id: groupId, hotesse, displayName, tables: [t] });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    );
  }, [sortedTables, state.invites]);

  function assignHostessToTable(hotesseId: string, hostessName: string, tableId: string) {
    const t = state.tables.find((x) => x.id === tableId);
    if (!t) return;
    upsertTable({ ...t, hotesseInviteId: hotesseId, hotesseNom: hostessName });
  }

  function removeHostessFromTable(tableId: string) {
    const t = state.tables.find((x) => x.id === tableId);
    if (!t) return;
    upsertTable({ ...t, hotesseInviteId: null, hotesseNom: null });
  }

  return (
    <section className="rounded-3xl border border-amber-400/20 bg-slate-950/60 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/60">
            Section
          </p>
          <h2 className="font-display text-lg uppercase tracking-widest text-amber-200">
            Hôtesses & tables
          </h2>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xs uppercase tracking-widest text-amber-200/70">
            Vue par hôtesse
          </h3>
          {groups.length === 0 ? (
            <div className="rounded-xl border border-amber-400/15 p-4 text-center text-sm text-amber-100/60">
              Aucune hôtesse n&apos;est encore assignée.
            </div>
          ) : (
            <ul className="space-y-3">
              {groups.map((g) => (
                <HostessRow
                  key={g.id}
                  group={g}
                  allTables={sortedTables}
                  isAdding={adding === g.id}
                  onStartAdd={() => setAdding(g.id)}
                  onCancelAdd={() => setAdding(null)}
                  onAssign={(tableId) => {
                    assignHostessToTable(g.hotesse.id, g.displayName, tableId);
                    setAdding(null);
                  }}
                  onRemove={(tableId) => removeHostessFromTable(tableId)}
                />
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-xs uppercase tracking-widest text-amber-200/70">
            Vue par table
          </h3>
          <ul className="space-y-2">
            {sortedTables.map((t) => {
              const hotesse = state.invites.find(
                (g) => g.id === t.hotesseInviteId,
              );
              const otherTables = hotesse
                ? state.tables.filter(
                    (x) =>
                      x.hotesseInviteId === hotesse.id && x.id !== t.id,
                  ).length
                : 0;
              return (
                <li
                  key={t.id}
                  className="rounded-xl border border-amber-400/15 bg-slate-900/50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-amber-100">
                      Table <span className="text-amber-300">{t.nom}</span>
                    </p>
                    {otherTables > 0 ? (
                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                        Hôtesse partagée
                      </span>
                    ) : null}
                  </div>
                  <select
                    value={
                      hotesse
                        ? allCandidates.find(
                            (c) =>
                              c.inviteId === hotesse.id &&
                              c.name === (t.hotesseNom ?? hotesse.nom),
                          )?.key ??
                          allCandidates.find((c) => c.inviteId === hotesse.id)?.key ??
                          ""
                        : ""
                    }
                    onChange={(e) =>
                      upsertTable(
                        e.target.value
                          ? {
                              ...t,
                              hotesseInviteId:
                                allCandidates.find((c) => c.key === e.target.value)
                                  ?.inviteId ?? null,
                              hotesseNom:
                                allCandidates.find((c) => c.key === e.target.value)
                                  ?.name ?? null,
                            }
                          : {
                              ...t,
                              hotesseInviteId: null,
                              hotesseNom: null,
                            },
                      )
                    }
                    className="luxe-input mt-2 text-sm"
                  >
                    <option value="">— Aucune hôtesse —</option>
                    {allCandidates.map((c) => {
                      const homeTable = state.tables.find(
                        (x) => x.id === c.tableId,
                      );
                      return (
                        <option key={c.key} value={c.key}>
                          {c.name}
                          {c.name !== c.fullName ? ` (${c.fullName})` : ""}
                          {homeTable
                            ? ` — assis Table ${homeTable.nom}`
                            : " — sans table"}
                        </option>
                      );
                    })}
                  </select>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

interface HostessRowProps {
  group: HostessGroup;
  allTables: TableGala[];
  isAdding: boolean;
  onStartAdd: () => void;
  onCancelAdd: () => void;
  onAssign: (tableId: string) => void;
  onRemove: (tableId: string) => void;
}

function HostessRow({
  group,
  allTables,
  isAdding,
  onStartAdd,
  onCancelAdd,
  onAssign,
  onRemove,
}: HostessRowProps) {
  const assignedIds = new Set(group.tables.map((t) => t.id));
  const available = allTables.filter((t) => !assignedIds.has(t.id));

  return (
    <li className="rounded-xl border border-amber-400/20 bg-slate-900/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-amber-100">
            {group.displayName}
          </p>
          <p className="mt-0.5 text-[11px] uppercase tracking-wider text-amber-200/70">
            {group.tables.length} table{group.tables.length > 1 ? "s" : ""}
          </p>
        </div>
        {!isAdding && available.length > 0 ? (
          <button
            type="button"
            className="btn-ghost text-[11px]"
            onClick={onStartAdd}
          >
            + Ajouter une table
          </button>
        ) : null}
      </div>

      <ul className="mt-2 flex flex-wrap gap-1.5">
        {group.tables.map((t) => (
          <li key={t.id}>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 py-1 pl-2 pr-1 text-[11px] text-amber-200">
              Table {t.nom}
              <button
                type="button"
                onClick={() => onRemove(t.id)}
                aria-label={`Retirer ${t.nom} de cette hôtesse`}
                className="rounded-full p-0.5 text-amber-200/70 hover:bg-amber-400/20 hover:text-amber-100"
              >
                <X size={11} />
              </button>
            </span>
          </li>
        ))}
      </ul>

      {isAdding ? (
        <div className="mt-2 flex items-center gap-2">
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) onAssign(e.target.value);
            }}
            className="luxe-input flex-1 text-sm"
            autoFocus
          >
            <option value="" disabled>
              Choisir une table…
            </option>
            {available.map((t) => (
              <option key={t.id} value={t.id}>
                Table {t.nom}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onCancelAdd}
            className="btn-ghost text-xs"
          >
            Annuler
          </button>
        </div>
      ) : null}
    </li>
  );
}
