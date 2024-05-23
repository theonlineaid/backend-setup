import { z } from "zod"

export const ReviewSchema = z.object({
    rating: z.string(),
    // rating: z.number().max(5, "Rating cannot be greater than 5"),
    comment: z.string(),
    imagePath: z.string().optional()
})

export const UpdateReviewSchema = z.object({
    rating: z.string(),
    comment: z.string().optional(),
    imagePath: z.string().optional()
});

