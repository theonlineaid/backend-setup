import { Response, Request } from "express";
import { prismaClient } from "..";

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


}

export default orderCtrl;