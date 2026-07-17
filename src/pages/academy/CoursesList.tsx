import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Play,
  Clock,
  BookOpen,
  CheckCircle,
  Star,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { listCourses, deleteCourse, type Course } from "@/lib/api/courses";
import { CourseFormDialog } from "@/components/academy/CourseFormDialog";

const pillars = ["Todos", "Onboarding", "Vendas", "Técnico", "Cultura"];

export default function CoursesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pillarFilter, setPillarFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: listCourses,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["courses"] });
  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (c: Course) => { setEditing(c); setFormOpen(true); };

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteCourse(deleting.id);
      toast({ title: "Curso excluído." });
      refresh();
    } catch (err) {
      toast({
        title: "Erro ao excluir",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPillar =
      pillarFilter === "Todos" || course.pillar === pillarFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && course.progress === 100) ||
      (statusFilter === "in-progress" && course.progress > 0 && course.progress < 100) ||
      (statusFilter === "not-started" && course.progress === 0);
    return matchesSearch && matchesPillar && matchesStatus;
  });

  const completedCount = courses.filter((c) => c.progress === 100).length;
  const inProgressCount = courses.filter((c) => c.progress > 0 && c.progress < 100).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trilhas de Treinamento</h1>
          <p className="text-muted-foreground">
            Desenvolva suas habilidades com os cursos da Idealize Academy
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 px-4 py-2">
            <CheckCircle className="h-4 w-4 text-success" />
            {completedCount} completos
          </Badge>
          <Button className="gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" />
            Novo curso
          </Button>
        </div>
      </div>

      {/* Pillar Tabs */}
      <div className="flex flex-wrap gap-2">
        {pillars.map((pillar) => (
          <Button
            key={pillar}
            variant={pillarFilter === pillar ? "default" : "outline"}
            size="sm"
            onClick={() => setPillarFilter(pillar)}
          >
            {pillar}
          </Button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="completed">Completos</SelectItem>
                <SelectItem value="in-progress">Em andamento</SelectItem>
                <SelectItem value="not-started">Não iniciados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group overflow-hidden transition-all hover:shadow-lg">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge
                    className={
                      course.mandatory
                        ? "bg-destructive/90"
                        : "bg-secondary/90 text-secondary-foreground"
                    }
                  >
                    {course.mandatory ? "Obrigatório" : "Opcional"}
                  </Badge>
                </div>
                {course.progress > 0 && course.progress < 100 && (
                  <div className="absolute right-4 top-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/90 font-bold text-primary">
                      {course.progress}%
                    </div>
                  </div>
                )}
                {course.progress === 100 && (
                  <div className="absolute right-4 top-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-success-foreground">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{course.pillar}</Badge>
                    <Badge variant="secondary">{course.role}</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 -mr-1">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(course)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleting(course)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {course.description}
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {course.lessons} aulas
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </span>
                </div>
                {course.progress > 0 && (
                  <div className="mt-4">
                    <Progress value={course.progress} className="h-2" />
                  </div>
                )}
                <Button
                  className="mt-4 w-full gap-2"
                  variant={course.progress === 100 ? "secondary" : "default"}
                  asChild
                >
                  <Link to={`/academy/courses/${course.id}`}>
                    {course.progress === 0 ? (
                      <>
                        <Play className="h-4 w-4" />
                        Iniciar
                      </>
                    ) : course.progress === 100 ? (
                      <>
                        <Star className="h-4 w-4" />
                        Revisar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Continuar
                      </>
                    )}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {isLoading && (
        <div className="py-12 text-center text-muted-foreground">
          Carregando cursos...
        </div>
      )}

      {!isLoading && filteredCourses.length === 0 && (
        <div className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum curso encontrado</h3>
          <p className="mt-2 text-muted-foreground">
            Tente ajustar seus filtros de busca.
          </p>
        </div>
      )}

      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editing}
        onSaved={refresh}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir curso?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.title}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
