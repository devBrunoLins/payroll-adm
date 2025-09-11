import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ICompany } from "@/types/company";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, KeyRound, Plus } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { useToast } from "@/hooks/use-toast";
import handleGenericErrorResponse from "@/common/utils/handleGenericErrorResponse";
import { usersService } from "@/services/users.service";
import { IUser } from "@/types/user";
import UserFormModal from "./UserFormModal";
import { Tooltip, TooltipContent } from "./ui/tooltip";
import { TooltipTrigger } from "./ui/tooltip";

interface UsersListModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: ICompany | null;
}


const UsersListModal = ({ isOpen, onClose, company }: UsersListModalProps) => {
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const queryClient = useQueryClient()
    const { toast } = useToast();

    const { mutateAsync: createUsers } = useMutation({
        mutationFn: (payload: IUser) => usersService.create(payload),
    });

    const { mutateAsync: resetPassword } = useMutation({
        mutationFn: (user_id: string) => usersService.resetPassword(user_id),
    });

    const handleSaveUsers = (user: IUser) => {
        createUsers({
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          is_active: user.is_active,
          company_id: user.company_id,
        }, {
          onSuccess: async () => {
            await queryClient.invalidateQueries({
              queryKey: ['users'],
              refetchType: 'active'
            });
            toast({
              title: "Usuário criado",
              description: `${user.name} foi incluído com sucesso.`,
            });
          },
          onError: handleGenericErrorResponse
        });
        
        setIsUserModalOpen(false);
      };

    const {
        data: users,
        isLoading,
        error
    } = useQuery({
        queryKey: ['users', 'company', company?.id],
        queryFn: () => usersService.getUsersByCompany(company.id),
        enabled: !!company && !!company.id,
    });

    const handleResetPassword = (userId: string) => {
        resetPassword(userId, {
            onSuccess: () => {
                toast({
                    title: "Senha redefinida",
                    description: "A senha do usuário foi redefinida com sucesso.",
                });
            },
            onError: handleGenericErrorResponse
        });
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            Lista de Usuários
                        </DialogTitle>
                        <DialogDescription>
                            {company?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">Usuários</CardTitle>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button onClick={() => setIsUserModalOpen(true)} variant="gradient">
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar
                            </Button>
                        </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        <div className="rounded-md border h-full flex flex-col">
                            <div className="flex-1 overflow-hidden">
                                <Table className="relative">
                                    <TableHeader className="sticky top-0 bg-background z-10">
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                </Table>
                                <div className="overflow-y-auto max-h-[400px]">
                                    <Table>
                                        <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                    <p className="text-lg font-medium">Carregando usuários...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : error ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <p className="text-lg font-medium text-red-700">Erro ao carregar usuários</p>
                                                    <p className="text-sm text-gray-500">Tente novamente mais tarde</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : users?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                                    <p className="text-lg font-medium text-green-700">Nenhum usuário foi encontrado</p>
                                                    <p className="text-sm text-gray-500">Clique no botão acima para adicionar um usuário</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users?.map((user, index) => (
                                            <TableRow key={`${user.id}-${index}`}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell className="font-semibold text-primary">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell className="font-semibold text-primary text-right">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="destructive" size="icon" onClick={() => handleResetPassword(user.id)}>
                                                                <KeyRound className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" align="center">
                                                            Resetar senha
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                </DialogContent>
            </Dialog>
            <UserFormModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSave={handleSaveUsers}
                company={company}
            />
        </>
    );
};

export default UsersListModal;