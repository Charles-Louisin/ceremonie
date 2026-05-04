import { NextResponse, type NextRequest } from "next/server";
import { createInvite, type InviteInput } from "../../lib/db-server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: InviteInput;
  try {
    body = (await req.json()) as InviteInput;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  if (!body || typeof body.nom !== "string" || body.nom.trim() === "") {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 422 });
  }
  const invite = await createInvite(body);
  return NextResponse.json(invite, { status: 201 });
}
