// Exibição do resultado DISC (perfil + barras por dimensão).
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DiscDim, DiscResult } from "@/lib/disc";
import { discProfiles } from "@/lib/mock-data";

const DIMS: { key: DiscDim; label: string; color: string }[] = [
  { key: "D", label: "Dominância", color: "bg-destructive" },
  { key: "I", label: "Influência", color: "bg-brand" },
  { key: "S", label: "Estabilidade", color: "bg-primary" },
  { key: "C", label: "Conformidade", color: "bg-info" },
];

export function DiscResultView({ result }: { result: DiscResult }) {
  const primary = discProfiles[result.primary];
  const secondary = discProfiles[result.secondary];

  // Normaliza as barras (0-100) com base no maior valor absoluto.
  const max = Math.max(1, ...DIMS.map((d) => Math.abs(result.scores[d.key])));

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-hero p-8 text-center text-primary-foreground">
          <p className="text-sm uppercase tracking-wide opacity-90">Seu perfil predominante</p>
          <div className="mt-2 font-serif text-6xl">{result.primary}</div>
          <h2 className="mt-1 text-2xl font-bold">{primary?.name}</h2>
          <p className="mx-auto mt-2 max-w-md opacity-90">{primary?.description}</p>
        </div>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Perfil de apoio: <strong>{result.secondary} — {secondary?.name}</strong>.{" "}
            {secondary?.description}.
          </p>

          <div className="mt-6 space-y-4">
            {DIMS.map((d, i) => {
              const val = result.scores[d.key];
              const pct = (Math.abs(val) / max) * 100;
              return (
                <motion.div
                  key={d.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {d.key} · {d.label}
                    </span>
                    <span className="text-muted-foreground">{val}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${d.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {DIMS.map((d) => (
              <Badge
                key={d.key}
                variant={d.key === result.primary ? "default" : "outline"}
              >
                {d.key}: {result.scores[d.key]}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
