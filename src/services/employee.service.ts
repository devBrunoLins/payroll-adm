import api from "@/api";
import { ISignInSchema } from "@/entities/SignIn";
import { IEmployee } from "@/types/employee";

class EmployeeService {
    getAll = async (): Promise<IEmployee[]> => {
        const { data } = await api.get<IEmployee[]>('employee');
        return data;
    };
}


export const employeeService = new EmployeeService();