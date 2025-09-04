import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RecoverPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de envio de email
    setTimeout(() => {
      setIsEmailSent(true);
      toast({
        title: "Email enviado!",
        description: `Instruções de recuperação foram enviadas para ${email}`,
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleBackToLogin = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
      <Card className="w-full max-w-md relative z-10 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToLogin}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">
              Recuperar Senha
            </CardTitle>
          </div>
          <CardDescription>
            {isEmailSent 
              ? "Verifique seu email para redefinir sua senha" 
              : "Digite seu email para receber as instruções de recuperação"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isEmailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email">E-mail cadastrado</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar instruções
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleBackToLogin}
                >
                  Voltar ao login
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-accent rounded-lg">
                <Mail className="h-12 w-12 mx-auto mb-3 text-primary" />
                <p className="text-sm font-medium">Email enviado com sucesso!</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Verifique sua caixa de entrada e siga as instruções
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail("");
                  }}
                >
                  Enviar novamente
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleBackToLogin}
                >
                  Voltar ao login
                </Button>
              </div>
            </div>
          )}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Para implementação real, conecte o Supabase Auth</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecoverPassword;