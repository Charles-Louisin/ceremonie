import { NextResponse, type NextRequest } from "next/server";
import { deleteTable, updateTable } from "../../../lib/db-server";
import type { TableGala } from "../../../lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/tables/[id]">,
) {
  const { id } = await ctx.params;
  let patch: Partial<Omit<TableGala, "id">>;
  try {
    patch = (await req.json()) as Partial<Omit<TableGala, "id">>;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  const updated = await updateTable(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Table introuvable" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/tables/[id]">,
) {
  const { id } = await ctx.params;
  const ok = await deleteTable(id);
  if (!ok) {
    return NextResponse.json({ error: "Table introuvable" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
