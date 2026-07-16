import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Target, Calendar, MoreHorizontal, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  listPdis,
  createPdi,
  updatePdiStatus,
  deletePdi,
} from "@/lib/api/pdis";
import { listEmployees } from "@/lib/api/employees";

const STATUS: Record<string, { label: string; color: string }> = {
  em_andamento: { label: "Em andamento", color: "bg-info/10 text-info" },
  concluido: { label: "Concluído", color: "bg-success/10 text-success" },
  atrasado: { label: "Atrasado", color: "bg-destructive/10 text-destructive" },
};

const empty = {
  employee_id: "",
  title: "",
  description: "",
  status: "em_andamento",
  due_date: "",
};

export default function Pdis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: pdis = [], isLoading } = useQuery({ queryKey: ["pdis"], queryFn: listPdis });
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: listEmployees,
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(empty);
  }, [open]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["pdis"] });
  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.employee_id || !form.title.trim()) {
      toast({ title: "Informe o colaborador e o título", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createPdi({
        employee_id: form.employee_id,
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        due_date: form.due_date || null,
      });
      toast({ title: "PDI criado!" });
      refresh();
      setOpen(false);
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

  async function changeStatus(id: string, status: string) {
    try {
      await updatePdiStatus(id, status);
      refresh();
    } catch (err) {
      toast({
        title: "Erro ao atualizar",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  }

  async function remove(id: string) {
    try {
      await deletePdi(id);
      toast({ title: "PDI excluído." });
      refresh();
    } catch (err) {
      toast({
        title: "Erro ao excluir",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PDIs</h1>
          <p className="text-muted-foreground">
            Planos de Desenvolvimento Individual
          </p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo PDI
        </Button>
      </div>

      {isLoading && (
        <p className="py-10 text-center text-muted-foreground">Carregando PDIs...</p>
      )}

      {!isLoading && pdis.length === 0 && (
        <div className="py-12 text-center">
          <Target className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum PDI cadastrado</h3>
          <p className="mt-2 text-muted-foreground">
            Crie o primeiro plano de desenvolvimento.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {pdis.map((pdi, index) => {
          const st = STATUS[pdi.status] ?? STATUS.em_andamento;
          return (
            <motion.div
              key={pdi.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className={st.color}>{st.label}</Badge>
                      <h3 className="mt-2 font-semibold">{pdi.title}</h3>
                      <p className="text-sm text-muted-foreground">{pdi.employeeName}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => changeStatus(pdi.id, "concluido")}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marcar como concluído
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeStatus(pdi.id, "em_andamento")}>
                          <Target className="mr-2 h-4 w-4" />
                          Em andamento
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => remove(pdi.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {pdi.description && (
                    <p className="mt-3 text-sm text-muted-foreground">{pdi.description}</p>
                  )}
                  {pdi.dueDate && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Prazo: {new Date(pdi.dueDate).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Novo PDI</DialogTitle>
            <DialogDescription>
              Defina um plano de desenvolvimento para um colaborador.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Colaborador *</Label>
              <Select value={form.employee_id} onValueChange={(v) => set("employee_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdi-title">Título *</Label>
              <Input
                id="pdi-title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Ex.: Desenvolver liderança"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdi-desc">Descrição</Label>
              <Textarea
                id="pdi-desc"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Metas e ações do plano..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS).map(([value, s]) => (
                      <SelectItem key={value} value={value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdi-due">Prazo</Label>
                <Input
                  id="pdi-due"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => set("due_date", e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Salvando..." : "Criar PDI"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
