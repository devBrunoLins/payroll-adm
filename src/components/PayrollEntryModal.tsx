import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DollarSign } from "lucide-react";
import { IEmployee } from "@/types/employee";

export interface PayrollEntry {
  employee_id: string;
  employee_name: string;
  salary: number;
  discount: number;
  commission: number;
  month: string;
  net_salary: number;
  year: number;
  observations: string;
}


interface PayrollEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: PayrollEntry) => void;
  employee: IEmployee;
  currentMonth: string;
  currentYear: number;
}

const PayrollEntryModal = ({ isOpen, onClose, onSave, employee, currentMonth, currentYear }: PayrollEntryModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<PayrollEntry, 'employee_id' | 'employee_name' | 'month' | 'year'>>({
    salary: employee.salary,
    discount: employee.discount,
    commission: employee.commission,
    observations: "",
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        salary: employee.salary,
        discount: employee.discount,
        commission: employee.commission,
        observations: "",
      });
    }
  }, [employee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: PayrollEntry = {
      salary: formData.salary,
      employee_id: employee.id,
      employee_name: employee.full_name,
      month: currentMonth,
      year: currentYear,
      ...formData,
    };
    
    onSave(entry);
    toast({
      title: "Folha preenchida",
      description: `Dados de ${employee.full_name} salvos para ${currentMonth}/${currentYear}`,
    });
    onClose();
  };

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === "observations" ? value : Number(value) || 0,
    }));
  };

  const netSalary = formData.salary - (formData.discount ? formData.discount : 0) + (formData.commission ? formData.commission : 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Preencher Folha - {currentMonth}/{currentYear}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da folha de pagamento para <strong>{employee.full_name}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Salário (R$)</Label>
                <Input
                  id="salary"
                  type="number"
                  step="0.01"
                  value={formData.salary}
                  onChange={(e) => handleChange("salary", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount">Desconto (R$)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => handleChange("discount", e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission">Comissão (R$)</Label>
                <Input
                  id="commission"
                  type="number"
                  step="0.01"
                  value={formData.commission}
                  onChange={(e) => handleChange("commission", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Salário Líquido</Label>
                <div className="flex items-center h-10 px-3 py-2 bg-muted rounded-md font-semibold text-primary">
                  R$ {netSalary.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observations">Observações (opcional)</Label>
              <Textarea
                id="observations"
                placeholder="Digite observações sobre esta folha..."
                value={formData.observations}
                onChange={(e) => handleChange("observations", e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button disabled={!formData.salary || !formData.discount || !formData.commission} type="submit" variant="gradient">
              Salvar Folha
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PayrollEntryModal;