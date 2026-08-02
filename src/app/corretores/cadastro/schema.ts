import { z } from "zod";

export const CadastroCorretorSchema = z.object({
  nome: z.string().min(2, { error: "Informe seu nome completo." }).trim(),
  email: z.email({ error: "Informe um e-mail válido." }).trim(),
  telefone: z
    .string()
    .min(10, { error: "Informe um telefone válido, com DDD." })
    .trim(),
  creci: z.string().min(3, { error: "Informe o número do seu CRECI." }).trim(),
  senha: z
    .string()
    .min(8, { error: "A senha deve ter pelo menos 8 caracteres." })
    .regex(/[a-zA-Z]/, { error: "A senha deve conter ao menos uma letra." })
    .regex(/[0-9]/, { error: "A senha deve conter ao menos um número." }),
});
