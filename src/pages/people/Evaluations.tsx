import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ClipboardList, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { listEvaluations, createEvaluation } from "@/lib/api/evaluations";
import { listEmployees } from "@/lib/api/employees";

const empty = {
  employee_id: "",
  period: "",
  score: "",
  strengths: "",
  improvements: "",
  comments: "",
};

function scoreColor(score: number | null) {
  if (score === null) return "bg-muted text-muted-foreground";
  if (score >= 85) return "bg-success/10 text-success";
  if (score >= 70) return "bg-warning/10 text-warning";
  return "bg-destructive/10 text-destructive";
}

export default function Evaluations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ["evaluations"],
    queryFn: listEvaluations,
  });
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: listEmployees,
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(empty);
  }, [open]);

  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.employee_id) {
      toast({ title: "Selecione o colaborador", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createEvaluation({
        employee_id: form.employee_id,
        period: form.period.trim(),
        score: form.score ? Number(form.score) : null,
        strengths: form.strengths.trim(),
        improvements: form.improvements.trim(),
        comments: form.comments.trim(),
      });
      toast({ title: "Avaliação registrada!" });
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      setOpen(false);
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Avaliações</h1>
          <p className="text-muted-foreground">
            Avaliações de desempenho dos colaboradores
          </p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova avaliação
        </Button>
      </div>

      {isLoading && (
        <p className="py-10 text-center text-muted-foreground">Carregando avaliações...</p>
      )}

      {!isLoading && evaluations.length === 0 && (
        <div className="py-12 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma avaliação ainda</h3>
          <p className="mt-2 text-muted-foreground">
            Registre a primeira avaliação de desempenho.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {evaluations.map((ev, index) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {ev.employeeName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{ev.employeeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {ev.period || "Sem período"} •{" "}
                        {new Date(ev.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  {ev.score !== null && (
                    <Badge className={`gap-1 ${scoreColor(ev.score)}`}>
                      <Star className="h-3 w-3" />
                      {ev.score}%
                    </Badge>
                  )}
                </div>
                {(ev.strengths || ev.improvements || ev.comments) && (
                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                    {ev.strengths && (
                      <div>
                        <p className="font-medium text-success">Pontos fortes</p>
                        <p className="text-muted-foreground">{ev.strengths}</p>
                      </div>
                    )}
                    {ev.improvements && (
                      <div>
                        <p className="font-medium text-warning">A desenvolver</p>
                        <p className="text-muted-foreground">{ev.improvements}</p>
                      </div>
                    )}
                    {ev.comments && (
                      <div>
                        <p className="font-medium">Comentários</p>
                        <p className="text-muted-foreground">{ev.comments}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Nova avaliação</DialogTitle>
            <DialogDescription>
              Registre o desempenho de um colaborador.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Colaborador *</Label>
                <Select value={form.employee_id} onValueChange={(v) => set("employee_id", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-period">Período</Label>
                <Input
                  id="ev-period"
                  value={form.period}
                  onChange={(e) => set("period", e.target.value)}
                  placeholder="Ex.: 2026-1º semestre"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-score">Nota (0 a 100)</Label>
              <Input
                id="ev-score"
                type="number"
                min={0}
                max={100}
                value={form.score}
                onChange={(e) => set("score", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-strengths">Pontos fortes</Label>
              <Textarea
                id="ev-strengths"
                value={form.strengths}
                onChange={(e) => set("strengths", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-improvements">A desenvolver</Label>
              <Textarea
                id="ev-improvements"
                value={form.improvements}
                onChange={(e) => set("improvements", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-comments">Comentários</Label>
              <Textarea
                id="ev-comments"
                value={form.comments}
                onChange={(e) => set("comments", e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Salvando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
