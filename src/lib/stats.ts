export const PERIODS = ["today", "week", "month", "all"] as const;
export type Period = (typeof PERIODS)[number];

export type StatsReservation = {
  kind: string;
  guests: number;
  visitAt: Date;
  createdAt: Date;
  checkedInCount: number;
  user: { email: string; name: string };
  tickets: { checkedInAt: Date | null }[];
};

export function periodStart(period: Period) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (period === "today") return now;
  if (period === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return start;
  }
  if (period === "month") {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    return start;
  }
  return null;
}

export function parsePeriod(value?: string): Period {
  return PERIODS.includes(value as Period) ? (value as Period) : "week";
}

export function computeStats(reservations: StatsReservation[], period: Period) {
  const from = periodStart(period);
  const inPeriod = from
    ? reservations.filter((item) => item.visitAt >= from || item.createdAt >= from)
    : reservations;
  const emails = [...new Set(inPeriod.map((item) => item.user.email))].sort((a, b) => a.localeCompare(b));
  const soldTickets = inPeriod
    .filter((item) => item.kind === "EVENT")
    .reduce((sum, item) => sum + item.guests, 0);
  const tableGuests = inPeriod
    .filter((item) => item.kind === "TABLE")
    .reduce((sum, item) => sum + item.guests, 0);
  const arrived = inPeriod.reduce((sum, item) => {
    if (item.kind === "EVENT") {
      return sum + item.tickets.filter((ticket) => ticket.checkedInAt).length;
    }
    return sum + item.checkedInCount;
  }, 0);

  return { inPeriod, emails, soldTickets, tableGuests, arrived };
}

export function chartDays(reservations: StatsReservation[], dayKey: (date: Date) => string) {
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (13 - index));
    const key = dayKey(date);
    const ofDay = reservations.filter((item) => dayKey(item.visitAt) === key);
    return {
      label: `${date.getDate()}.`,
      reservations: ofDay.length,
      arrived: ofDay.reduce((sum, item) => {
        if (item.kind === "EVENT") {
          return sum + item.tickets.filter((ticket) => ticket.checkedInAt).length;
        }
        return sum + (item.checkedInCount >= item.guests ? item.guests : 0);
      }, 0),
    };
  });
}
