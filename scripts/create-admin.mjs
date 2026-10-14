/**
 * Bootstrap the first admin user (run once locally with service role key).
 *
 * Usage:
 *   node scripts/create-admin.mjs ADMIN001 "Admin Name" "SecurePass123!" "9876543210"
 */
import { createClient } from "@supabase/supabase-js";

const [employeeId, fullName, password, mobileArg] = process.argv.slice(2);

if (!employeeId || !fullName || !password) {
  console.error(
    "Usage: node scripts/create-admin.mjs <EMPLOYEE_ID> <FULL_NAME> <PASSWORD> [MOBILE]",
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const normalizedId = employeeId.trim().toUpperCase();
const email = `${normalizedId.toLowerCase().replace(/[^a-z0-9]/g, "")}@guardhours.internal`;
const mobile = mobileArg ? mobileArg.replace(/\D/g, "") : null;

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: authUser, error: authError } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { employee_id: normalizedId, full_name: fullName },
});

if (authError || !authUser.user) {
  console.error("Auth error:", authError?.message);
  process.exit(1);
}

const { error: profileError } = await admin.from("profiles").insert({
  id: authUser.user.id,
  employee_id: normalizedId,
  full_name: fullName,
  mobile,
  role: "admin",
});

if (profileError) {
  await admin.auth.admin.deleteUser(authUser.user.id);
  console.error("Profile error:", profileError.message);
  process.exit(1);
}

console.log(`Admin created: ${fullName} (${normalizedId})`);
console.log(`Sign in with employee ID "${normalizedId}" and your password.`);
