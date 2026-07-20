// =============================================================
// Acesso a dados: Conteúdo da Academy (Módulos e Aulas)
// Estrutura: Curso → Módulos → Aulas
// Tipo de aula: 'video' (link) | 'pdf' (link) | 'texto' (conteúdo escrito)
// =============================================================
import { supabase } from "@/lib/supabase";

export type LessonType = "video" | "pdf" | "texto";

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  type: LessonType;
  link: string | null;      // URL do vídeo ou do material (para video/pdf)
  content: string | null;   // texto escrito (para type = 'texto')
  duration: string | null;
  position: number;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  lessons: Lesson[];
}

// ------------------------------------------------------------------
// Leitura — todos os módulos de um curso, já com as aulas ordenadas
// ------------------------------------------------------------------
export async function listModules(courseId: string): Promise<CourseModule[]> {
  const { data: modules, error } = await supabase
    .from("course_modules")
    .select("id, course_id, title, description, position")
    .eq("course_id", courseId)
    .order("position");
  if (error) throw error;

  const mods = (modules ?? []) as Omit<CourseModule, "lessons">[];
  if (mods.length === 0) return [];

  const { data: lessons, error: lErr } = await supabase
    .from("lessons")
    .select("id, module_id, title, type, link, content, duration, position")
    .in(
      "module_id",
      mods.map((m) => m.id)
    )
    .order("position");
  if (lErr) throw lErr;

  const byModule = new Map<string, Lesson[]>();
  for (const l of (lessons ?? []) as Lesson[]) {
    if (!l.module_id) continue;
    const arr = byModule.get(l.module_id) ?? [];
    arr.push(l);
    byModule.set(l.module_id, arr);
  }

  return mods.map((m) => ({ ...m, lessons: byModule.get(m.id) ?? [] }));
}

// ------------------------------------------------------------------
// Módulos — CRUD
// ------------------------------------------------------------------
export interface ModuleInput {
  course_id: string;
  title: string;
  description?: string | null;
  position?: number;
}

export async function createModule(input: ModuleInput): Promise<void> {
  const { error } = await supabase.from("course_modules").insert(input);
  if (error) throw error;
}

export async function updateModule(
  id: string,
  input: Partial<ModuleInput>
): Promise<void> {
  const { error } = await supabase
    .from("course_modules")
    .update(input)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteModule(id: string): Promise<void> {
  const { error } = await supabase.from("course_modules").delete().eq("id", id);
  if (error) throw error;
}

// ------------------------------------------------------------------
// Aulas — CRUD
// ------------------------------------------------------------------
export interface LessonInput {
  module_id: string;
  course_id: string; // mantido para compatibilidade com a coluna course_id de lessons
  title: string;
  type: LessonType;
  link?: string | null;
  content?: string | null;
  duration?: string | null;
  position?: number;
}

export async function createLesson(input: LessonInput): Promise<void> {
  const { error } = await supabase.from("lessons").insert(input);
  if (error) throw error;
}

export async function updateLesson(
  id: string,
  input: Partial<LessonInput>
): Promise<void> {
  const { error } = await supabase.from("lessons").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteLesson(id: string): Promise<void> {
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw error;
}
