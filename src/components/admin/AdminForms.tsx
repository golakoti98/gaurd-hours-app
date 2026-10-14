"use client";

import { useActionState } from "react";
import { createGuard, createSite, type AdminActionState } from "@/actions/admin";

const initial: AdminActionState = {};

type AdminFormsProps = {
  sites: { id: string; name: string }[];
};

export function AdminForms({ sites }: AdminFormsProps) {
  const [guardState, guardAction, guardPending] = useActionState(createGuard, initial);
  const [siteState, siteAction, sitePending] = useActionState(createSite, initial);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form
        action={guardAction}
        className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <h3 className="font-semibold text-gray-900">Add guard</h3>
        <input
          name="employee_id"
          required
          placeholder="Employee ID"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          name="full_name"
          required
          placeholder="Full name"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          name="mobile"
          placeholder="Mobile (optional)"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <select
          name="site_id"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="">No site</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Temporary password"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        {guardState.error ? (
          <p className="text-sm text-red-600" role="alert">
            {guardState.error}
          </p>
        ) : null}
        {guardState.success ? (
          <p className="text-sm text-emerald-700" role="status">
            {guardState.success}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={guardPending}
          className="w-full rounded-xl bg-emerald-900 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {guardPending ? "Creating…" : "Create guard"}
        </button>
      </form>

      <form
        action={siteAction}
        className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <h3 className="font-semibold text-gray-900">Add site</h3>
        <input
          name="name"
          required
          placeholder="Site name"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          name="address"
          placeholder="Address (optional)"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        {siteState.error ? (
          <p className="text-sm text-red-600" role="alert">
            {siteState.error}
          </p>
        ) : null}
        {siteState.success ? (
          <p className="text-sm text-emerald-700" role="status">
            {siteState.success}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={sitePending}
          className="w-full rounded-xl bg-emerald-900 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {sitePending ? "Saving…" : "Create site"}
        </button>
      </form>
    </div>
  );
}
