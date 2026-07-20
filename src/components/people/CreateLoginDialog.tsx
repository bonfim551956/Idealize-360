// Cria um login de acesso para um colaborador que já existe (sem login).
import { useEffect, useState } from "react";
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
import { createUserAccount, setProfileAccessAndUnit } from "@/lib/api/users";
import { linkEmployeeProfile, type Employee } from "@/lib/api/employees";
import type { NivelAcesso } from "@/contexts/AuthContext";

const ACCESS_OPTIONS: { value: NivelAcesso; label: string }[] = [
  { value: "colaborador", label: "Colaborador" },
  { value: "gestor", label: "Gestor / Supervisor" },
  { value: "rh", label: "Recursos Humanos" },
  { value: "admin", label: "Administrador" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSaved: () => void;
}

export function CreateLoginDialog({ open, onOpenChange, employee, onSaved }: Props) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [access, setAccess] = useState<NivelAcesso>("colaborador");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && employee) {
      setEmail(employee.email ?? "");
      setPassword("");
      setAccess("colaborador");
    }
  }, [open, employee]);

  async function save() {
    if (!employee) return;
    if (!email.trim()) {
      toast({ title: "Informe o e-mail de acesso", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Senha muito curta", description: "Use ao menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const userId = await createUserAccount(email.trim(), password, employee.name);
      await setProfileAccessAndUnit(userId, access, employee.unit?.id ?? null);
      await linkEmployeeProfile(employee.id, userId);
      toast({
        title: "Acesso criado!",
        description: `${employee.name} já pode entrar com o e-mail e a senha definidos.`,
      });
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Erro ao criar acesso",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Criar acesso — {employee?.name}</DialogTitle>
          <DialogDescription>
            Gera o login desta pessoa e vincula à ficha dela.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cl-email">E-mail de acesso *</Label>
            <Input id="cl-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cl-pass">Senha inicial *</Label>
              <Input id="cl-pass" type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mín. 6 caracteres" />
            </div>
            <div className="space-y-2">
              <Label>Nível de acesso</Label>
              <Select value={access} onValueChange={(v) => setAccess(v as NivelAcesso)}>
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
            Passe essa senha para a pessoa; ela poderá trocá-la depois.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Criando..." : "Criar acesso"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
