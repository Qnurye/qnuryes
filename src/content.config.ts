import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

export const blog = defineCollection({
  loader: glob({ pattern: '**/*.md(x)?', base: './src/content/blog' }),
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

const link = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/links' }),
  schema: z.object({
    name: z.string(),
    url: z.string().url(),
    description: z.object({
      'en': z.string(),
      'zh-cn': z.string().optional(),
      'zh-tw': z.string().optional(),
    },
    ),
    avatar: z.string().url().optional(),
  }),
});

export const collections = { blog, link }
