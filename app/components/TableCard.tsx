"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useMemo } from "react";
import type { Invite, TableGala } from "../lib/types";
import { useGala } from "../lib/store";
import { splitInvitationName } from "../lib/utils";

interface Props {
  table: TableGala;
  onClick?: (table: TableGala) => void;
  compact?: boolean;
}

interface SeatData {
  invite: Invite | null;
  name: string | null;
}

export function TableCard({ table, onClick, compact = false }: Props) {
  const { state } = useGala();

  const invites = useMemo(
    () => state.invites.filter((g) => g.tableId === table.id),
    [state.invites, table.id],
  );

  const hotesse = useMemo(
    () => state.invites.find((g) => g.id === table.hotesseInviteId) ?? null,
    [state.invites, table.hotesseInviteId],
  );

  const hotesseExtraTables = useMemo(() => {
    if (!hotesse) return 0;
    return state.tables.filter(
      (t) => t.hotesseInviteId === hotesse.id && t.id !== table.id,
    ).length;
  }, [hotesse, state.tables, table.id]);

  const seats: SeatData[] = useMemo(() => {
    const slots: SeatData[] = [];
    for (const inv of invites) {
      const names = splitInvitationName(inv.nom, inv.nbPersonnes ?? 1);
      for (let i = 0; i < names.length && slots.length < table.capacite; i += 1) {
        slots.push({ invite: inv, name: names[i] });
      }
      if (slots.length >= table.capacite) break;
    }
    while (slots.length < table.capacite) slots.push({ invite: null, name: null });
    return slots;
  }, [invites, table.capacite]);

  const presentCount = invites
    .filter((g) => g.estPresent)
    .reduce((sum, g) => sum + (g.nbPersonnes ?? 1), 0);
  const isComplete = presentCount >= table.capacite && table.capacite > 0;
  const isActive = presentCount > 0;

  return (
    <motion.button
      type="button"
      onClick={() => onClick?.(table)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={[
        "group relative w-full rounded-2xl text-left transition-colors",
        "border",
        isComplete
          ? "border-amber-300/40 bg-gradient-to-br from-amber-50/90 to-amber-100/70 gold-glow-strong"
          : isActive
            ? "border-amber-400/25 bg-white/90 gold-glow"
            : "border-slate-700/40 bg-slate-200/70",
        compact ? "p-3" : "p-4",
      ].join(" ")}
    >
      <div className="flex items-center justify-center">
        <TableSvg
          tableId={table.id}
          tableName={table.nom}
          hotesseNom={table.hotesseNom ?? hotesse?.nom ?? null}
          seats={seats}
          isActive={isActive}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-medium tracking-wide">
        <span
          className={[
            "flex min-w-0 items-center gap-1 uppercase",
            isActive ? "text-amber-700" : "text-slate-500",
          ].join(" ")}
        >
          <span className="truncate">
            {hotesse
              ? `Hôtesse · ${shortName(table.hotesseNom ?? hotesse.nom)}`
              : "Sans hôtesse"}
          </span>
          {hotesseExtraTables > 0 ? (
            <span
              title={`Cette hôtesse couvre ${hotesseExtraTables + 1} tables`}
              className={[
                "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider normal-case",
                isActive
                  ? "bg-amber-200 text-amber-800"
                  : "bg-slate-300 text-slate-600",
              ].join(" ")}
            >
              +{hotesseExtraTables}
            </span>
          ) : null}
        </span>
        <span
          className={[
            "shrink-0 rounded-full px-2 py-0.5",
            isComplete
              ? "bg-amber-300/90 text-amber-900"
              : isActive
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-300 text-slate-700",
          ].join(" ")}
        >
          {presentCount} / {table.capacite}
        </span>
      </div>
    </motion.button>
  );
}

interface TableSvgProps {
  tableId: string;
  tableName: string;
  hotesseNom: string | null;
  seats: SeatData[];
  isActive: boolean;
}

function TableSvg({
  tableId,
  tableName,
  hotesseNom,
  seats,
  isActive,
}: TableSvgProps) {
  const VIEWBOX = 280;
  const cx = VIEWBOX / 2;
  const cy = VIEWBOX / 2;
  const ringRadius = 80;
  const labelRadius = 116;
  const tableRadius = 42;
  const safeId = tableId.replace(/[^a-zA-Z0-9_-]/g, "_");

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      className="w-full max-w-[300px] h-auto"
      role="img"
      aria-label={`Table ${tableName}`}
    >
      <defs>
        <radialGradient id={`tableFill-${safeId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8e1" />
          <stop offset="100%" stopColor="#fcd9a3" />
        </radialGradient>
        <linearGradient id={`tableStroke-${safeId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fcd9a3" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      {seats.map((seat, i) => {
        const angle = (i * 45 - 90) * (Math.PI / 180);
        const sx = cx + Math.cos(angle) * ringRadius;
        const sy = cy + Math.sin(angle) * ringRadius;
        const lx = cx + Math.cos(angle) * labelRadius;
        const ly = cy + Math.sin(angle) * labelRadius;
        const present = seat.invite?.estPresent ?? false;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        const textAnchor: "start" | "middle" | "end" =
          dx > 0.35 ? "start" : dx < -0.35 ? "end" : "middle";
        const verticalNudge = dy > 0.5 ? 6 : dy < -0.5 ? -2 : 3;
        return (
          <g key={i}>
            <SeatIcon
              x={sx}
              y={sy}
              present={present}
              hasGuest={seat.invite !== null}
            />
            {seat.name ? (
              <SeatLabel
                x={lx}
                y={ly + verticalNudge}
                textAnchor={textAnchor}
                name={seat.name}
                isPresent={present}
                isActive={isActive}
              />
            ) : null}
          </g>
        );
      })}

      <circle
        cx={cx}
        cy={cy}
        r={tableRadius}
        fill={`url(#tableFill-${safeId})`}
        stroke={`url(#tableStroke-${safeId})`}
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={cy - 3}
        textAnchor="middle"
        fontSize={fontSizeForName(tableName)}
        fontWeight="700"
        fill="#1c1917"
        className="select-none"
      >
        {tableName}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontSize="7"
        fill="#78350f"
        className="select-none"
      >
        Hôtesse
      </text>
    <text
        x={cx}
        y={cy + 19}
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="600"
        fill="#78350f"
        className="select-none"
      >
        {hotesseNom ? truncate(firstName(hotesseNom), 12) : "—"}
      </text>
    </svg>
  );
}

interface SeatIconProps {
  x: number;
  y: number;
  present: boolean;
  hasGuest: boolean;
}

function SeatIcon({ x, y, present, hasGuest }: SeatIconProps) {
  const color = present
    ? "#d97706"
    : hasGuest
      ? "#64748b"
      : "#57534e";
  const filter = present ? "drop-shadow(0 0 3px rgba(217, 119, 6, 0.4))" : undefined;
  return (
    <motion.g
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{ transform: `translate(${x - 9}px, ${y - 9}px)`, filter }}
    >
      <foreignObject width="18" height="18">
        <div style={{ width: 18, height: 18, color }}>
          <User strokeWidth={hasGuest ? 2.2 : 2.35} size={18} />
        </div>
      </foreignObject>
    </motion.g>
  );
}

interface SeatLabelProps {
  x: number;
  y: number;
  textAnchor: "start" | "middle" | "end";
  name: string;
  isPresent: boolean;
  isActive: boolean;
}

function SeatLabel({ x, y, textAnchor, name, isPresent, isActive }: SeatLabelProps) {
  const fill = isPresent ? "#92400e" : isActive ? "#475569" : "#475569";
  const fontWeight = isPresent ? 700 : 500;
  const lines = wrapName(name);
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fontSize="7"
      fontWeight={fontWeight}
      fill={fill}
      className="select-none"
    >
      {lines.map((line, idx) => (
        <tspan key={idx} x={x} dy={idx === 0 ? 0 : 8}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

/** Découpe un nom long en 1 ou 2 lignes pour qu'il rentre dans la carte. */
function wrapName(name: string): string[] {
  const compact = compactName(name);
  if (compact.length <= 13) return [compact];
  const parts = compact.split(" ");
  if (parts.length === 1) return [truncate(compact, 13)];
  let line1 = "";
  let line2 = "";
  for (const p of parts) {
    if ((line1 + " " + p).trim().length <= 13 && line2 === "") {
      line1 = (line1 + " " + p).trim();
    } else {
      line2 = (line2 + " " + p).trim();
    }
  }
  return [line1, truncate(line2, 13)];
}

/** "JEAN-PIERRE DUPONT" → "J-P DUPONT" pour économiser l'espace. */
function compactName(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length <= 1) return name;
  const first = parts[0];
  if (first.includes("-") && first.length > 6) {
    const initials = first
      .split("-")
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("-");
    return `${initials} ${parts.slice(1).join(" ")}`;
  }
  return name;
}

function shortName(full: string): string {
  const parts = full.split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
}

function firstName(full: string): string {
  return full.split(" ")[0];
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function fontSizeForName(name: string): number {
  if (name.length <= 6) return 12;
  if (name.length <= 9) return 10.5;
  if (name.length <= 12) return 9;
  return 8;
}
