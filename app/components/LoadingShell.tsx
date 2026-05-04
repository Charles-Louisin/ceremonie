"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useGala } from "../lib/store";

export function LoadingShell({ children }: { children: React.ReactNode }) {
  const { status, errorMessage, refetch } = useGala();

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="flex flex-col items-center gap-3 text-amber-200/80">
          <Loader2 className="animate-spin" size={28} />
          <p className="text-xs uppercase tracking-[0.3em]">
            Chargement de la salle...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-red-500/30 bg-red-950/30 p-6 text-center">
          <AlertTriangle className="mx-auto text-red-300" size={28} />
          <p className="mt-2 font-display uppercase tracking-widest text-red-200">
            Connexion impossible
          </p>
          <p className="mt-2 text-sm text-red-100/80">
            {errorMessage ?? "Une erreur s'est produite lors du chargement."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn-gold mt-4 text-xs"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
