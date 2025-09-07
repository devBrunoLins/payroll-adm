import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PayrollEntry } from "@/components/PayrollEntryModal";

interface PayrollSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: PayrollEntry[];
  currentMonth: string;
  currentYear: number;
}

const PayrollSummaryModal = ({ isOpen, onClose, entries, currentMonth, currentYear }: PayrollSummaryModalProps) => {
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalSalaries = entries.reduce((sum, entry) => sum + entry.salary, 0);
  const totalDiscounts = entries.reduce((sum, entry) => sum + entry.discount, 0);
  const totalCommissions = entries.reduce((sum, entry) => sum + entry.commission, 0);
  const totalNet = totalSalaries - totalDiscounts + totalCommissions;

  const handleConfirm = () => {
    const payrollData = {
      month: currentMonth,
      year: currentYear,
      entries: entries.map(entry => ({
        employee_id: entry.employee_id,
        employee_name: entry.employee_name,
        salary: entry.salary,
        discount: entry.discount,
        commission: entry.commission,
        netSalary: entry.salary - entry.discount + entry.commission,
        observations: entry.observations,
      })),
      summary: {
        totalEmployees: entries.length,
        totalSalaries,
        totalDiscounts,
        totalCommissions,
        totalNet,
      },
      createdAt: new Date().toISOString(),
    };

    console.log("===== FOLHA DE PAGAMENTO FINALIZADA =====");
    console.log(payrollData);
    console.log("==========================================");

    toast({
      title: "Folha enviada com sucesso!",
      description: `Folha de ${currentMonth}/${currentYear} processada para ${entries.length} funcionário(s)`,
    });
    
    onClose();
  };

  if (entries.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nenhuma folha preenchida</DialogTitle>
            <DialogDescription>
              Não há dados de folha de pagamento para {currentMonth}/{currentYear}.
              Por favor, preencha as folhas dos funcionários primeiro.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Resumo da Folha - {currentMonth}/{currentYear}
          </DialogTitle>
          <DialogDescription>
            Confirme os dados antes de enviar a folha de pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-2">
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground">Funcionários</div>
                <div className="text-lg font-bold">{entries.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground">Total Salários</div>
                <div className="text-lg font-bold">{formatCurrency(totalSalaries)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground">Total Descontos</div>
                <div className="text-lg font-bold text-destructive">{formatCurrency(totalDiscounts)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground">Total Líquido</div>
                <div className="text-lg font-bold text-primary">{formatCurrency(totalNet)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Details */}
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-3">
              {entries.map((entry, index) => {
                const netSalary = entry.salary - entry.discount + entry.commission;
                return (
                  <Card key={entry.employee_id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="font-medium text-lg">{entry.employee_name}</div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Salário:</span>
                              <span className="font-medium">{formatCurrency(entry.salary)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingDown className="h-3 w-3 text-destructive" />
                              <span className="text-muted-foreground">Desconto:</span>
                              <Badge variant="outline" className="text-destructive">
                                {formatCurrency(entry.discount)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-secondary" />
                              <span className="text-muted-foreground">Comissão:</span>
                              <Badge variant="outline" className="text-secondary">
                                {formatCurrency(entry.commission)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Líquido:</span>
                              <span className="font-bold text-primary">{formatCurrency(netSalary)}</span>
                            </div>
                          </div>
                          {entry.observations && (
                            <div className="text-sm text-muted-foreground mt-2">
                              <span className="font-medium">Obs:</span> {entry.observations}
                            </div>
                          )}
                        </div>
                        <Badge>{index + 1}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="gradient" onClick={handleConfirm}>
            Confirmar e Enviar Folha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PayrollSummaryModal;