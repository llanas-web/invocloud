import { AppError } from "~/core/errors/app.error";
import {
    type RequestUploadInvoiceBody,
    RequestUploadInvoiceRequestSchema,
    type RequestUploadInvoiceResponse,
} from "~~/shared/contracts/api/security/upload/request.contract";
import {
    type SendInvoicesBody,
    SendInvoicesBodySchema,
    type SendInvoicesResponse,
} from "~~/shared/contracts/api/security/invoices/send.contract";
import {
    type ValidateUploadInvoiceBody,
    ValidateUploadInvoiceRequestSchema,
    type ValidateUploadInvoiceResponse,
} from "~~/shared/contracts/api/security/upload/validate.contract";
import {
    type SendUploadInvoiceBody,
    SendUploadInvoiceRequestSchema,
    type SendUploadInvoiceResponse,
} from "~~/shared/contracts/api/security/upload/send.contract";
import { z } from "zod";
import {
    CheckUploadAuthorizationSchema,
    type SendInvoiceByEmailCommand,
    SendInvoiceByEmailCommandSchema,
} from "~~/shared/application/invoice/commands";
import { SendInvoiceUploadSchema } from "~~/shared/contracts/api/security/invoices/upload/send.contrat";

export const invoicesApi = {
    send(body: SendInvoiceByEmailCommand) {
        return $fetch<SendInvoicesResponse>("/api/security/invoice/send", {
            method: "POST",
            body: parseBody(SendInvoiceByEmailCommandSchema, body),
        });
    },
    requestUploadAnonymous(body: RequestUploadInvoiceBody) {
        return $fetch<RequestUploadInvoiceResponse>(
            "/api/anonyme/invoices/request",
            {
                method: "POST",
                body: parseBody(RequestUploadInvoiceRequestSchema, body),
            },
        );
    },
    requestUpload(body: RequestUploadInvoiceBody) {
        return $fetch<RequestUploadInvoiceResponse>(
            "/api/security/upload/request",
            {
                method: "POST",
                body: parseBody(CheckUploadAuthorizationSchema, body),
            },
        );
    },
    validateUpload(body: ValidateUploadInvoiceBody) {
        return $fetch<ValidateUploadInvoiceResponse>(
            "/api/anonyme/upload/validate",
            {
                method: "POST",
                body: parseBody(
                    ValidateUploadInvoiceRequestSchema,
                    body,
                ),
            },
        );
    },
    sendUploadAnonymous(body: SendUploadInvoiceBody) {
        return $fetch<SendUploadInvoiceResponse>(
            "/api/anonyme/upload/send",
            {
                method: "POST",
                body: parseBody(SendUploadInvoiceRequestSchema, body),
            },
        );
    },
    sendUpload(body: SendUploadInvoiceBody) {
        return $fetch<SendUploadInvoiceResponse>(
            "/api/security/upload/send",
            {
                method: "POST",
                body: parseBody(SendInvoiceUploadSchema, body),
            },
        );
    },
    uploadFile(uploadUrl: string, file: File) {
        const { success: urlSuccess, error: urlError, data: urlData } = z.url()
            .safeParse(uploadUrl);
        const { success: fileSuccess, error: fileError, data: fileData } = z
            .instanceof(File).safeParse(file);

        if (!urlSuccess || !fileSuccess) {
            throw new AppError("Invalid upload parameters", {
                details: {
                    url: urlError,
                    file: fileError,
                },
            });
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", uploadUrl);
        return fetch(urlData, {
            method: "PUT",
            body: fileData,
        });
    },
};
