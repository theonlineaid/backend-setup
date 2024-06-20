import { Response, Request } from "express";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/notFound";
import { ErrorCode } from "../exceptions/root";

const orderCtrl = {
    createOrder: async (req: Request, res: Response) => {
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

            const address = await tx.address.findFirstOrThrow({
                where: {
                    id: req.user.defaultShippingAddress || undefined
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
            // const orderEvent = await tx.orderEvent.create({
            //     data: {
            //         orderId: order.id,
            //     }
            // })
            // await tx.cartItem.deleteMany({
            //     where: {
            //         userId: req.user.id
            //     }
            // })

            await tx.orderEvent.create({ data: { orderId: order.id } });
            await tx.cartItem.deleteMany({ where: { userId: req.user.id } });
            return res.json(order)
        })
    },

    listOrder: async (req: Request, res: Response) => {
        try {
            const orders = await prismaClient.order.findMany({
                where: { userId: req.user.id },
                include: {
                    products: {
                        include: { product: true } // Include product details for each order product
                    }
                }
            });

            // Transform orders to include quantities
            const transformedOrders = orders.map(order => ({
                ...order,
                products: order.products.map(orderProduct => ({
                    productId: orderProduct.productId,
                    quantity: orderProduct.quantity,
                    productName: orderProduct.product.name,
                    productPrice: orderProduct.product.price
                }))
            }));

            res.json(transformedOrders);
        } catch (error) {
            console.error("Error listing orders:", error);
            res.status(500).json({ message: "An error occurred while listing the orders." });
        }
    },

    // ++++++++++++++++++++++++++++
    cancelOrder: async (req: Request, res: Response) => {
        return await prismaClient.$transaction(async (tx) => {
            const orderId = +req.params.id;
            const userId = req.user.id;

            // Check if the order belongs to the user
            const order = await tx.order.findUnique({
                where: { id: orderId }
            });

            if (!order || order.userId !== userId) {
                throw new NotFoundException('Order not found or not authorized to cancel', ErrorCode.ORDER_NOT_FOUND);
            }

            // Update the order status to CANCELLED
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' }
            });

            // Create an order event for the cancellation
            await tx.orderEvent.create({
                data: {
                    orderId: updatedOrder.id,
                    status: 'CANCELLED'
                }
            });

            res.json(updatedOrder);
        }).catch((err) => {
            console.error('Error cancelling order:', err);
            res.status(500).json({ message: 'An error occurred while cancelling the order.' });
        });
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


    // Admin route user cant access those below routes
    listAllOrders: async (req: Request, res: Response) => {
        let whereClause = {}
        const status = req.query.status
        if (status) {
            whereClause = {
                status
            }
        }


        // const skip = req.query.skip ? +req.query.skip : 0;

        const orders = await prismaClient.order.findMany({
            where: whereClause,
            skip: req.query.skip ? +req.query.skip : 0,
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

        const skip = req.query.skip ? +req.query.skip : 0;
        const orders = await prismaClient.order.findMany({
            where: whereClause,
            skip: skip,
            take: 5
        })
        res.json(orders)

    }


}

export default orderCtrl;