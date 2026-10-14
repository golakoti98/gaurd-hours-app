"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { clockIn, clockOut, type AttendanceActionState } from "@/actions/attendance";

type ClockActionsProps = {
  activeShiftId: string | null;
};

export function ClockActions({ activeShiftId }: ClockActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(
    null,
  );

  function run(action: () => Promise<AttendanceActionState>) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setFeedback({ text: result.error, isError: true });
      } else if (result.success) {
        setFeedback({ text: result.success, isError: false });
        router.refresh();
      }
    });
  }

  const onDuty = Boolean(activeShiftId);

  return (
    <div className="space-y-2">
      {onDuty ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(clockOut)}
          className="w-full rounded-2xl bg-red-600 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Clock Out"}
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(clockIn)}
          className="w-full rounded-2xl bg-emerald-800 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Clock In"}
        </button>
      )}
      {feedback ? (
        <p
          className={`text-center text-sm ${feedback.isError ? "text-red-600" : "text-emerald-700"}`}
          role={feedback.isError ? "alert" : "status"}
        >
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}
