// Diálogo para o RH gerenciar a agenda (eventos) de um colaborador.
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  listAgenda,
  createAgendaEvent,
  deleteAgendaEvent,
  EVENT_TYPES,
} from "@/lib/api/agenda";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string | null;
  employeeName: string;
}

export function AgendaDialog({ open, onOpenChange, employeeId, employeeName }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("reuniao");
  const [saving, setSaving] = useState(false);

  const { data: events = [] } = useQuery({
    queryKey: ["agenda", employeeId],
    queryFn: () => listAgenda(employeeId!),
    enabled: !!employeeId && open,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["agenda", employeeId] });

  async function add() {
    if (!employeeId || !date || !title.trim()) {
      toast({ title: "Informe a data e o título", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createAgendaEvent({ employee_id: employeeId, event_date: date, title: title.trim(), type });
      toast({ title: "Evento adicionado!" });
      setDate("");
      setTitle("");
      setType("reuniao");
      refresh();
    } catch (err) {
      toast({
        title: "Erro ao adicionar",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await deleteAgendaEvent(id);
      refresh();
    } catch (err) {
      toast({
        title: "Erro ao excluir",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Agenda de {employeeName}</DialogTitle>
          <DialogDescription>
            Reuniões, feedbacks e treinamentos que aparecem na Jornada da pessoa.
          </DialogDescription>
        </DialogHeader>

        {/* Adicionar */}
        <div className="rounded-xl border p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ag-date">Data</Label>
              <Input id="ag-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPES).map(([v, t]) => (
                    <SelectItem key={v} value={v}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <Label htmlFor="ag-title">Título</Label>
            <Input id="ag-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Feedback de vendas" />
          </div>
          <Button className="mt-3 w-full gap-2" onClick={add} disabled={saving}>
            <Plus className="h-4 w-4" />
            {saving ? "Adicionando..." : "Adicionar evento"}
          </Button>
        </div>

        {/* Lista */}
        <div className="space-y-2">
          {events.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhum evento agendado.
            </p>
          )}
          {events.map((e) => {
            const t = EVENT_TYPES[e.type] ?? EVENT_TYPES.outro;
            return (
              <div key={e.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className={`h-2.5 w-2.5 rounded-full ${t.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{t.label}</p>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(e.date).toLocaleDateString("pt-BR")}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => remove(e.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
