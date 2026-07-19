import z from "zod";

export const productValidator = z.object({
    title: z.string().min(5, "Title should be at least 5 characters long."),
    description: z.string(),
    category: z.string(),

    price: z.coerce.number().min(0.01),
    stock: z.coerce.number().min(0),
    sku: z.string(),

    keywords: z.array(z.string()),
    seoTitle: z.string(),
    seoDescription: z.string(),

    thumbnails: z
        .array(z.instanceof(File))

});


export type productValues = z.infer<typeof productValidator>

