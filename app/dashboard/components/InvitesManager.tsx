"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X, Check } from "lucide-react";
import { useGala } from "../../lib/store";
import { detectNbPersonnes, normalize } from "../../lib/utils";
import type { Invite } from "../../lib/types";

export function InvitesManager() {
  const { state, upsertInvite, deleteInvite } = useGala();
  const [editing, setEditing] = useState<Invite | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query);
    const list = q
      ? state.invites.filter((g) => normalize(g.nom).includes(q))
      : state.invites;
    return [...list].sort((a, b) => a.nom.localeCompare(b.nom));
  }, [query, state.invites]);

  return (
    <section className="rounded-3xl border border-amber-400/20 bg-slate-950/60 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/60">
            Section
          </p>
          <h2 className="font-display text-lg uppercase tracking-widest text-amber-200">
            Invités
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
          <Plus size={14} /> Nouvel invité
        </button>
      </div>

      <div className="relative mt-3">
        <div className="absolute inset-y-0 left-3 flex items-center text-amber-300/60">
          <Search size={14} />
        </div>
        <input
          type="search"
          placeholder="Filtrer un invité..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="luxe-input pl-9! text-sm"
        />
      </div>

      {creating ? (
        <InviteForm
          key="new"
          onCancel={() => setCreating(false)}
          onSubmit={(values) => {
            upsertInvite(values);
            setCreating(false);
          }}
          initial={{ nom: "", nbPersonnes: 1, tableId: null }}
        />
      ) : null}

      <ul className="mt-4 space-y-2 max-h-[55vh] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <li className="rounded-xl border border-amber-400/15 p-4 text-center text-sm text-amber-100/60">
            Aucun invité.
          </li>
        ) : null}
        {filtered.map((g) => {
          const table = state.tables.find((t) => t.id === g.tableId);
          const hotesseInvite = table?.hotesseInviteId
            ? state.invites.find((inv) => inv.id === table.hotesseInviteId)
            : null;
          const hotesseTablesCount = state.tables.filter(
            (t) => t.hotesseInviteId === g.id,
          ).length;
          const isHotesse = hotesseTablesCount > 0;
          const isEditing = editing?.id === g.id;
          if (isEditing) {
            return (
              <li key={g.id}>
                <InviteForm
                  initial={g}
                  onCancel={() => setEditing(null)}
                  onSubmit={(values) => {
                    upsertInvite({ ...g, ...values });
                    setEditing(null);
                  }}
                />
              </li>
            );
          }
          return (
            <li
              key={g.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-amber-400/15 bg-slate-900/50 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-amber-100">
                  {g.nom}
                  {g.nbPersonnes > 1 ? (
                    <span className="ml-1 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                      × {g.nbPersonnes}
                    </span>
                  ) : null}
                  {isHotesse ? (
                    <span className="ml-1 rounded-full bg-amber-200/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-amber-300">
                      Hôtesse{hotesseTablesCount > 1 ? ` × ${hotesseTablesCount}` : ""}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1 gap-y-0.5 text-[11px] text-amber-100/55">
                  {table ? (
                    <>
                      <span>Table</span>
                      <span className="font-semibold text-amber-200">
                        {table.nom}
                      </span>
                    </>
                  ) : (
                    <span>Sans table</span>
                  )}
                  {hotesseInvite ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Hôtesse</span>
                      <span className="font-semibold text-amber-200">
                        {hotesseInvite.nom}
                      </span>
                    </>
                  ) : null}
                  {g.estPresent ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-emerald-300/90">
                        Présent
                      </span>
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded-full p-1.5 text-amber-200/70 hover:bg-amber-400/10 hover:text-amber-200"
                  aria-label="Modifier l'invité"
                  onClick={() => {
                    setCreating(false);
                    setEditing(g);
                  }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  className="rounded-full p-1.5 text-red-300/80 hover:bg-red-500/10 hover:text-red-200"
                  aria-label="Supprimer l'invité"
                  onClick={() => {
                    if (confirm(`Supprimer « ${g.nom} » ?`)) {
                      deleteInvite(g.id);
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

interface InviteFormValues {
  nom: string;
  nbPersonnes: number;
  tableId: string | null;
}

function InviteForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: InviteFormValues;
  onSubmit: (values: InviteFormValues) => void;
  onCancel: () => void;
}) {
  const { state } = useGala();
  const [nom, setNom] = useState(initial.nom);
  const [nbPersonnes, setNbPersonnes] = useState<number>(initial.nbPersonnes);
  const [tableId, setTableId] = useState<string | null>(initial.tableId);
  const [nbPersonnesTouched, setNbPersonnesTouched] = useState<boolean>(
    initial.nbPersonnes > 1,
  );

  const detected = detectNbPersonnes(nom);

  function handleNomChange(value: string) {
    setNom(value);
    if (!nbPersonnesTouched) {
      setNbPersonnes(detectNbPersonnes(value));
    }
  }

  function handleNbPersonnesChange(value: number) {
    setNbPersonnes(value);
    setNbPersonnesTouched(true);
  }

  return (
    <form
      className="mt-4 rounded-2xl border border-amber-400/30 bg-slate-900/70 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!nom.trim()) return;
        onSubmit({
          nom: nom.trim(),
          nbPersonnes: Math.max(1, Math.floor(nbPersonnes || 1)),
          tableId,
        });
      }}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label className="text-xs text-amber-100/70 sm:col-span-2">
          Libellé de l&apos;invitation
          <input
            type="text"
            value={nom}
            onChange={(e) => handleNomChange(e.target.value)}
            className="luxe-input mt-1 text-sm"
            placeholder="Ex : MME ET M. MARTIN"
            required
            autoFocus
          />
        </label>
        <label className="text-xs text-amber-100/70">
          Nb personnes
          <input
            type="number"
            min={1}
            max={12}
            value={nbPersonnes}
            onChange={(e) => handleNbPersonnesChange(Number(e.target.value))}
            className="luxe-input mt-1 text-sm"
            required
          />
          {detected !== nbPersonnes ? (
            <button
              type="button"
              onClick={() => {
                setNbPersonnes(detected);
                setNbPersonnesTouched(false);
              }}
              className="mt-1 text-[10px] uppercase tracking-wider text-amber-300/80 underline-offset-2 hover:underline"
            >
              Détection auto : {detected}
            </button>
          ) : null}
        </label>
        <label className="text-xs text-amber-100/70 sm:col-span-3">
          Table assignée
          <select
            value={tableId ?? ""}
            onChange={(e) => setTableId(e.target.value || null)}
            className="luxe-input mt-1 text-sm"
          >
            <option value="">— Aucune —</option>
            {[...state.tables]
              .sort((a, b) => a.nom.localeCompare(b.nom))
              .map((t) => (
                <option key={t.id} value={t.id}>
                  Table {t.nom}
                </option>
              ))}
          </select>
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
