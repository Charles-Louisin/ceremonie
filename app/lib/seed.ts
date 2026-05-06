import type { GalaState, Invite, TableGala } from "./types";

interface SeedInvite {
  nom: string;
  nbPersonnes: number;
}

interface SeedTable {
  nom: string;
  invitations: SeedInvite[];
}

/**
 * Données réelles du Gala — 17 tables, noms exacts des invitations.
 * Le chiffre = `nbPersonnes` (1 = personne seule, 2 = couple, etc.).
 */
const TABLES_DATA: SeedTable[] = [
  {
    nom: "NSAN",
    invitations: [
      { nom: "ESTHER PAULE", nbPersonnes: 1 },
      { nom: "RUTH + JOAN", nbPersonnes: 2 },
      { nom: "MME YENGA RUTH", nbPersonnes: 1 },
      { nom: "MME ET M. YIMBNE", nbPersonnes: 2 },
      { nom: "MME ET M. MASOCK", nbPersonnes: 2 },
    ],
  },
  {
    nom: "MASEE",
    invitations: [
      { nom: "MME ET M. ZAKARI", nbPersonnes: 2 },
      { nom: "MME ET M. NKONGA", nbPersonnes: 2 },
      { nom: "MME MAKAKI JACQUELINE", nbPersonnes: 2 },
      { nom: "MME BENA AGNES", nbPersonnes: 1 },
      { nom: "MME BINENG ELISBETH", nbPersonnes: 1 },
    ],
  },
  {
    nom: "WONGUT",
    invitations: [
      { nom: "KWIN + MAWENA + MATHIS", nbPersonnes: 3 },
      { nom: "MME SENGUE KWEDI", nbPersonnes: 1 },
      { nom: "MME RACHEL DISSON", nbPersonnes: 1 },
      { nom: "MME ESSO MARLYSE", nbPersonnes: 1 },
      { nom: "MME ET M. TJANG", nbPersonnes: 2 },
    ],
  },
  {
    nom: "NEM NLAM",
    invitations: [
      { nom: "MME ET M. MBOMA", nbPersonnes: 2 },
      { nom: "MME ET M. SOUOP", nbPersonnes: 2 },
      { nom: "MME ET M. DOGO", nbPersonnes: 2 },
      { nom: "MME ET M. BIKIM", nbPersonnes: 2 },
    ],
  },
  {
    nom: "NEM LIMA",
    invitations: [
      { nom: "MME ET M. EWANG", nbPersonnes: 2 },
      { nom: "M. KALDJOB STEVE", nbPersonnes: 1 },
      { nom: "MME HOPTA JULIENNE", nbPersonnes: 1 },
      { nom: "MME KINDJO LYDIENNE", nbPersonnes: 1 },
      { nom: "MME ET M. NDJEM", nbPersonnes: 2 },
      { nom: "M. MAHI JOEL", nbPersonnes: 1 },
    ],
  },
  {
    nom: "KONANGOO",
    invitations: [
      { nom: "NOLLA GERMAIN", nbPersonnes: 1 },
      { nom: "MME ET M. MONAYONG", nbPersonnes: 2 },
      { nom: "MME ET M. TCHOUANTE", nbPersonnes: 2 },
      { nom: "FRANCK MBELEG", nbPersonnes: 1 },
      { nom: "MME ET M. MBELEG", nbPersonnes: 2 },
    ],
  },
  {
    nom: "KARIS",
    invitations: [
      { nom: "MME ET M. BOYONG", nbPersonnes: 2 },
      { nom: "MME ET M. WO'O", nbPersonnes: 2 },
      { nom: "MME ET M. AKONO", nbPersonnes: 2 },
      { nom: "MLLE TCHOUANTE MIJAH E.", nbPersonnes: 2 },
    ],
  },
  {
    nom: "KINNEM",
    invitations: [
      { nom: "MME ET M. POM", nbPersonnes: 2 },
      { nom: "MME ET M. BAOKEN", nbPersonnes: 2 },
      { nom: "MME ET M. YOUMLE", nbPersonnes: 2 },
      { nom: "MME ET M. FOTSING", nbPersonnes: 2 },
    ],
  },
  {
    nom: "NEM NGOO",
    invitations: [
      { nom: "MME DANIELLE THERESE", nbPersonnes: 2 },
      { nom: "RACHEL ATOCK", nbPersonnes: 1 },
      { nom: "ERNEST NZOUNGO", nbPersonnes: 1 },
      { nom: "EMMANUEL LIKOUNG", nbPersonnes: 1 },
      { nom: "MARIE NGO NOODE", nbPersonnes: 1 },
      { nom: "ERIC KOUONANG", nbPersonnes: 1 },
      { nom: "NGUINA LEOPOLD", nbPersonnes: 1 },
    ],
  },
  {
    nom: "GWEHA",
    invitations: [
      { nom: "MME MADELEINE TOUTENG", nbPersonnes: 1 },
      { nom: "MME ET M. EBOA", nbPersonnes: 2 },
      { nom: "MME ET M. NOCK", nbPersonnes: 2 },
      { nom: "MME ET M. DIBOUNDJE", nbPersonnes: 2 },
      { nom: "MME GRACE TOUTENG", nbPersonnes: 1 },
    ],
  },
  {
    nom: "TELEP SEP",
    invitations: [
      { nom: "MME ET M. BATIF", nbPersonnes: 2 },
      { nom: "CHLOE + CLAUDIA BATIF", nbPersonnes: 2 },
      { nom: "LOUISIN + JEAN PAUL", nbPersonnes: 2 },
      { nom: "SAMUEL + RUTH", nbPersonnes: 2 },
    ],
  },
  {
    nom: "LONGENEM",
    invitations: [
      { nom: "MME MONIQUE NZOUANGO", nbPersonnes: 1 },
      { nom: "MONIQUE NZOUANGO", nbPersonnes: 1 },
      { nom: "MME MARIE THERESE", nbPersonnes: 1 },
      { nom: "MME MBEP BERTHE", nbPersonnes: 1 },
      { nom: "MME SOPHIE DIMOUNGUE", nbPersonnes: 1 },
      { nom: "MME MICHELLE ESSOH", nbPersonnes: 1 },
      { nom: "MME ET M. BIMAI", nbPersonnes: 2 },
    ],
  },
  {
    nom: "HEMLE",
    invitations: [
      { nom: "MME ET M. MANIKE", nbPersonnes: 2 },
      { nom: "MME ET M. WONGA", nbPersonnes: 2 },
      { nom: "MME ET M. BIKOKO", nbPersonnes: 2 },
      { nom: "MAMAN BENEDICTE", nbPersonnes: 1 },
      { nom: "NGO MBEN NGONDO S", nbPersonnes: 1 },
    ],
  },
  {
    nom: "HOTNYUU",
    invitations: [
      { nom: "MME ET M. NLEND", nbPersonnes: 2 },
      { nom: "MME ET M. NDOMBOL", nbPersonnes: 2 },
      { nom: "MME ASSEN CELESTINE", nbPersonnes: 1 },
      { nom: "MME MOUENDI AUGUSTINE", nbPersonnes: 1 },
      { nom: "M. NYECK NKOT", nbPersonnes: 1 },
      { nom: "MME KANSU", nbPersonnes: 1 },
    ],
  },
  {
    nom: "MANOGLA",
    invitations: [
      { nom: "MME ET M. BIKATAL", nbPersonnes: 2 },
      { nom: "SOLANGE JENNY MAPOUT", nbPersonnes: 1 },
      { nom: "MME ROSALIE MAPOUT", nbPersonnes: 1 },
      { nom: "MME BAMBEMBI ROSE", nbPersonnes: 1 },
      { nom: "MME CARINE BOUNDIL", nbPersonnes: 1 },
      { nom: "MME ET M. NANG", nbPersonnes: 2 },
    ],
  },
  {
    nom: "YELAM",
    invitations: [
      { nom: "HELENE OLINGA", nbPersonnes: 1 },
      { nom: "MICHELE MBOG", nbPersonnes: 1 },
      { nom: "NTOGUE MARIE", nbPersonnes: 1 },
      { nom: "MAGNOL CHARLOTTE", nbPersonnes: 1 },
      { nom: "MME ET M. NYENATI", nbPersonnes: 2 },
      { nom: "MME ET M. MOLE", nbPersonnes: 2 },
    ],
  },
  {
    nom: "MALIGA",
    invitations: [
      { nom: "MARTINE NZOUANGO", nbPersonnes: 1 },
      { nom: "BALOGOG MARCELINE", nbPersonnes: 1 },
      { nom: "CHANTAL ILIGA", nbPersonnes: 1 },
      { nom: "ESTHER NLIBA", nbPersonnes: 1 },
      { nom: "CATHY EPIKA", nbPersonnes: 1 },
      { nom: "PAULINE MATIPA", nbPersonnes: 1 },
      { nom: "MME ET M. BALEBA", nbPersonnes: 2 },
    ],
  },
];

function makeId(prefix: string, n: number): string {
  return `${prefix}-${n.toString().padStart(3, "0")}`;
}

export function buildSeed(): GalaState {
  const tables: TableGala[] = [];
  const invites: Invite[] = [];

  TABLES_DATA.forEach((data, tIndex) => {
    const tableId = makeId("t", tIndex + 1);
    const table: TableGala = {
      id: tableId,
      nom: data.nom,
      capacite: data.invitations.reduce((sum, i) => sum + i.nbPersonnes, 0),
      hotesseInviteId: null,
      hotesseNom: null,
    };

    data.invitations.forEach((inv, iIndex) => {
      const inviteId = makeId(`g-${tIndex + 1}`, iIndex + 1);
      invites.push({
        id: inviteId,
        nom: inv.nom,
        nbPersonnes: inv.nbPersonnes,
        tableId,
        estPresent: false,
        heureArrivee: null,
      });
    });

    const firstInvite = invites.find((g) => g.tableId === tableId);
    if (firstInvite) {
      table.hotesseInviteId = firstInvite.id;
      table.hotesseNom = firstInvite.nom;
    }

    tables.push(table);
  });

  return { tables, invites };
}
