import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Award,
  Gift,
  Calendar,
  Bell,
  ArrowRight,
  Star,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getEmployeeByProfile, type Employee } from "@/lib/api/employees";
import { listAgenda, EVENT_TYPES } from "@/lib/api/agenda";

const CRITERIA: { key: keyof Employee; label: string }[] = [
  { key: "ratePostura", label: "Postura" },
  { key: "rateApresentacao", label: "Apresentação pessoal" },
  { key: "ratePontualidade", label: "Pontualidade" },
  { key: "rateCordialidade", label: "Cordialidade" },
  { key: "ratePadrao", label: "Padrão" },
];

export default function Jornada() {
  const { user, profile } = useAuth();

  const { data: employee, isLoading } = useQuery({
    queryKey: ["my-employee", user?.id],
    queryFn: () => getEmployeeByProfile(user!.id),
    enabled: !!user?.id,
  });

  const { data: agenda = [] } = useQuery({
    queryKey: ["agenda", employee?.id],
    queryFn: () => listAgenda(employee!.id),
    enabled: !!employee?.id,
  });

  const firstName = (profile?.full_name || employee?.name || "").split(" ")[0];
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
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
      <div className="mx-auto max-w-lg py-16 text-center">
        <Target className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Sua jornada ainda não está pronta</h1>
        <p className="mt-2 text-muted-foreground">
          Seu login ainda não está vinculado a uma ficha de colaborador. Fale com o RH
          para vincular seu perfil e liberar a Minha Jornada.
        </p>
      </div>
    );
  }

  const upcoming = agenda.filter((e) => new Date(e.date) >= new Date(new Date().toDateString()));

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <div className="rounded-2xl bg-gradient-hero p-6 text-primary-foreground">
        <p className="text-sm capitalize opacity-90">{today}</p>
        <h1 className="font-serif text-4xl">Seja bem-vindo, {firstName}! 👋</h1>
        <p className="mt-1 opacity-90">
          {employee.role?.name}
          {employee.unit?.name ? ` · ${employee.unit.name}` : ""}
        </p>
      </div>

      {/* Trilha de carreira */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trilha de carreira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="text-center">
              <Badge className="bg-primary/10 text-primary">{employee.careerLevel || "—"}</Badge>
              <p className="mt-1 text-xs text-muted-foreground">Nível atual</p>
            </div>
            <div className="flex-1">
              <Progress value={employee.careerProgress} className="h-3" />
              <p className="mt-1 text-center text-xs text-muted-foreground">
                {employee.careerProgress}% para o próximo nível
              </p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="gap-1">
                <ArrowRight className="h-3 w-3" />
                {employee.careerNext || "—"}
              </Badge>
              <p className="mt-1 text-xs text-muted-foreground">Próximo nível</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scores + Recompensa */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Score Geral</p>
              <p className="text-3xl font-bold">{employee.scoreGeral}</p>
            </div>
            <Star className="h-9 w-9 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Score do Mês</p>
              <p className="text-3xl font-bold text-brand">{employee.scoreMes}</p>
            </div>
            <TrendingUp className="h-9 w-9 text-brand" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-primary text-primary-foreground">
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm opacity-90">Programa de Recompensa</p>
              <p className="text-3xl font-bold">{employee.rewardPoints} pts</p>
            </div>
            <Gift className="h-9 w-9" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rates / critérios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-primary" />
              Minhas avaliações (Rates)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {CRITERIA.map((c) => {
              const val = (employee[c.key] as number) ?? 0;
              return (
                <div key={c.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{c.label}</span>
                    <span className="font-medium">{val}</span>
                  </div>
                  <Progress value={val} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Métricas de venda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Métricas de venda
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 pt-2">
            <div className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">Fat. Médio</p>
              <p className="mt-1 text-lg font-bold">{employee.fatMedio || "—"}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">Ticket Médio</p>
              <p className="mt-1 text-lg font-bold">{employee.ticketMedio || "—"}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">Conversão</p>
              <p className="mt-1 text-lg font-bold">{employee.conversao || "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lembretes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-warning" />
              Lembretes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {employee.trainingsCompleted >= 0 && employee.pendingFeedbacks > 0 && (
              <div className="flex items-start gap-3 rounded-lg bg-warning/10 p-3">
                <Bell className="mt-0.5 h-5 w-5 text-warning" />
                <p className="text-sm">
                  Você tem <strong>{employee.pendingFeedbacks}</strong> feedback(s) pendente(s).
                </p>
              </div>
            )}
            {upcoming.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm">
                  <strong>{new Date(e.date).toLocaleDateString("pt-BR")}</strong> — {e.title}
                </p>
              </div>
            ))}
            {upcoming.length === 0 && employee.pendingFeedbacks === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum lembrete no momento. 🎉</p>
            )}
          </CardContent>
        </Card>

        {/* Agenda / Calendário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Meu calendário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {agenda.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum evento agendado. O RH pode adicionar reuniões e feedbacks à sua agenda.
              </p>
            )}
            {agenda.map((e) => {
              const t = EVENT_TYPES[e.type] ?? EVENT_TYPES.outro;
              return (
                <div key={e.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${t.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{t.label}</p>
                  </div>
                  <Badge variant="outline">
                    {new Date(e.date).toLocaleDateString("pt-BR")}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button variant="outline" asChild>
          <Link to="/academy/courses">Ver meus treinamentos</Link>
        </Button>
      </div>
    </div>
  );
}
