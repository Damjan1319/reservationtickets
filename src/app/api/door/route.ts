import { NextResponse } from "next/server";
import { loadDoorList, releaseNoShows } from "@/lib/door";
import { getStaffContext } from "@/lib/staff";

export async function GET() {
  const context = await getStaffContext();
  if (!context) return NextResponse.json({ error: "noAccess" }, { status: 401 });
  await releaseNoShows(context.venue.id, context.venue.noShowMinutes);
  const items = await loadDoorList(context.venue.id);
  return NextResponse.json(
    { items, at: Date.now() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
