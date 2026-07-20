import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  createModule,
  updateModule,
  type CourseModule,
} from "@/lib/api/academy";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  courseId: string;
  module: CourseModule | null;
  nextPosition: number;
  onSaved: () => void;
}

export function ModuleFormDialog({
  open,
  onOpenChange,
  courseId,
  module,
  nextPosition,
  onSaved,
}: Props) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(module?.title ?? "");
      setDescription(module?.description ?? "");
    }
  }, [open, module]);

  async function handleSave() {
    if (!title.trim()) {
      toast({ title: "Dê um nome ao módulo.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (module) {
        await updateModule(module.id, {
          title: title.trim(),
          description: description.trim() || null,
        });
      } else {
        await createModule({
          course_id: courseId,
          title: title.trim(),
          description: description.trim() || null,
          position: nextPosition,
        });
      }
      toast({ title: module ? "Módulo atualizado." : "Módulo criado." });
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{module ? "Editar módulo" : "Novo módulo"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome do módulo</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Boas-vindas e cultura"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Um resumo do que este módulo cobre."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
