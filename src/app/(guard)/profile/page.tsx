import { Building2, BadgeCheck, Phone, LogOut } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { requireGuard } from "@/lib/session";
import { signOut } from "@/actions/auth";

export default async function ProfilePage() {
  const profile = await requireGuard();

  return (
    <div className="space-y-6">
      <AppHeader subtitle="Your profile" />

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
        <p className="text-sm text-gray-500">Security guard</p>

        <dl className="mt-6 space-y-4">
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-800" aria-hidden />
            <div>
              <dt className="text-xs text-gray-500">Employee ID</dt>
              <dd className="font-semibold text-gray-900">{profile.employee_id}</dd>
            </div>
          </div>
          {profile.mobile ? (
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-emerald-800" aria-hidden />
              <div>
                <dt className="text-xs text-gray-500">Mobile</dt>
                <dd className="font-semibold text-gray-900">{profile.mobile}</dd>
              </div>
            </div>
          ) : null}
          <div className="flex items-start gap-3">
            <Building2 className="mt-0.5 h-5 w-5 text-emerald-800" aria-hidden />
            <div>
              <dt className="text-xs text-gray-500">Assigned site</dt>
              <dd className="font-semibold text-gray-900">
                {profile.sites?.name ?? "Not assigned"}
              </dd>
              {profile.sites?.address ? (
                <dd className="text-sm text-gray-500">{profile.sites.address}</dd>
              ) : null}
            </div>
          </div>
        </dl>
      </section>

      <form action={signOut}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-800 shadow-sm"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </button>
      </form>
    </div>
  );
}
