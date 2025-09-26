import {
    serverClient,
    serverServiceRole,
    serverUser,
} from "~~/server/lib/supabase/client";
import { z } from "zod";
import { LocalResponse } from "mindee";
import { OcrProviderName } from "~~/server/lib/ocr/types";
import { getOcrProvider } from "~~/server/lib/ocr/factory";

export default defineEventHandler(async (event) => {
    const providerName = (getQuery(event).provider as OcrProviderName) ??
        "mindee";
    const provider = getOcrProvider(providerName);
    const supabaseServiceRole = serverServiceRole(event);

    const { isValid, jobId, prediction, raw } = await provider.parseWebhook(
        event,
    );

    if (!isValid) {
        if (!jobId) {
            throw createError({ status: 400, message: "Invalid jobId" });
        } else {
            supabaseServiceRole.from("invoice_jobs").update({
                status: "error",
                error_message: "Invalid webhook",
            }).eq("job_id", jobId!);
            throw createError({ status: 400, message: "Invalid webhook" });
        }
    }

    console.log("OCR Webhook received for jobId:", jobId);
    if (jobId && prediction) {
        const { data, error } = await supabaseServiceRole
            .from("invoice_jobs")
            .update({
                status: "done",
                raw_result: typeof raw === "object" ? JSON.stringify(raw) : raw,
            }).eq("job_id", jobId!);
        console.log("predictions: ", prediction);
    }

    // Return 204 No Content
    setResponseStatus(event, 204);
    return;
});
