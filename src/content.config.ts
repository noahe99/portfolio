import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One markdown file per project and language:
// src/content/projects/de/<slug>.md and src/content/projects/en/<slug>.md
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    year: z.number(),
    role: z.string(),
    stack: z.array(z.string()),
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
    // live-urls = real websites in production, side = own projects
    category: z.enum(['live', 'side']).default('side'),
    order: z.number().default(0),
    // drafts are visible in dev only
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
