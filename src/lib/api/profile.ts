// Acesso a dados: Perfil do usuário logado
import { supabase } from "@/lib/supabase";

export async function updateMyProfile(
  userId: string,
  fullName: string
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", userId);
  if (error) throw error;
}
