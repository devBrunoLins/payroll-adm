import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ICompany } from "@/types/company";
import { IEmployee } from "@/types/employee";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyService } from "@/services/company.service";
import { CheckCircle, Plus, Search, Users } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import EmployeeFormModal from "@/components/EmployeeFormModal";
import { employeeService } from "@/services/employee.service";
import { useToast } from "@/hooks/use-toast";
import handleGenericErrorResponse from "@/common/utils/handleGenericErrorResponse";

interface EmployeeListModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: ICompany | null;
}


const EmployeeListModal = ({ isOpen, onClose, company }: EmployeeListModalProps) => {
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const queryClient = useQueryClient()
    const { toast } = useToast();

    const { mutateAsync: createEmployee } = useMutation({
        mutationFn: (payload: IEmployee) => employeeService.create(payload),
    });

    const handleSaveEmployee = (employee: IEmployee) => {
        createEmployee({
          full_name: employee.full_name,
          salary: employee.salary,
          cpf: employee.cpf,
          company_id: employee.company_id, // Usar o company_id do formulário
          admission_date: employee.admission_date,
          discount: employee.discount || 0,
          commission: employee.commission || 0,
        }, {
          onSuccess: async () => {
            await queryClient.invalidateQueries({
              queryKey: ['employees'],
              refetchType: 'active'
            });
            toast({
              title: "Funcionário criado",
              description: `${employee.full_name} foi incluído com sucesso.`,
            });
          },
          onError: handleGenericErrorResponse
        });
        
        setIsEmployeeModalOpen(false);
      };

    const formatCPF = (cpf: string) => {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    const {
        data: employees,
        isLoading,
        error
    } = useQuery({
        queryKey: ['employees', 'company', company?.id],
        queryFn: () => companyService.getEmployeesByCompany(company.id),
        enabled: !!company && !!company.id,
    });

    const handleAddEmployee = (company: ICompany) => {
        setIsEmployeeModalOpen(true);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            Lista de Funcionários
                        </DialogTitle>
                        <DialogDescription>
                            {company?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">Funcionários</CardTitle>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button onClick={() => handleAddEmployee(company)} variant="gradient">
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar
                            </Button>
                        </div>
                        </div>
                        {/* <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar empresa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 max-w-sm"
                        />
                        </div> */}
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        <div className="rounded-md border h-full flex flex-col">
                            <div className="flex-1 overflow-hidden">
                                <Table className="relative">
                                    <TableHeader className="sticky top-0 bg-background z-10">
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>CPF</TableHead>
                                            <TableHead>Salário</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                </Table>
                                <div className="overflow-y-auto max-h-[400px]">
                                    <Table>
                                        <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                    <p className="text-lg font-medium">Carregando funcionários...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : error ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <p className="text-lg font-medium text-red-700">Erro ao carregar funcionários</p>
                                                    <p className="text-sm text-gray-500">Tente novamente mais tarde</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : employees?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                                    <p className="text-lg font-medium text-green-700">Nenhum funcionário foi encontrado</p>
                                                    <p className="text-sm text-gray-500">Clique no botão acima para adicionar um funcionário</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        employees?.map((employee, index) => (
                                            <TableRow key={`${employee.id}-${index}`}>
                                                <TableCell className="font-medium">{employee.full_name}</TableCell>
                                                <TableCell className="font-semibold text-primary">
                                                    {formatCPF(employee.cpf)}
                                                </TableCell>
                                                <TableCell className="font-semibold text-primary">
                                                    R$ {employee.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                </DialogContent>
            </Dialog>
            <EmployeeFormModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                onSave={handleSaveEmployee}
                company={company}
            />
        </>
    );
};

export default EmployeeListModal;