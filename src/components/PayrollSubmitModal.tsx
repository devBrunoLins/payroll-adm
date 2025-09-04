import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Calendar } from "lucide-react";
import { Employee } from "@/pages/Dashboard";

interface PayrollSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
}

const PayrollSubmitModal = ({ isOpen, onClose, employees }: PayrollSubmitModalProps) => {
  const { toast } = useToast();
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [webhookUrl, setWebhookUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  const handleSubmit = async () => {
    if (!month || !year) {
      toast({
        title: "Erro",
        description: "Por favor, selecione o mês e ano.",
        variant: "destructive",
      });
      return;
    }

    if (!webhookUrl) {
      toast({
        title: "Erro",
        description: "Por favor, insira a URL do webhook.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Preparar dados da folha de pagamento
    const payrollData = {
      period: {
        month: parseInt(month),
        monthName: months.find(m => m.value === month)?.label,
        year: parseInt(year)
      },
      generatedAt: new Date().toISOString(),
      summary: {
        totalEmployees: employees.length,
        totalSalaries: employees.reduce((sum, emp) => sum + emp.salary, 0),
        totalDiscounts: employees.reduce((sum, emp) => sum + emp.discount, 0),
        totalCommissions: employees.reduce((sum, emp) => sum + emp.commission, 0),
        totalNet: employees.reduce((sum, emp) => sum + (emp.salary - emp.discount + emp.commission), 0)
      },
      employees: employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        salary: emp.salary,
        discount: emp.discount,
        commission: emp.commission,
        netSalary: emp.salary - emp.discount + emp.commission
      })),
      notes: notes || "Sem observações"
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(payrollData),
      });

      toast({
        title: "Folha de Pagamento Enviada",
        description: `Dados de ${months.find(m => m.value === month)?.label}/${year} enviados com sucesso.`,
      });

      // Limpar formulário
      setMonth("");
      setNotes("");
      onClose();
    } catch (error) {
      console.error("Erro ao enviar folha de pagamento:", error);
      toast({
        title: "Erro",
        description: "Falha ao enviar a folha de pagamento. Verifique a URL e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Enviar Folha de Pagamento
          </DialogTitle>
          <DialogDescription>
            Selecione o período e envie os dados da folha de pagamento.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Mês</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger id="month">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Ano</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id="year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook">URL do Webhook (Zapier, Make, etc.)</Label>
            <Input
              id="webhook"
              type="url"
              placeholder="https://hooks.zapier.com/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Configure um webhook em sua ferramenta de automação para receber os dados.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre esta folha de pagamento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-sm font-medium mb-1">Resumo da Folha</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• {employees.length} funcionários</p>
              <p>• Total líquido: {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(employees.reduce((sum, emp) => sum + (emp.salary - emp.discount + emp.commission), 0))}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            variant="gradient" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>Enviando...</>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Folha
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PayrollSubmitModal;