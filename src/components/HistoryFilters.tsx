"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";

type HistoryFiltersProps = {
  defaultFrom?: string;
  defaultTo?: string;
};

export function HistoryFilters({ defaultFrom, defaultTo }: HistoryFiltersProps) {
  const router = useRouter();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const from = String(fd.get("from") ?? "");
    const to = String(fd.get("to") ?? "");
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/history?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div>
        <label htmlFor="from" className="mb-1 block text-xs font-medium text-gray-500">
          From
        </label>
        <input
          id="from"
          name="from"
          type="date"
          defaultValue={defaultFrom}
          className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="to" className="mb-1 block text-xs font-medium text-gray-500">
          To
        </label>
        <input
          id="to"
          name="to"
          type="date"
          defaultValue={defaultTo}
          className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        className="col-span-2 rounded-xl bg-emerald-900 py-2.5 text-sm font-semibold text-white"
      >
        Apply filters
      </button>
    </form>
  );
}
