import { AppHeader } from "@/components/AppHeader";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-4 py-10">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-8">
          <AppHeader />
        </div>
        <h2 className="mb-1 text-xl font-semibold text-gray-900">Sign in</h2>
        <p className="mb-6 text-sm text-gray-500">
          Use your employee ID or registered mobile number.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
