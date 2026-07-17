// Acesso a dados: Avaliações DISC
import { supabase } from "@/lib/supabase";
import type { DiscDim } from "@/lib/disc";

export interface NewAssessment {
  employee_id?: string | null;
  candidate_id?: string | null;
  respondent_name: string;
  respondent_email?: string | null;
  respondent_type: string; // 'colaborador' | 'candidato'
  primary_profile: DiscDim;
  score_d: number;
  score_i: number;
  score_s: number;
  score_c: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers: any;
  applied_by?: string | null;
}

export async function createAssessment(input: NewAssessment): Promise<void> {
  const { error } = await supabase.from("disc_assessments").insert(input);
  if (error) throw error;

  // Tenta preencher o perfil DISC da pessoa (só funciona com sessão admin/RH).
  try {
    if (input.employee_id) {
      await supabase
        .from("employees")
        .update({ disc_profile: input.primary_profile })
        .eq("id", input.employee_id);
    } else if (input.candidate_id) {
      await supabase
        .from("candidates")
        .update({ disc_profile: input.primary_profile })
        .eq("id", input.candidate_id);
    }
  } catch {
    // Silencioso: no autosserviço sem login isso pode não ser permitido; tudo bem.
  }
}

export interface Assessment {
  id: string;
  respondentName: string;
  respondentType: string;
  primaryProfile: DiscDim;
  scores: Record<DiscDim, number>;
  linkedName: string | null;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAssessment(row: any): Assessment {
  return {
    id: row.id,
    respondentName: row.respondent_name ?? "—",
    respondentType: row.respondent_type ?? "",
    primaryProfile: row.primary_profile,
    scores: { D: row.score_d, I: row.score_i, S: row.score_s, C: row.score_c },
    linkedName: row.employee?.name ?? row.candidate?.name ?? null,
    createdAt: row.created_at,
  };
}

export async function listAssessments(): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from("disc_assessments")
    .select(
      "id, respondent_name, respondent_type, primary_profile, score_d, score_i, score_s, score_c, created_at, employee:employees(name), candidate:candidates(name)"
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapAssessment);
}
