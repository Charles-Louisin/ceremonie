"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";
import { useGala } from "../../lib/store";
import { TABLE_CAPACITY, type TableGala } from "../../lib/types";

export function TablesManager() {
  const { state, upsertTable, deleteTable } = useGala();
  const [editing, setEditing] = useState<TableGala | null>(null);
  const [creating, setCreating] = useState(false);

  const sortedTables = [...state.tables].sort((a, b) =>
    a.nom.localeCompare(b.nom),
  );

  return (
    <section className="rounded-3xl border border-amber-400/20 bg-slate-950/60 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/60">
            Section
          </p>
          <h2 className="font-display text-lg uppercase tracking-widest text-amber-200">
            Tables
          </h2>
        </div>
        <button
          type="button"
          className="btn-gold text-xs"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
        >
          <Plus size={14} /> Nouvelle table
        </button>
      </div>

      {creating ? (
        <TableForm
          key="new"
          onCancel={() => setCreating(false)}
          onSubmit={(values) => {
            upsertTable(values);
            setCreating(false);
          }}
          initial={{
            nom: "",
            capacite: TABLE_CAPACITY,
            hotesseInviteId: null,
          }}
        />
      ) : null}

      <ul className="mt-4 space-y-2">
        {sortedTables.length === 0 ? (
          <li className="rounded-xl border border-amber-400/15 p-4 text-center text-sm text-amber-100/60">
            Aucune table pour l&apos;instant.
          </li>
        ) : null}
        {sortedTables.map((t) => {
          const hotesse = state.invites.find((g) => g.id === t.hotesseInviteId);
          const count = state.invites
            .filter((g) => g.tableId === t.id)
            .reduce((sum, g) => sum + (g.nbPersonnes ?? 1), 0);
          const otherTables = hotesse
            ? state.tables.filter(
                (x) => x.hotesseInviteId === hotesse.id && x.id !== t.id,
              ).length
            : 0;
          const isEditing = editing?.id === t.id;
          if (isEditing) {
            return (
              <li key={t.id}>
                <TableForm
                  initial={t}
                  onCancel={() => setEditing(null)}
                  onSubmit={(values) => {
                    upsertTable({ ...t, ...values });
                    setEditing(null);
                  }}
                />
              </li>
            );
          }
          return (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-amber-400/15 bg-slate-900/50 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-100">
                  Table <span className="text-amber-300">{t.nom}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-amber-100/60">
                  {count}/{t.capacite} personnes · Hôtesse : {hotesse ? hotesse.nom : "—"}
                  {otherTables > 0 ? (
                    <span className="ml-1 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                      + {otherTables} autre{otherTables > 1 ? "s" : ""}
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded-full p-1.5 text-amber-200/70 hover:bg-amber-400/10 hover:text-amber-200"
                  aria-label="Modifier la table"
                  onClick={() => {
                    setCreating(false);
                    setEditing(t);
                  }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  className="rounded-full p-1.5 text-red-300/80 hover:bg-red-500/10 hover:text-red-200"
                  aria-label="Supprimer la table"
                  onClick={() => {
                    if (
                      confirm(
                        `Supprimer la table « ${t.nom} » ? Les invités assignés seront détachés.`,
                      )
                    ) {
                      deleteTable(t.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface TableFormValues {
  nom: string;
  capacite: number;
  hotesseInviteId: string | null;
}

function TableForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: TableFormValues;
  onSubmit: (values: TableFormValues) => void;
  onCancel: () => void;
}) {
  const { state } = useGala();
  const [nom, setNom] = useState(initial.nom);
  const [capacite, setCapacite] = useState<number>(initial.capacite);
  const [hotesseInviteId, setHotesseInviteId] = useState<string | null>(
    initial.hotesseInviteId,
  );

  const candidatesHotesse = [...state.invites].sort((a, b) =>
    a.nom.localeCompare(b.nom),
  );

  return (
    <form
      className="mt-4 rounded-2xl border border-amber-400/30 bg-slate-900/70 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!nom.trim()) return;
        onSubmit({
          nom: nom.trim(),
          capacite,
          hotesseInviteId,
        });
      }}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label className="text-xs text-amber-100/70 sm:col-span-2">
          Nom de la table
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="luxe-input mt-1 text-sm"
            placeholder="Ex : NSAN"
            required
            autoFocus
          />
        </label>
        <label className="text-xs text-amber-100/70">
          Capacité
          <input
            type="number"
            min={1}
            max={20}
            value={capacite}
            onChange={(e) => setCapacite(Number(e.target.value))}
            className="luxe-input mt-1 text-sm"
            required
          />
        </label>
        <label className="text-xs text-amber-100/70 sm:col-span-3">
          Hôtesse
          <select
            value={hotesseInviteId ?? ""}
            onChange={(e) => setHotesseInviteId(e.target.value || null)}
            className="luxe-input mt-1 text-sm"
          >
            <option value="">— Aucune —</option>
            {candidatesHotesse.map((g) => {
              const t = state.tables.find((x) => x.id === g.tableId);
              return (
                <option key={g.id} value={g.id}>
                  {g.nom}
                  {t ? ` — assis Table ${t.nom}` : " — sans table"}
                </option>
              );
            })}
          </select>
          <span className="mt-1 block text-[10px] text-amber-100/40">
            L&apos;hôtesse peut être choisie parmi tous les invités, et peut couvrir plusieurs tables.
          </span>
        </label>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-ghost text-xs">
          <X size={14} /> Annuler
        </button>
        <button type="submit" className="btn-gold text-xs">
          <Check size={14} /> Enregistrer
        </button>
      </div>
    </form>
  );
}
