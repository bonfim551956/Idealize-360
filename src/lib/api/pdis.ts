// Acesso a dados: PDIs (Plano de Desenvolvimento Individual)
import { supabase } from "@/lib/supabase";

export interface Pdi {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  status: string; // em_andamento | concluido | atrasado
  dueDate: string | null;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPdi(row: any): Pdi {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee?.name ?? "—",
    title: row.title,
    description: row.description ?? "",
    status: row.status ?? "em_andamento",
    dueDate: row.due_date,
    createdAt: row.created_at,
  };
}

export async function listPdis(): Promise<Pdi[]> {
  const { data, error } = await supabase
    .from("pdis")
    .select(
      "id, employee_id, title, description, status, due_date, created_at, employee:employees(name)"
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPdi);
}

export interface PdiInput {
  employee_id: string;
  title: string;
  description: string;
  status: string;
  due_date: string | null;
}

export async function createPdi(input: PdiInput): Promise<void> {
  const { error } = await supabase.from("pdis").insert(input);
  if (error) throw error;
}

export async function updatePdiStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from("pdis").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deletePdi(id: string): Promise<void> {
  const { error } = await supabase.from("pdis").delete().eq("id", id);
  if (error) throw error;
}
