import { useServerDi } from "~~/server/middleware/injection.middleware";
import ProcessInvoiceMetricUsecase from "~~/shared/application/invoice/usecases/metrics/process-invoice-metric.usecase";
import { handleError } from "~~/server/core/errors/handling-error";

export default defineEventHandler(async (event) => {
    try {
        const { repos, queries, paymentRepository } = useServerDi(
            event,
        );

        const cron_token = event.headers.get("authorization") || "";
        if (cron_token !== `Bearer ${process.env.CRON_SECRET}`) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
            });
        }

        const processInvoiceMetricUsecase = new ProcessInvoiceMetricUsecase(
            repos,
            queries,
            paymentRepository,
        );

        await processInvoiceMetricUsecase.execute();
    } catch (error) {
        return handleError(error);
    }
});
