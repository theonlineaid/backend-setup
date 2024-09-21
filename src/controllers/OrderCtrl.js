"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const notFound_1 = require("../exceptions/notFound");
const root_1 = require("../exceptions/root");
const orderCtrl = {
    createOrder: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        return yield __1.prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const cartItems = yield tx.cartItem.findMany({
                where: {
                    userId: req.user.id
                },
                include: {
                    product: true
                }
            });
            if (cartItems.length == 0) {
                return res.json({ message: "cart is empty" });
            }
            const price = cartItems.reduce((prev, current) => {
                return prev + (current.quantity * +current.product.price);
            }, 0);
            const address = yield tx.address.findFirstOrThrow({
                where: {
                    id: req.user.defaultShippingAddress || undefined
                }
            });
            const order = yield tx.order.create({
                data: {
                    userId: req.user.id,
                    netAmount: price,
                    address: address.formattedAddress,
                    products: {
                        create: cartItems.map((cart) => {
                            return {
                                productId: cart.productId,
                                quantity: cart.quantity
                            };
                        })
                    }
                }
            });
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
            yield tx.orderEvent.create({ data: { orderId: order.id } });
            yield tx.cartItem.deleteMany({ where: { userId: req.user.id } });
            return res.json(order);
        }));
    }),
    listOrder: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const orders = yield __1.prismaClient.order.findMany({
                where: { userId: req.user.id },
                include: {
                    products: {
                        include: { product: true } // Include product details for each order product
                    }
                }
            });
            // Transform orders to include quantities
            const transformedOrders = orders.map(order => (Object.assign(Object.assign({}, order), { products: order.products.map(orderProduct => ({
                    productId: orderProduct.productId,
                    quantity: orderProduct.quantity,
                    productName: orderProduct.product.name,
                    productPrice: orderProduct.product.price
                })) })));
            res.json(transformedOrders);
        }
        catch (error) {
            console.error("Error listing orders:", error);
            res.status(500).json({ message: "An error occurred while listing the orders." });
        }
    }),
    // ++++++++++++++++++++++++++++
    cancelOrder: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        return yield __1.prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const orderId = +req.params.id;
            const userId = req.user.id;
            // Check if the order belongs to the user
            const order = yield tx.order.findUnique({
                where: { id: orderId }
            });
            if (!order || order.userId !== userId) {
                throw new notFound_1.NotFoundException('Order not found or not authorized to cancel', root_1.ErrorCode.ORDER_NOT_FOUND);
            }
            // Update the order status to CANCELLED
            const updatedOrder = yield tx.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' }
            });
            // Create an order event for the cancellation
            yield tx.orderEvent.create({
                data: {
                    orderId: updatedOrder.id,
                    status: 'CANCELLED'
                }
            });
            res.json(updatedOrder);
        })).catch((err) => {
            console.error('Error cancelling order:', err);
            res.status(500).json({ message: 'An error occurred while cancelling the order.' });
        });
    }),
    getOrderById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const order = yield __1.prismaClient.order.findFirstOrThrow({
                where: {
                    id: +req.params.id
                },
                include: {
                    products: true,
                    events: true
                }
            });
            res.json(order);
        }
        catch (err) {
            throw new notFound_1.NotFoundException('Order not found', root_1.ErrorCode.ORDER_NOT_FOUND);
        }
    }),
    // Admin route user can't access those below routes
    // @admin route 
    listAllOrders: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let whereClause = {};
        const status = req.query.status;
        if (status) {
            whereClause = {
                status
            };
        }
        // const skip = req.query.skip ? +req.query.skip : 0;
        const orders = yield __1.prismaClient.order.findMany({
            where: whereClause,
            skip: req.query.skip ? +req.query.skip : 0,
            take: 5
        });
        res.json(orders);
    }),
    // @admin route 
    changeStatus: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // wrap it inside transaction
        try {
            const order = yield __1.prismaClient.order.update({
                where: {
                    id: +req.params.id
                },
                data: {
                    status: req.body.status
                }
            });
            yield __1.prismaClient.orderEvent.create({
                data: {
                    orderId: order.id,
                    status: req.body.status
                }
            });
            res.json(order);
        }
        catch (err) {
            throw new notFound_1.NotFoundException('Order not found', root_1.ErrorCode.ORDER_NOT_FOUND);
        }
    }),
    // @admin route 
    listUserOrders: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let whereClause = {
            userId: +req.params.id
        };
        const status = req.params.status;
        if (status) {
            whereClause = Object.assign(Object.assign({}, whereClause), { status });
        }
        const skip = req.query.skip ? +req.query.skip : 0;
        const orders = yield __1.prismaClient.order.findMany({
            where: whereClause,
            skip: skip,
            take: 5
        });
        res.json(orders);
    })
};
exports.default = orderCtrl;
