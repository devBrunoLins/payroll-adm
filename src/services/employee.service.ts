import api from "@/api";
import { PayrollEntry } from "@/components/PayrollEntryModal";
import { IEmployee } from "@/types/employee";
import { IPayrollData } from "@/types/payroll";

class EmployeeService {
    getAll = async (): Promise<IEmployee[]> => {
        const { data } = await api.get<IEmployee[]>('employee');
        return data;
    };

    getPendingPayroll = async (): Promise<IEmployee[]> => {
        const { data } = await api.get<IEmployee[]>('employee/pending');
        return data;
    };

    setPendingPayroll = async ({ employee, entry}: {employee: IEmployee, entry: PayrollEntry }): Promise<{ id: string	 }> => {
        
        const { data } = await api.post<{ id: string }>('payroll-entry/generate', {
            employee_id: employee.id,
            discount: entry.discount,
            commission: entry.commission,
            notes: entry.observations,
            salary: entry.salary
        });

        return data;
    };
    
    sendPayroll = async (payroll: IPayrollData): Promise<{ id: string	 }> => {
        const { data } = await api.post<{ id: string }>('payroll-entry/send', {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            entries: payroll.entries,
            summary: payroll.summary
        });

        return data;
    };

    create = async (payload: IEmployee): Promise<IEmployee> => {
        const { data } = await api.post<IEmployee>('employee', payload);
        return data;
    }

    edit = async (payload: IEmployee): Promise<IEmployee> => {
        const { data } = await api.put<IEmployee>(`employee/${payload.id}`, payload);
        return data;
    }

    delete = async (payload: IEmployee): Promise<string> => {
        const { data } = await api.delete<string>(`employee/${payload.id}`);
        return data;
    }
}


export const employeeService = new EmployeeService();