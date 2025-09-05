import { type HttpResponseError } from "@/common/types/http";

import { AxiosError } from "axios";
import { toast } from "sonner";

export default function handleGenericErrorResponse(err: unknown) {
  if (err instanceof AxiosError) {
    const axiosError = err as AxiosError<HttpResponseError>;
    const errorMessage =
      axiosError.response?.data.message ||
      "Erro na comunicação com o servidor. Tente novamente mais tarde.";
    toast.error(errorMessage);
    return;
  }

  if (err instanceof Error) {
    const errorMessage = err.message || "Ocorreu um erro inesperado.";
    toast.error(errorMessage);
    return;
  }

  toast.error("Oops! Algo deu errado. Por favor, tente novamente.");
}
