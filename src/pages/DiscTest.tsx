// =============================================================
// Página pública do Teste DISC (autosserviço via link).
// Aceita ?employee=<id> ou ?candidate=<id> para vincular a pessoa.
// =============================================================
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DiscQuestionnaire } from "@/components/disc/DiscQuestionnaire";
import { DiscResultView } from "@/components/disc/DiscResultView";
import { createAssessment } from "@/lib/api/disc";
import type { DiscAnswer, DiscResult } from "@/lib/disc";

export default function DiscTest() {
  const [params] = useSearchParams();
  const employeeId = params.get("employee");
  const candidateId = params.get("candidate");

  const { toast } = useToast();
  const [step, setStep] = useState<"intro" | "test" | "done">("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState(candidateId ? "candidato" : "colaborador");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<DiscResult | null>(null);

  function startTest() {
    if (!name.trim()) {
      toast({ title: "Informe seu nome", variant: "destructive" });
      return;
    }
    setStep("test");
  }

  async function handleComplete(answers: DiscAnswer[], res: DiscResult) {
    setSubmitting(true);
    try {
      await createAssessment({
        employee_id: employeeId,
        candidate_id: candidateId,
        respondent_name: name.trim(),
        respondent_email: email.trim() || null,
        respondent_type: type,
        primary_profile: res.primary,
        score_d: res.scores.D,
        score_i: res.scores.I,
        score_s: res.scores.S,
        score_c: res.scores.C,
        answers,
      });
      setResult(res);
      setStep("done");
    } catch (err) {
      toast({
        title: "Erro ao enviar",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4">
        {/* Cabeçalho */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary">
            <Brain className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-4xl">Teste de Perfil DISC</h1>
          <p className="mt-2 text-muted-foreground">Idealize 360º</p>
        </div>

        {step === "intro" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mx-auto max-w-lg">
              <CardHeader>
                <CardTitle>Antes de começar</CardTitle>
                <CardDescription>
                  São 24 grupos de palavras. Em cada um, escolha a que MAIS e a que MENOS
                  combinam com você. Leva cerca de 5 minutos. Não há respostas certas ou erradas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="d-name">Nome completo *</Label>
                  <Input id="d-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-email">E-mail</Label>
                  <Input id="d-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                {!employeeId && !candidateId && (
                  <div className="space-y-2">
                    <Label>Você é</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="colaborador">Colaborador(a)</SelectItem>
                        <SelectItem value="candidato">Candidato(a)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button className="w-full" onClick={startTest}>Começar o teste</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === "test" && (
          <DiscQuestionnaire onComplete={handleComplete} submitting={submitting} />
        )}

        {step === "done" && result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
            <DiscResultView result={result} />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Resultado registrado com sucesso. Você já pode fechar esta página. ✅
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
