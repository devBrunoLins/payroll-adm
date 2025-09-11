import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ICompany } from "@/types/company";
import { IUser } from "@/types/user";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: IUser) => void;
  company: ICompany | null;
}

const getUserDefault = (company_id?: string): IUser => ({
  name  : "",
  email: "",
  password: "",
  role: "",
  is_active: true,
  company_id: company_id || "",
})

const UserFormModal = ({ isOpen, onClose, onSave, company }: UserFormModalProps) => {
  const [formData, setFormData] = useState<IUser>(getUserDefault());

  // Reset form when modal opens with the correct company
  useEffect(() => {
    if (isOpen && company) {
      setFormData(getUserDefault(company.id));
    }
  }, [isOpen, company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof IUser, value: string | number) => {
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
            Adicionar usuário para {company?.name	}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do novo usuário
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
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password || ""}
                onChange={(e) => handleChange("password", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
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

export default UserFormModal;