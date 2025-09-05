import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, Search, Download, Users, TrendingUp, Wallet, Receipt, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmployeeFormModal from "@/components/EmployeeFormModal";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import PayrollSubmitModal from "@/components/PayrollSubmitModal";
import { useQuery } from "@tanstack/react-query";
import { employeeService } from "@/services/employee.service";
import handleGenericErrorResponse from "@/common/utils/handleGenericErrorResponse";

export interface Employee {
  id: string;
  name: string;
  salary: number;
  discount: number;
  commission: number;
}

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
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const {
    data: employees,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll(),
    onError: (err: unknown) => {
      return handleGenericErrorResponse(err);
    }
  });

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("@Payroll:Token");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
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

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
      toast({
        title: "Funcionário removido",
        description: `${employeeToDelete.name} foi removido com sucesso.`,
      });
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleSaveEmployee = (employee: Employee) => {
    if (selectedEmployee) {
      // Editar funcionário existente
      setEmployees(employees.map(emp => 
        emp.id === employee.id ? employee : emp
      ));
      toast({
        title: "Funcionário atualizado",
        description: `${employee.name} foi atualizado com sucesso.`,
      });
    } else {
      // Adicionar novo funcionário
      const newEmployee = {
        ...employee,
        id: Date.now().toString(),
      };
      setEmployees([...employees, newEmployee]);
      toast({
        title: "Funcionário adicionado",
        description: `${employee.name} foi adicionado com sucesso.`,
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
          emp.name,
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

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSalaries = filteredEmployees.reduce((sum, emp) => sum + emp.salary, 0);
  const totalDiscounts = filteredEmployees.reduce((sum, emp) => sum + emp.discount, 0);
  const totalCommissions = filteredEmployees.reduce((sum, emp) => sum + emp.commission, 0);
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
              <h1 className="text-xl font-semibold">Sistema de Gestão de Funcionários</h1>
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
              <div className="text-2xl font-bold">{filteredEmployees.length}</div>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comissões</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{formatCurrency(totalCommissions)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Folha Líquida</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalNet)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Funcionários</CardTitle>
                <CardDescription>Gerencie os funcionários da sua empresa</CardDescription>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="gradient" onClick={handleAddEmployee}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline" onClick={() => setIsPayrollModalOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Enviar Folha
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
                    <TableHead>Salário</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Salário Líquido</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhum funcionário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{formatCurrency(employee.salary)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-destructive">
                            {formatCurrency(employee.discount)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-secondary">
                            {formatCurrency(employee.commission)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {formatCurrency(employee.salary - employee.discount + employee.commission)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
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
                              Remover
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
        employeeName={employeeToDelete?.name || ""}
      />
      
      <PayrollSubmitModal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        employees={filteredEmployees}
      />
    </div>
  );
};

export default Dashboard;