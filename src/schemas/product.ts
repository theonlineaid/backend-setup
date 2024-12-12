import { z } from 'zod';

// Define a schema for the Product model
export const ProductSchema = z.object({
  name: z.string(), // Required product name
  sku: z.string(), // Required SKU
  description: z.string(), // Required description
  category: z.string(), // Required category
  subcategory: z.string().optional(), // Optional subcategory
  price: z.number(), // Required price (must be a number)
  tags: z.array(z.string()).min(1), // Tags should be an array of strings, at least 1 tag
  originalPrice: z.number().optional(), // Optional original price
  discountPercentage: z.number().optional(), // Optional discount percentage
  stock: z.number(), // Required stock (must be a number)
  youtubeUrl: z.string().url().optional(), // Optional YouTube URL (must be a valid URL)
  brand: z.string().optional(), // Optional brand
  specifications: z.array(z.string()).optional(), // Optional specifications (array of strings)
  variants: z.array(z.object({
    name: z.string(),
    price: z.number(),
    stock: z.number(),
  })).optional(), // Optional product variants (array of objects with name, price, and stock)
  slug: z.string().optional(), // Optional slug
  metaTitle: z.string().optional(), // Optional meta title
  metaDescription: z.string().optional(), // Optional meta description
  isFeatured: z.boolean().optional(), // Optional featured flag
  isActive: z.boolean().optional(), // Optional active flag
  isTrash: z.boolean().optional(), // Optional trash flag
  images: z.array(z.string()).optional(), // Optional image URLs
});

export type Product = z.infer<typeof ProductSchema>;