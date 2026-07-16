// Acesso a dados: Cursos (Academy)
import { supabase } from "@/lib/supabase";

export interface Course {
  id: string;
  title: string;
  description: string;
  pillar: string;
  role: string; // cargo-alvo ("Todos" ou um cargo)
  duration: string;
  thumbnail: string;
  mandatory: boolean;
  lessons: number; // quantidade de aulas
  progress: number; // 0-100 (progresso do usuário; por ora 0 até ligarmos matrículas)
}

const SELECT =
  "id, title, description, pillar, target_role, duration, thumbnail, mandatory, lessons(count)";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCourse(row: any): Course {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    pillar: row.pillar ?? "",
    role: row.target_role ?? "Todos",
    duration: row.duration ?? "",
    thumbnail:
      row.thumbnail ||
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
    mandatory: !!row.mandatory,
    lessons: row.lessons?.[0]?.count ?? 0,
    progress: 0,
  };
}

export async function listCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select(SELECT)
    .order("title");
  if (error) throw error;
  return (data ?? []).map(mapCourse);
}

export async function getCourse(id: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from("courses")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCourse(data) : null;
}
