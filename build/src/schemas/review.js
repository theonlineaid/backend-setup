"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateReviewSchema = exports.ReviewSchema = void 0;
const zod_1 = require("zod");
exports.ReviewSchema = zod_1.z.object({
    rating: zod_1.z.string(),
    // rating: z.number().max(5, "Rating cannot be greater than 5"),
    comment: zod_1.z.string(),
    imagePath: zod_1.z.string().optional()
});
exports.UpdateReviewSchema = zod_1.z.object({
    rating: zod_1.z.string(),
    comment: zod_1.z.string().optional(),
    imagePath: zod_1.z.string().optional()
});
