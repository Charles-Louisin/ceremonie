import Link from "next/link";
import { Crown } from "lucide-react";

interface Props {
  showAdminLink?: boolean;
}

export function Header({ showAdminLink = true }: Props) {
  return (
    <header className="px-5 pt-6 pb-3 text-center">
      <div className="flex items-center justify-center gap-2 text-amber-300">
        <Crown size={20} className="opacity-90" />
      </div>
      <h1 className="font-display mt-1 text-xl sm:text-2xl tracking-[0.18em] uppercase text-gold-gradient">
        Gala de Remise
        <br className="sm:hidden" />
        <span className="sm:ml-2"> de Médaille — Esther Paule YENGA</span>
      </h1>
      {showAdminLink ? (
        <div className="mt-3">
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-widest text-amber-200/70 underline-offset-4 hover:text-amber-200 hover:underline"
          >
            Tableau de bord
          </Link>
        </div>
      ) : null}
    </header>
  );
}
