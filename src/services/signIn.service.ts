import api from "@/api";
import { ISignInSchema } from "@/entities/SignIn";

class SignInService {
    signIn = async (payload: ISignInSchema): Promise<{ access_token: string }> => {
        const { data } = await api.post<{ access_token: string }>('auth/sign-in-adm', payload);
        return data;
      };
}


export const signInService = new SignInService();