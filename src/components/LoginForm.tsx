"use client";

import { useActionState } from "react";
import { signIn, type AuthActionState } from "@/actions/auth";

const initial: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="identifier" className="mb-1 block text-sm font-medium text-gray-700">
          Employee ID or mobile number
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          required
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none ring-emerald-800 focus:ring-2"
          placeholder="e.g. GH1024 or 9876543210"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none ring-emerald-800 focus:ring-2"
        />
      </div>
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-emerald-900 py-3.5 text-base font-semibold text-white hover:bg-emerald-950 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
