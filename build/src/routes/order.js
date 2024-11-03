"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const errorHandler_1 = require("../utils/errorHandler");
const auth_1 = __importDefault(require("../middlewares/auth"));
const OrderCtrl_1 = __importDefault(require("../controllers/OrderCtrl"));
const admin_1 = __importDefault(require("../middlewares/admin"));
const OrderRouter = (0, express_1.Router)();
// # User routes
OrderRouter.post('/', [auth_1.default], (0, errorHandler_1.errorHandler)(OrderCtrl_1.default.createOrder));
OrderRouter.get('/', [auth_1.default], (0, errorHandler_1.errorHandler)(OrderCtrl_1.default.listOrder));
OrderRouter.get('/:id', [auth_1.default], (0, errorHandler_1.errorHandler)(OrderCtrl_1.default.getOrderById));
OrderRouter.put('/:id/cancel', [auth_1.default], (0, errorHandler_1.errorHandler)(OrderCtrl_1.default.cancelOrder));
// # Admin routes
OrderRouter.get('/index', [auth_1.default, admin_1.default], (0, errorHandler_1.errorHandler)(OrderCtrl_1.default.listAllOrders));
OrderRouter.get('/users/:id', [auth_1.default, admin_1.default], (0, errorHandler_1.errorHandler)(OrderCtrl_1.default.listUserOrders));
OrderRouter.put('/:id/status', [auth_1.default, admin_1.default], (0, errorHandler_1.errorHandler)(OrderCtrl_1.default.changeStatus));
exports.default = OrderRouter;
