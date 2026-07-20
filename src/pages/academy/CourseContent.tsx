import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Video,
  FileText,
  AlignLeft,
  BookOpen,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCourse } from "@/lib/api/courses";
import {
  listModules,
  deleteModule,
  deleteLesson,
  type CourseModule,
  type Lesson,
} from "@/lib/api/academy";
import { ModuleFormDialog } from "@/components/academy/ModuleFormDialog";
import { LessonFormDialog } from "@/components/academy/LessonFormDialog";

const typeMeta: Record<Lesson["type"], { label: string; icon: typeof Video }> = {
  video: { label: "Vídeo", icon: Video },
  pdf: { label: "Material", icon: FileText },
  texto: { label: "Texto", icon: AlignLeft },
};

export default function CourseContent() {
  const { id } = useParams();
  const courseId = id as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId),
    enabled: !!courseId,
  });

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["modules", courseId],
    queryFn: () => listModules(courseId),
    enabled: !!courseId,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["modules", courseId] });

  // Diálogos de módulo
  const [moduleFormOpen, setModuleFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [deletingModule, setDeletingModule] = useState<CourseModule | null>(null);

  // Diálogos de aula
  const [lessonFormOpen, setLessonFormOpen] = useState(false);
  const [lessonModuleId, setLessonModuleId] = useState<string>("");
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  const openNewModule = () => {
    setEditingModule(null);
    setModuleFormOpen(true);
  };
  const openEditModule = (m: CourseModule) => {
    setEditingModule(m);
    setModuleFormOpen(true);
  };
  const openNewLesson = (moduleId: string) => {
    setLessonModuleId(moduleId);
    setEditingLesson(null);
    setLessonFormOpen(true);
  };
  const openEditLesson = (moduleId: string, lesson: Lesson) => {
    setLessonModuleId(moduleId);
    setEditingLesson(lesson);
    setLessonFormOpen(true);
  };

  async function confirmDeleteModule() {
    if (!deletingModule) return;
    try {
      await deleteModule(deletingModule.id);
      toast({ title: "Módulo excluído." });
      refresh();
    } catch (err) {
      toast({
        title: "Erro ao excluir",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingModule(null);
    }
  }

  async function confirmDeleteLesson() {
    if (!deletingLesson) return;
    try {
      await deleteLesson(deletingLesson.id);
      toast({ title: "Aula excluída." });
      refresh();
    } catch (err) {
      toast({
        title: "Erro ao excluir",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingLesson(null);
    }
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const editingModuleForLesson =
    modules.find((m) => m.id === lessonModuleId) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/academy/courses"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Gerenciar conteúdo</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {course?.title ?? "Curso"}
          </h1>
          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              {modules.length} módulos
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {totalLessons} aulas
            </span>
          </div>
        </div>
        <Button className="gap-2" onClick={openNewModule}>
          <Plus className="h-4 w-4" />
          Novo módulo
        </Button>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-muted-foreground">
          Carregando conteúdo...
        </div>
      )}

      {!isLoading && modules.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Layers className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum módulo ainda</h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              Organize o curso em módulos (ex.: "Boas-vindas", "Produtos",
              "Vendas") e adicione as aulas dentro de cada um. As aulas podem ser
              vídeo, material/PDF ou texto escrito.
            </p>
            <Button className="mt-6 gap-2" onClick={openNewModule}>
              <Plus className="h-4 w-4" />
              Criar primeiro módulo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de módulos */}
      <div className="space-y-4">
        {modules.map((module, mIndex) => (
          <Card key={module.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {mIndex + 1}
                </div>
                <div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  {module.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {module.lessons.length} aula(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEditModule(module)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setDeletingModule(module)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {module.lessons.map((lesson, lIndex) => {
                const meta = typeMeta[lesson.type] ?? typeMeta.video;
                const Icon = meta.icon;
                return (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {lIndex + 1}. {lesson.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {meta.label}
                        </Badge>
                        {lesson.duration && (
                          <span className="text-xs text-muted-foreground">
                            {lesson.duration}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditLesson(module.id, lesson)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeletingLesson(lesson)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => openNewLesson(module.id)}
              >
                <Plus className="h-4 w-4" />
                Adicionar aula
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diálogos */}
      <ModuleFormDialog
        open={moduleFormOpen}
        onOpenChange={setModuleFormOpen}
        courseId={courseId}
        module={editingModule}
        nextPosition={modules.length}
        onSaved={refresh}
      />
      <LessonFormDialog
        open={lessonFormOpen}
        onOpenChange={setLessonFormOpen}
        courseId={courseId}
        moduleId={lessonModuleId}
        lesson={editingLesson}
        nextPosition={editingModuleForLesson?.lessons.length ?? 0}
        onSaved={refresh}
      />

      {/* Exclusões */}
      <AlertDialog
        open={!!deletingModule}
        onOpenChange={(o) => !o && setDeletingModule(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir módulo?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deletingModule?.title}" e todas as suas aulas serão removidos
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteModule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deletingLesson}
        onOpenChange={(o) => !o && setDeletingLesson(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aula?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deletingLesson?.title}" será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLesson}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
