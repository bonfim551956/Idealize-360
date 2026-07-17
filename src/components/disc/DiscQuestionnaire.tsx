// =============================================================
// Questionário DISC — responde grupo a grupo (mais / menos).
// =============================================================
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  DISC_GROUPS,
  computeDisc,
  type DiscAnswer,
  type DiscDim,
  type DiscResult,
} from "@/lib/disc";

interface Props {
  onComplete: (answers: DiscAnswer[], result: DiscResult) => void;
  submitting?: boolean;
}

export function DiscQuestionnaire({ onComplete, submitting }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<DiscAnswer[]>(
    DISC_GROUPS.map(() => ({ mais: null, menos: null }))
  );

  const total = DISC_GROUPS.length;
  const group = DISC_GROUPS[current];
  const answer = answers[current];
  const progress = ((current + (answer.mais && answer.menos ? 1 : 0)) / total) * 100;
  const isLast = current === total - 1;
  const canAdvance = !!answer.mais && !!answer.menos;

  function pick(kind: "mais" | "menos", dim: DiscDim) {
    setAnswers((prev) => {
      const copy = [...prev];
      const a = { ...copy[current] };
      // Não deixa mais e menos serem a mesma palavra.
      if (kind === "mais") {
        a.mais = a.mais === dim ? null : dim;
        if (a.menos === dim) a.menos = null;
      } else {
        a.menos = a.menos === dim ? null : dim;
        if (a.mais === dim) a.mais = null;
      }
      copy[current] = a;
      return copy;
    });
  }

  function next() {
    if (!canAdvance) return;
    if (isLast) {
      onComplete(answers, computeDisc(answers));
    } else {
      setCurrent((c) => c + 1);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Grupo {current + 1} de {total}
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <motion.div
        key={current}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-2xl border bg-card p-6 shadow-sm"
      >
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Marque a palavra que <strong className="text-primary">MAIS</strong> combina com você
          e a que <strong className="text-brand">MENOS</strong> combina.
        </p>

        {/* Cabeçalho */}
        <div className="mb-2 grid grid-cols-[1fr_auto_auto] items-center gap-3 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Palavra</span>
          <span className="w-14 text-center">Mais</span>
          <span className="w-14 text-center">Menos</span>
        </div>

        <div className="space-y-2">
          {group.map((word) => (
            <div
              key={word.dim}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border p-3"
            >
              <span className="font-medium">{word.text}</span>
              <button
                type="button"
                onClick={() => pick("mais", word.dim)}
                className={cn(
                  "flex h-9 w-14 items-center justify-center rounded-lg border-2 transition-colors",
                  answer.mais === word.dim
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                )}
                aria-label={`${word.text} mais`}
              >
                {answer.mais === word.dim && <Check className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => pick("menos", word.dim)}
                className={cn(
                  "flex h-9 w-14 items-center justify-center rounded-lg border-2 transition-colors",
                  answer.menos === word.dim
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border hover:border-brand/50"
                )}
                aria-label={`${word.text} menos`}
              >
                {answer.menos === word.dim && <Check className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={next} disabled={!canAdvance || submitting} className="gap-2">
          {isLast ? (submitting ? "Enviando..." : "Ver meu resultado") : "Próximo"}
          {!isLast && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
