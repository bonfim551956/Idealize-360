// =============================================================
// Rota protegida — só deixa passar quem está autenticado.
// Opcionalmente restringe por nível de acesso.
// =============================================================
import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type NivelAcesso } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  /** Se informado, apenas estes níveis de acesso podem entrar. */
  allow?: NivelAcesso[];
}

export function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();

  // Enquanto verifica a sessão, mostra um estado de carregamento simples.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Não logado → vai para o login.
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Logado, mas sem o nível de acesso exigido → vai para a Minha Jornada
  // (página acessível a todos os níveis).
  if (allow && profile && !allow.includes(profile.access_level)) {
    return <Navigate to="/jornada" replace />;
  }

  return <Outlet />;
}
