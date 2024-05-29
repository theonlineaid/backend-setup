import { Request, Response } from 'express';
import { prismaClient } from '..';
import { NotFoundException } from '../exceptions/notFound';
import { ErrorCode } from '../exceptions/root';
import { ReviewSchema, UpdateReviewSchema } from '../schemas/review';
import path from 'path';
import fs from 'fs';

const reviewCtrl = {
    addReview: async (req: Request, res: Response) => {
        ReviewSchema.parse(req.body);
        const productId = +req.params.id;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        try {
            const product = await prismaClient.product.findFirst({
                where: { id: productId },
            });

            if (!product) {
                throw new NotFoundException('Product not found.', ErrorCode.PRODUCT_NOT_FOUND);
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const imagePath = req.file.path.replace(/\\/g, '/');

            const review = await prismaClient.review.create({
                data: {
                    rating,
                    comment,
                    productId,
                    userId,
                    imagePath,
                },
            });

            res.json(review);
        } catch (error) {
            console.error('Error adding review:', error);
            res.status(500).json({ message: 'An error occurred while adding the review.' });
        }
    },

    deleteReview: async (req: Request, res: Response) => {
        const reviewId = +req.params.id;
        const userId = req.user.id;

        try {
            const review = await prismaClient.review.findUnique({
                where: { id: reviewId },
            });

            if (!review) {
                throw new NotFoundException('Review not found.', ErrorCode.REVIEW_NOT_FOUND);
            }

            if (review.userId !== userId) {
                throw new NotFoundException('You are not authorized to delete this review.', ErrorCode.UNAUTHORIZED);
            }

            if (review.imagePath) {
                fs.unlinkSync(path.resolve(review.imagePath));
            }

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
        const reviewId = +req.params.id;
        const userId = req.user.id;
        const validatedData = UpdateReviewSchema.parse(req.body);

        try {
            const review = await prismaClient.review.findUnique({
                where: { id: reviewId },
            });

            if (!review) {
                throw new NotFoundException('Review not found.', ErrorCode.REVIEW_NOT_FOUND);
            }

            if (review.userId !== userId) {
                throw new NotFoundException('You are not authorized to edit this review.', ErrorCode.UNAUTHORIZED);
            }

            if (req.file) {
                if (review.imagePath) {
                    fs.unlinkSync(path.resolve(review.imagePath));
                }

                validatedData.imagePath = req.file.path.replace(/\\/g, '/');
            }

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
