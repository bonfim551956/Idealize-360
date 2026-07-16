import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, MoreHorizontal, Plus, Mail, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { candidates, candidateStatuses, discProfiles, jobs } from "@/lib/mock-data";

const columnColors: Record<string, string> = {
  new: "border-t-info",
  evaluating: "border-t-warning",
  interview: "border-t-primary",
  approved: "border-t-success",
  rejected: "border-t-destructive",
};

export default function Pipeline() {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  const getJobTitle = (jobId: string) => {
    return jobs.find((j) => j.id === jobId)?.title || "N/A";
  };

  const getCandidatesByStatus = (status: string) => {
    return candidates.filter((c) => c.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline de Recrutamento</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie o fluxo de candidatos
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Ver vagas
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova vaga
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {candidateStatuses.map((status) => {
          const statusCandidates = getCandidatesByStatus(status.id);
          return (
            <div key={status.id} className="min-w-[300px] flex-1">
              <div
                className={`kanban-column border-t-4 ${columnColors[status.id]}`}
              >
                {/* Column Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{status.label}</h3>
                    <Badge variant="secondary" className="rounded-full">
                      {statusCandidates.length}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {statusCandidates.map((candidate, index) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group cursor-pointer"
                      onClick={() => setSelectedCandidate(candidate.id)}
                    >
                      <Card className="transition-all hover:shadow-md hover:border-primary/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {candidate.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{candidate.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {getJobTitle(candidate.jobId)}
                                </p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Enviar e-mail
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Agendar entrevista
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ArrowRight className="mr-2 h-4 w-4" />
                                  Mover para próxima etapa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              DISC: {candidate.discProfile}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {candidate.temperament}
                            </Badge>
                          </div>

                          {candidate.notes && (
                            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                              {candidate.notes}
                            </p>
                          )}

                          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {new Date(candidate.appliedAt).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {statusCandidates.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                      <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Nenhum candidato
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tempo médio de contratação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18 dias</div>
            <p className="text-sm text-muted-foreground">
              -3 dias em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taxa de conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24%</div>
            <p className="text-sm text-muted-foreground">
              Candidatos aprovados / total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vagas em aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{jobs.filter((j) => j.status === "open").length}</div>
            <p className="text-sm text-muted-foreground">
              Em {candidates.length} candidaturas ativas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
