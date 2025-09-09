import api from "@/api";
import { IEmployee } from "@/types/employee";

class EmployeeService {

    create = async (payload: Partial<IEmployee>): Promise<IEmployee> => {
        const { data } = await api.post<IEmployee>('employee/for-company', payload);
        return data;
    }
}


export const employeeService = new EmployeeService();