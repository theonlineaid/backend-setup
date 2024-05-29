import { Request, Response } from 'express';
import { prismaClient } from "..";
import { NotFoundException } from '../exceptions/notFound';
import { ErrorCode } from '../exceptions/root';


const orderCtrl = {

    createOrder: async (req: Request, res: Response) => {
        // 1. to create a transaction
        // 2. to list all the cart items and proceed if cart is not empty
        // 3. calculate the total amount
        // 4. fetch address of user 
        // 5. to define computed field for formatted address on address module
        // 6. we will create a order and order productsorder products 
        // 7. create event
        // 8. to empty the cart
        return await prismaClient.$transaction(async (tx) => {
            const cartItems = await tx.cartItem.findMany({
                where: {
                    userId: req.user.id
                },
                include: {
                    product: true
                }
            })
            if (cartItems.length == 0) {
                return res.json({ message: "cart is empty" })
            }
            const price = cartItems.reduce((prev, current) => {
                return prev + (current.quantity * +current.product.price)
            }, 0);
            const address = await tx.address.findFirst({
                where: {
                    id: req.user.defaultShippingAddress
                }
            })
            const order = await tx.order.create({
                data: {
                    userId: req.user.id,
                    netAmount: price,
                    address: address.formattedAddress,
                    products: {
                        create: cartItems.map((cart) => {
                            return {
                                productId: cart.productId,
                                quantity: cart.quantity
                            }
                        })
                    }
                }
            })
            const orderEvent = await tx.orderEvent.create({
                data: {
                    orderId: order.id,
                }
            })
            await tx.cartItem.deleteMany({
                where: {
                    userId: req.user.id
                }
            })
            return res.json(order)
        })

    },

    listOrders: async (req: Request, res: Response) => {
        const orders = await prismaClient.order.findMany({
            where: {
                userId: req.user.id
            }
        })
        res.json(orders)

    },

    cancelOrder: async (req: Request, res: Response) => {


        // 1. wrap it inside tranaction
        // 2. check if the users is cancelling its own order

        try {
            const order = await prismaClient.order.update({
                where: {
                    id: +req.params.id
                },
                data: {
                    status: 'CANCELLED'
                }
            })
            await prismaClient.orderEvent.create({
                data: {
                    orderId: order.id,
                    status: "CANCELLED"
                }
            })
            res.json(order)
        } catch (err) {
            throw new NotFoundException('Order not found', ErrorCode.ORDER_NOT_FOUND)
        }

    },

    getOrderById: async (req: Request, res: Response) => {
        try {
            const order = await prismaClient.order.findFirstOrThrow({
                where: {
                    id: +req.params.id
                },
                include: {
                    products: true,
                    events: true
                }
            })
            res.json(order)
        } catch (err) {
            throw new NotFoundException('Order not found', ErrorCode.ORDER_NOT_FOUND)
        }

    },

    listAllOrders: async (req: Request, res: Response) => {
        let whereClause = {}
        const status = req.query.status
        if (status) {
            whereClause = {
                status
            }
        }
        const orders = await prismaClient.order.findMany({
            where: whereClause,
            skip: +req.query.skip || 0,
            take: 5
        })
        res.json(orders)
    },

    changeStatus: async (req: Request, res: Response) => {
        // wrap it inside transaction
        try {
            const order = await prismaClient.order.update({
                where: {
                    id: +req.params.id
                },
                data: {
                    status: req.body.status
                }
            })
            await prismaClient.orderEvent.create({
                data: {
                    orderId: order.id,
                    status: req.body.status
                }
            })
            res.json(order)
        } catch (err) {
            throw new NotFoundException('Order not found', ErrorCode.ORDER_NOT_FOUND)
        }

    },

    listUserOrders: async (req: Request, res: Response) => {
        let whereClause: any = {
            userId: +req.params.id
        }
        const status = req.params.status
        if (status) {
            whereClause = {
                ...whereClause,
                status
            }
        }
        const orders = await prismaClient.order.findMany({
            where: whereClause,
            skip: +req.query.skip || 0,
            take: 5
        })
        res.json(orders)

    }

}

export default orderCtrl;
