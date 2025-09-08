export interface IPayrollEntry {
  employee_id: string;
  employee_name: string;
  salary: number;
  discount: number;
  commission: number;
  netSalary: number;
  observations: string;
}

export interface IPayrollSummary {
  totalEmployees: number;
  totalSalaries: number;
  totalDiscounts: number;
  totalCommissions: number;
  totalNet: number;
}

export interface IPayrollData {
    month: string;
    year: number;
    entries: IPayrollEntry[];
    summary: IPayrollSummary;
}

      