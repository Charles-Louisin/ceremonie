/** Supprime accents + casse pour la recherche. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Détecte automatiquement le nombre de personnes d'une invitation à partir du libellé.
 *
 *  - "MME ET M. DUPONT"           → 2
 *  - "MR ET MME DUPONT"           → 2
 *  - "RUTH + JOAN"                → 2
 *  - "KWIN + MAWENA + MATHIS"     → 3
 *  - "ESTHER PAULE"               → 1
 */
export function detectNbPersonnes(nom: string): number {
  const trimmed = nom.trim();
  if (!trimmed) return 1;
  if (trimmed.includes("+")) {
    const parts = trimmed
      .split("+")
      .map((s) => s.trim())
      .filter(Boolean);
    return Math.max(parts.length, 1);
  }
  if (
    /\bMME\s+ET\s+(M\.?|MR\.?|MONSIEUR)\b/i.test(trimmed) ||
    /\b(M\.?|MR\.?|MONSIEUR)\s+ET\s+MME\b/i.test(trimmed) ||
    /\bMADAME\s+ET\s+MONSIEUR\b/i.test(trimmed)
  ) {
    return 2;
  }
  return 1;
}

/**
 * Décompose une invitation à plusieurs personnes en N noms individuels.
 *
 * Exemples :
 *  - "MME ET M. MOLE" (2)        → ["MME MOLE", "M. MOLE"]
 *  - "RUTH + JOAN" (2)            → ["RUTH", "JOAN"]
 *  - "KWIN + MAWENA + MATHIS" (3) → ["KWIN", "MAWENA", "MATHIS"]
 *  - "MME MAKAKI JACQUELINE" (2)  → ["MME MAKAKI JACQUELINE", "MME MAKAKI JACQUELINE"]
 *  - "ESTHER PAULE" (1)           → ["ESTHER PAULE"]
 */
export function splitInvitationName(nom: string, nbPersonnes: number): string[] {
  const trimmed = nom.trim();
  const n = Math.max(1, Math.floor(nbPersonnes));
  if (n === 1) return [trimmed];

  if (trimmed.includes("+")) {
    const parts = trimmed
      .split("+")
      .map((s) => s.trim())
      .filter(Boolean);
    while (parts.length < n) parts.push(parts[parts.length - 1] ?? trimmed);
    return parts.slice(0, n);
  }

  const couplePatterns: RegExp[] = [
    /^\s*MME\s+ET\s+M\.?\s+(.+)$/i,
    /^\s*MME\s+ET\s+MR\.?\s+(.+)$/i,
    /^\s*M\.?\s+ET\s+MME\s+(.+)$/i,
    /^\s*MR\.?\s+ET\s+MME\s+(.+)$/i,
  ];
  for (const re of couplePatterns) {
    const m = trimmed.match(re);
    if (m && n === 2) {
      const lastName = m[1].trim();
      return [`MME ${lastName}`, `M. ${lastName}`];
    }
  }

  return Array.from({ length: n }, () => trimmed);
}

export function makeUid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function formatHeure(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
