"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useAdminAuth } from "../../lib/admin-auth";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated, unlock } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <Loader2 className="animate-spin text-amber-200/80" size={24} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    const ok = unlock(password);
    if (ok) {
      setPassword("");
      setError(null);
      return;
    }
    setError("Mot de passe incorrect.");
    setPassword("");
    setShake((s) => s + 1);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <motion.div
        key={shake}
        initial={shake === 0 ? { opacity: 0, y: 12 } : { x: 0 }}
        animate={
          shake === 0 ? { opacity: 1, y: 0 } : { x: [0, -8, 8, -6, 6, -3, 3, 0] }
        }
        transition={
          shake === 0
            ? { duration: 0.3 }
            : { duration: 0.4, ease: "easeInOut" }
        }
        className="w-full max-w-sm rounded-3xl border border-amber-400/25 bg-slate-950/95 p-6 gold-glow"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/10 text-amber-300">
            <Lock size={20} />
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-amber-200/60">
            Accès protégé
          </p>
          <h2 className="font-display mt-1 text-xl uppercase tracking-widest text-gold-gradient">
            Tableau de bord
          </h2>
          <p className="mt-2 text-xs text-amber-100/60">
            Saisissez le mot de passe administrateur pour continuer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3" autoComplete="off">
          <div className="relative">
            <input
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              className="luxe-input pr-10 text-sm"
              placeholder="••••••••"
              autoFocus
              required
              aria-label="Mot de passe administrateur"
              aria-invalid={error !== null}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              className="absolute inset-y-0 right-2 flex items-center rounded-md px-2 text-amber-200/60 hover:text-amber-200"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error ? (
            <p
              role="alert"
              className="flex items-center gap-1 text-xs text-red-300"
            >
              <AlertCircle size={12} /> {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="btn-gold w-full justify-center text-sm"
            disabled={!password}
          >
            <ShieldCheck size={14} /> Déverrouiller
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-amber-200/60 hover:text-amber-200"
          >
            <ArrowLeft size={12} /> Retour à l&apos;application
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
