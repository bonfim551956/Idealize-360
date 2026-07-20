// Diálogo de formulário de Colaborador (criar e editar).
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { listUnits } from "@/lib/api/units";
import { listRoles } from "@/lib/api/roles";
import {
  createEmployee,
  updateEmployee,
  type Employee,
  type EmployeeInput,
} from "@/lib/api/employees";
import { createUserAccount, setProfileAccessAndUnit } from "@/lib/api/users";
import type { NivelAcesso } from "@/contexts/AuthContext";
import { discProfiles, temperaments, idealizeLevels } from "@/lib/mock-data";

const ACCESS_OPTIONS: { value: NivelAcesso; label: string }[] = [
  { value: "colaborador", label: "Colaborador" },
  { value: "gestor", label: "Gestor / Supervisor" },
  { value: "rh", label: "Recursos Humanos" },
  { value: "admin", label: "Administrador" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSaved: () => void;
}

const empty = {
  name: "",
  email: "",
  role_id: "",
  unit_id: "",
  hire_date: "",
  disc_profile: "",
  temperament: "",
  idealize_level: "I",
  performance: "0",
  trainings_completed: "0",
  // Minha Jornada
  career_level: "",
  career_next: "",
  career_progress: "0",
  score_geral: "0",
  score_mes: "0",
  reward_points: "0",
  fat_medio: "",
  ticket_medio: "",
  conversao: "",
  rate_postura: "0",
  rate_apresentacao: "0",
  rate_pontualidade: "0",
  rate_cordialidade: "0",
  rate_padrao: "0",
};

export function EmployeeFormDialog({ open, onOpenChange, employee, onSaved }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  // Acesso ao sistema (só na criação)
  const [createLogin, setCreateLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [accessLevel, setAccessLevel] = useState<NivelAcesso>("colaborador");

  const { data: units = [] } = useQuery({ queryKey: ["units"], queryFn: listUnits });
  const { data: roles = [] } = useQuery({ queryKey: ["roles"], queryFn: listRoles });

  useEffect(() => {
    if (!open) return;
    setCreateLogin(false);
    setPassword("");
    setAccessLevel("colaborador");
    if (employee) {
      setForm({
        name: employee.name,
        email: employee.email ?? "",
        role_id: employee.role?.id ?? "",
        unit_id: employee.unit?.id ?? "",
        hire_date: employee.hireDate ?? "",
        disc_profile: employee.discProfile ?? "",
        temperament: employee.temperament ?? "",
        idealize_level: employee.idealizeLevel ?? "I",
        performance: String(employee.performance ?? 0),
        trainings_completed: String(employee.trainingsCompleted ?? 0),
        career_level: employee.careerLevel ?? "",
        career_next: employee.careerNext ?? "",
        career_progress: String(employee.careerProgress ?? 0),
        score_geral: String(employee.scoreGeral ?? 0),
        score_mes: String(employee.scoreMes ?? 0),
        reward_points: String(employee.rewardPoints ?? 0),
        fat_medio: employee.fatMedio ?? "",
        ticket_medio: employee.ticketMedio ?? "",
        conversao: employee.conversao ?? "",
        rate_postura: String(employee.ratePostura ?? 0),
        rate_apresentacao: String(employee.rateApresentacao ?? 0),
        rate_pontualidade: String(employee.ratePontualidade ?? 0),
        rate_cordialidade: String(employee.rateCordialidade ?? 0),
        rate_padrao: String(employee.ratePadrao ?? 0),
      });
    } else {
      setForm(empty);
    }
  }, [open, employee]);

  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.name.trim()) {
      toast({ title: "Informe o nome", variant: "destructive" });
      return;
    }
    // Validação do login (apenas na criação com login habilitado)
    if (!employee && createLogin) {
      if (!form.email.trim()) {
        toast({ title: "Informe o e-mail para criar o login", variant: "destructive" });
        return;
      }
      if (password.length < 6) {
        toast({ title: "Senha de acesso muito curta", description: "Use ao menos 6 caracteres.", variant: "destructive" });
        return;
      }
    }

    setSaving(true);
    const num = (v: string) => Number(v) || 0;
    const payload: EmployeeInput = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      role_id: form.role_id || null,
      unit_id: form.unit_id || null,
      hire_date: form.hire_date || null,
      disc_profile: form.disc_profile || null,
      temperament: form.temperament || null,
      idealize_level: form.idealize_level || "I",
      performance: num(form.performance),
      trainings_completed: num(form.trainings_completed),
      career_level: form.career_level.trim() || null,
      career_next: form.career_next.trim() || null,
      career_progress: num(form.career_progress),
      score_geral: num(form.score_geral),
      score_mes: num(form.score_mes),
      reward_points: num(form.reward_points),
      fat_medio: form.fat_medio.trim() || null,
      ticket_medio: form.ticket_medio.trim() || null,
      conversao: form.conversao.trim() || null,
      rate_postura: num(form.rate_postura),
      rate_apresentacao: num(form.rate_apresentacao),
      rate_pontualidade: num(form.rate_pontualidade),
      rate_cordialidade: num(form.rate_cordialidade),
      rate_padrao: num(form.rate_padrao),
    };
    try {
      if (employee) {
        await updateEmployee(employee.id, payload);
        toast({ title: "Colaborador atualizado!" });
      } else if (createLogin) {
        // 1) cria o login (sem deslogar o admin) 2) define acesso/unidade 3) cria a ficha vinculada
        const userId = await createUserAccount(form.email.trim(), password, form.name.trim());
        await setProfileAccessAndUnit(userId, accessLevel, form.unit_id || null);
        await createEmployee(payload, userId);
        toast({
          title: "Colaborador e login criados!",
          description: "A pessoa já pode entrar com o e-mail e a senha definidos.",
        });
      } else {
        await createEmployee(payload);
        toast({ title: "Colaborador cadastrado!" });
      }
      onSaved();
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{employee ? "Editar colaborador" : "Novo colaborador"}</DialogTitle>
          <DialogDescription>Preencha os dados. * é obrigatório.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="e-name">Nome *</Label>
              <Input id="e-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-email">E-mail</Label>
              <Input id="e-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select value={form.role_id} onValueChange={(v) => set("role_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select value={form.unit_id} onValueChange={(v) => set("unit_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {units.map((u) => (<SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="e-hire">Admissão</Label>
              <Input id="e-hire" type="date" value={form.hire_date} onChange={(e) => set("hire_date", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Perfil DISC</Label>
              <Select value={form.disc_profile} onValueChange={(v) => set("disc_profile", v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(discProfiles).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{k} - {v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Temperamento</Label>
              <Select value={form.temperament} onValueChange={(v) => set("temperament", v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(temperaments).map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Nível IDEALIZE</Label>
              <Select value={form.idealize_level} onValueChange={(v) => set("idealize_level", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(idealizeLevels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{k} - {v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-perf">Performance (%)</Label>
              <Input id="e-perf" type="number" min={0} max={100} value={form.performance} onChange={(e) => set("performance", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-tr">Treinamentos</Label>
              <Input id="e-tr" type="number" min={0} value={form.trainings_completed} onChange={(e) => set("trainings_completed", e.target.value)} />
            </div>
          </div>

          {/* Minha Jornada & Desempenho */}
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="mb-3 font-medium">Minha Jornada & Desempenho</p>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Carreira</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="j-cl">Nível atual</Label>
                <Input id="j-cl" value={form.career_level} onChange={(e) => set("career_level", e.target.value)} placeholder="Ex.: Consultor JR" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-cn">Próximo nível</Label>
                <Input id="j-cn" value={form.career_next} onChange={(e) => set("career_next", e.target.value)} placeholder="Ex.: Consultor Pleno" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-cp">Progresso (%)</Label>
                <Input id="j-cp" type="number" min={0} max={100} value={form.career_progress} onChange={(e) => set("career_progress", e.target.value)} />
              </div>
            </div>

            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scores & Recompensa</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="j-sg">Score Geral</Label>
                <Input id="j-sg" type="number" value={form.score_geral} onChange={(e) => set("score_geral", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-sm">Score do Mês</Label>
                <Input id="j-sm" type="number" value={form.score_mes} onChange={(e) => set("score_mes", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-rp">Pontos (recompensa)</Label>
                <Input id="j-rp" type="number" value={form.reward_points} onChange={(e) => set("reward_points", e.target.value)} />
              </div>
            </div>

            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Métricas de venda</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="j-fm">Fat. Médio</Label>
                <Input id="j-fm" value={form.fat_medio} onChange={(e) => set("fat_medio", e.target.value)} placeholder="R$ 0,00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-tm">Ticket Médio</Label>
                <Input id="j-tm" value={form.ticket_medio} onChange={(e) => set("ticket_medio", e.target.value)} placeholder="R$ 0,00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-cv">Conversão</Label>
                <Input id="j-cv" value={form.conversao} onChange={(e) => set("conversao", e.target.value)} placeholder="0%" />
              </div>
            </div>

            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rates (0 a 100)</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="j-p1" className="text-xs">Postura</Label>
                <Input id="j-p1" type="number" min={0} max={100} value={form.rate_postura} onChange={(e) => set("rate_postura", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-p2" className="text-xs">Apresentação</Label>
                <Input id="j-p2" type="number" min={0} max={100} value={form.rate_apresentacao} onChange={(e) => set("rate_apresentacao", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-p3" className="text-xs">Pontualidade</Label>
                <Input id="j-p3" type="number" min={0} max={100} value={form.rate_pontualidade} onChange={(e) => set("rate_pontualidade", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-p4" className="text-xs">Cordialidade</Label>
                <Input id="j-p4" type="number" min={0} max={100} value={form.rate_cordialidade} onChange={(e) => set("rate_cordialidade", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-p5" className="text-xs">Padrão</Label>
                <Input id="j-p5" type="number" min={0} max={100} value={form.rate_padrao} onChange={(e) => set("rate_padrao", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Acesso ao sistema — só ao criar um novo colaborador */}
          {!employee && (
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Criar login de acesso</p>
                  <p className="text-sm text-muted-foreground">
                    Gera um usuário para esta pessoa entrar na plataforma.
                  </p>
                </div>
                <Switch checked={createLogin} onCheckedChange={setCreateLogin} />
              </div>

              {createLogin && (
                <div className="mt-4 space-y-4">
                  {!form.email && (
                    <p className="text-xs text-brand">
                      Preencha o e-mail acima — ele será o login de acesso.
                    </p>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="e-pass">Senha inicial *</Label>
                      <Input
                        id="e-pass"
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nível de acesso</Label>
                      <Select value={accessLevel} onValueChange={(v) => setAccessLevel(v as NivelAcesso)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ACCESS_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Informe essa senha para a pessoa; ela poderá trocá-la depois.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Salvando..." : employee ? "Salvar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
