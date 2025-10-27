import { OcrMindeeRepository } from "~~/server/infra/mindee/mindee.ocr.repository";
import { useServerUsecases } from "~~/server/middleware/injection.middleware";

export default defineEventHandler(async (event) => {
    const { invoiceTask } = useServerUsecases(event);
    const mindeeRepository = new OcrMindeeRepository();

    const { isValid, jobId, prediction, raw } = await mindeeRepository
        .parseWebhook(
            event,
        );

    await invoiceTask.processOcrWebhook.execute({
        jobId: jobId,
        isValid,
        prediction,
        rawResult: raw,
    });
});
