import { z } from "zod";

export const amountField = z.union([z.string(), z.number()])
    .transform(parseAmountFR)
    .pipe(z.number().positive("Le montant doit être positif."));
