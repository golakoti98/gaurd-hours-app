import { CalendarDays, Clock3 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { ClockActions } from "@/components/ClockActions";
import { LiveDuration } from "@/components/LiveDuration";
import { ShiftProgressBar } from "@/components/ShiftProgressBar";
import { fetchGuardHomeStats } from "@/lib/attendance-queries";
import { requireGuard } from "@/lib/session";
import { formatTime12h } from "@/lib/time";

export default async function HomePage() {
  const profile = await requireGuard();
  const stats = await fetchGuardHomeStats(profile.id);
  const onDuty = Boolean(stats.active);

  return (
    <div className="space-y-6">
      <AppHeader onDuty={onDuty} />

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Welcome back, {profile.full_name.split(" ")[0]}</p>
        <h2 className="mt-1 text-lg font-semibold text-gray-900">
          {onDuty ? "Your current shift" : "Ready for duty"}
        </h2>

        {onDuty && stats.active ? (
          <>
            <p className="mt-4 text-sm text-gray-500">Shift started at</p>
            <p className="text-3xl font-bold tracking-tight text-emerald-800">
              {formatTime12h(stats.active.clock_in)}
            </p>
            <p className="mt-4 text-sm text-gray-500">Today&apos;s working hours</p>
            <p className="text-2xl font-bold text-gray-900">
              <LiveDuration clockIn={stats.active.clock_in} />
            </p>
            <div className="mt-3">
              <ShiftProgressBar clockIn={stats.active.clock_in} active />
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-gray-500">Today&apos;s total hours</p>
            <p className="text-2xl font-bold text-gray-900">{stats.todayLabel}</p>
            <p className="mt-4 text-sm text-gray-600">
              Tap Clock In when your shift starts at{" "}
              {profile.sites?.name ?? "your assigned site"}.
            </p>
          </>
        )}

        <div className="mt-6">
          <ClockActions activeShiftId={stats.active?.id ?? null} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <Clock3 className="mb-2 h-5 w-5 text-gray-400" aria-hidden />
          <p className="text-xs text-gray-500">This week</p>
          <p className="text-lg font-bold text-gray-900">{stats.weekLabel}</p>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <CalendarDays className="mb-2 h-5 w-5 text-gray-400" aria-hidden />
          <p className="text-xs text-gray-500">Shifts logged</p>
          <p className="text-lg font-bold text-gray-900">{stats.weekDaysLogged} days</p>
        </article>
      </div>
    </div>
  );
}
