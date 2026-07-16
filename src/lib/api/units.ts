// Acesso a dados: Unidades
import { supabase } from "@/lib/supabase";

export interface Unit {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  manager: string | null;
}

export async function listUnits(): Promise<Unit[]> {
  const { data, error } = await supabase
    .from("units")
    .select("id, name, city, state, manager")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export interface UnitInput {
  name: string;
  city: string | null;
  state: string | null;
  manager: string | null;
}

export async function createUnit(input: UnitInput): Promise<void> {
  const { error } = await supabase.from("units").insert(input);
  if (error) throw error;
}

export async function updateUnit(id: string, input: UnitInput): Promise<void> {
  const { error } = await supabase.from("units").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteUnit(id: string): Promise<void> {
  const { error } = await supabase.from("units").delete().eq("id", id);
  if (error) throw error;
}
