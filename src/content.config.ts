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
    estimated: z.number(),
  })
});

export const collections = {blog};
