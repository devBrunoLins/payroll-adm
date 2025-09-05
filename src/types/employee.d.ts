export interface IEmployee {
    id: string;
    company: ICompany;
    company_id: string;
    full_name: string;
    salary: number;
    discount: number;
    commission: number;
    cpf: string;
    admission_date?: string;
    termination_date?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}