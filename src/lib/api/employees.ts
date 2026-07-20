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
  profileId: string | null; // login vinculado (null = sem acesso)
  // Minha Jornada
  careerLevel: string;
  careerNext: string;
  careerProgress: number;
  scoreGeral: number;
  scoreMes: number;
  rewardPoints: number;
  fatMedio: string;
  ticketMedio: string;
  conversao: string;
  ratePostura: number;
  rateApresentacao: number;
  ratePontualidade: number;
  rateCordialidade: number;
  ratePadrao: number;
}

const SELECT =
  "id, name, email, profile_id, hire_date, disc_profile, temperament, idealize_level, avatar, performance, trainings_completed, pending_feedbacks, career_level, career_next, career_progress, score_geral, score_mes, reward_points, fat_medio, ticket_medio, conversao, rate_postura, rate_apresentacao, rate_pontualidade, rate_cordialidade, rate_padrao, role:roles(id,name,department), unit:units(id,name,city,state)";

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
    profileId: row.profile_id ?? null,
    careerLevel: row.career_level ?? "",
    careerNext: row.career_next ?? "",
    careerProgress: row.career_progress ?? 0,
    scoreGeral: row.score_geral ?? 0,
    scoreMes: row.score_mes ?? 0,
    rewardPoints: row.reward_points ?? 0,
    fatMedio: row.fat_medio ?? "",
    ticketMedio: row.ticket_medio ?? "",
    conversao: row.conversao ?? "",
    ratePostura: row.rate_postura ?? 0,
    rateApresentacao: row.rate_apresentacao ?? 0,
    ratePontualidade: row.rate_pontualidade ?? 0,
    rateCordialidade: row.rate_cordialidade ?? 0,
    ratePadrao: row.rate_padrao ?? 0,
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

/** Busca a ficha de colaborador vinculada a um usuário (para a Minha Jornada). */
export async function getEmployeeByProfile(profileId: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from("employees")
    .select(SELECT)
    .eq("profile_id", profileId)
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
  // Minha Jornada (opcionais)
  career_level?: string | null;
  career_next?: string | null;
  career_progress?: number;
  score_geral?: number;
  score_mes?: number;
  reward_points?: number;
  fat_medio?: string | null;
  ticket_medio?: string | null;
  conversao?: string | null;
  rate_postura?: number;
  rate_apresentacao?: number;
  rate_pontualidade?: number;
  rate_cordialidade?: number;
  rate_padrao?: number;
}

export async function createEmployee(
  input: EmployeeInput,
  profileId?: string | null
): Promise<void> {
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    input.name || "novo"
  )}`;
  const { error } = await supabase
    .from("employees")
    .insert({ ...input, avatar, profile_id: profileId ?? null });
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

/** Vincula uma ficha de colaborador a um login (profile). */
export async function linkEmployeeProfile(
  employeeId: string,
  profileId: string
): Promise<void> {
  const { error } = await supabase
    .from("employees")
    .update({ profile_id: profileId })
    .eq("id", employeeId);
  if (error) throw error;
}
