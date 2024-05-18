import { Request, Response } from 'express';
import { ErrorCode } from '../exceptions/root';
import { Product } from '@prisma/client';
import { ChangeQuantitySchema, CreateCartSchema } from '../schemas/cart';
import { prismaClient } from '..';
import { NotFoundException } from '../exceptions/notFound';

const CartCtrl = {
    addItemToCart: async (req: Request, res: Response) => {
        // Validate the incoming data
        const validatedData = CreateCartSchema.parse(req.body);

        // Fetch the product to ensure it exists
        let product;
        try {
            product = await prismaClient.product.findFirstOrThrow({
                where: {
                    id: validatedData.productId,
                },
            });
        } catch (err) {
            throw new NotFoundException('Product not found!', ErrorCode.PRODUCT_NOT_FOUND);
        }

        // Check if the product already exists in the user's cart
        const existingCartItem = await prismaClient.cartItem.findFirst({
            where: {
                userId: req.user.id,
                productId: product.id,
            },
        });

        let cartItem;
        if (existingCartItem) {
            // If the cart item exists, update its quantity
            cartItem = await prismaClient.cartItem.update({
                where: {
                    id: existingCartItem.id,
                },
                data: {
                    quantity: existingCartItem.quantity + validatedData.quantity,
                },
            });
        } else {
            // If the cart item does not exist, create a new cart item
            cartItem = await prismaClient.cartItem.create({
                data: {
                    userId: req.user.id,
                    productId: product.id,
                    quantity: validatedData.quantity,
                },
            });
        }

        res.json(cartItem);
    },

    deleteItemFromCart: async (req: Request, res: Response) => {
        const cartItemId = +req.params.id;

        // Check if the cart item exists and belongs to the authenticated user
        const cartItem = await prismaClient.cartItem.findFirst({
            where: {
                id: cartItemId,
                userId: req.user.id,
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found or does not belong to the user.', ErrorCode.CART_ITEM_NOT_FOUND);
        }

        // Delete the cart item
        await prismaClient.cartItem.delete({
            where: {
                id: cartItemId,
            },
        });

        res.json({ success: true });
    },

    changeQuantity: async (req: Request, res: Response) => {
        // Validate the request body
        const validatedData = ChangeQuantitySchema.parse(req.body);
        const cartItemId = +req.params.id;

        // Check if the cart item exists and belongs to the authenticated user
        const cartItem = await prismaClient.cartItem.findFirst({
            where: {
                id: cartItemId,
                userId: req.user.id,
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found or does not belong to the user.', ErrorCode.CART_ITEM_NOT_FOUND);
        }

        // Update the cart item quantity
        const updatedCart = await prismaClient.cartItem.update({
            where: {
                id: cartItemId,
            },
            data: {
                quantity: validatedData.quantity,
            },
        });

        res.json(updatedCart);
    },

    getAllCart: async (req: Request, res: Response) => {
        try {
            // Fetch all cart items for the authenticated user and include product details
            const cart = await prismaClient.cartItem.findMany({
                where: {
                    userId: req.user.id
                },
                include: {
                    product: true
                }
            });

            if (!cart.length) {
                throw new NotFoundException('No cart items found for this user.', ErrorCode.CART_NOT_FOUND);
            }

            res.json(cart);
        } catch (error) {
            // Handle potential errors
            if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message, errorCode: error.errorCode });
            } else {
                res.status(500).json({ message: 'An unexpected error occurred.' });
            }
        }
    },

    deleteAllCart: async (req: Request, res: Response) => {
        try {
            // Ensure the user ID is available
            if (!req.user || !req.user.id) {
                throw new NotFoundException('User not authenticated.', ErrorCode.UNAUTHORIZED);
            }

            // Delete all cart items for the authenticated user
            const deleteResult = await prismaClient.cartItem.deleteMany({
                where: {
                    userId: req.user.id,
                },
            });

            // Check if any items were deleted
            if (deleteResult.count === 0) {
                return res.status(404).json({ message: 'No items in the cart to delete.' });
            }

            res.json({ message: 'All items in the cart have been deleted.', count: deleteResult.count });
        } catch (error) {
            console.error('Error deleting cart items:', error);
            res.status(500).json({ message: 'An error occurred while deleting cart items.' });
        }
    }
}

export default CartCtrl;