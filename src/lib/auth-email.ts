/** Maps employee ID to the Supabase Auth email (internal, not shown to users). */
export function employeeIdToAuthEmail(employeeId: string): string {
  const normalized = employeeId.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!normalized) {
    throw new Error("Invalid employee ID");
  }
  return `${normalized}@guardhours.internal`;
}

export function normalizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, "");
}

export function isLikelyMobile(identifier: string): boolean {
  const digits = normalizeMobile(identifier);
  return digits.length >= 10;
}
