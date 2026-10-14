import { ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

type AppHeaderProps = {
  onDuty?: boolean;
  subtitle?: string;
};

export function AppHeader({ onDuty, subtitle = "Security Staff Time Tracker" }: AppHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-900 text-white shadow-sm">
          <ShieldCheck className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900">GuardHours</h1>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      {onDuty !== undefined ? <StatusBadge onDuty={onDuty} /> : null}
    </header>
  );
}
