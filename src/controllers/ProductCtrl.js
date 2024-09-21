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
const notFound_1 = require("../exceptions/notFound");
const root_1 = require("../exceptions/root");
const product_1 = require("../schemas/product");
const __1 = require("..");
const productCtrl = {
    createProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        product_1.ProductSchema.parse(req.body);
        const product = yield __1.prismaClient.product.create({
            data: Object.assign(Object.assign({}, req.body), { tags: req.body.tags.join(',') })
        });
        res.json(product);
    }),
    updateProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const product = req.body;
            if (product.tags) {
                product.tags = product.tags.join(',');
            }
            const updateProduct_ = yield __1.prismaClient.product.update({
                where: {
                    id: +req.params.id
                },
                data: product
            });
            res.json(updateProduct_);
        }
        catch (err) {
            throw new notFound_1.NotFoundException('Product not found.', root_1.ErrorCode.PRODUCT_NOT_FOUND);
        }
    }),
    deleteProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const productId = +req.params.id;
            yield __1.prismaClient.product.delete({
                where: {
                    id: productId
                }
            });
            res.json({ success: true, message: 'Product deleted successfully.' });
        }
        catch (err) {
            throw new notFound_1.NotFoundException('Product not found.', root_1.ErrorCode.PRODUCT_NOT_FOUND);
        }
    }),
    getAllProducts: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Get the value of 'skip' from the query parameters or default to 0
            const skip = req.query.skip ? +req.query.skip : 0;
            // Count the total number of products
            const count = yield __1.prismaClient.product.count();
            // Fetch products with pagination
            const products = yield __1.prismaClient.product.findMany({
                skip: skip,
                take: 5 // initially show only five 
            });
            // Send the response with product count and data
            res.json({
                count: count,
                data: products
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            throw new notFound_1.NotFoundException('Products not found.', root_1.ErrorCode.PRODUCT_NOT_FOUND);
        }
    }),
    searchProducts: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            // Get the search query from the request parameters
            const searchQuery = (_a = req.query.q) === null || _a === void 0 ? void 0 : _a.toString();
            // Get pagination options from query parameters or use defaults
            const skip = ((_b = req.query) === null || _b === void 0 ? void 0 : _b.skip) ? +((_c = req.query) === null || _c === void 0 ? void 0 : _c.skip) : 0;
            const take = req.query.take ? +req.query.take : 5;
            // Find products that match the search query
            const products = yield __1.prismaClient.product.findMany({
                where: {
                    name: {
                        search: searchQuery
                    },
                    description: {
                        search: searchQuery,
                    },
                    tags: {
                        search: searchQuery,
                    }
                },
                skip: skip,
                take: take,
            });
            if (!products || products.length === 0) {
                throw new notFound_1.NotFoundException('Product not found.', root_1.ErrorCode.PRODUCT_NOT_FOUND);
            }
            // Send the response with the search results
            res.json({ products });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal Server Error to try search' });
            console.error(error);
            throw new notFound_1.NotFoundException('Product not found.', root_1.ErrorCode.PRODUCT_NOT_FOUND);
        }
        console.log("search product ======================");
    }),
    getSingleProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const productId = parseInt(req.params.id);
            // Find the product with the specified ID
            const product = yield __1.prismaClient.product.findFirst({
                where: {
                    id: productId
                },
                include: {
                    reviews: true // Include the reviews related to this product
                }
            });
            if (!product) {
                throw new notFound_1.NotFoundException('Product not found.', root_1.ErrorCode.PRODUCT_NOT_FOUND);
            }
            res.json(product);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            throw new notFound_1.NotFoundException('Product not found.', root_1.ErrorCode.PRODUCT_NOT_FOUND);
        }
        console.log("Single product ======================");
    }),
};
exports.default = productCtrl;