export type UserRole = "guard" | "admin";

export type Site = {
  id: string;
  name: string;
  address: string | null;
};

export type Profile = {
  id: string;
  employee_id: string;
  full_name: string;
  mobile: string | null;
  site_id: string | null;
  role: UserRole;
  sites: Site | null;
};

export type AttendanceRow = {
  id: string;
  user_id: string;
  clock_in: string;
  clock_out: string | null;
  profiles?: Pick<Profile, "employee_id" | "full_name"> | null;
};
