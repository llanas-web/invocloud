import {
    serverSupabaseClient,
    serverSupabaseServiceRole,
} from "#supabase/server";
import { z } from "zod";
import { User } from "~/types";
import { Database } from "~/types/database.types";
import { generateCode, hashCode } from "~/utils/hash";

const schema = z.object({
    senderEmail: z.string().email(),
    recipientEmail: z.string().email(),
    comment: z.string().optional(),
    name: z.string().min(1, "File name is required"),
});

type SupabaseClient = Awaited<
    ReturnType<typeof serverSupabaseClient<Database>>
>;

const parseBody = async (event: any) => {
    const body = await readBody<typeof schema>(event);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        console.error("Validation error:", parsed.error);
        throw createError({
            status: 400,
            message: "Invalid request data",
        });
    }
    return parsed.data;
};

export default defineEventHandler(async (event) => {
    const { senderEmail, recipientEmail, comment, name } = await parseBody(
        event,
    );
    const supabase = await serverSupabaseClient<Database>(event);
    const supabaseServiceRole = serverSupabaseServiceRole<Database>(
        event,
    );

    // 1. Check if user is authenticated
    const { data: anonymousUser, error: authError } = await supabase.auth
        .signInAnonymously();

    if (authError || !anonymousUser) {
        console.error("Authentication error:", authError);
        throw createError({
            status: 401,
            message: "Unauthorized",
        });
    }

    const { data: recipientUser, error: recipientError } =
        await supabaseServiceRole
            .from("users").select().eq("email", recipientEmail).single();

    if (recipientError || !recipientUser) {
        console.error("Recipient user retrieval error:", recipientError);
        throw createError({
            status: 404,
            message: "Recipient user not found",
        });
    }

    // 1. Check permission
    const { data: establishments, error: establishmentsError } =
        await supabaseServiceRole
            .rpc(
                "check_sender_authorized",
                {
                    sender_email: senderEmail,
                    recipient_email: recipientUser.email,
                },
            );

    if (establishmentsError || !establishments || establishments.length === 0) {
        console.error("Permission check error:", establishmentsError);
        throw createError({
            status: 403,
            message:
                "You are not authorized to upload invoices for this recipient",
        });
    }

    // 2. Generate and hash code
    const code = generateCode();
    console.log("Generated code:", code);
    const hashedCode = hashCode(code);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes
    const newInvoiceId = crypto.randomUUID();

    const { data: newUploadValidation, error: newUploadValidationError } =
        await supabase
            .from("upload_validations")
            .insert({
                id: newInvoiceId,
                uploader_id: anonymousUser.user!.id,
                token_hash: hashedCode,
                token_expires_at: expiresAt.toISOString(),
                comment: comment || null,
                suppliers: establishments.map((establishments) =>
                    establishments.supplier_id
                ),
                establishments: establishments.map(
                    (establishment) => establishment.establishment_id,
                ),
                recipient_email: recipientEmail,
                file_name: name,
            })
            .select()
            .single();

    if (newUploadValidationError) {
        console.error(
            "Error creating new upload validation:",
            newUploadValidationError,
        );
        throw createError({
            status: 500,
            message: "Error creating new upload validation",
        });
    }

    const { emails } = useResend();

    try {
        await emails.send({
            from: "InvoCloud <tech@llanas.dev>",
            to: [senderEmail],
            subject: "Confirm your invoice upload",
            html:
                `Hello, <br /> Please confirm your invoice upload with this code: <br /> ${code} <br /> It will expire at ${expiresAt.toISOString()}.`,
        });
    } catch (error) {
        console.error("Error sending email:", error);
        throw createError({
            status: 500,
            message: "Error sending confirmation email",
        });
    }

    const response = {
        success: true,
        expires_at: expiresAt.toISOString(),
        upload_validation_id: newUploadValidation.id,
        toJSON() {
            return {
                success: this.success,
                expires_at: this.expires_at,
                upload_validation_id: this.upload_validation_id,
            };
        },
    };
    return response;
});
