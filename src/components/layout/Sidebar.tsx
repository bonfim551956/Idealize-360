import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  GraduationCap,
  Settings,
  Bell,
  LogOut,
  Building2,
  UserCircle,
  ClipboardList,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Banco de Talentos",
    icon: Briefcase,
    color: "text-pillar-talents",
    children: [
      { name: "Vagas", href: "/talents/jobs" },
      { name: "Candidatos", href: "/talents/candidates" },
      { name: "Pipeline", href: "/talents/pipeline" },
    ],
  },
  {
    name: "Pessoas & Cultura",
    icon: Users,
    color: "text-pillar-people",
    children: [
      { name: "Colaboradores", href: "/people/employees" },
      { name: "Avaliações", href: "/people/evaluations" },
      { name: "PDIs", href: "/people/pdis" },
      { name: "Teste DISC", href: "/people/disc" },
      { name: "Ranking", href: "/people/ranking" },
    ],
  },
  {
    name: "Academy",
    icon: GraduationCap,
    color: "text-pillar-academy",
    children: [
      { name: "Trilhas", href: "/academy/courses" },
      { name: "Progresso", href: "/academy/progress" },
      { name: "Certificados", href: "/academy/certificates" },
    ],
  },
  {
    name: "Unidades",
    href: "/units",
    icon: Building2,
  },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const canManageUsers =
    profile?.access_level === "admin" || profile?.access_level === "rh";
  const [expandedItems, setExpandedItems] = useState<string[]>(["Banco de Talentos", "Pessoas & Cultura", "Academy"]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  const isParentActive = (children: { href: string }[]) =>
    children?.some((child) => location.pathname.startsWith(child.href));

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
            <span className="text-lg font-bold text-primary-foreground">i</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">Idealize</h1>
            <p className="text-xs text-sidebar-foreground/60">360º Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={cn(
                      "sidebar-link w-full justify-between",
                      isParentActive(item.children)
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("h-5 w-5", item.color)} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        expandedItems.includes(item.name) && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedItems.includes(item.name) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-8 mt-1 space-y-1 border-l border-sidebar-border pl-4">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={cn(
                                "block rounded-md px-3 py-2 text-sm transition-colors",
                                isActive(child.href)
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                              )}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    "sidebar-link",
                    isActive(item.href)
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-3">
          {canManageUsers && (
            <Link
              to="/settings/users"
              className={cn(
                "sidebar-link",
                isActive("/settings/users")
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <UserCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Usuários</span>
            </Link>
          )}
          <Link
            to="/settings"
            className="sidebar-link text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Configurações</span>
          </Link>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
