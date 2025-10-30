import { useServerDi } from "~~/server/middleware/injection.middleware";
import ProcessPendingTasksUsecase from "#shared/application/invoice-task/usecase/process-pending-task.usecase";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(async (event) => {
    try {
        const { repos, queries, storageRepository, ocrRepository } =
            useServerDi(
                event,
            );

        // SECURITY CHECK
        const cron_token = event.headers.get("authorization") || "";
        console.log(
            "OCR Runner cron_token:",
            cron_token ? "provided" : "missing",
        );
        console.log(
            "Expected CRON_SECRET:",
            process.env.CRON_SECRET ? "set" : "missing",
        );
        if (cron_token !== `Bearer ${process.env.CRON_SECRET}`) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
            });
        }

        const processInvoiceOcrTasksUsecase = new ProcessPendingTasksUsecase(
            repos,
            queries,
            storageRepository,
            ocrRepository,
        );

        await processInvoiceOcrTasksUsecase.execute({
            limit: 20,
            maxAttempts: 5,
        });
    } catch (error) {
        return handleError(error);
    }
});
