import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Brain, Copy, ClipboardCheck, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { listAssessments } from "@/lib/api/disc";
import { listEmployees } from "@/lib/api/employees";
import { listCandidates } from "@/lib/api/candidates";
import { discProfiles } from "@/lib/mock-data";

const profileColor: Record<string, string> = {
  D: "bg-destructive/10 text-destructive",
  I: "bg-brand/10 text-brand",
  S: "bg-primary/10 text-primary",
  C: "bg-info/10 text-info",
};

export default function DiscResults() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ["disc-assessments"],
    queryFn: listAssessments,
  });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: listEmployees });
  const { data: candidates = [] } = useQuery({ queryKey: ["candidates"], queryFn: listCandidates });

  const [applyOpen, setApplyOpen] = useState(false);
  const [personType, setPersonType] = useState("colaborador");
  const [personId, setPersonId] = useState("");

  const selfLink = `${window.location.origin}/disc`;

  function startApply() {
    if (!personId) {
      toast({ title: "Selecione a pessoa", variant: "destructive" });
      return;
    }
    const param = personType === "colaborador" ? "employee" : "candidate";
    navigate(`/disc?${param}=${personId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teste DISC</h1>
          <p className="text-muted-foreground">
            Aplique o teste e acompanhe os perfis comportamentais da equipe
          </p>
        </div>
        <Button className="gap-2" onClick={() => setApplyOpen(true)}>
          <ClipboardCheck className="h-4 w-4" />
          Aplicar teste
        </Button>
      </div>

      {/* Link de autosserviço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5 text-primary" />
            Link para a pessoa responder sozinha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Compartilhe este link com colaboradores ou candidatos para eles fazerem o teste por conta própria.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <code className="flex-1 truncate rounded-lg border bg-muted px-3 py-2 text-sm">{selfLink}</code>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                navigator.clipboard?.writeText(selfLink);
                toast({ title: "Link copiado!" });
              }}
            >
              <Copy className="h-4 w-4" />
              Copiar link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Resultados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pessoa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>D / I / S / C</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Carregando resultados...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && assessments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Nenhum teste realizado ainda.
                  </TableCell>
                </TableRow>
              )}
              {assessments.map((a, i) => (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <TableCell>
                    <p className="font-medium">{a.linkedName || a.respondentName}</p>
                    {a.linkedName && a.respondentName !== a.linkedName && (
                      <p className="text-xs text-muted-foreground">respondido por {a.respondentName}</p>
                    )}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">{a.respondentType}</TableCell>
                  <TableCell>
                    <Badge className={`gap-1 ${profileColor[a.primaryProfile]}`}>
                      {a.primaryProfile} - {discProfiles[a.primaryProfile]?.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {a.scores.D} / {a.scores.I} / {a.scores.S} / {a.scores.C}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Aplicar teste */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Aplicar teste DISC</DialogTitle>
            <DialogDescription>
              Escolha a pessoa. O teste abrirá em seguida e o resultado já fica vinculado a ela.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={personType} onValueChange={(v) => { setPersonType(v); setPersonId(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                  <SelectItem value="candidato">Candidato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pessoa</Label>
              <Select value={personId} onValueChange={setPersonId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {(personType === "colaborador" ? employees : candidates).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancelar</Button>
            <Button onClick={startApply}>Abrir teste</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
