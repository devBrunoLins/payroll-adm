export interface ICompany {
    id: string;
    name: string;
    slug?: string;
    cnpj?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}