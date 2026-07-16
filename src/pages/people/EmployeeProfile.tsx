import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Award,
  TrendingUp,
  GraduationCap,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { discProfiles, temperaments, idealizeLevels, courses } from "@/lib/mock-data";
import { useQuery } from "@tanstack/react-query";
import { getEmployee } from "@/lib/api/employees";

export default function EmployeeProfile() {
  const { id } = useParams();
  const { data: employee, isLoading } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Colaborador não encontrado</h1>
          <Button className="mt-4" asChild>
            <Link to="/people/employees">Voltar para lista</Link>
          </Button>
        </div>
      </div>
    );
  }

  const discInfo = discProfiles[employee.discProfile as keyof typeof discProfiles];
  const tempInfo = temperaments[employee.temperament as keyof typeof temperaments];
  const levelInfo = idealizeLevels[employee.idealizeLevel as keyof typeof idealizeLevels];

  const hireDate = employee.hireDate ? new Date(employee.hireDate) : null;
  const today = new Date();
  const yearsOfService = hireDate
    ? Math.floor((today.getTime() - hireDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/people/employees"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{employee.name}</h1>
          <p className="text-muted-foreground">{employee.role?.name}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Profile Info */}
        <div className="space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Avatar className="mx-auto h-24 w-24">
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback className="text-2xl">
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-4 text-xl font-semibold">{employee.name}</h2>
                  <p className="text-muted-foreground">{employee.role?.name}</p>
                  <Badge className="mt-2" variant="outline">
                    {employee.role?.department}
                  </Badge>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{employee.unit?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">
                      {yearsOfService} ano{yearsOfService !== 1 && "s"} de casa
                    </span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex gap-2">
                  <Button className="flex-1 gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Feedback
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Avaliar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* IDEALIZE Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Programa IDEALIZE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-5xl font-bold">{employee.idealizeLevel}</div>
                  <p className="mt-2 text-lg">{levelInfo?.name}</p>
                  <p className="mt-1 text-sm text-primary-foreground/80">
                    {levelInfo?.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Behavioral Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Perfil Comportamental</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-secondary p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">DISC</span>
                    <Badge variant="outline" className="text-lg font-bold">
                      {employee.discProfile}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {discInfo?.name} - {discInfo?.description}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Temperamento</span>
                    <Badge variant="outline">{employee.temperament}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {tempInfo?.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Tabs Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="trainings">Treinamentos</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="pdi">PDI</TabsTrigger>
            </TabsList>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      Indicadores de Desempenho
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Performance Geral</span>
                          <span className="text-sm font-bold">{employee.performance}%</span>
                        </div>
                        <Progress value={employee.performance} className="h-3" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Metas Atingidas</span>
                          <span className="text-sm font-bold">85%</span>
                        </div>
                        <Progress value={85} className="h-3" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Engajamento</span>
                          <span className="text-sm font-bold">92%</span>
                        </div>
                        <Progress value={92} className="h-3" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Qualidade</span>
                          <span className="text-sm font-bold">88%</span>
                        </div>
                        <Progress value={88} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Últimas Avaliações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { period: "Q4 2024", score: 92, status: "Excelente" },
                        { period: "Q3 2024", score: 88, status: "Bom" },
                        { period: "Q2 2024", score: 85, status: "Bom" },
                      ].map((evaluation, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border border-border p-4"
                        >
                          <div>
                            <p className="font-medium">{evaluation.period}</p>
                            <Badge
                              variant="outline"
                              className={
                                evaluation.score >= 90
                                  ? "bg-success/10 text-success"
                                  : "bg-info/10 text-info"
                              }
                            >
                              {evaluation.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{evaluation.score}</p>
                            <p className="text-sm text-muted-foreground">pontos</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Trainings Tab */}
            <TabsContent value="trainings" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-pillar-academy" />
                      Treinamentos ({employee.trainingsCompleted} completos)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courses.slice(0, 4).map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center gap-4 rounded-lg border border-border p-4"
                        >
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-16 w-24 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{course.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {course.pillar} • {course.duration}
                                </p>
                              </div>
                              {course.progress === 100 ? (
                                <Badge className="bg-success/10 text-success">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Completo
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {course.progress}%
                                </Badge>
                              )}
                            </div>
                            <Progress value={course.progress} className="mt-2 h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Linha do Tempo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-20px)] before:w-0.5 before:bg-border">
                      {[
                        { date: "Dez 2024", event: "Promovido a " + employee.role?.name, type: "promotion" },
                        { date: "Out 2024", event: "Certificação em Técnicas de Vendas SPIN", type: "training" },
                        { date: "Set 2024", event: "Avaliação de desempenho: 92 pontos", type: "evaluation" },
                        { date: "Jun 2024", event: "Feedback positivo do gestor", type: "feedback" },
                        { date: "Mar 2024", event: "Onboarding concluído", type: "training" },
                        { date: employee.hireDate, event: "Admissão na Idealize", type: "hire" },
                      ].map((item, index) => (
                        <div key={index} className="relative flex gap-4 pl-8">
                          <div
                            className={`absolute left-0 h-6 w-6 rounded-full border-2 ${
                              item.type === "promotion"
                                ? "border-success bg-success/20"
                                : item.type === "training"
                                ? "border-pillar-academy bg-pillar-academy/20"
                                : item.type === "evaluation"
                                ? "border-info bg-info/20"
                                : item.type === "hire"
                                ? "border-primary bg-primary/20"
                                : "border-warning bg-warning/20"
                            }`}
                          />
                          <div>
                            <p className="text-sm text-muted-foreground">{item.date}</p>
                            <p className="font-medium">{item.event}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* PDI Tab */}
            <TabsContent value="pdi" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Plano de Desenvolvimento Individual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {[
                        {
                          goal: "Desenvolver habilidades de liderança",
                          deadline: "Mar 2025",
                          progress: 60,
                          actions: ["Curso de Liderança", "Mentoria com gestor", "Projeto de melhoria"],
                        },
                        {
                          goal: "Aprimorar técnicas de vendas consultivas",
                          deadline: "Fev 2025",
                          progress: 80,
                          actions: ["Treinamento SPIN", "Shadowing com top performer"],
                        },
                        {
                          goal: "Certificação em lentes especiais",
                          deadline: "Jan 2025",
                          progress: 100,
                          actions: ["Curso técnico", "Prova de certificação"],
                        },
                      ].map((pdi, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-border p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{pdi.goal}</p>
                              <p className="text-sm text-muted-foreground">
                                Prazo: {pdi.deadline}
                              </p>
                            </div>
                            <Badge
                              className={
                                pdi.progress === 100
                                  ? "bg-success/10 text-success"
                                  : "bg-info/10 text-info"
                              }
                            >
                              {pdi.progress}%
                            </Badge>
                          </div>
                          <Progress value={pdi.progress} className="mt-3 h-2" />
                          <div className="mt-3">
                            <p className="text-sm font-medium">Ações:</p>
                            <ul className="mt-1 space-y-1">
                              {pdi.actions.map((action, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <CheckCircle className="h-3 w-3 text-success" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
