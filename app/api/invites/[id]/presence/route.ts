import { NextResponse, type NextRequest } from "next/server";
import { setInvitePresence } from "../../../../lib/db-server";

export const dynamic = "force-dynamic";

interface PresenceBody {
  present: boolean;
}

export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/invites/[id]/presence">,
) {
  const { id } = await ctx.params;
  let body: PresenceBody;
  try {
    body = (await req.json()) as PresenceBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  if (typeof body.present !== "boolean") {
    return NextResponse.json(
      { error: "Le champ `present` doit être un booléen" },
      { status: 422 },
    );
  }
  const updated = await setInvitePresence(id, body.present);
  if (!updated) {
    return NextResponse.json({ error: "Invité introuvable" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
