import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import { generateCode, hashCode } from "~/utils/hash";

const schema = z.object({
    sendorEmail: z.string().email(),
    recipientEmail: z.string().email(),
    comment: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const body = await readBody<typeof schema>(event);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        console.error("Validation error:", parsed.error);
        throw createError({
            status: 400,
            message: "Invalid request data",
        });
    }
    const { sendorEmail, recipientEmail, comment } = parsed.data;

    const supabase = await serverSupabaseClient(event);
    // 1. Check if user is authenticated
    const { data, error: authError } = await supabase.auth
        .signInAnonymously();

    // 1. Check permission
    const { data: recipientUser, error: recipientError } = await supabase
        .from("users").select().eq("email", recipientEmail).single();
    if (recipientError) {
        console.error("Error fetching recipient user:", recipientError);
        throw createError({
            status: 403,
            message: "Not allowed to upload invoices to this email",
        });
    }
    const { data: stakeholder, error: stakeholderError } = await supabase
        .from("stakeholders").select().eq("email", sendorEmail).eq(
            "user_id",
            recipientUser.id,
        ).single();
    if (stakeholderError) {
        console.error("Error fetching stakeholder:", stakeholderError);
        throw createError({
            status: 403,
            message: "Not allowed to upload invoices to this email",
        });
    }

    // 2. Generate and hash code
    const code = generateCode();
    const hashedCode = hashCode(code);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes
    const newInvoiceId = crypto.randomUUID();

    const { data: newInvoice, error: newInvoiceError } = await supabase
        .from("shared_invoices")
        .insert({
            id: newInvoiceId,
            user_id: recipientUser.id,
            stakeholder_id: stakeholder.id,
            comment: comment,
            token: hashedCode,
            token_expires_at: expiresAt,
        })
        .select()
        .single();

    if (newInvoiceError) {
        console.error("Error creating new invoice:", newInvoiceError);
        throw createError({
            status: 500,
            message: "Error creating new invoice",
        });
    }

    const response = {
        success: true,
        expires_at: expiresAt.toISOString(),
        invoice_id: newInvoice.id,
        toJSON() {
            return {
                success: this.success,
                expires_at: this.expires_at,
                invoice_id: this.invoice_id,
            };
        },
    };
    return response;
});
