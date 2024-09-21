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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const notFound_1 = require("../exceptions/notFound");
const root_1 = require("../exceptions/root");
const review_1 = require("../schemas/review");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const reviewCtrl = {
    addReview: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        review_1.ReviewSchema.parse(req.body);
        const productId = +req.params.id;
        const { rating, comment } = req.body;
        const userId = req.user.id;
        try {
            const product = yield __1.prismaClient.product.findFirst({
                where: { id: productId },
            });
            if (!product) {
                throw new notFound_1.NotFoundException('Product not found.', root_1.ErrorCode.PRODUCT_NOT_FOUND);
            }
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            const imagePath = req.file.path.replace(/\\/g, '/');
            const review = yield __1.prismaClient.review.create({
                data: {
                    rating,
                    comment,
                    productId,
                    userId,
                    imagePath,
                },
            });
            res.json(review);
        }
        catch (error) {
            console.error('Error adding review:', error);
            res.status(500).json({ message: 'An error occurred while adding the review.' });
        }
    }),
    deleteReview: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const reviewId = +req.params.id;
        const userId = req.user.id;
        try {
            const review = yield __1.prismaClient.review.findUnique({
                where: { id: reviewId },
            });
            if (!review) {
                throw new notFound_1.NotFoundException('Review not found.', root_1.ErrorCode.REVIEW_NOT_FOUND);
            }
            if (review.userId !== userId) {
                throw new notFound_1.NotFoundException('You are not authorized to delete this review.', root_1.ErrorCode.UNAUTHORIZED);
            }
            if (review.imagePath) {
                fs_1.default.unlinkSync(path_1.default.resolve(review.imagePath));
            }
            yield __1.prismaClient.review.delete({
                where: { id: reviewId },
            });
            res.json({ message: 'Review deleted successfully.' });
        }
        catch (error) {
            console.error('Error deleting review:', error);
            res.status(500).json({ message: 'An error occurred while deleting the review.' });
        }
    }),
    updateReview: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const reviewId = +req.params.id;
        const userId = req.user.id;
        const validatedData = review_1.UpdateReviewSchema.parse(req.body);
        try {
            const review = yield __1.prismaClient.review.findUnique({
                where: { id: reviewId },
            });
            if (!review) {
                throw new notFound_1.NotFoundException('Review not found.', root_1.ErrorCode.REVIEW_NOT_FOUND);
            }
            if (review.userId !== userId) {
                throw new notFound_1.NotFoundException('You are not authorized to edit this review.', root_1.ErrorCode.UNAUTHORIZED);
            }
            if (req.file) {
                if (review.imagePath) {
                    fs_1.default.unlinkSync(path_1.default.resolve(review.imagePath));
                }
                validatedData.imagePath = req.file.path.replace(/\\/g, '/');
            }
            const updatedReview = yield __1.prismaClient.review.update({
                where: { id: reviewId },
                data: validatedData,
            });
            res.json(updatedReview);
        }
        catch (error) {
            console.error('Error editing review:', error);
            res.status(500).json({ message: 'An error occurred while editing the review.' });
        }
    }),
};
exports.default = reviewCtrl;
