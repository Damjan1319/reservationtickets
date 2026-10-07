import { getLocale } from "next-intl/server";
import { DoorBoard } from "@/components/door-board";
import { DoorPwa } from "@/components/door-pwa";
import { loadDoorList, releaseNoShows } from "@/lib/door";
import { getStaffContext } from "@/lib/staff";

export default async function ScanPage() {
  const locale = await getLocale();
  const context = await getStaffContext();
  if (!context) return null;
  await releaseNoShows(context.venue.id, context.venue.noShowMinutes);
  const items = await loadDoorList(context.venue.id);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      <DoorPwa />
      <DoorBoard
        venueId={context.venue.id}
        venueName={context.venue.name}
        locale={locale}
        initialItems={items}
      />
    </div>
  );
}
