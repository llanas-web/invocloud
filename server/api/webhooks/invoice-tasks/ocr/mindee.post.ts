import { handleError } from "~~/server/core/errors/handling-error";
import { OcrMindeeRepository } from "~~/server/infra/mindee/mindee.ocr.repository";
import { useServerDi } from "~~/server/middleware/injection.middleware";
import ProcessOcrWebhookUsecase from "~~/shared/application/invoice-task/usecase/process-ocr-webhook.usecase";

export default defineEventHandler(async (event) => {
    try {
        const { repos, queries } = useServerDi(event);

        const mindeeRepository = new OcrMindeeRepository();

        const { isValid, jobId, prediction, raw } = await mindeeRepository
            .parseWebhook(
                event,
            );

        if (!jobId) {
            throw createError({
                statusCode: 400,
                statusMessage: "Missing jobId in webhook payload",
            });
        }

        const processWebhookUsecase = new ProcessOcrWebhookUsecase(
            repos,
            queries,
        );
        await processWebhookUsecase.execute({
            jobId,
            isValid,
            prediction: {
                dueDate: prediction?.dueDate ?? undefined,
                totalTtc: prediction?.totalTtc ?? undefined,
                invoiceNumber: prediction?.invoiceNumber ?? undefined,
            },
            rawResult: raw,
        });
    } catch (error) {
        return handleError(error);
    }
});
