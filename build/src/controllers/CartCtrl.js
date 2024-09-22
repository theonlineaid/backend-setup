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
const root_1 = require("../exceptions/root");
const cart_1 = require("../schemas/cart");
const __1 = require("..");
const notFound_1 = require("../exceptions/notFound");
const CartCtrl = {
    addItemToCart: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // Validate the incoming data
        const validatedData = cart_1.CreateCartSchema.parse(req.body);
        // Fetch the product to ensure it exists
        let product;
        try {
            product = yield __1.prismaClient.product.findFirstOrThrow({
                where: {
                    id: validatedData.productId,
                },
            });
        }
        catch (err) {
            throw new notFound_1.NotFoundException('Product not found!', root_1.ErrorCode.PRODUCT_NOT_FOUND);
        }
        // Check if the product already exists in the user's cart
        const existingCartItem = yield __1.prismaClient.cartItem.findFirst({
            where: {
                userId: req.user.id,
                productId: product.id,
            },
        });
        let cartItem;
        if (existingCartItem) {
            // If the cart item exists, update its quantity
            cartItem = yield __1.prismaClient.cartItem.update({
                where: {
                    id: existingCartItem.id,
                },
                data: {
                    quantity: existingCartItem.quantity + validatedData.quantity,
                },
            });
        }
        else {
            // If the cart item does not exist, create a new cart item
            cartItem = yield __1.prismaClient.cartItem.create({
                data: {
                    userId: req.user.id,
                    productId: product.id,
                    quantity: validatedData.quantity,
                },
            });
        }
        res.json(cartItem);
    }),
    deleteItemFromCart: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const cartItemId = +req.params.id;
        // Check if the cart item exists and belongs to the authenticated user
        const cartItem = yield __1.prismaClient.cartItem.findFirst({
            where: {
                id: cartItemId,
                userId: req.user.id,
            },
        });
        if (!cartItem) {
            throw new notFound_1.NotFoundException('Cart item not found or does not belong to the user.', root_1.ErrorCode.CART_ITEM_NOT_FOUND);
        }
        // Delete the cart item
        yield __1.prismaClient.cartItem.delete({
            where: {
                id: cartItemId,
            },
        });
        res.json({ success: true });
    }),
    changeQuantity: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // Validate the request body
        const validatedData = cart_1.ChangeQuantitySchema.parse(req.body);
        const cartItemId = +req.params.id;
        // Check if the cart item exists and belongs to the authenticated user
        const cartItem = yield __1.prismaClient.cartItem.findFirst({
            where: {
                id: cartItemId,
                userId: req.user.id,
            },
        });
        if (!cartItem) {
            throw new notFound_1.NotFoundException('Cart item not found or does not belong to the user.', root_1.ErrorCode.CART_ITEM_NOT_FOUND);
        }
        // Update the cart item quantity
        const updatedCart = yield __1.prismaClient.cartItem.update({
            where: {
                id: cartItemId,
            },
            data: {
                quantity: validatedData.quantity,
            },
        });
        res.json(updatedCart);
    }),
    getAllCart: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Fetch all cart items for the authenticated user and include product details
            const cart = yield __1.prismaClient.cartItem.findMany({
                where: {
                    userId: req.user.id
                },
                include: {
                    product: true
                }
            });
            if (!cart.length) {
                throw new notFound_1.NotFoundException('No cart items found for this user.', root_1.ErrorCode.CART_NOT_FOUND);
            }
            res.json(cart);
        }
        catch (error) {
            // Handle potential errors
            if (error instanceof notFound_1.NotFoundException) {
                res.status(404).json({ message: error.message, errorCode: error.errorCode });
            }
            else {
                res.status(500).json({ message: 'An unexpected error occurred.' });
            }
        }
    }),
    deleteAllCart: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Ensure the user ID is available
            if (!req.user || !req.user.id) {
                throw new notFound_1.NotFoundException('User not authenticated.', root_1.ErrorCode.UNAUTHORIZED);
            }
            // Delete all cart items for the authenticated user
            const deleteResult = yield __1.prismaClient.cartItem.deleteMany({
                where: {
                    userId: req.user.id,
                },
            });
            // Check if any items were deleted
            if (deleteResult.count === 0) {
                return res.status(404).json({ message: 'No items in the cart to delete.' });
            }
            res.json({ message: 'All items in the cart have been deleted.', count: deleteResult.count });
        }
        catch (error) {
            console.error('Error deleting cart items:', error);
            res.status(500).json({ message: 'An error occurred while deleting cart items.' });
        }
    })
};
exports.default = CartCtrl;
