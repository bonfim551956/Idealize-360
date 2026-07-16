// =============================================================
// Cliente Supabase — ponto único de conexão com o backend.
// As chaves vêm das variáveis de ambiente (arquivo .env).
// =============================================================
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Aviso claro no console caso o .env não tenha sido preenchido.
  console.warn(
    "[Supabase] Variáveis de ambiente ausentes. " +
      "Crie um arquivo .env a partir de .env.example e preencha " +
      "VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
