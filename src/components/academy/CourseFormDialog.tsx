// Diálogo de formulário de Curso (criar e editar).
import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  createCourse,
  updateCourse,
  type Course,
  type CourseInput,
} from "@/lib/api/courses";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  onSaved: () => void;
}

const PILLARS = ["Onboarding", "Vendas", "Técnico", "Cultura", "Gestão"];

const empty = {
  title: "",
  description: "",
  pillar: "Onboarding",
  target_role: "Todos",
  duration: "",
  thumbnail: "",
  mandatory: false,
};

export function CourseFormDialog({ open, onOpenChange, course, onSaved }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (course) {
      setForm({
        title: course.title,
        description: course.description,
        pillar: course.pillar || "Onboarding",
        target_role: course.role || "Todos",
        duration: course.duration,
        thumbnail: course.thumbnail,
        mandatory: course.mandatory,
      });
    } else {
      setForm(empty);
    }
  }, [open, course]);

  const set = (k: keyof typeof empty, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title.trim()) {
      toast({ title: "Informe o título do curso", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload: CourseInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      pillar: form.pillar,
      target_role: form.target_role.trim() || "Todos",
      duration: form.duration.trim(),
      thumbnail: form.thumbnail.trim(),
      mandatory: form.mandatory,
    };
    try {
      if (course) {
        await updateCourse(course.id, payload);
        toast({ title: "Curso atualizado!" });
      } else {
        await createCourse(payload);
        toast({ title: "Curso criado!" });
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{course ? "Editar curso" : "Novo curso"}</DialogTitle>
          <DialogDescription>Preencha as informações da trilha.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="c-title">Título *</Label>
            <Input id="c-title" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-desc">Descrição</Label>
            <Textarea
              id="c-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Pilar</Label>
              <Select value={form.pillar} onValueChange={(v) => set("pillar", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PILLARS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-role">Cargo-alvo</Label>
              <Input
                id="c-role"
                value={form.target_role}
                onChange={(e) => set("target_role", e.target.value)}
                placeholder="Todos ou um cargo"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-dur">Duração</Label>
              <Input id="c-dur" value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="Ex.: 4h" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-thumb">Imagem (URL)</Label>
              <Input id="c-thumb" value={form.thumbnail} onChange={(e) => set("thumbnail", e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="c-mand"
              checked={form.mandatory}
              onCheckedChange={(v) => set("mandatory", v)}
            />
            <Label htmlFor="c-mand">Curso obrigatório</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Salvando..." : course ? "Salvar" : "Criar curso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
