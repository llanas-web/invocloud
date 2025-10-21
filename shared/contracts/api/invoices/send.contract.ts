import { z } from "zod";

export const SendInvoicesBodySchema = z.object({
    invoices: z.array(z.uuid()).min(1),
    email: z.email(),
});

export const SendInvoicesResponseSchema = z.undefined();

export type SendInvoicesBody = z.infer<typeof SendInvoicesBodySchema>;
export type SendInvoicesResponse = z.infer<typeof SendInvoicesResponseSchema>;
