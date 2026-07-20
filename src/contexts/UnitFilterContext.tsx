// =============================================================
// Filtro global de Unidade — a unidade escolhida no topo filtra
// as telas do sistema (dashboard, colaboradores, vagas, candidatos).
// =============================================================
import { createContext, useContext, useState, type ReactNode } from "react";

interface UnitFilterValue {
  unitId: string | null; // null = todas as unidades
  unitName: string;
  setUnit: (id: string | null, name: string) => void;
}

const UnitFilterContext = createContext<UnitFilterValue | undefined>(undefined);

export function UnitFilterProvider({ children }: { children: ReactNode }) {
  const [unitId, setUnitId] = useState<string | null>(null);
  const [unitName, setUnitName] = useState("Todas as Unidades");

  const setUnit = (id: string | null, name: string) => {
    setUnitId(id);
    setUnitName(name);
  };

  return (
    <UnitFilterContext.Provider value={{ unitId, unitName, setUnit }}>
      {children}
    </UnitFilterContext.Provider>
  );
}

export function useUnitFilter() {
  const ctx = useContext(UnitFilterContext);
  if (!ctx) throw new Error("useUnitFilter deve ser usado dentro de <UnitFilterProvider>");
  return ctx;
}
