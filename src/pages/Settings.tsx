import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, Shield, Mail, Info, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth, type NivelAcesso } from "@/contexts/AuthContext";
import { updateMyProfile } from "@/lib/api/profile";

const ACCESS_LABEL: Record<NivelAcesso, string> = {
  admin: "Administrador",
  rh: "Recursos Humanos",
  gestor: "Gestor",
  colaborador: "Colaborador",
  candidato: "Candidato",
};

export default function Settings() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile?.full_name ?? "");
  }, [profile]);

  const email = profile?.email ?? user?.email ?? "";
  const level = profile?.access_level ?? "colaborador";
  const initials = (name || email)
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      await updateMyProfile(user.id, name.trim());
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas.",
      });
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie seu perfil e as informações da conta
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Perfil */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Meu perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{name || "Sem nome"}</p>
                <Badge variant="outline" className="mt-1 gap-1">
                  <Shield className="h-3 w-3" />
                  {ACCESS_LABEL[level]}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input id="email" value={email} disabled />
              </div>
              <p className="text-xs text-muted-foreground">
                O e-mail de acesso não pode ser alterado por aqui.
              </p>
            </div>

            <Button onClick={save} disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </CardContent>
        </Card>

        {/* Conta / Sobre */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Sobre a conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nível de acesso</span>
              <span className="font-medium">{ACCESS_LABEL[level]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plataforma</span>
              <span className="font-medium">Idealize 360º</span>
            </div>
            {(level === "admin" || level === "rh") && (
              <Button variant="outline" className="mt-2 w-full gap-2" asChild>
                <Link to="/settings/users">
                  <Users className="h-4 w-4" />
                  Gerenciar usuários & equipe
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
