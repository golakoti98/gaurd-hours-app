"use server";

import { revalidatePath } from "next/cache";
import { requireGuard } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export type AttendanceActionState = {
  error?: string;
  success?: string;
};

export async function clockIn(): Promise<AttendanceActionState> {
  const profile = await requireGuard();
  const supabase = await createClient();

  const { data: active } = await supabase
    .from("attendance")
    .select("id")
    .eq("user_id", profile.id)
    .is("clock_out", null)
    .maybeSingle();

  if (active) {
    return { error: "You already have an active shift. Clock out first." };
  }

  const { error } = await supabase.from("attendance").insert({
    user_id: profile.id,
    clock_in: new Date().toISOString(),
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You already have an active shift." };
    }
    return { error: "Could not clock in. Check your connection and try again." };
  }

  revalidatePath("/home");
  revalidatePath("/history");
  return { success: "Shift started." };
}

export async function clockOut(): Promise<AttendanceActionState> {
  const profile = await requireGuard();
  const supabase = await createClient();

  const { data: active, error: fetchError } = await supabase
    .from("attendance")
    .select("id, clock_in")
    .eq("user_id", profile.id)
    .is("clock_out", null)
    .maybeSingle();

  if (fetchError || !active) {
    return { error: "No active shift to clock out." };
  }

  const clockOut = new Date().toISOString();
  if (clockOut <= active.clock_in) {
    return { error: "Invalid clock out time." };
  }

  const { error } = await supabase
    .from("attendance")
    .update({ clock_out: clockOut })
    .eq("id", active.id)
    .is("clock_out", null);

  if (error) {
    return { error: "Could not clock out. Check your connection and try again." };
  }

  revalidatePath("/home");
  revalidatePath("/history");
  return { success: "Shift ended." };
}
