import { AppHeader } from "@/components/AppHeader";
import { HistoryFilters } from "@/components/HistoryFilters";
import { fetchGuardHistory } from "@/lib/attendance-queries";
import { requireGuard } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import {
  formatDateLabel,
  formatTime12h,
  monthRangeUtc,
  msToDuration,
  shiftDurationMs,
  sumAttendanceMs,
  weekRangeUtc,
  zonedTodayStr,
} from "@/lib/time";

type HistoryPageProps = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const profile = await requireGuard();
  const params = await searchParams;
  const from = params.from;
  const to = params.to;

  const rows = await fetchGuardHistory(profile.id, from, to);
  const totalMs = sumAttendanceMs(rows);

  const supabase = await createClient();
  const weekRange = weekRangeUtc();
  const monthRange = monthRangeUtc();
  const [{ data: weekRows }, { data: monthRows }] = await Promise.all([
    supabase
      .from("attendance")
      .select("clock_in, clock_out")
      .eq("user_id", profile.id)
      .gte("clock_in", weekRange.start)
      .lte("clock_in", weekRange.end),
    supabase
      .from("attendance")
      .select("clock_in, clock_out")
      .eq("user_id", profile.id)
      .gte("clock_in", monthRange.start)
      .lte("clock_in", monthRange.end),
  ]);

  return (
    <div className="space-y-6">
      <AppHeader subtitle="Hours history" />

      <HistoryFilters defaultFrom={from} defaultTo={to ?? zonedTodayStr()} />

      <div className="grid grid-cols-3 gap-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500">Filtered</p>
          <p className="text-base font-bold text-emerald-900">{msToDuration(totalMs)}</p>
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500">This week</p>
          <p className="text-base font-bold text-gray-900">
            {msToDuration(sumAttendanceMs(weekRows ?? []))}
          </p>
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500">This month</p>
          <p className="text-base font-bold text-gray-900">
            {msToDuration(sumAttendanceMs(monthRows ?? []))}
          </p>
        </section>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          No shifts found for this period. Adjust the dates or clock in from Home.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const duration = msToDuration(shiftDurationMs(row.clock_in, row.clock_out));
            const open = !row.clock_out;
            return (
              <li
                key={row.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{formatDateLabel(row.clock_in)}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatTime12h(row.clock_in)}
                      {" — "}
                      {open ? "In progress" : formatTime12h(row.clock_out!)}
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800">
                    {duration}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
