// Acesso a dados: Vagas
import { supabase } from "@/lib/supabase";

export interface JobUnit {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary: string;
  type: string;
  status: string;
  createdAt: string;
  unit: JobUnit | null;
  applications: number; // total de candidaturas nesta vaga
}

// Colunas + relacionamentos usados nas consultas de vaga.
const SELECT =
  "id, title, description, requirements, benefits, salary, type, status, created_at, unit:units(id,name,city,state), candidates(count)";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapJob(row: any): Job {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    requirements: row.requirements ?? [],
    benefits: row.benefits ?? [],
    salary: row.salary ?? "",
    type: row.type,
    status: row.status,
    createdAt: row.created_at,
    unit: row.unit ?? null,
    applications: row.candidates?.[0]?.count ?? 0,
  };
}

/** Todas as vagas (uso interno — painel). */
export async function listJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapJob);
}

/** Apenas vagas abertas (uso público — página de carreiras). */
export async function listOpenJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(SELECT)
    .eq("status", "open")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapJob);
}

/** Detalhe de uma vaga. */
export async function getJob(id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapJob(data) : null;
}
