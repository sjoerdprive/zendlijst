import type { Dictionary, Locale } from "@/shared/i18n";
import { APP_TIME_ZONE, formatWeekdayDate } from "@/shared/lib";

/*
 * Scheduled newsletters go out once a day at DELIVERY_HOUR Dutch time. Vercel
 * cron runs in UTC at 06:00 and 07:00 (see vercel.json) so one of the two runs
 * falls in that hour in both summer (UTC+2) and winter (UTC+1) time. Hobby
 * cron jobs may start any time within their hour, hence the delivery window.
 */
export const DELIVERY_HOUR = 8;
export const DELIVERY_WINDOW_END_HOUR = DELIVERY_HOUR + 1;

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const partsInAppZone = (value: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) };
};

// "YYYY-MM-DD" of the given moment in Dutch time.
export const toAppDateString = (value: Date): string => partsInAppZone(value).date;

// The delivery moment (08:00 Dutch time) for a "YYYY-MM-DD" date, or null if invalid.
export const deliveryMomentForDate = (date: string): Date | null => {
  const match = DATE_PATTERN.exec(date);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  if (!year || !month || !day) return null;
  // Amsterdam is UTC+1 or UTC+2, so 08:00 local is 07:00 or 06:00 UTC.
  for (const offset of [1, 2]) {
    const candidate = new Date(Date.UTC(year, month - 1, day, DELIVERY_HOUR - offset));
    const parts = partsInAppZone(candidate);
    if (parts.date === date && parts.hour === DELIVERY_HOUR) return candidate;
  }
  return null;
};

// The first date whose delivery moment is still ahead of `now`.
export const earliestDeliveryDate = (now: Date = new Date()): string => {
  const today = toAppDateString(now);
  const todayMoment = deliveryMomentForDate(today);
  if (todayMoment && todayMoment.getTime() > now.getTime()) return today;
  return toAppDateString(new Date(now.getTime() + 24 * 60 * 60 * 1000));
};

// The daily run that actually picks up a newsletter scheduled at `scheduledAt`.
// New schedules are exactly on a delivery moment; older ones may be any time.
export const deliveryMomentFor = (scheduledAt: Date): Date => {
  const sameDay = deliveryMomentForDate(toAppDateString(scheduledAt));
  if (sameDay && sameDay.getTime() >= scheduledAt.getTime()) return sameDay;
  const nextDay = deliveryMomentForDate(toAppDateString(new Date(scheduledAt.getTime() + 24 * 60 * 60 * 1000)));
  return nextDay ?? scheduledAt;
};

// e.g. "zaterdag 10 oktober 2026, tussen 8:00 en 9:00"
export const describeDelivery = (scheduledAt: Date, t: Dictionary, locale: Locale): string =>
  t.schedule.window(
    formatWeekdayDate(deliveryMomentFor(scheduledAt), locale),
    DELIVERY_HOUR,
    DELIVERY_WINDOW_END_HOUR,
  );
