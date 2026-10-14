import { AppHeader } from "@/components/AppHeader";
import { requireAdmin } from "@/lib/session";
import { signOut } from "@/actions/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div className="mx-auto min-h-full max-w-5xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <AppHeader subtitle="Admin dashboard" />
        <div className="flex items-center gap-2">
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
