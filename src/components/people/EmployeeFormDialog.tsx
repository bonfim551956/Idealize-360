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
import { discProfiles, temperaments, idealizeLevels } from "@/lib/mock-data";

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
};

export function EmployeeFormDialog({ open, onOpenChange, employee, onSaved }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const { data: units = [] } = useQuery({ queryKey: ["units"], queryFn: listUnits });
  const { data: roles = [] } = useQuery({ queryKey: ["roles"], queryFn: listRoles });

  useEffect(() => {
    if (!open) return;
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
    setSaving(true);
    const payload: EmployeeInput = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      role_id: form.role_id || null,
      unit_id: form.unit_id || null,
      hire_date: form.hire_date || null,
      disc_profile: form.disc_profile || null,
      temperament: form.temperament || null,
      idealize_level: form.idealize_level || "I",
      performance: Number(form.performance) || 0,
      trainings_completed: Number(form.trainings_completed) || 0,
    };
    try {
      if (employee) {
        await updateEmployee(employee.id, payload);
        toast({ title: "Colaborador atualizado!" });
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
