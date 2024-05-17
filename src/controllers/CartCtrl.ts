import { Request, Response } from 'express';
import { ErrorCode } from '../exceptions/root';
import { Product } from '@prisma/client';
import { ChangeQuantitySchema, CreateCartSchema } from '../schemas/cart';
import { prismaClient } from '..';
import { NotFoundException } from '../exceptions/notFound';

const CartCtrl = {
    addItemToCart: async (req: Request, res: Response) => {
        // Check for the existence of the same product in user's cart and alter the quantity as required
        const validatedData = CreateCartSchema.parse(req.body)
        let product: Product;
        try {
            product = await prismaClient.product.findFirstOrThrow({
                where: {
                    id: validatedData.productId
                }
            })
        } catch (err) {
            throw new NotFoundException('Product not found!', ErrorCode.PRODUCT_NOT_FOUND)
        }
        const cart = await prismaClient.cartItem.create({
            data: {
                userId: req.user.id,
                productId: product.id,
                quantity: validatedData.quantity
            }
        })
        res.json(cart)
    },

    deleteItemFromCart: async (req: Request, res: Response) => {
        // Check if user is deleting its own cart item
        await prismaClient.cartItem.delete({
            where: {
                id: +req.params.id
            }
        })
        res.json({ success: true })

    },

    changeQuantity: async (req: Request, res: Response) => {
        // Check if user is updating its own cart item
        const validatedData = ChangeQuantitySchema.parse(req.body)
        const updatedCart = await prismaClient.cartItem.update({
            where: {
                id: +req.params.id
            },
            data: {
                quantity: validatedData.quantity
            }
        })

        res.json(updatedCart)

    },

    getCart: async (req: Request, res: Response) => {
        const cart = await prismaClient.cartItem.findMany({
            where: {
                userId: req.user.id
            },
            include: {
                product: true
            }
        })
        res.json(cart)
    }
}

export default CartCtrl;