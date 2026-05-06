import "server-only";

import type { Collection } from "mongodb";
import type { GalaState, Invite, TableGala } from "./types";
import { TABLE_CAPACITY } from "./types";
import { buildSeed } from "./seed";
import { getDb } from "./mongodb";
import { decodeHostessInviteId, makeUid, nowIso, splitInvitationName } from "./utils";

interface InviteDoc extends Omit<Invite, "id"> {
  _id: string;
}

interface TableDoc extends Omit<TableGala, "id"> {
  _id: string;
}

const TABLES = "tables";
const INVITES = "invites";

async function collections(): Promise<{
  tables: Collection<TableDoc>;
  invites: Collection<InviteDoc>;
}> {
  const db = await getDb();
  return {
    tables: db.collection<TableDoc>(TABLES),
    invites: db.collection<InviteDoc>(INVITES),
  };
}

function pickHostessName(
  invite: { nom: string; nbPersonnes?: number } | null,
  desiredName: string | null | undefined,
): string | null {
  if (!invite) return null;
  const candidates = splitInvitationName(invite.nom, invite.nbPersonnes ?? 1)
    .map((n) => n.trim())
    .filter(Boolean);
  if (candidates.length === 0) return null;
  const wanted = desiredName?.trim();
  if (wanted) {
    const exact = candidates.find((n) => n.toLowerCase() === wanted.toLowerCase());
    if (exact) return exact;
  }
  return candidates[0];
}

function fromTableDoc(doc: TableDoc): TableGala {
  return {
    id: doc._id,
    nom: doc.nom,
    capacite: doc.capacite,
    hotesseInviteId: doc.hotesseInviteId ?? null,
    hotesseNom: doc.hotesseNom ?? null,
  };
}

function fromInviteDoc(doc: InviteDoc): Invite {
  return {
    id: doc._id,
    nom: doc.nom,
    nbPersonnes: doc.nbPersonnes ?? 1,
    tableId: doc.tableId ?? null,
    estPresent: doc.estPresent ?? false,
    heureArrivee: doc.heureArrivee ?? null,
  };
}

function toTableDoc(t: TableGala): TableDoc {
  return {
    _id: t.id,
    nom: t.nom,
    capacite: t.capacite,
    hotesseInviteId: t.hotesseInviteId,
    hotesseNom: t.hotesseNom,
  };
}

function toInviteDoc(g: Invite): InviteDoc {
  return {
    _id: g.id,
    nom: g.nom,
    nbPersonnes: g.nbPersonnes,
    tableId: g.tableId,
    estPresent: g.estPresent,
    heureArrivee: g.heureArrivee,
  };
}

let seedingPromise: Promise<void> | null = null;
let migrationPromise: Promise<void> | null = null;

async function ensureSeeded(): Promise<void> {
  if (seedingPromise) return seedingPromise;
  seedingPromise = (async () => {
    const { tables, invites } = await collections();
    const tablesCount = await tables.estimatedDocumentCount();
    if (tablesCount === 0) {
      const invitesCount = await invites.estimatedDocumentCount();
      if (invitesCount === 0) {
        const seed = buildSeed();
        if (seed.tables.length > 0) {
          await tables.insertMany(seed.tables.map(toTableDoc));
        }
        if (seed.invites.length > 0) {
          await invites.insertMany(seed.invites.map(toInviteDoc));
        }
      }
    }
  })();
  try {
    await seedingPromise;
  } catch (err) {
    seedingPromise = null;
    throw err;
  }
}

async function ensureMigrated(): Promise<void> {
  if (migrationPromise) return migrationPromise;
  migrationPromise = (async () => {
    await ensureSeeded();
    const { tables, invites } = await collections();

    const invitesById = new Map(
      (
        await invites
          .find({}, { projection: { _id: 1, nom: 1, nbPersonnes: 1 } })
          .toArray()
      ).map((d) => [d._id, { nom: d.nom, nbPersonnes: d.nbPersonnes ?? 1 }]),
    );
    const tableDocs = await tables
      .find({}, { projection: { _id: 1, hotesseInviteId: 1, hotesseNom: 1 } })
      .toArray();

    for (const t of tableDocs) {
      const parsed = decodeHostessInviteId(t.hotesseInviteId);
      const validInviteId =
        parsed.inviteId && invitesById.has(parsed.inviteId) ? parsed.inviteId : null;
      const persistedName = validInviteId
        ? pickHostessName(invitesById.get(validInviteId) ?? null, parsed.personName ?? t.hotesseNom)
        : null;
      const needsUpdate =
        (t.hotesseInviteId ?? null) !== validInviteId || (t.hotesseNom ?? null) !== persistedName;
      if (needsUpdate) {
        await tables.updateOne(
          { _id: t._id },
          {
            $set: {
              hotesseInviteId: validInviteId,
              hotesseNom: persistedName,
            },
          },
        );
      }
    }
  })();
  try {
    await migrationPromise;
  } catch (err) {
    migrationPromise = null;
    throw err;
  }
}

export async function readState(): Promise<GalaState> {
  await ensureMigrated();
  const { tables, invites } = await collections();
  const [t, i] = await Promise.all([
    tables.find({}).sort({ _id: 1 }).toArray(),
    invites.find({}).sort({ nom: 1 }).toArray(),
  ]);
  return {
    tables: t.map(fromTableDoc),
    invites: i.map(fromInviteDoc),
  };
}

export async function resetState(): Promise<GalaState> {
  const { tables, invites } = await collections();
  await Promise.all([tables.deleteMany({}), invites.deleteMany({})]);
  const seed = buildSeed();
  if (seed.tables.length > 0) {
    await tables.insertMany(seed.tables.map(toTableDoc));
  }
  if (seed.invites.length > 0) {
    await invites.insertMany(seed.invites.map(toInviteDoc));
  }
  return seed;
}

// ---------- Invités ----------

export interface InviteInput {
  id?: string;
  nom: string;
  nbPersonnes?: number;
  tableId?: string | null;
  estPresent?: boolean;
  heureArrivee?: string | null;
}

export async function createInvite(input: InviteInput): Promise<Invite> {
  await ensureSeeded();
  const { invites } = await collections();
  const invite: Invite = {
    id: input.id ?? makeUid("g"),
    nom: input.nom.trim(),
    nbPersonnes: Math.max(1, Math.floor(input.nbPersonnes ?? 1)),
    tableId: input.tableId ?? null,
    estPresent: input.estPresent ?? false,
    heureArrivee: input.heureArrivee ?? null,
  };
  await invites.insertOne(toInviteDoc(invite));
  return invite;
}

export async function updateInvite(
  id: string,
  patch: Partial<Omit<Invite, "id">>,
): Promise<Invite | null> {
  await ensureSeeded();
  const { invites } = await collections();
  const cleanedPatch: Partial<Omit<Invite, "id">> = { ...patch };
  if (cleanedPatch.nbPersonnes !== undefined) {
    cleanedPatch.nbPersonnes = Math.max(1, Math.floor(cleanedPatch.nbPersonnes));
  }
  if (cleanedPatch.nom !== undefined) {
    cleanedPatch.nom = cleanedPatch.nom.trim();
  }
  const result = await invites.findOneAndUpdate(
    { _id: id },
    { $set: cleanedPatch },
    { returnDocument: "after" },
  );
  return result ? fromInviteDoc(result) : null;
}

export async function setInvitePresence(
  id: string,
  present: boolean,
): Promise<Invite | null> {
  return updateInvite(id, {
    estPresent: present,
    heureArrivee: present ? nowIso() : null,
  });
}

export async function deleteInvite(id: string): Promise<boolean> {
  await ensureSeeded();
  const { invites, tables } = await collections();
  const res = await invites.deleteOne({ _id: id });
  if (res.deletedCount === 0) return false;
  await tables.updateMany(
    {
      $or: [
        { hotesseInviteId: id },
      ],
    },
    { $set: { hotesseInviteId: null, hotesseNom: null } },
  );
  return true;
}

// ---------- Tables ----------

export interface TableInput {
  id?: string;
  nom: string;
  capacite?: number;
  hotesseInviteId?: string | null;
  hotesseNom?: string | null;
}

export async function createTable(input: TableInput): Promise<TableGala> {
  await ensureSeeded();
  const { tables, invites } = await collections();
  const hostessInvite = input.hotesseInviteId
    ? await invites.findOne(
        { _id: input.hotesseInviteId },
        { projection: { _id: 1, nom: 1, nbPersonnes: 1 } },
      )
    : null;
  const table: TableGala = {
    id: input.id ?? makeUid("t"),
    nom: input.nom.trim(),
    capacite: input.capacite ?? TABLE_CAPACITY,
    hotesseInviteId: input.hotesseInviteId ?? null,
    hotesseNom: pickHostessName(hostessInvite, input.hotesseNom),
  };
  await tables.insertOne(toTableDoc(table));
  return table;
}

export async function updateTable(
  id: string,
  patch: Partial<Omit<TableGala, "id">>,
): Promise<TableGala | null> {
  await ensureSeeded();
  const { tables, invites } = await collections();
  const current = await tables.findOne({ _id: id });
  if (!current) return null;
  const cleanedPatch: Partial<Omit<TableGala, "id">> = { ...patch };
  if (cleanedPatch.nom !== undefined) {
    cleanedPatch.nom = cleanedPatch.nom.trim();
  }
  const nextHostessInviteId =
    cleanedPatch.hotesseInviteId !== undefined
      ? cleanedPatch.hotesseInviteId
      : current.hotesseInviteId ?? null;
  const hostessInvite = nextHostessInviteId
    ? await invites.findOne(
        { _id: nextHostessInviteId },
        { projection: { _id: 1, nom: 1, nbPersonnes: 1 } },
      )
    : null;
  const desiredHostessName =
    cleanedPatch.hotesseNom !== undefined ? cleanedPatch.hotesseNom : current.hotesseNom ?? null;
  cleanedPatch.hotesseNom = pickHostessName(hostessInvite, desiredHostessName);
  cleanedPatch.hotesseInviteId = nextHostessInviteId;
  const result = await tables.findOneAndUpdate(
    { _id: id },
    { $set: cleanedPatch },
    { returnDocument: "after" },
  );
  return result ? fromTableDoc(result) : null;
}

export async function deleteTable(id: string): Promise<boolean> {
  await ensureSeeded();
  const { tables, invites } = await collections();
  const res = await tables.deleteOne({ _id: id });
  if (res.deletedCount === 0) return false;
  await invites.updateMany(
    { tableId: id },
    { $set: { tableId: null } },
  );
  return true;
}
