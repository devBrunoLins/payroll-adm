export interface IEmployee {
    id?: string;
    company_id: string;
    full_name: string;
    salary: number;
    discount?: number;
    commission?: number;
    cpf: string;
    admission_date?: string;
    termination_date?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}