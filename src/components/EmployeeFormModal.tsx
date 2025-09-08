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
  onSave: (company: ICompany) => void;
  company: ICompany | null;
}

const companyDefault: ICompany = {
  id: "",
  name: "",
  slug: "",
  cnpj: "",
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: new Date(),
}

const EmployeeFormModal = ({ isOpen, onClose, onSave, company }: EmployeeFormModalProps) => {
  const [formData, setFormData] = useState<ICompany>(companyDefault);

  useEffect(() => {
    if (company) {
      setFormData(company);
    } else {
      setFormData(companyDefault);
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof ICompany, value: string | number) => {
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
            {company ? "Editar Funcionário" : "Adicionar Funcionário"}
          </DialogTitle>
          <DialogDescription>
            {company 
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
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cnpj" className="text-right">
                CNPJ
              </Label>
              <Input
                id="cnpj"
                type="text"
                value={formData.cnpj || ""}
                onChange={(e) => handleChange("cnpj", e.target.value)}
                className="col-span-3"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                Slug
              </Label>
              <Input
                id="slug"
                type="text"
                value={formData.slug || ""}
                onChange={(e) => handleChange("slug", e.target.value)}
                className="col-span-3"
                min="0"
                step="1"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="gradient">
              {company ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormModal;