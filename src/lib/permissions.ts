// =============================================================
// Permissões por nível de acesso.
// =============================================================
import type { NivelAcesso } from "@/contexts/AuthContext";

// Grupos de conveniência
export const MANAGERS: NivelAcesso[] = ["admin", "rh", "gestor"];
export const ADMINS: NivelAcesso[] = ["admin", "rh"];
export const EVERYONE: NivelAcesso[] = [
  "admin",
  "rh",
  "gestor",
  "colaborador",
  "candidato",
];

/** Verifica se um nível tem acesso, dada uma lista de permitidos.
 *  allow indefinido = liberado para todos os autenticados. */
export function hasAccess(
  level: NivelAcesso | undefined | null,
  allow?: NivelAcesso[]
): boolean {
  if (!allow) return true;
  if (!level) return false;
  return allow.includes(level);
}
