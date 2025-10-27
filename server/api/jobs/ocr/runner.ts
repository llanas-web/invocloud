import { useServerUsecases } from "~~/server/middleware/injection.middleware";

export default defineEventHandler(async (event) => {
    const { invoiceTask } = useServerUsecases(event);

    // SECURITY CHECK
    const cron_token = event.headers.get("authorization") || "";
    console.log("OCR Runner cron_token:", cron_token ? "provided" : "missing");
    console.log(
        "Expected CRON_SECRET:",
        process.env.CRON_SECRET ? "set" : "missing",
    );
    if (cron_token !== `Bearer ${process.env.CRON_SECRET}`) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    await invoiceTask.processPendingTasks.execute({
        limit: 20,
        maxAttempts: 5,
    });
});
