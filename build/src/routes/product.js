"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const errorHandler_1 = require("../utils/errorHandler");
const ProductCtrl_1 = __importDefault(require("../controllers/ProductCtrl"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const admin_1 = __importDefault(require("../middlewares/admin"));
const ProductRouter = (0, express_1.Router)();
ProductRouter.post('/', [auth_1.default, admin_1.default], (0, errorHandler_1.errorHandler)(ProductCtrl_1.default.createProduct));
ProductRouter.patch('/:id', [auth_1.default, admin_1.default], (0, errorHandler_1.errorHandler)(ProductCtrl_1.default.updateProduct));
ProductRouter.delete('/:id', [auth_1.default, admin_1.default], (0, errorHandler_1.errorHandler)(ProductCtrl_1.default.deleteProduct));
ProductRouter.get('/', (0, errorHandler_1.errorHandler)(ProductCtrl_1.default.getAllProducts));
ProductRouter.get('/search', (0, errorHandler_1.errorHandler)(ProductCtrl_1.default.searchProducts)); // http://localhost:5000/api/products/search?q=apple&skip=0&take=5
ProductRouter.get('/:id', (0, errorHandler_1.errorHandler)(ProductCtrl_1.default.getSingleProduct));
exports.default = ProductRouter;
