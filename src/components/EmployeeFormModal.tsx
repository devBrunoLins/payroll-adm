import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IEmployee } from "@/types/employee";
import { ICompany } from "@/types/company";

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: IEmployee) => void;
  company: ICompany | null;
}

const getEmployeeDefault = (company_id?: string): IEmployee => ({
  full_name: "",
  salary: 0,
  cpf: "",
  company_id: company_id || "",
})

const EmployeeFormModal = ({ isOpen, onClose, onSave, company }: EmployeeFormModalProps) => {
  const [formData, setFormData] = useState<IEmployee>(getEmployeeDefault());

  // Reset form when modal opens with the correct company
  useEffect(() => {
    if (isOpen && company) {
      setFormData(getEmployeeDefault(company.id));
    }
  }, [isOpen, company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof IEmployee, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Adicionar Funcionário para {company?.name	}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do novo funcionário
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="salary" className="text-right">
                Salário (R$)
              </Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary || ""}
                onChange={(e) => handleChange("salary", parseFloat(e.target.value) || 0)}
                className="col-span-3"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cpf" className="text-right">
                CPF
              </Label>
              <Input
                id="cpf"
                type="text"
                value={formData.cpf || ""}
                onChange={(e) => handleChange("cpf", e.target.value)}
                className="col-span-3"
                min="0"
                step="1"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="admission_date" className="text-right">
                Data de Admissão
              </Label>
              <Input
                id="admission_date"
                type="date"
                value={formData.admission_date || ""}
                onChange={(e) => handleChange("admission_date", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discount" className="text-right">
                Desconto (R$)
              </Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount || ""}
                onChange={(e) => handleChange("discount", e.target.value)}
                className="col-span-3"
                min="0"
                step="0.01"
                required
              />
            </div> */}
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="commission" className="text-right">
                Comissão (R$)
              </Label>
              <Input
                id="commission"
                type="number"
                value={formData.commission || ""}
                onChange={(e) => handleChange("commission", e.target.value)}
                className="col-span-3"
                min="0"
                step="0.01"
                required
              />
            </div> */}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="gradient">
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormModal;