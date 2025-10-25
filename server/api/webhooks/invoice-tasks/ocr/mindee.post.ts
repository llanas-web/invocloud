import { buildRequestScope } from "~~/server/core/container";
import { OcrMindeeRepository } from "~~/server/infra/mindee/mindee.ocr.repository";
import { useServerUsecases } from "~~/server/plugins/usecases.plugin";

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
