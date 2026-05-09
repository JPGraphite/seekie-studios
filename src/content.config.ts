import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    time: z.string(),
    venue: z.string(),
    venueAddress: z.string(),
    region: z.enum(['geelong', 'surf-coast', 'bellarine', 'other']),
    price: z.number(),
    duration: z.string(),
    seatsLeft: z.number().optional(),
    totalSeats: z.number().optional(),
    ticketUrl: z.string(),
    coverColor: z.string(),
    coverVariant: z.string().default('default'),
    status: z.enum(['available', 'sold-out', 'waitlist']).default('available'),
    order: z.number().default(0),
    cover: z.string().optional(),
  }),
});

// One collection covering every settings singleton JSON file.
// Each singleton's shape is validated by Keystatic; we use a permissive
// passthrough schema here and cast to typed interfaces in components.
const settings = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/settings' }),
  schema: z.object({}).passthrough(),
});

export const collections = { events, settings };
