import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, Plus, Search, Users, Wallet, ClipboardCheck, CheckCircle, Sparkles, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyService } from "@/services/company.service";
import handleGenericErrorResponse from "@/common/utils/handleGenericErrorResponse";
import { ICompany } from "@/types/company";
import CompanyFormModal from "@/components/CompanyFormModal";
import EmployeeListModal from "@/components/EmployeeListModal";
import EmployeeFormModal from "@/components/EmployeeFormModal";
import { IEmployee } from "@/types/employee";
import { employeeService } from "@/services/employee.service";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<ICompany | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<ICompany | null>(null);
  const [isEmployeesModalOpen, setIsEmployeesModalOpen] = useState(false);

  const queryClient = useQueryClient()
  

  const {
    data: companies,
  } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getAll(),
    enabled: true,
  });

  const { mutateAsync: create } = useMutation({
    mutationFn: (payload: ICompany) => companyService.create(payload),
  });

  const { mutateAsync: createEmployee } = useMutation({
    mutationFn: (payload: IEmployee) => employeeService.create(payload),
  });

  const { mutateAsync: edit } = useMutation({
    mutationFn: (payload: ICompany) => companyService.edit(payload),
  });

  const { mutateAsync: deleteCompany } = useMutation({
    mutationFn: (payload: ICompany) => companyService.delete(payload),
  });

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("@Payroll:Company:Token");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("@Payroll:Company:Token");
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema.",
    });
    navigate("/");
  };

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

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  const handleEditCompany = (company: ICompany) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleAddEmployee = (company: ICompany) => {
    setSelectedCompany(company);
    setIsEmployeeModalOpen(true);
  };

  const handleDeleteCompany = (company: ICompany) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (companyToDelete) {
      deleteCompany(companyToDelete, {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: ['companies'],
            refetchType: 'active'
          })
          toast({
            title: "Empresa removida",
            description: `${companyToDelete.name} foi removido com sucesso.`,
          });
        },
        onError: handleGenericErrorResponse
      });
      setIsDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };

  const handleSaveCompany = (company: ICompany) => {
    if (selectedCompany) {
      edit(company, {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: ['companies'],
            refetchType: 'active'
          })
          toast({
            title: "Empresa atualizada",
            description: `${company.name} foi atualizado com sucesso.`,
          });
        },
        onError: handleGenericErrorResponse
      });
    } else {
      // Adicionar novo funcionário

      create({
        name: company.name,
        cnpj: company.cnpj,
        slug: company.slug,
      }, {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: ['companies'],
            refetchType: 'active'
          })
          toast({
            title: "Empresa criada",
            description: `${company.name} foi incluído com sucesso.`,
          });
        },
        onError: handleGenericErrorResponse
      });
    }
    setIsModalOpen(false);
  };

  const handleViewEmployees = (company: ICompany) => {
    setSelectedCompany(company);
    setIsEmployeesModalOpen(true);
  };

  const filteredCompanies = companies?.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCNPJ = (value: number) => {
    return value.toString().replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold">Sistema de Gestão de Empresas</h1>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredCompanies?.length}</div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comissões</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{formatCurrency(totalCommissions)}</div>
            </CardContent>
          </Card> */}

          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Folha Líquida</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalNet)}</div>
            </CardContent>
          </Card> */}
        </div>

        {filteredCompanies?.length === 0 && companies?.length > 0 && (
          <Card className="mb-8 border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg animate-pulse">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                      <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 mb-1">
                      🎉 Folha de Pagamento Completa!
                    </h3>
                    <p className="text-green-700 text-lg">
                      Não há registros para serem exibidos
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      Agora você pode finalizar e enviar a folha de pagamento.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">Empresas</CardTitle>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="gradient" onClick={handleAddCompany}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredCompanies?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                          <p className="text-lg font-medium text-green-700">Nenhuma empresa foi encontrada</p>
                          <p className="text-sm text-gray-500">Clique no botão acima para adicionar uma empresa</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies?.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell className="font-semibold text-primary">
                          {formatCNPJ(+company.cnpj)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="gradient"
                              size="sm"
                              onClick={() => handleViewEmployees(company)}
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Ver funcionários
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCompany(company)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddEmployee(company)}
                            >
                              Adicionar funcionário
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCompany(company)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <CompanyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCompany}
        company={selectedCompany}
      />
      
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        companyName={companyToDelete?.name || ""}
      />

      <EmployeeFormModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
        company={selectedCompany}
      />

      <EmployeeListModal
        isOpen={isEmployeesModalOpen}
        onClose={() => setIsEmployeesModalOpen(false)}
        company={selectedCompany}
      />
    </div>
  );
};

export default Dashboard;