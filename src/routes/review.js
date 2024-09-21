"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const ReviewCtrl_1 = __importDefault(require("../controllers/ReviewCtrl"));
const errorHandler_1 = require("../utils/errorHandler");
const upload_1 = __importDefault(require("../middlewares/upload"));
const reviewImageUpload = (0, upload_1.default)('uploads/reviews/review');
const ReviewRouter = express_1.default.Router();
ReviewRouter.post('/:id', [auth_1.default], reviewImageUpload.single('reviewImage'), (0, errorHandler_1.errorHandler)(ReviewCtrl_1.default.addReview));
ReviewRouter.delete('/:id', [auth_1.default], (0, errorHandler_1.errorHandler)(ReviewCtrl_1.default.deleteReview));
ReviewRouter.patch('/:id', [auth_1.default], reviewImageUpload.single('reviewImage'), (0, errorHandler_1.errorHandler)(ReviewCtrl_1.default.updateReview));
exports.default = ReviewRouter;
