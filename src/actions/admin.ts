"use server";

import { revalidatePath } from "next/cache";
import { employeeIdToAuthEmail, normalizeMobile } from "@/lib/auth-email";
import { requireAdmin } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminActionState = {
  error?: string;
  success?: string;
};

export async function createGuard(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const employeeId = String(formData.get("employee_id") ?? "").trim().toUpperCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const mobileRaw = String(formData.get("mobile") ?? "").trim();
  const siteId = String(formData.get("site_id") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!employeeId || !fullName || !password) {
    return { error: "Employee ID, name, and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const mobile = mobileRaw ? normalizeMobile(mobileRaw) : null;
  if (mobile && mobile.length < 10) {
    return { error: "Enter a valid mobile number." };
  }

  let email: string;
  try {
    email = employeeIdToAuthEmail(employeeId);
  } catch {
    return { error: "Invalid employee ID format." };
  }

  const admin = createAdminClient();

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { employee_id: employeeId, full_name: fullName },
  });

  if (authError || !authUser.user) {
    return { error: authError?.message ?? "Could not create auth user." };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: authUser.user.id,
    employee_id: employeeId,
    full_name: fullName,
    mobile,
    site_id: siteId || null,
    role: "guard",
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(authUser.user.id);
    return { error: profileError.message };
  }

  revalidatePath("/admin");
  return { success: `Guard ${fullName} (${employeeId}) created.` };
}

export async function createSite(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!name) {
    return { error: "Site name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("sites").insert({
    name,
    address: address || null,
  });

  if (error) {
    return { error: "Could not create site." };
  }

  revalidatePath("/admin");
  return { success: "Site added." };
}
