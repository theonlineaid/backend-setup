import { Request, Response } from 'express';
import { prismaClient } from '..';
import { NotFoundException } from '../exceptions/notFound';
import { ErrorCode } from '../exceptions/root';

const reviewCtrl = {
    addReview: async (req: Request, res: Response) => {
        const productId =  +req.params.id; // Extract product ID from URL parameters
        const { rating, comment } = req.body;
        const userId = req.user.id; // Assumes you have user authentication
        
        try {
            // Convert productId to a number
            const productIdNum = productId;
    
            // Find the product with the specified ID
            const product = await prismaClient.product.findFirst({
                where: { id: productIdNum },
            });
    
            // Check if the product exists
            if (!product) {
                throw new NotFoundException('Product not found.', ErrorCode.PRODUCT_NOT_FOUND);
            }
    
            // Create the review for the product
            const review = await prismaClient.review.create({
                data: {
                    rating,
                    comment,
                    productId: productIdNum, // Use the parsed product ID
                    userId,
                },
            });
    
            res.json(review);
        } catch (error) {
            console.error('Error adding review:', error);
            res.status(500).json({ message: 'An error occurred while adding the review.' });
        }
    },

    deleteReview:  async (req: Request, res: Response) => {
        
    }

};

export default reviewCtrl;
