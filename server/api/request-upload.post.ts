import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import { Supplier, SupplierMember, User } from "~/types";
import { Database } from "~/types/database.types";
import { generateCode, hashCode } from "~/utils/hash";

const schema = z.object({
    sendorEmail: z.string().email(),
    recipientEmail: z.string().email(),
    comment: z.string().optional(),
});

type SupabaseClient = Awaited<
    ReturnType<typeof serverSupabaseClient<Database>>
>;

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

    const supabase = await serverSupabaseClient<Database>(event);

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

    const { data: recipientUser, error: recipientError } = await supabase
        .from("users").select().eq("email", recipientEmail).single();

    if (recipientError || !recipientUser) {
        console.error("Recipient user retrieval error:", recipientError);
        throw createError({
            status: 404,
            message: "Recipient user not found",
        });
    }

    // 2. Check if recipient has an establishment
    const { data: establishment, error: recipientSupplierError } =
        await supabase
            .from("establishments").select().eq("creator_id", recipientUser?.id)
            .single();

    if (recipientSupplierError || !establishment) {
        console.error(
            "Authentication or user retrieval error:",
            authError || recipientError || recipientSupplierError,
        );
        throw createError({
            status: 401,
            message: "Unauthorized or user not found",
        });
    }

    // 1. Check permission
    const allowedSupplier = await isSendorEmailDomainAllowed(
        supabase,
        sendorEmail,
        establishment.id,
    );
    if (!allowedSupplier) {
        console.error("Sender's email domain is not allowed.");
        throw createError({
            status: 403,
            message: "Forbidden: Sender's email domain is not allowed",
        });
    }

    // 2. Generate and hash code
    const code = generateCode();
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
                supplier_id: allowedSupplier.supplier.id,
                file_path:
                    `${allowedSupplier.supplier.establishment.id}/${newInvoiceId}`,
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
            to: [sendorEmail],
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

async function isSendorEmailDomainAllowed(
    supabaseClient: SupabaseClient,
    sendorEmail: string,
    establishmentId: string,
) {
    // Check if the sender's email domain matches the supplier's email domain
    const sendorDomain = sendorEmail.split("@")[1];
    const { data: supplier, error: supplierError } = await supabaseClient
        .from("supplier_members")
        .select(`
            *,
            supplier:suppliers(
                id,
                establishment:establishments(
                    id,
                    name
                )
            )
        `)
        .eq("supplier.establishment.id", establishmentId)
        .or(
            `email.eq.${sendorEmail},email.eq.*${sendorDomain}`,
        )
        .single();
    if (supplierError) {
        console.error("Error fetching supplier:", supplierError);
        return null;
    }
    console.log("Supplier found:", supplier);
    return supplier;
}
