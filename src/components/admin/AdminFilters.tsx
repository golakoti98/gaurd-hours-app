"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";

type GuardOption = { id: string; full_name: string; employee_id: string };

type AdminFiltersProps = {
  guards: GuardOption[];
  defaultGuardId?: string;
  defaultFrom?: string;
  defaultTo?: string;
};

export function AdminFilters({
  guards,
  defaultGuardId,
  defaultFrom,
  defaultTo,
}: AdminFiltersProps) {
  const router = useRouter();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const guard = String(fd.get("guard") ?? "");
    const from = String(fd.get("from") ?? "");
    const to = String(fd.get("to") ?? "");
    if (guard) params.set("guard", guard);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/admin?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-4"
    >
      <div className="md:col-span-2">
        <label htmlFor="guard" className="mb-1 block text-xs text-gray-500">
          Guard
        </label>
        <select
          id="guard"
          name="guard"
          defaultValue={defaultGuardId ?? ""}
          className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
        >
          <option value="">All guards</option>
          {guards.map((g) => (
            <option key={g.id} value={g.id}>
              {g.full_name} ({g.employee_id})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="from" className="mb-1 block text-xs text-gray-500">
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
        <label htmlFor="to" className="mb-1 block text-xs text-gray-500">
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
        className="md:col-span-4 rounded-xl bg-emerald-900 py-2.5 text-sm font-semibold text-white"
      >
        Apply filters
      </button>
    </form>
  );
}
