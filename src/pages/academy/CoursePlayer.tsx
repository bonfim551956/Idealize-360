import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Video,
  FileText,
  AlignLeft,
  ExternalLink,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { getCourse } from "@/lib/api/courses";
import { listModules, type Lesson } from "@/lib/api/academy";

// Aula "achatada" com a referência do módulo, para navegação linear.
interface FlatLesson extends Lesson {
  moduleTitle: string;
  moduleIndex: number;
}

const typeIcon: Record<Lesson["type"], typeof Video> = {
  video: Video,
  pdf: FileText,
  texto: AlignLeft,
};

// Converte links do YouTube/Vimeo em URL "embed" para tocar dentro da página.
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    if (host === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (host.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
    if (host.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

export default function CoursePlayer() {
  const { id } = useParams();
  const courseId = id as string;

  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId),
    enabled: !!courseId,
  });

  const { data: modules = [], isLoading: loadingModules } = useQuery({
    queryKey: ["modules", courseId],
    queryFn: () => listModules(courseId),
    enabled: !!courseId,
  });

  // Achata todas as aulas mantendo a ordem dos módulos.
  const flatLessons = useMemo<FlatLesson[]>(() => {
    const out: FlatLesson[] = [];
    modules.forEach((m, mIndex) => {
      m.lessons.forEach((l) =>
        out.push({ ...l, moduleTitle: m.title, moduleIndex: mIndex })
      );
    });
    return out;
  }, [modules]);

  const [currentId, setCurrentId] = useState<string | null>(null);
  const current =
    flatLessons.find((l) => l.id === currentId) ?? flatLessons[0] ?? null;
  const currentIndex = current
    ? flatLessons.findIndex((l) => l.id === current.id)
    : -1;

  const isLoading = loadingCourse || loadingModules;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Curso não encontrado</h1>
          <Button className="mt-4" asChild>
            <Link to="/academy/courses">Voltar para cursos</Link>
          </Button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {flatLessons.length} aulas
            </span>
            {course.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.duration}
              </span>
            )}
            {course.pillar && <Badge variant="outline">{course.pillar}</Badge>}
          </div>
        </div>
      </div>

      {/* Sem conteúdo ainda */}
      {flatLessons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Layers className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              Este curso ainda não tem conteúdo
            </h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              O conteúdo (módulos e aulas) será adicionado em breve pela equipe.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Área principal */}
          <div className="space-y-4 lg:col-span-2">
            <motion.div
              key={current?.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden">
                <LessonView lesson={current} thumbnail={course.thumbnail} />
              </Card>
            </motion.div>

            {/* Navegação anterior/próxima */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex <= 0}
                onClick={() =>
                  setCurrentId(flatLessons[currentIndex - 1]?.id ?? null)
                }
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Aula {currentIndex + 1} de {flatLessons.length}
              </span>
              <Button
                size="sm"
                disabled={currentIndex >= flatLessons.length - 1}
                onClick={() =>
                  setCurrentId(flatLessons[currentIndex + 1]?.id ?? null)
                }
                className="gap-1"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lista de conteúdo (módulos → aulas) */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Conteúdo do curso
                  <Badge variant="outline">{flatLessons.length} aulas</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[560px]">
                  <div className="space-y-4 p-4">
                    {modules.map((module, mIndex) => (
                      <div key={module.id}>
                        <div className="mb-2 flex items-center gap-2 px-1">
                          <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                            {mIndex + 1}
                          </span>
                          <p className="text-sm font-semibold">{module.title}</p>
                        </div>
                        <div className="space-y-1">
                          {module.lessons.length === 0 && (
                            <p className="px-3 py-2 text-xs text-muted-foreground">
                              Sem aulas neste módulo.
                            </p>
                          )}
                          {module.lessons.map((lesson) => {
                            const Icon = typeIcon[lesson.type] ?? Video;
                            const active = current?.id === lesson.id;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setCurrentId(lesson.id)}
                                className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors ${
                                  active
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-accent"
                                }`}
                              >
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                    active ? "bg-primary-foreground/20" : "bg-muted"
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium">
                                    {lesson.title}
                                  </p>
                                  {lesson.duration && (
                                    <p
                                      className={`text-xs ${
                                        active
                                          ? "text-primary-foreground/70"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {lesson.duration}
                                    </p>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------
// Renderiza a aula atual conforme o tipo
// -----------------------------------------------------------------
function LessonView({
  lesson,
  thumbnail,
}: {
  lesson: FlatLesson | null;
  thumbnail: string;
}) {
  if (!lesson) return null;

  if (lesson.type === "texto") {
    return (
      <div>
        <div className="border-b border-border bg-muted/40 p-4">
          <p className="text-lg font-semibold">{lesson.title}</p>
          <p className="text-sm text-muted-foreground">{lesson.moduleTitle}</p>
        </div>
        <CardContent className="prose prose-sm max-w-none whitespace-pre-wrap pt-6 text-foreground">
          {lesson.content || "Sem conteúdo."}
        </CardContent>
      </div>
    );
  }

  if (lesson.type === "pdf") {
    return (
      <div>
        <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-muted/40 p-6 text-center">
          <FileText className="h-14 w-14 text-primary" />
          <div>
            <p className="text-lg font-semibold">{lesson.title}</p>
            <p className="text-sm text-muted-foreground">{lesson.moduleTitle}</p>
          </div>
          {lesson.link ? (
            <Button asChild className="gap-2">
              <a href={lesson.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Abrir material
              </a>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Material indisponível.</p>
          )}
        </div>
      </div>
    );
  }

  // vídeo
  const embed = lesson.link ? toEmbedUrl(lesson.link) : null;
  return (
    <div>
      <div className="relative aspect-video bg-black">
        {embed ? (
          <iframe
            src={embed}
            title={lesson.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : lesson.link ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 bg-muted/40 p-6 text-center">
            <Video className="h-14 w-14 text-primary" />
            <p className="text-sm text-muted-foreground">
              Não foi possível embutir este vídeo aqui.
            </p>
            <Button asChild className="gap-2">
              <a href={lesson.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Assistir ao vídeo
              </a>
            </Button>
          </div>
        ) : (
          <img
            src={thumbnail}
            alt={lesson.title}
            className="h-full w-full object-cover opacity-70"
          />
        )}
      </div>
      <div className="border-t border-border p-4">
        <p className="text-lg font-semibold">{lesson.title}</p>
        <p className="text-sm text-muted-foreground">{lesson.moduleTitle}</p>
      </div>
    </div>
  );
}
