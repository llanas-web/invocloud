import { AppError } from "~/core/errors/app.error";
import type {
    SendInvoicesBody,
    SendInvoicesResponse,
} from "~~/shared/contracts/api/invoices/send.contract";

export const invoicesApi = {
    send(body: SendInvoicesBody) {
        if (!body.invoices || body.invoices.length === 0) {
            throw new AppError(
                "At least one invoice ID is required to send invoices.",
            );
        }
        return $fetch<SendInvoicesResponse>("/api/invoices/send", {
            method: "POST",
            body,
        });
    },
};
