import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  Clock,
  BookOpen,
  Download,
  ChevronRight,
  Lock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { getCourse } from "@/lib/api/courses";

const lessons = [
  { id: "1", title: "Introdução ao curso", duration: "5:30", completed: true, type: "video" },
  { id: "2", title: "Conceitos fundamentais", duration: "12:45", completed: true, type: "video" },
  { id: "3", title: "Material de apoio", duration: "10 min leitura", completed: true, type: "pdf" },
  { id: "4", title: "Técnicas avançadas", duration: "18:20", completed: false, type: "video", current: true },
  { id: "5", title: "Casos práticos", duration: "15:00", completed: false, type: "video" },
  { id: "6", title: "Exercícios práticos", duration: "20 min", completed: false, type: "quiz" },
  { id: "7", title: "Revisão geral", duration: "8:30", completed: false, type: "video" },
  { id: "8", title: "Avaliação final", duration: "30 min", completed: false, type: "quiz" },
];

export default function CoursePlayer() {
  const { id } = useParams();
  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourse(id as string),
    enabled: !!id,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(lessons.find((l) => l.current) || lessons[0]);

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

  const completedLessons = lessons.filter((l) => l.completed).length;
  const progress = Math.round((completedLessons / lessons.length) * 100);

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
              {lessons.length} aulas
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {course.duration}
            </span>
            <Badge variant="outline">{course.pillar}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Progresso</p>
            <p className="text-xl font-bold">{progress}%</p>
          </div>
          <div className="h-12 w-12">
            <Progress value={progress} className="h-full w-full rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-foreground/5">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Button
                    size="lg"
                    className="h-16 w-16 rounded-full"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4">
                  <p className="text-lg font-semibold text-primary-foreground">
                    {currentLesson.title}
                  </p>
                  <p className="text-sm text-primary-foreground/80">
                    Aula {lessons.indexOf(currentLesson) + 1} de {lessons.length}
                  </p>
                </div>
              </div>
              {/* Video Controls */}
              <div className="border-t border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Anterior
                    </Button>
                    <Button size="sm">
                      Próxima aula
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Baixar material
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Sobre esta aula</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {course.description} Nesta aula você aprenderá técnicas avançadas que
                  irão ajudá-lo a se destacar no dia a dia de trabalho.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">Técnicas de vendas</Badge>
                  <Badge variant="secondary">Comunicação</Badge>
                  <Badge variant="secondary">Rapport</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Lessons List */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Conteúdo do curso
                  <Badge variant="outline">
                    {completedLessons}/{lessons.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-1 p-4">
                    {lessons.map((lesson, index) => {
                      const isLocked = index > 0 && !lessons[index - 1].completed && !lesson.completed;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => !isLocked && setCurrentLesson(lesson)}
                          disabled={isLocked}
                          className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                            currentLesson.id === lesson.id
                              ? "bg-primary text-primary-foreground"
                              : isLocked
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-accent"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              lesson.completed
                                ? "bg-success text-success-foreground"
                                : currentLesson.id === lesson.id
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            }`}
                          >
                            {lesson.completed ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : isLocked ? (
                              <Lock className="h-4 w-4" />
                            ) : lesson.type === "video" ? (
                              <Play className="h-4 w-4" />
                            ) : lesson.type === "pdf" ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <span className="text-xs font-bold">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium">
                              {lesson.title}
                            </p>
                            <p
                              className={`text-xs ${
                                currentLesson.id === lesson.id
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {lesson.duration}
                            </p>
                          </div>
                          {lesson.type === "quiz" && (
                            <Badge variant="outline" className="shrink-0">
                              Quiz
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
