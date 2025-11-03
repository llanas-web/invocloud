import { useServerDi } from "~~/server/middleware/injection.middleware";
import ProcessPendingTasksUsecase from "#shared/application/invoice-task/usecase/process-pending-task.usecase";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(async (event) => {
    try {
        const { repos, queries, storageRepository, ocrRepository } =
            useServerDi(
                event,
            );

        const cron_token = event.headers.get("authorization") || "";
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
