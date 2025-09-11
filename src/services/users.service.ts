import api from "@/api";
import { IUser } from "@/types/user";

class UsersService {

    create = async (payload: Partial<IUser>): Promise<IUser> => {
        const { data } = await api.post<IUser>('user', {...payload, role: 'RH_USER'});
        return data;
    }

    getUsersByCompany = async (company_id: string): Promise<IUser[]> => {
        const { data } = await api.get<IUser[]>(`user/for-company/${company_id}`);
        return data;
    };

    resetPassword = async (user_id: string): Promise<boolean> => {
        const { data } = await api.put<boolean>(`user/reset-password/${user_id}`);
        return data;
    };
}

export const usersService = new UsersService();