// Acesso a dados: Matrículas / Certificados
import { supabase } from "@/lib/supabase";

export interface Certificate {
  id: string;
  employeeName: string;
  courseTitle: string;
  completedAt: string | null;
  certificateUrl: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCertificate(row: any): Certificate {
  return {
    id: row.id,
    employeeName: row.employee?.name ?? "—",
    courseTitle: row.course?.title ?? "—",
    completedAt: row.completed_at,
    certificateUrl: row.certificate_url,
  };
}

/** Cursos concluídos (geram certificado). */
export async function listCertificates(): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from("enrollments")
    .select(
      "id, completed_at, certificate_url, employee:employees(name), course:courses(title)"
    )
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapCertificate);
}
