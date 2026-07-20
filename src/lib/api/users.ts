// Acesso a dados: Usuários do sistema (perfis)
import { supabase, makeSignupClient } from "@/lib/supabase";
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

/**
 * Cria uma conta de acesso (login) para outra pessoa, sem afetar a
 * sessão do admin logado. Retorna o id do novo usuário.
 * Usa um cliente secundário descartável.
 */
export async function createUserAccount(
  email: string,
  password: string,
  fullName: string
): Promise<string> {
  const client = makeSignupClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  if (!data.user) throw new Error("Não foi possível criar o login.");
  return data.user.id;
}

/** Ajusta nível de acesso e unidade de um perfil (uso do admin). */
export async function setProfileAccessAndUnit(
  id: string,
  access_level: NivelAcesso,
  unit_id: string | null
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ access_level, unit_id })
    .eq("id", id);
  if (error) throw error;
}
