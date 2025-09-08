import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, Search, Download, Users, Wallet, ClipboardCheck, FileText, Calendar, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmployeeFormModal from "@/components/EmployeeFormModal";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import PayrollSubmitModal from "@/components/PayrollSubmitModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/services/employee.service";
import { IEmployee } from "@/types/employee";
import handleGenericErrorResponse from "@/common/utils/handleGenericErrorResponse";
import type { PayrollEntry } from "@/components/PayrollEntryModal";
import PayrollEntryModal from "@/components/PayrollEntryModal";
import PayrollSummaryModal from "@/components/PayrollSummaryModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // const [employees, setEmployees] = useState<Employee[]>([
  //   {
  //     id: "1",
  //     name: "João Silva",
  //     salary: 3500,
  //     discount: 200,
  //     commission: 500,
  //   },
  //   {
  //     id: "2",
  //     name: "Maria Santos",
  //     salary: 4200,
  //     discount: 150,
  //     commission: 800,
  //   },
  //   {
  //     id: "3",
  //     name: "Pedro Oliveira",
  //     salary: 2800,
  //     discount: 100,
  //     commission: 350,
  //   },
  // ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<IEmployee | null>(null);
  const [selectedEmployeeForPayroll, setSelectedEmployeeForPayroll] = useState<IEmployee | null>(null);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isPayrollEntryModalOpen, setIsPayrollEntryModalOpen] = useState(false);
  const now = new Date();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  const queryClient = useQueryClient()
  

  const {
    data: employees,
  } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getPendingPayroll(),
    enabled: true,
  });

  const employeesWithPayrollFilled = payrollEntries.map(entry => entry.employee_id);
  const availableEmployees = employees?.filter(employee => 
    !employeesWithPayrollFilled.includes(employee.id)
  );

  const { mutateAsync: create } = useMutation({
    mutationFn: (payload: IEmployee) => employeeService.create(payload),
  });

  const { mutateAsync: edit } = useMutation({
    mutationFn: (payload: IEmployee) => employeeService.edit(payload),
  });

  const { mutateAsync: deleteEmployee } = useMutation({
    mutationFn: (payload: IEmployee) => employeeService.delete(payload),
  });

  const { mutateAsync: setPendingPayroll } = useMutation({
    mutationFn: (data: {employee: IEmployee, entry: PayrollEntry }) => employeeService.setPendingPayroll(data),
  });

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("@Payroll:Token");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("@Payroll:Token");
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema.",
    });
    navigate("/");
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: IEmployee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = (employee: IEmployee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete, {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: ['employees'],
            refetchType: 'active'
          })
          toast({
            title: "Funcionário demitido",
            description: `${employeeToDelete.full_name} foi demitido com sucesso.`,
          });
        },
        onError: handleGenericErrorResponse
      });
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleSaveEmployee = (employee: IEmployee) => {
    if (selectedEmployee) {
      edit(employee, {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: ['employees'],
            refetchType: 'active'
          })
          toast({
            title: "Funcionário atualizado",
            description: `${employee.full_name} foi atualizado com sucesso.`,
          });
        },
        onError: handleGenericErrorResponse
      });
    } else {
      // Adicionar novo funcionário

      create(employee, {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: ['employees'],
            refetchType: 'active'
          })
          toast({
            title: "Funcionário criado",
            description: `${employee.full_name} foi incluído com sucesso.`,
          });
        },
        onError: handleGenericErrorResponse
      });
    }
    setIsModalOpen(false);
  };

  const exportToCSV = () => {
    const headers = ["Nome", "Salário", "Desconto", "Comissão", "Salário Líquido"];
    const csvContent = [
      headers.join(","),
      ...filteredEmployees.map(emp => 
        [
          emp.full_name,
          emp.salary,
          emp.discount,
          emp.commission,
          emp.salary - emp.discount + emp.commission
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `funcionarios_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Relatório exportado",
      description: "O relatório foi baixado com sucesso.",
    });
  };

  const handleFillPayroll = (employee: IEmployee) => {
    setSelectedEmployeeForPayroll(employee);
    setIsPayrollEntryModalOpen(true);
  };

  const handleSavePayrollEntry = (entry: PayrollEntry) => {
    // Remove existing entry for this employee if any

    setPendingPayroll({ employee: selectedEmployeeForPayroll, entry }, {
      onSuccess: async () => {
        setPayrollEntries([...payrollEntries, entry]);
        setIsPayrollEntryModalOpen(false);
        setSelectedEmployeeForPayroll(null);
        toast({
          title: "Folha preenchida",
          description: `Folha de ${entry.month}/${entry.year} preenchida para ${entry.employee_name}`,
        });
        await queryClient.invalidateQueries({
          queryKey: ['employees'],
          refetchType: 'active'
        })
      },
      onError: handleGenericErrorResponse
    });
  };

  const filteredEmployees = employees?.filter(employee =>
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSalaries = filteredEmployees?.reduce((sum, emp) => sum + emp.salary, 0);
  const totalDiscounts = filteredEmployees?.reduce((sum, emp) => sum + emp.discount, 0);
  const totalCommissions = filteredEmployees?.reduce((sum, emp) => sum + emp.commission, 0);
  const totalNet = totalSalaries - totalDiscounts + totalCommissions;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold">Sistema de Gestão de Folha de Pagamento</h1>
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
              <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredEmployees?.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Salários</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSalaries)}</div>
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

        {/* Alert quando todos funcionários estão preenchidos */}
        {availableEmployees?.length === 0 && employees?.length > 0 && (
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
                      Todos os <strong>{employees?.length} funcionários</strong> já foram preenchidos para <strong>{currentMonth}/{currentYear}</strong>
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      Agora você pode finalizar e enviar a folha de pagamento.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Button 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                    onClick={() => setIsSummaryModalOpen(true)}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Enviar Folha Agora
                    <ArrowRight className="h-5 w-5 ml-2 animate-pulse" />
                  </Button>
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
                <CardTitle className="flex items-center gap-2">
                  Funcionários Pendentes
                  <Badge variant="outline" className="ml-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    {currentMonth}/{currentYear}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {availableEmployees?.length === 0 
                    ? "Todos os funcionários já foram preenchidos para este mês" 
                    : `${availableEmployees?.length} funcionário(s) pendente(s) para preencher`}
                </CardDescription>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={handleAddEmployee}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
                <Button variant="outline" disabled={payrollEntries.length === 0} onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button disabled={payrollEntries.length === 0} variant="gradient" onClick={() => setIsSummaryModalOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Enviar Folha ({payrollEntries.length})
                </Button>
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar funcionário..."
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
                    <TableHead>Salário Base</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredEmployees?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                          <p className="text-lg font-medium text-green-700">Nenhum funcionário pendente</p>
                          <p className="text-sm text-gray-500">Todos já foram processados para este período</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees?.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.full_name}</TableCell>
                        <TableCell className="font-semibold text-primary">
                          {formatCurrency(+employee.salary)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="gradient"
                              size="sm"
                              onClick={() => handleFillPayroll(employee)}
                            >
                              <ClipboardCheck className="h-4 w-4 mr-1" />
                              Preencher Folha
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEmployee(employee)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteEmployee(employee)}
                            >
                              Demitir
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

      {/* Modals */}
      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={selectedEmployee}
      />
      
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        employeeName={employeeToDelete?.full_name || ""}
      />

      {selectedEmployeeForPayroll && (
        <PayrollEntryModal
          isOpen={isPayrollEntryModalOpen}
          onClose={() => {
            setIsPayrollEntryModalOpen(false);
            setSelectedEmployeeForPayroll(null);
          }}
          onSave={handleSavePayrollEntry}
          employee={selectedEmployeeForPayroll}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      )}

      <PayrollSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => {
          setIsSummaryModalOpen(false);
          setPayrollEntries([]);
        }}
        entries={payrollEntries}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
      
      {/* <PayrollSubmitModal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        employees={filteredEmployees}
      /> */}
    </div>
  );
};

export default Dashboard;