import { signInSchema } from "@/validations/signin.schema";
import { z } from "zod";

export type ISignInSchema = z.infer<typeof signInSchema>;