import api from "@/api";
import { ICompany } from "@/types/company";
import { IEmployee } from "@/types/employee";

class CompanyService {
    getAll = async (): Promise<ICompany[]> => {
        const { data } = await api.get<ICompany[]>('company');
        return data;
    };

    getEmployeesByCompany = async (company_id: string): Promise<IEmployee[]> => {
        const { data } = await api.get<IEmployee[]>(`company/employees/${company_id}`);
        return data;
    };

    create = async (payload: ICompany): Promise<ICompany> => {
        const { data } = await api.post<ICompany>('company', payload);
        return data;
    }

    edit = async (payload: ICompany): Promise<ICompany> => {
        const { data } = await api.put<ICompany>(`company/${payload.id}`, payload);
        return data;
    }

    delete = async (payload: ICompany): Promise<string> => {
        const { data } = await api.delete<string>(`company/${payload.id}`);
        return data;
    }
}


export const companyService = new CompanyService();