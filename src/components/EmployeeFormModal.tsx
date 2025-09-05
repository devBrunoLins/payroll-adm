import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IEmployee } from "@/types/employee";

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: IEmployee) => void;
  employee: IEmployee | null;
}

const employeeDefault: IEmployee = {
  id: "",
  full_name: "",
  salary: 0,
  discount: 0,
  commission: 0,
  cpf: "",
  company: {
    id: "",
    name: "",
    slug: "",
    cnpj: "",
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: new Date(),
  },
  company_id: "",
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: new Date(),
}

const EmployeeFormModal = ({ isOpen, onClose, onSave, employee }: EmployeeFormModalProps) => {
  const [formData, setFormData] = useState<IEmployee>(employeeDefault);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData(employeeDefault);
    }
  }, [employee]);

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
            {employee ? "Editar Funcionário" : "Adicionar Funcionário"}
          </DialogTitle>
          <DialogDescription>
            {employee 
              ? "Atualize as informações do funcionário"
              : "Preencha as informações do novo funcionário"}
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
                onChange={(e) => handleChange("salary", e.target.value)}
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
              {employee ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormModal;