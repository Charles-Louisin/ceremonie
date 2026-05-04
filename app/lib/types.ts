export type ID = string;

export interface Invite {
  id: ID;
  nom: string;
  /** Nombre de personnes couvertes par cette invitation (1 = seul, 2 = couple, etc.). */
  nbPersonnes: number;
  tableId: ID | null;
  estPresent: boolean;
  heureArrivee: string | null;
}

export interface TableGala {
  id: ID;
  nom: string;
  capacite: number;
  /** ID de l'invité désigné comme hôtesse pour cette table. */
  hotesseInviteId: ID | null;
}

export interface GalaState {
  tables: TableGala[];
  invites: Invite[];
}

export const TABLE_CAPACITY = 8;
