import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

export const blog = defineCollection({
  loader: glob({ pattern: '**/*.md(x)?', base: './src/blog' }),
  schema: z.object({
    title: z.string(),
    created_at: z.date(),
    updated_at: z.date(),
    tags: z.array(z.string()),

    // 预估阅读时间
    estimated: z.number(),

    // i18n
    translation_id: z.string().optional(),
    locale: z.string().default('en'),

    cover: z.string().default(''),
    description: z.string().default(''),
  }),
})

export const collections = { blog }
