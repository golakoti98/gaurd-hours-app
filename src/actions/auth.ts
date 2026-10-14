"use server";

import { redirect } from "next/navigation";
import {
  employeeIdToAuthEmail,
  isLikelyMobile,
  normalizeMobile,
} from "@/lib/auth-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
};

export async function signIn(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    return { error: "Enter your employee ID or mobile number and password." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server configuration is incomplete. Contact your administrator." };
  }

  let employeeId: string | null = null;

  if (isLikelyMobile(identifier)) {
    const mobile = normalizeMobile(identifier);
    const { data: byMobile } = await admin
      .from("profiles")
      .select("employee_id")
      .eq("mobile", mobile)
      .maybeSingle();
    employeeId = byMobile?.employee_id ?? null;
  } else {
    const { data: byId } = await admin
      .from("profiles")
      .select("employee_id")
      .ilike("employee_id", identifier)
      .maybeSingle();
    employeeId = byId?.employee_id ?? null;
  }

  if (!employeeId) {
    return { error: "Account not found. Check your ID or mobile number." };
  }

  let email: string;
  try {
    email = employeeIdToAuthEmail(employeeId);
  } catch {
    return { error: "Invalid account configuration." };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: "Sign in failed. Check your credentials and try again." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("employee_id", employeeId)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }
  redirect("/home");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
