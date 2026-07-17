import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState<"" | "confirm" | "in">("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "Use ao menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    const { error, needsConfirmation } = await signUp(email, password, name);
    setIsLoading(false);

    if (error) {
      toast({ title: "Erro no cadastro", description: error, variant: "destructive" });
      return;
    }
    if (needsConfirmation) {
      setDone("confirm");
    } else {
      toast({ title: "Conta criada!", description: "Bem-vindo à Idealize 360º." });
      navigate("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="mb-2 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary">
                <span className="font-serif text-2xl text-primary-foreground">i</span>
              </div>
            </div>
            <CardTitle className="font-serif text-3xl">Criar conta</CardTitle>
            <CardDescription>
              Cadastre-se para acessar a plataforma Idealize 360º
            </CardDescription>
          </CardHeader>
          <CardContent>
            {done === "confirm" ? (
              <div className="space-y-4 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-success" />
                <p className="font-medium">Confirme seu e-mail</p>
                <p className="text-sm text-muted-foreground">
                  Enviamos um link de confirmação para <strong>{email}</strong>.
                  Abra o e-mail, confirme sua conta e depois faça login.
                </p>
                <Button className="w-full" asChild>
                  <Link to="/login">Ir para o login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@idealize.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                  <UserPlus className="h-4 w-4" />
                  {isLoading ? "Criando..." : "Criar conta"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-primary-foreground/90">
          Já tem conta?{" "}
          <Link to="/login" className="font-semibold underline">
            Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
