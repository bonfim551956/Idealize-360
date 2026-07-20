// Acesso a dados: Agenda de eventos (calendário da Jornada)
import { supabase } from "@/lib/supabase";

export interface AgendaEvent {
  id: string;
  employeeId: string;
  date: string;
  title: string;
  type: string;
}

export const EVENT_TYPES: Record<string, { label: string; color: string }> = {
  reuniao: { label: "Reunião mensal", color: "bg-primary" },
  feedback_vendas: { label: "Feedback de vendas", color: "bg-brand" },
  feedback_dom: { label: "Feedback DOM", color: "bg-info" },
  treinamento: { label: "Treinamento", color: "bg-warning" },
  outro: { label: "Outro", color: "bg-muted-foreground" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEvent(row: any): AgendaEvent {
  return {
    id: row.id,
    employeeId: row.employee_id,
    date: row.event_date,
    title: row.title,
    type: row.type ?? "outro",
  };
}

export async function listAgenda(employeeId: string): Promise<AgendaEvent[]> {
  const { data, error } = await supabase
    .from("agenda_events")
    .select("id, employee_id, event_date, title, type")
    .eq("employee_id", employeeId)
    .order("event_date");
  if (error) throw error;
  return (data ?? []).map(mapEvent);
}

export async function createAgendaEvent(input: {
  employee_id: string;
  event_date: string;
  title: string;
  type: string;
}): Promise<void> {
  const { error } = await supabase.from("agenda_events").insert(input);
  if (error) throw error;
}

export async function deleteAgendaEvent(id: string): Promise<void> {
  const { error } = await supabase.from("agenda_events").delete().eq("id", id);
  if (error) throw error;
}
