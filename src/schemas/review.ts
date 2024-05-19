import { z } from "zod"

export const ReviewSchema = z.object({
    rating: z.number().max(5, "Rating cannot be greater than 5"),
    comment: z.string()
})

export const UpdateReviewSchema = z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().optional(),
});

