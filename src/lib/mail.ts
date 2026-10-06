import { formatDateTime } from "@/lib/utils";

type MailReservation = {
  kind: string;
  guests: number;
  mealType: string | null;
  visitAt: Date;
  user: { name: string; email: string; locale: string };
  venue: { name: string };
  event: { title: string } | null;
};

export async function sendReservationDecisionEmail(
  reservation: MailReservation,
  decision: "CONFIRMED" | "CANCELLED",
) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY missing; reservation email skipped");
    return;
  }

  const sr = reservation.user.locale !== "en";
  const title =
    reservation.kind === "TABLE"
      ? sr
        ? "Rezervacija stola"
        : "Table reservation"
      : (reservation.event?.title ?? reservation.venue.name);
  const when = formatDateTime(reservation.visitAt, sr ? "sr" : "en");
  const accepted = decision === "CONFIRMED";
  const subject = accepted
    ? sr
      ? `Prihvaćena rezervacija — ${reservation.venue.name}`
      : `Reservation accepted — ${reservation.venue.name}`
    : sr
      ? `Otkazana rezervacija — ${reservation.venue.name}`
      : `Reservation cancelled — ${reservation.venue.name}`;
  const body = accepted
    ? sr
      ? `Zdravo ${reservation.user.name},\n\nRezervacija u lokalu ${reservation.venue.name} je prihvaćena.\n${title}\n${when}\nGostiju: ${reservation.guests}\n\nKartu ili potvrdu vidiš u svom nalogu na Ulaznice.`
      : `Hi ${reservation.user.name},\n\nYour reservation at ${reservation.venue.name} was accepted.\n${title}\n${when}\nGuests: ${reservation.guests}\n\nOpen Ulaznice to see your ticket or confirmation.`
    : sr
      ? `Zdravo ${reservation.user.name},\n\nRezervacija u lokalu ${reservation.venue.name} je otkazana.\n${title}\n${when}\n\nAko imaš pitanje, javi se lokalu.`
      : `Hi ${reservation.user.name},\n\nYour reservation at ${reservation.venue.name} was cancelled.\n${title}\n${when}\n\nContact the venue if you have questions.`;

  const from = process.env.MAIL_FROM || "Ulaznice <onboarding@resend.dev>";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [reservation.user.email],
        subject,
        text: body,
      }),
    });

    if (!response.ok) {
      console.error("Reservation email failed", await response.text());
    }
  } catch (error) {
    console.error("Reservation email failed", error);
  }
}
