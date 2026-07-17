// Acesso a dados: Usuários do sistema (perfis)
import { supabase } from "@/lib/supabase";
import type { NivelAcesso } from "@/contexts/AuthContext";

export interface AppUser {
  id: string;
  full_name: string | null;
  email: string | null;
  access_level: NivelAcesso;
  unit_id: string | null;
  created_at: string;
}

export async function listProfiles(): Promise<AppUser[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, access_level, unit_id, created_at")
    .order("full_name");
  if (error) throw error;
  return (data ?? []) as AppUser[];
}

export async function updateAccessLevel(
  id: string,
  access_level: NivelAcesso
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ access_level })
    .eq("id", id);
  if (error) throw error;
}
