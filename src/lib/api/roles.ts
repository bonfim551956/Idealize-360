// Acesso a dados: Cargos
import { supabase } from "@/lib/supabase";

export interface Role {
  id: string;
  name: string;
  department: string | null;
}

export async function listRoles(): Promise<Role[]> {
  const { data, error } = await supabase
    .from("roles")
    .select("id, name, department")
    .order("name");
  if (error) throw error;
  return data ?? [];
}
