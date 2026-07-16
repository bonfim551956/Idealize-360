// Acesso a dados: Avaliações de desempenho
import { supabase } from "@/lib/supabase";

export interface Evaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  score: number | null;
  strengths: string;
  improvements: string;
  comments: string;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEvaluation(row: any): Evaluation {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee?.name ?? "—",
    period: row.period ?? "",
    score: row.score,
    strengths: row.strengths ?? "",
    improvements: row.improvements ?? "",
    comments: row.comments ?? "",
    createdAt: row.created_at,
  };
}

export async function listEvaluations(): Promise<Evaluation[]> {
  const { data, error } = await supabase
    .from("evaluations")
    .select(
      "id, employee_id, period, score, strengths, improvements, comments, created_at, employee:employees(name)"
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapEvaluation);
}

export interface EvaluationInput {
  employee_id: string;
  period: string;
  score: number | null;
  strengths: string;
  improvements: string;
  comments: string;
}

export async function createEvaluation(input: EvaluationInput): Promise<void> {
  const { error } = await supabase.from("evaluations").insert(input);
  if (error) throw error;
}

export async function deleteEvaluation(id: string): Promise<void> {
  const { error } = await supabase.from("evaluations").delete().eq("id", id);
  if (error) throw error;
}
