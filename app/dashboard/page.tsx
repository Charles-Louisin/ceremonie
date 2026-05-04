"use client";

import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useGala } from "../lib/store";
import { AdminAuthProvider, useAdminAuth } from "../lib/admin-auth";
import { LoadingShell } from "../components/LoadingShell";
import { AdminGate } from "./components/AdminGate";
import { TablesManager } from "./components/TablesManager";
import { InvitesManager } from "./components/InvitesManager";
import { HostessesManager } from "./components/HostessesManager";

export default function DashboardPage() {
  return (
    <AdminAuthProvider>
      <AdminGate>
        <DashboardContent />
      </AdminGate>
    </AdminAuthProvider>
  );
}

function DashboardContent() {
  const { state } = useGala();
  const { lock } = useAdminAuth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-5 pt-6 pb-4">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <Link
            href="/"
            className="btn-ghost text-xs sm:text-sm"
            aria-label="Retour à l'application"
          >
            <ArrowLeft size={16} /> Retour
          </Link>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-200/60">
              Tableau de bord
            </p>
            <h1 className="font-display text-lg sm:text-2xl uppercase tracking-widest text-gold-gradient">
              Administration du Gala
            </h1>
          </div>
          <button
            type="button"
            onClick={lock}
            className="btn-ghost text-xs sm:text-sm"
            aria-label="Verrouiller la session"
            title="Verrouiller la session"
          >
            <LockKeyhole size={14} />
            <span className="hidden sm:inline">Verrouiller</span>
          </button>
        </div>
      </header>

      <LoadingShell>
        <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-5 px-4 pb-16 sm:px-6 lg:grid-cols-2">
          <TablesManager />
          <InvitesManager />
          <div className="lg:col-span-2">
            <HostessesManager />
          </div>
        </div>
      </LoadingShell>

      <footer className="border-t border-amber-400/10 px-5 py-4 text-center text-[11px] uppercase tracking-[0.25em] text-amber-200/50">
        {state.tables.length} tables ·{" "}
        {state.invites.length} invitations ·{" "}
        {state.invites.reduce((sum, g) => sum + (g.nbPersonnes ?? 1), 0)} personnes ·{" "}
        {state.invites
          .filter((g) => g.estPresent)
          .reduce((sum, g) => sum + (g.nbPersonnes ?? 1), 0)}{" "}
        présents
      </footer>
    </div>
  );
}
