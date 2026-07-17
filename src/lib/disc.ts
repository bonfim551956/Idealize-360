// =============================================================
// Teste DISC — banco de palavras e cálculo do perfil.
// Formato clássico: em cada grupo de 4 palavras, o respondente
// escolhe a que MAIS combina e a que MENOS combina com ele.
// Cada palavra pertence a uma dimensão: D, I, S ou C.
// =============================================================

export type DiscDim = "D" | "I" | "S" | "C";

export interface DiscWord {
  text: string;
  dim: DiscDim;
}

// 24 grupos, cada um com 4 palavras (uma de cada dimensão).
export const DISC_GROUPS: DiscWord[][] = [
  [{ text: "Decidido", dim: "D" }, { text: "Comunicativo", dim: "I" }, { text: "Paciente", dim: "S" }, { text: "Preciso", dim: "C" }],
  [{ text: "Competitivo", dim: "D" }, { text: "Entusiasmado", dim: "I" }, { text: "Calmo", dim: "S" }, { text: "Analítico", dim: "C" }],
  [{ text: "Direto", dim: "D" }, { text: "Sociável", dim: "I" }, { text: "Leal", dim: "S" }, { text: "Detalhista", dim: "C" }],
  [{ text: "Ousado", dim: "D" }, { text: "Persuasivo", dim: "I" }, { text: "Colaborativo", dim: "S" }, { text: "Organizado", dim: "C" }],
  [{ text: "Determinado", dim: "D" }, { text: "Otimista", dim: "I" }, { text: "Tranquilo", dim: "S" }, { text: "Cauteloso", dim: "C" }],
  [{ text: "Exigente", dim: "D" }, { text: "Expressivo", dim: "I" }, { text: "Constante", dim: "S" }, { text: "Lógico", dim: "C" }],
  [{ text: "Assertivo", dim: "D" }, { text: "Animado", dim: "I" }, { text: "Prestativo", dim: "S" }, { text: "Sistemático", dim: "C" }],
  [{ text: "Corajoso", dim: "D" }, { text: "Extrovertido", dim: "I" }, { text: "Gentil", dim: "S" }, { text: "Metódico", dim: "C" }],
  [{ text: "Firme", dim: "D" }, { text: "Carismático", dim: "I" }, { text: "Ponderado", dim: "S" }, { text: "Disciplinado", dim: "C" }],
  [{ text: "Objetivo", dim: "D" }, { text: "Falante", dim: "I" }, { text: "Bom ouvinte", dim: "S" }, { text: "Criterioso", dim: "C" }],
  [{ text: "Autoconfiante", dim: "D" }, { text: "Espontâneo", dim: "I" }, { text: "Estável", dim: "S" }, { text: "Reservado", dim: "C" }],
  [{ text: "Líder", dim: "D" }, { text: "Caloroso", dim: "I" }, { text: "Confiável", dim: "S" }, { text: "Exato", dim: "C" }],
  [{ text: "Focado", dim: "D" }, { text: "Inspirador", dim: "I" }, { text: "Acolhedor", dim: "S" }, { text: "Cuidadoso", dim: "C" }],
  [{ text: "Enérgico", dim: "D" }, { text: "Popular", dim: "I" }, { text: "Sereno", dim: "S" }, { text: "Racional", dim: "C" }],
  [{ text: "Ambicioso", dim: "D" }, { text: "Convincente", dim: "I" }, { text: "Dedicado", dim: "S" }, { text: "Minucioso", dim: "C" }],
  [{ text: "Franco", dim: "D" }, { text: "Emotivo", dim: "I" }, { text: "Cordial", dim: "S" }, { text: "Planejador", dim: "C" }],
  [{ text: "Intenso", dim: "D" }, { text: "Criativo", dim: "I" }, { text: "Cooperativo", dim: "S" }, { text: "Rigoroso", dim: "C" }],
  [{ text: "Resoluto", dim: "D" }, { text: "Envolvente", dim: "I" }, { text: "Moderado", dim: "S" }, { text: "Correto", dim: "C" }],
  [{ text: "Independente", dim: "D" }, { text: "Alegre", dim: "I" }, { text: "Compreensivo", dim: "S" }, { text: "Prudente", dim: "C" }],
  [{ text: "Prático", dim: "D" }, { text: "Impulsivo", dim: "I" }, { text: "Discreto", dim: "S" }, { text: "Formal", dim: "C" }],
  [{ text: "Vencedor", dim: "D" }, { text: "Aberto", dim: "I" }, { text: "Equilibrado", dim: "S" }, { text: "Técnico", dim: "C" }],
  [{ text: "Dominante", dim: "D" }, { text: "Motivador", dim: "I" }, { text: "Amável", dim: "S" }, { text: "Meticuloso", dim: "C" }],
  [{ text: "Audacioso", dim: "D" }, { text: "Simpático", dim: "I" }, { text: "Diplomático", dim: "S" }, { text: "Perfeccionista", dim: "C" }],
  [{ text: "Rápido", dim: "D" }, { text: "Sorridente", dim: "I" }, { text: "Solidário", dim: "S" }, { text: "Ordeiro", dim: "C" }],
];

// Uma resposta por grupo: qual palavra é a "mais" e qual é a "menos".
export interface DiscAnswer {
  mais: DiscDim | null;
  menos: DiscDim | null;
}

export interface DiscResult {
  scores: Record<DiscDim, number>;
  primary: DiscDim;
  secondary: DiscDim;
}

// Cálculo: cada "mais" soma +1 na dimensão; cada "menos" subtrai 1.
// A dimensão com maior saldo é o perfil predominante.
export function computeDisc(answers: DiscAnswer[]): DiscResult {
  const scores: Record<DiscDim, number> = { D: 0, I: 0, S: 0, C: 0 };
  for (const a of answers) {
    if (a.mais) scores[a.mais] += 1;
    if (a.menos) scores[a.menos] -= 1;
  }
  const ordered = (Object.keys(scores) as DiscDim[]).sort(
    (a, b) => scores[b] - scores[a]
  );
  return { scores, primary: ordered[0], secondary: ordered[1] };
}
