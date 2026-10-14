import {
  differenceInMilliseconds,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export function getAppTimeZone(): string {
  return process.env.NEXT_PUBLIC_TIMEZONE?.trim() || "Asia/Kolkata";
}

export function parseUtcIso(iso: string): Date {
  return parseISO(iso);
}

export function formatInAppTz(iso: string, pattern: string): string {
  const zoned = toZonedTime(parseUtcIso(iso), getAppTimeZone());
  return format(zoned, pattern);
}

export function formatTime12h(iso: string): string {
  return formatInAppTz(iso, "hh:mm a");
}

export function formatDateLabel(iso: string): string {
  return formatInAppTz(iso, "EEE, d MMM yyyy");
}

export function formatDateInput(iso: string): string {
  return formatInAppTz(iso, "yyyy-MM-dd");
}

export function msToDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}

export function shiftDurationMs(clockIn: string, clockOut: string | null, now = new Date()): number {
  const start = parseUtcIso(clockIn);
  const end = clockOut ? parseUtcIso(clockOut) : now;
  return Math.max(0, differenceInMilliseconds(end, start));
}

export function sumAttendanceMs(
  rows: { clock_in: string; clock_out: string | null }[],
  now = new Date(),
): number {
  return rows.reduce((acc, row) => acc + shiftDurationMs(row.clock_in, row.clock_out, now), 0);
}

export function zonedDayRangeUtc(dateStr: string): { start: string; end: string } {
  const tz = getAppTimeZone();
  const localStart = fromZonedTime(`${dateStr}T00:00:00`, tz);
  const localEnd = fromZonedTime(`${dateStr}T23:59:59.999`, tz);
  return { start: localStart.toISOString(), end: localEnd.toISOString() };
}

export function zonedTodayStr(now = new Date()): string {
  return formatInAppTz(now.toISOString(), "yyyy-MM-dd");
}

export function weekRangeUtc(now = new Date()): { start: string; end: string } {
  const tz = getAppTimeZone();
  const zoned = toZonedTime(now, tz);
  const wStart = startOfWeek(zoned, { weekStartsOn: 1 });
  const wEnd = endOfWeek(zoned, { weekStartsOn: 1 });
  return {
    start: fromZonedTime(startOfDay(wStart), tz).toISOString(),
    end: fromZonedTime(endOfDay(wEnd), tz).toISOString(),
  };
}

export function monthRangeUtc(now = new Date()): { start: string; end: string } {
  const tz = getAppTimeZone();
  const zoned = toZonedTime(now, tz);
  const mStart = startOfMonth(zoned);
  const mEnd = endOfMonth(zoned);
  return {
    start: fromZonedTime(startOfDay(mStart), tz).toISOString(),
    end: fromZonedTime(endOfDay(mEnd), tz).toISOString(),
  };
}
