import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users as UsersIcon, Shield, UserPlus, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth, type NivelAcesso } from "@/contexts/AuthContext";
import { listProfiles, updateAccessLevel } from "@/lib/api/users";

const LEVELS: { value: NivelAcesso; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "rh", label: "Recursos Humanos" },
  { value: "gestor", label: "Gestor" },
  { value: "colaborador", label: "Colaborador" },
  { value: "candidato", label: "Candidato" },
];

const levelBadge: Record<string, string> = {
  admin: "bg-primary/10 text-primary",
  rh: "bg-info/10 text-info",
  gestor: "bg-warning/10 text-warning",
  colaborador: "bg-muted text-muted-foreground",
  candidato: "bg-secondary text-secondary-foreground",
};

export default function Users() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: listProfiles,
  });

  async function changeLevel(id: string, level: NivelAcesso) {
    try {
      await updateAccessLevel(id, level);
      toast({ title: "Nível de acesso atualizado!" });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    } catch (err) {
      toast({
        title: "Erro ao atualizar",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  }

  const signupLink = `${window.location.origin}/signup`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usuários & Equipe</h1>
        <p className="text-muted-foreground">
          Gerencie quem tem acesso à plataforma e o nível de cada pessoa
        </p>
      </div>

      {/* Convite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-primary" />
            Convidar alguém para a equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Compartilhe este link para a pessoa criar a conta dela. Depois que ela
            se cadastrar, ela aparece na lista abaixo como "Colaborador" e você
            ajusta o nível de acesso.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <code className="flex-1 truncate rounded-lg border bg-muted px-3 py-2 text-sm">
              {signupLink}
            </code>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                navigator.clipboard?.writeText(signupLink);
                toast({ title: "Link copiado!" });
              }}
            >
              <Copy className="h-4 w-4" />
              Copiar link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UsersIcon className="h-5 w-5 text-primary" />
            Pessoas com acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pessoa</TableHead>
                <TableHead>Nível atual</TableHead>
                <TableHead className="w-[220px]">Alterar nível</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                    Carregando usuários...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
              {users.map((u, index) => {
                const name = u.full_name || u.email || "Usuário";
                const isMe = u.id === user?.id;
                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {name} {isMe && <span className="text-xs text-muted-foreground">(você)</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`gap-1 ${levelBadge[u.access_level]}`}>
                        <Shield className="h-3 w-3" />
                        {LEVELS.find((l) => l.value === u.access_level)?.label ?? u.access_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.access_level}
                        onValueChange={(v) => changeLevel(u.id, v as NivelAcesso)}
                        disabled={isMe}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEVELS.map((l) => (
                            <SelectItem key={l.value} value={l.value}>
                              {l.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
