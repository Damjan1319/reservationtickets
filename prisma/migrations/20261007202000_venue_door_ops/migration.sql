ALTER TABLE "Venue" ADD COLUMN "tableCapacity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Venue" ADD COLUMN "opensAt" TEXT NOT NULL DEFAULT '10:00';
ALTER TABLE "Venue" ADD COLUMN "closesAt" TEXT NOT NULL DEFAULT '23:30';
ALTER TABLE "Venue" ADD COLUMN "closed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Venue" ADD COLUMN "noShowMinutes" INTEGER NOT NULL DEFAULT 45;

CREATE INDEX "Reservation_venueId_visitAt_idx" ON "Reservation"("venueId", "visitAt");
CREATE INDEX "Reservation_venueId_status_idx" ON "Reservation"("venueId", "status");
