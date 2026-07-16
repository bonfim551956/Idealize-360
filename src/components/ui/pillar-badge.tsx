import { cn } from "@/lib/utils";
import { Briefcase, Users, GraduationCap } from "lucide-react";

type PillarType = "talents" | "people" | "academy";

interface PillarBadgeProps {
  pillar: PillarType;
  className?: string;
}

const pillarConfig = {
  talents: {
    label: "Banco de Talentos",
    icon: Briefcase,
    className: "bg-pillar-talents/10 text-pillar-talents",
  },
  people: {
    label: "Pessoas & Cultura",
    icon: Users,
    className: "bg-pillar-people/10 text-pillar-people",
  },
  academy: {
    label: "Academy",
    icon: GraduationCap,
    className: "bg-pillar-academy/10 text-pillar-academy",
  },
};

export function PillarBadge({ pillar, className }: PillarBadgeProps) {
  const config = pillarConfig[pillar];
  const Icon = config.icon;

  return (
    <span className={cn("pillar-badge", config.className, className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
