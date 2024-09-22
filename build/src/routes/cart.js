"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const errorHandler_1 = require("../utils/errorHandler");
const CartCtrl_1 = __importDefault(require("../controllers/CartCtrl"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const CartRouter = (0, express_1.Router)();
CartRouter.post('/', [auth_1.default], (0, errorHandler_1.errorHandler)(CartCtrl_1.default.addItemToCart));
CartRouter.delete('/:id', [auth_1.default], (0, errorHandler_1.errorHandler)(CartCtrl_1.default.deleteItemFromCart));
CartRouter.put('/:id', [auth_1.default], (0, errorHandler_1.errorHandler)(CartCtrl_1.default.changeQuantity));
CartRouter.get('/', [auth_1.default], (0, errorHandler_1.errorHandler)(CartCtrl_1.default.getAllCart));
CartRouter.delete('/', [auth_1.default], (0, errorHandler_1.errorHandler)(CartCtrl_1.default.deleteAllCart));
exports.default = CartRouter;
