import api from "@/api";
import { IEmployee } from "@/types/employee";

class EmployeeService {
    getAll = async (): Promise<IEmployee[]> => {
        const { data } = await api.get<IEmployee[]>('employee');
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