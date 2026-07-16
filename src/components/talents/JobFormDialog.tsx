// =============================================================
// Diálogo de formulário de Vaga (criar e editar).
// =============================================================
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { listUnits } from "@/lib/api/units";
import { listRoles } from "@/lib/api/roles";
import { createJob, updateJob, type Job, type JobInput } from "@/lib/api/jobs";

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: Job | null; // presente = edição
  onSaved: () => void;
}

const TIPOS = ["CLT", "PJ", "Estágio", "Temporário", "Freelancer"];
const STATUS = [
  { value: "open", label: "Aberta" },
  { value: "paused", label: "Pausada" },
  { value: "closed", label: "Fechada" },
];

const emptyForm = {
  title: "",
  unit_id: "",
  role_id: "",
  description: "",
  requirements: "",
  benefits: "",
  salary: "",
  type: "CLT",
  status: "open",
};

export function JobFormDialog({
  open,
  onOpenChange,
  job,
  onSaved,
}: JobFormDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data: units = [] } = useQuery({ queryKey: ["units"], queryFn: listUnits });
  const { data: roles = [] } = useQuery({ queryKey: ["roles"], queryFn: listRoles });

  // Ao abrir, preenche o formulário (com os dados da vaga, se for edição).
  useEffect(() => {
    if (!open) return;
    if (job) {
      setForm({
        title: job.title,
        unit_id: job.unit?.id ?? "",
        role_id: "",
        description: job.description,
        requirements: job.requirements.join("\n"),
        benefits: job.benefits.join("\n"),
        salary: job.salary,
        type: job.type || "CLT",
        status: job.status || "open",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, job]);

  const set = (key: keyof typeof emptyForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSave() {
    if (!form.title.trim()) {
      toast({
        title: "Preencha o título",
        description: "A vaga precisa de um título.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const payload: JobInput = {
      title: form.title.trim(),
      unit_id: form.unit_id || null,
      role_id: form.role_id || null,
      description: form.description.trim(),
      requirements: form.requirements
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      benefits: form.benefits
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      salary: form.salary.trim(),
      type: form.type,
      status: form.status,
    };

    try {
      if (job) {
        await updateJob(job.id, payload);
        toast({ title: "Vaga atualizada com sucesso!" });
      } else {
        await createJob(payload);
        toast({ title: "Vaga criada com sucesso!" });
      }
      onSaved();
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{job ? "Editar vaga" : "Nova vaga"}</DialogTitle>
          <DialogDescription>
            Preencha as informações da vaga. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex.: Consultor de Vendas"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select value={form.unit_id} onValueChange={(v) => set("unit_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select value={form.role_id} onValueChange={(v) => set("role_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Descreva a vaga e as responsabilidades..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="requirements">Requisitos (um por linha)</Label>
              <Textarea
                id="requirements"
                value={form.requirements}
                onChange={(e) => set("requirements", e.target.value)}
                placeholder={"Experiência em vendas\nBoa comunicação"}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="benefits">Benefícios (um por linha)</Label>
              <Textarea
                id="benefits"
                value={form.benefits}
                onChange={(e) => set("benefits", e.target.value)}
                placeholder={"Vale transporte\nPlano de saúde"}
                rows={4}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="salary">Salário</Label>
              <Input
                id="salary"
                value={form.salary}
                onChange={(e) => set("salary", e.target.value)}
                placeholder="R$ 2.500 - R$ 4.500"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : job ? "Salvar alterações" : "Criar vaga"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
