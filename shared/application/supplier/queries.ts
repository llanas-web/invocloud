import { z } from "zod";

export const ListSuppliersQueryFilterSchema = z.object({
    establishmentIds: z.array(z.uuid()).nonempty().optional(),
});

export type ListSuppliersQueryFilter = z.infer<
    typeof ListSuppliersQueryFilterSchema
>;
