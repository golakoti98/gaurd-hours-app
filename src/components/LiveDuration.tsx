"use client";

import { useEffect, useState } from "react";
import { msToDuration, shiftDurationMs } from "@/lib/time";

type LiveDurationProps = {
  clockIn: string;
  clockOut?: string | null;
  className?: string;
};

export function LiveDuration({ clockIn, clockOut, className }: LiveDurationProps) {
  const [label, setLabel] = useState(() =>
    msToDuration(shiftDurationMs(clockIn, clockOut ?? null)),
  );

  useEffect(() => {
    if (clockOut) {
      setLabel(msToDuration(shiftDurationMs(clockIn, clockOut)));
      return;
    }
    const tick = () => setLabel(msToDuration(shiftDurationMs(clockIn, null)));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [clockIn, clockOut]);

  return <span className={className}>{label}</span>;
}
