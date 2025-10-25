import { z } from "zod";

export const CreateOcrTaskCommandSchema = z.object({
    invoiceId: z.string().uuid(),
    provider: z.enum(["mindee"]).default("mindee"),
});
export type CreateOcrTaskCommand = z.infer<typeof CreateOcrTaskCommandSchema>;

export const ProcessOcrWebhookCommandSchema = z.object({
    jobId: z.string(),
    isValid: z.boolean(),
    prediction: z.object({
        invoiceNumber: z.string().optional(),
        totalTtc: z.number().optional(),
        dueDate: z.string().optional(),
    }).optional(),
    rawResult: z.unknown(),
});
export type ProcessOcrWebhookCommand = z.infer<
    typeof ProcessOcrWebhookCommandSchema
>;

export const RetryFailedTasksCommandSchema = z.object({
    type: z.enum(["ocr", "pdp_validation"]).optional(),
    maxAttempts: z.number().default(5),
    limit: z.number().optional(),
});
export type RetryFailedTasksCommand = z.infer<
    typeof RetryFailedTasksCommandSchema
>;

export const ProcessPendingTasksCommandSchema = z.object({
    limit: z.number().optional().default(25),
    maxAttempts: z.number().default(5),
});
export type ProcessPendingTasksCommand = z.infer<
    typeof ProcessPendingTasksCommandSchema
>;
