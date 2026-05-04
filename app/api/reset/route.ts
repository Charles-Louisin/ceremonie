import { NextResponse } from "next/server";
import { resetState } from "../../lib/db-server";

export const dynamic = "force-dynamic";

export async function POST() {
  const state = await resetState();
  return NextResponse.json(state);
}
