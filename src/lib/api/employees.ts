// Acesso a dados: Colaboradores
import { supabase } from "@/lib/supabase";

export interface EmployeeRole {
  id: string;
  name: string;
  department: string | null;
}
export interface EmployeeUnit {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole | null;
  unit: EmployeeUnit | null;
  hireDate: string | null;
  discProfile: string | null;
  temperament: string | null;
  idealizeLevel: string;
  avatar: string | null;
  performance: number;
  trainingsCompleted: number;
  pendingFeedbacks: number;
}

const SELECT =
  "id, name, email, hire_date, disc_profile, temperament, idealize_level, avatar, performance, trainings_completed, pending_feedbacks, role:roles(id,name,department), unit:units(id,name,city,state)";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEmployee(row: any): Employee {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    role: row.role ?? null,
    unit: row.unit ?? null,
    hireDate: row.hire_date,
    discProfile: row.disc_profile,
    temperament: row.temperament,
    idealizeLevel: row.idealize_level ?? "I",
    avatar: row.avatar,
    performance: row.performance ?? 0,
    trainingsCompleted: row.trainings_completed ?? 0,
    pendingFeedbacks: row.pending_feedbacks ?? 0,
  };
}

export async function listEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase.from("employees").select(SELECT).order("name");
  if (error) throw error;
  return (data ?? []).map(mapEmployee);
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from("employees")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapEmployee(data) : null;
}

export interface EmployeeInput {
  name: string;
  email: string | null;
  role_id: string | null;
  unit_id: string | null;
  hire_date: string | null;
  disc_profile: string | null;
  temperament: string | null;
  idealize_level: string;
  performance: number;
  trainings_completed: number;
}

export async function createEmployee(input: EmployeeInput): Promise<void> {
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    input.name || "novo"
  )}`;
  const { error } = await supabase.from("employees").insert({ ...input, avatar });
  if (error) throw error;
}

export async function updateEmployee(
  id: string,
  input: EmployeeInput
): Promise<void> {
  const { error } = await supabase.from("employees").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) throw error;
}
