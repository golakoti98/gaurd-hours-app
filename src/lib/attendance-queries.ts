import {
  msToDuration,
  sumAttendanceMs,
  weekRangeUtc,
  zonedDayRangeUtc,
  zonedTodayStr,
} from "@/lib/time";
import type { AttendanceRow } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { oneRelation } from "@/lib/supabase/normalize";

export async function fetchActiveShift(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select("id, clock_in, clock_out")
    .eq("user_id", userId)
    .is("clock_out", null)
    .maybeSingle();
  return data;
}

export async function fetchGuardHomeStats(userId: string) {
  const supabase = await createClient();
  const today = zonedTodayStr();
  const todayRange = zonedDayRangeUtc(today);
  const weekRange = weekRangeUtc();

  const [active, todayRows, weekRows, shiftDays] = await Promise.all([
    fetchActiveShift(userId),
    supabase
      .from("attendance")
      .select("clock_in, clock_out")
      .eq("user_id", userId)
      .gte("clock_in", todayRange.start)
      .lte("clock_in", todayRange.end),
    supabase
      .from("attendance")
      .select("clock_in, clock_out")
      .eq("user_id", userId)
      .gte("clock_in", weekRange.start)
      .lte("clock_in", weekRange.end),
    supabase
      .from("attendance")
      .select("clock_in")
      .eq("user_id", userId)
      .gte("clock_in", weekRange.start)
      .lte("clock_in", weekRange.end),
  ]);

  const todayMs = sumAttendanceMs(todayRows.data ?? []);
  const weekMs = sumAttendanceMs(weekRows.data ?? []);

  const uniqueDays = new Set(
    (shiftDays.data ?? []).map((r) => r.clock_in.slice(0, 10)),
  );

  return {
    active,
    todayMs,
    weekMs,
    weekDaysLogged: uniqueDays.size,
    todayLabel: msToDuration(todayMs),
    weekLabel: msToDuration(weekMs),
  };
}

export async function fetchGuardHistory(
  userId: string,
  fromDate?: string,
  toDate?: string,
): Promise<AttendanceRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("attendance")
    .select("id, user_id, clock_in, clock_out")
    .eq("user_id", userId)
    .order("clock_in", { ascending: false })
    .limit(100);

  if (fromDate) {
    query = query.gte("clock_in", zonedDayRangeUtc(fromDate).start);
  }
  if (toDate) {
    query = query.lte("clock_in", zonedDayRangeUtc(toDate).end);
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function fetchAdminAttendance(filters: {
  guardId?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("attendance")
    .select(
      "id, user_id, clock_in, clock_out, profiles ( employee_id, full_name )",
    )
    .order("clock_in", { ascending: false })
    .limit(200);

  if (filters.guardId) {
    query = query.eq("user_id", filters.guardId);
  }
  if (filters.fromDate) {
    query = query.gte("clock_in", zonedDayRangeUtc(filters.fromDate).start);
  }
  if (filters.toDate) {
    query = query.lte("clock_in", zonedDayRangeUtc(filters.toDate).end);
  }

  const { data } = await query;
  return (data ?? []).map((row) => ({
    ...row,
    profiles: oneRelation(row.profiles),
  })) as AttendanceRow[];
}

export async function fetchAllGuards() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, employee_id, full_name, mobile, site_id, role, sites ( name )")
    .eq("role", "guard")
    .order("full_name");
  return data ?? [];
}

export async function fetchSites() {
  const supabase = await createClient();
  const { data } = await supabase.from("sites").select("id, name, address").order("name");
  return data ?? [];
}
