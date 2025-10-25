import { z } from "zod";
import { InvoiceStatus } from "~~/shared/domain/invoice/invoice.model";

export const InvoiceListQuerySchema = z.object({
    ids: z.array(z.uuid()).nonempty().optional(),
    supplierIds: z.array(z.uuid()).nonempty().optional(),
    establishmentIds: z.array(z.uuid()).nonempty().optional(),
    status: z.array(z.enum(InvoiceStatus)).nonempty().optional(),
    overdue: z.boolean().optional(),
    search: z.string().trim().min(1).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
})
    // normalize + guard date range
    .transform((q) => {
        const { dateFrom, dateTo, ...rest } = q;
        if (dateFrom && dateTo && dateFrom > dateTo) {
            return { ...rest, dateFrom: dateTo, dateTo: dateFrom }; // swap silently
        }
        return q;
    });

export type InvoiceListQuery = z.infer<typeof InvoiceListQuerySchema>;
