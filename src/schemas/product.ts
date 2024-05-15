import { z } from 'zod';

// Define a schema for the Product model
export const ProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  tags: z.string().array().max(5).min(2),
});


