import { NextResponse, type NextRequest } from "next/server";
import { deleteInvite, updateInvite } from "../../../lib/db-server";
import type { Invite } from "../../../lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/invites/[id]">,
) {
  const { id } = await ctx.params;
  let patch: Partial<Omit<Invite, "id">>;
  try {
    patch = (await req.json()) as Partial<Omit<Invite, "id">>;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  const updated = await updateInvite(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Invité introuvable" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/invites/[id]">,
) {
  const { id } = await ctx.params;
  const ok = await deleteInvite(id);
  if (!ok) {
    return NextResponse.json({ error: "Invité introuvable" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
