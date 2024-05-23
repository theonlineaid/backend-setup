import { Request, Response } from 'express';
import { prismaClient } from '..';
import { NotFoundException } from '../exceptions/notFound';
import { ErrorCode } from '../exceptions/root';
import { ReviewSchema, UpdateReviewSchema } from '../schemas/review';
import path from 'path';

const reviewCtrl = {
    addReview: async (req: Request, res: Response) => {
        ReviewSchema.parse(req.body)
        const productId = +req.params.id; // Extract product ID from URL parameters
        const { rating, comment } = req.body;
        const userId = req.user.id; // Assumes you have user authentication

        try {
            // Convert productId to a number
            const productIdNum = productId;

            const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : null; // Replace backslashes with forward slashes

            // Find the product with the specified ID
            const product = await prismaClient.product.findFirst({
                where: { id: productIdNum },
            });

            // Check if the product exists
            if (!product) {
                throw new NotFoundException('Product not found.', ErrorCode.PRODUCT_NOT_FOUND);
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Extract the extension name from the original file name
            const extensionName = path.extname(req.file.originalname);

            console.log(extensionName)

            // Create the review for the product
            const review = await prismaClient.review.create({
                data: {
                    rating,
                    comment,
                    productId: productIdNum, // Use the parsed product ID
                    userId,
                    imagePath
                },
            });

            res.json(review);
        } catch (error) {
            console.error('Error adding review:', error);
            res.status(500).json({ message: 'An error occurred while adding the review.' });
        }
    },

    deleteReview: async (req: Request, res: Response) => {
        const reviewId = +req.params.id; // Extract review ID from URL parameters
        const userId = req.user.id; // Assumes you have user authentication

        try {
            // Find the review with the specified ID
            const review = await prismaClient.review.findUnique({
                where: { id: reviewId },
            });

            // Check if the review exists and belongs to the user
            if (!review) {
                throw new NotFoundException('Review not found.', ErrorCode.REVIEW_NOT_FOUND);
            }

            if (review.userId !== userId) {
                throw new NotFoundException('You are not authorized to delete this review.', ErrorCode.UNAUTHORIZED);
            }

            // Delete the review
            await prismaClient.review.delete({
                where: { id: reviewId },
            });

            res.json({ message: 'Review deleted successfully.' });
        } catch (error) {
            console.error('Error deleting review:', error);
            res.status(500).json({ message: 'An error occurred while deleting the review.' });
        }
    },

    updateReview: async (req: Request, res: Response) => {
        const reviewId = +req.params.id; // Extract review ID from URL parameters
        const userId = req.user.id; // Assumes you have user authentication

        // Validate the incoming request data
        const validatedData = UpdateReviewSchema.parse(req.body);

        try {
            // Find the review with the specified ID
            const review = await prismaClient.review.findUnique({
                where: { id: reviewId },
            });

            // Check if the review exists and belongs to the user
            if (!review) {
                throw new NotFoundException('Review not found.', ErrorCode.REVIEW_NOT_FOUND);
            }

            if (review.userId !== userId) {
                throw new NotFoundException('You are not authorized to edit this review.', ErrorCode.UNAUTHORIZED);
            }

            // Update the review
            const updatedReview = await prismaClient.review.update({
                where: { id: reviewId },
                data: validatedData,
            });

            res.json(updatedReview);
        } catch (error) {
            console.error('Error editing review:', error);
            res.status(500).json({ message: 'An error occurred while editing the review.' });
        }
    },

};

export default reviewCtrl;
