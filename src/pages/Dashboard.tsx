import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  GraduationCap,
  TrendingUp,
  UserPlus,
  Building2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { candidates, employees, courses, jobs, units } from "@/lib/mock-data";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const totalEmployees = employees.length;
  const totalCandidates = candidates.length;
  const pendingInterviews = candidates.filter((c) => c.status === "interview").length;
  const avgTrainingProgress = Math.round(
    courses.reduce((acc, c) => acc + c.progress, 0) / courses.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da plataforma Idealize 360º
        </p>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <StatCard
            title="Colaboradores"
            value={totalEmployees}
            change="+12% este mês"
            changeType="positive"
            icon={Users}
            iconColor="text-pillar-people"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Candidatos Ativos"
            value={totalCandidates}
            change={`${pendingInterviews} em entrevista`}
            changeType="neutral"
            icon={UserPlus}
            iconColor="text-pillar-talents"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Vagas Abertas"
            value={jobs.filter((j) => j.status === "open").length}
            change={`${jobs.reduce((acc, j) => acc + j.applications, 0)} candidaturas`}
            changeType="neutral"
            icon={Briefcase}
            iconColor="text-pillar-talents"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Progresso Academy"
            value={`${avgTrainingProgress}%`}
            change="Meta: 80%"
            changeType={avgTrainingProgress >= 80 ? "positive" : "neutral"}
            icon={GraduationCap}
            iconColor="text-pillar-academy"
          />
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pipeline Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-pillar-talents" />
              Pipeline de Recrutamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: "Novos", count: candidates.filter((c) => c.status === "new").length, color: "bg-info" },
                { label: "Avaliando", count: candidates.filter((c) => c.status === "evaluating").length, color: "bg-warning" },
                { label: "Entrevista", count: candidates.filter((c) => c.status === "interview").length, color: "bg-primary" },
                { label: "Aprovados", count: candidates.filter((c) => c.status === "approved").length, color: "bg-success" },
                { label: "Reprovados", count: candidates.filter((c) => c.status === "rejected").length, color: "bg-destructive" },
              ].map((stage) => (
                <div key={stage.label} className="text-center">
                  <div className={`mx-auto mb-2 h-16 w-16 rounded-full ${stage.color} flex items-center justify-center`}>
                    <span className="text-2xl font-bold text-primary-foreground">{stage.count}</span>
                  </div>
                  <p className="text-sm font-medium">{stage.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Units Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Unidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {units.slice(0, 4).map((unit) => (
                <div key={unit.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{unit.name}</p>
                    <p className="text-sm text-muted-foreground">{unit.city}</p>
                  </div>
                  <Badge variant="secondary">
                    {employees.filter((e) => e.unit.id === unit.id).length} colaboradores
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Training Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-pillar-academy" />
              Progresso de Treinamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.slice(0, 4).map((course) => (
                <div key={course.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">{course.pillar}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-warning/10 p-3">
                <Clock className="mt-0.5 h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium">Feedbacks Pendentes</p>
                  <p className="text-sm text-muted-foreground">
                    3 colaboradores aguardam feedback
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium">Treinamentos Vencidos</p>
                  <p className="text-sm text-muted-foreground">
                    2 treinamentos obrigatórios expirados
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-info/10 p-3">
                <TrendingUp className="mt-0.5 h-5 w-5 text-info" />
                <div>
                  <p className="font-medium">Nova Candidatura</p>
                  <p className="text-sm text-muted-foreground">
                    Mariana Costa - Consultor de Vendas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {employees
                .sort((a, b) => b.performance - a.performance)
                .slice(0, 4)
                .map((employee, index) => (
                  <div
                    key={employee.id}
                    className="flex items-center gap-4 rounded-lg border border-border p-4"
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback>
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium">{employee.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {employee.role.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress value={employee.performance} className="h-1.5 flex-1" />
                        <span className="text-xs font-medium">{employee.performance}%</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
