import { NextResponse, type NextRequest } from "next/server";
import { createTable, type TableInput } from "../../lib/db-server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: TableInput;
  try {
    body = (await req.json()) as TableInput;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  if (!body || typeof body.nom !== "string" || body.nom.trim() === "") {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 422 });
  }
  const table = await createTable(body);
  return NextResponse.json(table, { status: 201 });
}
