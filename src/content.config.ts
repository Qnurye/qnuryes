import {defineCollection, z} from 'astro:content';
import {glob} from "astro/loaders";

const blog = defineCollection({
  loader: glob({pattern: "**/*.md(x)?", base: "./src/blog"}),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    created_at: z.date(),
    updated_at: z.date(),
    tags: z.array(z.string()),

    // 预估阅读时间
    estimated: z.number(),

    // i18n
    translation_id: z.string().optional(),
    locale: z.string().default("en"),
  })
});

export const collections = {blog};
