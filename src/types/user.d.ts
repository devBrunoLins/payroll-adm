export interface IUser {
    id?: string;
    company_id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}