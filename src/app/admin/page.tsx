import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminForms } from "@/components/admin/AdminForms";
import {
  fetchAdminAttendance,
  fetchAllGuards,
  fetchSites,
} from "@/lib/attendance-queries";
import {
  formatDateLabel,
  formatTime12h,
  msToDuration,
  shiftDurationMs,
  sumAttendanceMs,
  zonedTodayStr,
} from "@/lib/time";

type AdminPageProps = {
  searchParams: Promise<{ guard?: string; from?: string; to?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const guards = await fetchAllGuards();
  const sites = await fetchSites();
  const rows = await fetchAdminAttendance({
    guardId: params.guard,
    fromDate: params.from,
    toDate: params.to,
  });
  const totalMs = sumAttendanceMs(rows);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">Filtered total hours</p>
        <p className="text-3xl font-bold text-emerald-900">{msToDuration(totalMs)}</p>
        <p className="mt-1 text-sm text-gray-500">{guards.length} guards registered</p>
      </section>

      <AdminFilters
        guards={guards.map((g) => ({
          id: g.id,
          full_name: g.full_name,
          employee_id: g.employee_id,
        }))}
        defaultGuardId={params.guard}
        defaultFrom={params.from}
        defaultTo={params.to ?? zonedTodayStr()}
      />

      <AdminForms sites={sites.map((s) => ({ id: s.id, name: s.name }))} />

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Attendance records</h2>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            No attendance records match these filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Guard</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">In</th>
                  <th className="px-4 py-3">Out</th>
                  <th className="px-4 py-3">Hours</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.profiles?.full_name ?? "—"}
                      <span className="block text-xs text-gray-500">
                        {row.profiles?.employee_id}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatDateLabel(row.clock_in)}</td>
                    <td className="px-4 py-3">{formatTime12h(row.clock_in)}</td>
                    <td className="px-4 py-3">
                      {row.clock_out ? formatTime12h(row.clock_out) : "Active"}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {msToDuration(shiftDurationMs(row.clock_in, row.clock_out))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
