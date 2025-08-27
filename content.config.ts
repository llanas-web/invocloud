import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export const collections = {
    index: defineCollection({
        type: "page",
        source: "0.index.yaml",
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
