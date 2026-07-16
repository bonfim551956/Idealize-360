// Acesso a dados: Candidatos
import { supabase } from "@/lib/supabase";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  discProfile: string | null;
  temperament: string | null;
  appliedAt: string;
  jobId: string | null;
  unitId: string | null;
  jobTitle: string;
  notes: string;
  resumeUrl: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCandidate(row: any): Candidate {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    status: row.status,
    discProfile: row.disc_profile,
    temperament: row.temperament,
    appliedAt: row.applied_at,
    jobId: row.job_id,
    unitId: row.unit_id,
    jobTitle: row.job?.title ?? "N/A",
    notes: row.notes ?? "",
    resumeUrl: row.resume_url,
  };
}

/** Lista todos os candidatos (painel RH). */
export async function listCandidates(): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from("candidates")
    .select(
      "id, name, email, phone, status, disc_profile, temperament, applied_at, job_id, unit_id, notes, resume_url, job:jobs(title)"
    )
    .order("applied_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapCandidate);
}

export interface NewApplication {
  name: string;
  email: string;
  phone: string;
  jobId: string;
  unitId?: string | null;
  notes?: string;
  resumeUrl?: string | null;
}

/** Cria uma nova candidatura (formulário público). */
export async function createApplication(input: NewApplication): Promise<void> {
  const { error } = await supabase.from("candidates").insert({
    name: input.name,
    email: input.email,
    phone: input.phone,
    job_id: input.jobId,
    unit_id: input.unitId ?? null,
    notes: input.notes ?? null,
    resume_url: input.resumeUrl ?? null,
    status: "new",
  });
  if (error) throw error;
}

/** Atualiza a etapa (status) de um candidato no funil. */
export async function updateCandidateStatus(
  id: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from("candidates")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
