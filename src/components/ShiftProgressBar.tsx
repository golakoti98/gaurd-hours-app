"use client";

import { useEffect, useState } from "react";
import { shiftDurationMs } from "@/lib/time";

/** Visual hint: progress toward a 8h reference shift (not a hard limit). */
const REFERENCE_SHIFT_MS = 8 * 60 * 60 * 1000;

type ShiftProgressBarProps = {
  clockIn: string;
  active: boolean;
};

export function ShiftProgressBar({ clockIn, active }: ShiftProgressBarProps) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!active) {
      setPct(0);
      return;
    }
    const tick = () => {
      const ms = shiftDurationMs(clockIn, null);
      setPct(Math.min(100, (ms / REFERENCE_SHIFT_MS) * 100));
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [clockIn, active]);

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full bg-emerald-700 transition-all duration-500"
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
