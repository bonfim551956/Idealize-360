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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  createLesson,
  updateLesson,
  type Lesson,
  type LessonType,
} from "@/lib/api/academy";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  courseId: string;
  moduleId: string;
  lesson: Lesson | null;
  nextPosition: number;
  onSaved: () => void;
}

export function LessonFormDialog({
  open,
  onOpenChange,
  courseId,
  moduleId,
  lesson,
  nextPosition,
  onSaved,
}: Props) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<LessonType>("video");
  const [link, setLink] = useState("");
  const [content, setContent] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(lesson?.title ?? "");
      setType((lesson?.type as LessonType) ?? "video");
      setLink(lesson?.link ?? "");
      setContent(lesson?.content ?? "");
      setDuration(lesson?.duration ?? "");
    }
  }, [open, lesson]);

  async function handleSave() {
    if (!title.trim()) {
      toast({ title: "Dê um título à aula.", variant: "destructive" });
      return;
    }
    if ((type === "video" || type === "pdf") && !link.trim()) {
      toast({
        title: type === "video" ? "Informe o link do vídeo." : "Informe o link do material.",
        variant: "destructive",
      });
      return;
    }
    if (type === "texto" && !content.trim()) {
      toast({ title: "Escreva o conteúdo da aula.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        type,
        link: type === "texto" ? null : link.trim() || null,
        content: type === "texto" ? content.trim() : null,
        duration: duration.trim() || null,
      };
      if (lesson) {
        await updateLesson(lesson.id, payload);
      } else {
        await createLesson({
          module_id: moduleId,
          course_id: courseId,
          position: nextPosition,
          ...payload,
        });
      }
      toast({ title: lesson ? "Aula atualizada." : "Aula criada." });
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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lesson ? "Editar aula" : "Nova aula"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Título da aula</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Como abordar o cliente"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de aula</Label>
              <Select value={type} onValueChange={(v) => setType(v as LessonType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vídeo (link)</SelectItem>
                  <SelectItem value="pdf">Material / PDF (link)</SelectItem>
                  <SelectItem value="texto">Texto escrito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duração (opcional)</Label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex.: 12 min"
              />
            </div>
          </div>

          {type !== "texto" ? (
            <div className="space-y-2">
              <Label>
                {type === "video" ? "Link do vídeo" : "Link do material / PDF"}
              </Label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={
                  type === "video"
                    ? "https://youtube.com/watch?v=..."
                    : "https://... (PDF, Drive, etc.)"
                }
              />
              <p className="text-xs text-muted-foreground">
                {type === "video"
                  ? "Cole o link do YouTube, Vimeo ou de qualquer vídeo."
                  : "Cole o link do PDF ou material (Google Drive, etc.)."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva aqui o conteúdo da aula..."
                rows={8}
              />
            </div>
          )}
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
