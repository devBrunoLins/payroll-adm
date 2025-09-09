import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ICompany } from "@/types/company";
import { IEmployee } from "@/types/employee";
import { useQuery } from "@tanstack/react-query";
import { companyService } from "@/services/company.service";
import { CheckCircle, Users } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";

interface EmployeeListModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: ICompany | null;
}


const EmployeeListModal = ({ isOpen, onClose, company }: EmployeeListModalProps) => {


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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        Funcionários
                    </DialogTitle>
                    <DialogDescription>
                        Lista de funcionários da empresa {company?.name}
                    </DialogDescription>
                </DialogHeader>

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
    );
};

export default EmployeeListModal;