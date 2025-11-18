import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export const collections = {
    index: defineCollection({
        type: "page",
        source: "index.yaml",
        schema: z.object({
            title: z.string(),
            description: z.string(),
            keywords: z.string().optional(),
            hero: z.object({
                title: z.string(),
                description: z.string(),
            }),
            sections: z.array(
                z.object({
                    title: z.string(),
                    description: z.string().optional(),
                    features: z.array(
                        z.object({
                            title: z.string(),
                            description: z.string().optional(),
                            icon: z.string().optional(),
                        }),
                    ).optional(),
                }),
            ),
            pricing: z.object({
                title: z.string(),
                description: z.string().optional(),
                plans: z.array(
                    z.object({
                        name: z.string(),
                        price: z.string(),
                        features: z.array(z.string()),
                    }),
                ),
            }),
        }),
    }),
    plans: defineCollection({
        type: "data",
        source: "plans/**.yaml",
        schema: z.object({
            id: z.string(),
            name: z.string(),
            title: z.string(),
            description: z.string().optional(),
            price: z.string(),
            establisments: z.number().nullable(),
            users: z.number().nullable(),
            "monthly-invoices": z.number().nullable(),
            "price-per-extra-invoice": z.number(),
            pdp: z.boolean(),
            ocr: z.boolean(),
            "email-invoice": z.boolean().optional(),
            "transfert-invoice": z.boolean().optional(),
            support: z.boolean(),
            beta: z.boolean(),
            features: z.array(z.string()).optional(),
        }),
    }),
    tarifs: defineCollection({
        type: "page",
        source: "tarifs.yaml",
        schema: z.object({
            title: z.string(),
            description: z.string(),
            keywords: z.string().optional(),
            plans: z.array(
                z.object({
                    id: z.string(),
                    title: z.string(),
                    description: z.string().optional(),
                    highlight: z.boolean().optional(),
                    scale: z.boolean().optional(),
                    button: z.object({
                        label: z.string(),
                        variant: z.enum(["subtle", "outline", "solid"]),
                        to: z.string(),
                        color: z.enum([
                            "primary",
                            "secondary",
                            "success",
                            "error",
                            "warning",
                            "info",
                        ]).optional(),
                    }),
                }),
            ),
        }),
    }),
    faq: defineCollection({
        type: "page",
        source: "faq.md",
        schema: z.object({
            title: z.string(),
            description: z.string(),
            date: z.string().optional(),
            keywords: z.string().optional(),
        }),
    }),
    cgu: defineCollection({
        type: "page",
        source: "cgu.md",
        schema: z.object({
            title: z.string(),
            description: z.string(),
            date: z.string().optional(),
            keywords: z.string().optional(),
        }),
    }),
    pdc: defineCollection({
        type: "page",
        source: "pdc.md",
        schema: z.object({
            title: z.string(),
            description: z.string(),
            date: z.string().optional(),
            keywords: z.string().optional(),
        }),
    }),
};
