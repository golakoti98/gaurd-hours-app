import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { oneRelation } from "@/lib/supabase/normalize";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getSessionUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, employee_id, full_name, mobile, site_id, role, sites ( id, name, address )")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return {
    ...data,
    sites: oneRelation(data.sites),
  } as Profile;
}

export async function requireProfile(): Promise<Profile> {
  if (!isSupabaseConfigured()) redirect("/login");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/home");
  return profile;
}

export async function requireGuard(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role === "admin") redirect("/admin");
  return profile;
}
