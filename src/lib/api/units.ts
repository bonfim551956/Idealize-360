// Acesso a dados: Unidades
import { supabase } from "@/lib/supabase";

export interface Unit {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  manager: string | null;
}

export async function listUnits(): Promise<Unit[]> {
  const { data, error } = await supabase
    .from("units")
    .select("id, name, city, state, manager")
    .order("name");
  if (error) throw error;
  return data ?? [];
}
