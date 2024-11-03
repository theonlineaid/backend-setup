"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthCtrl_1 = __importDefault(require("../controllers/AuthCtrl"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const uploadMiddleware_1 = __importDefault(require("../middlewares/uploadMiddleware"));
const errorHandler_1 = require("../utils/errorHandler");
const AuthRouter = (0, express_1.Router)();
AuthRouter.post('/register', uploadMiddleware_1.default.single('profileImage'), (0, errorHandler_1.errorHandler)(AuthCtrl_1.default.register));
AuthRouter.put('/:id', uploadMiddleware_1.default.single('profileImage'), [auth_1.default], (0, errorHandler_1.errorHandler)(AuthCtrl_1.default.updateUser));
AuthRouter.post('/login', (0, errorHandler_1.errorHandler)(AuthCtrl_1.default.login));
AuthRouter.post('/logout', AuthCtrl_1.default.logout);
AuthRouter.get('/me', [auth_1.default], (0, errorHandler_1.errorHandler)(AuthCtrl_1.default.me));
AuthRouter.post('/:id', [auth_1.default], (0, errorHandler_1.errorHandler)(AuthCtrl_1.default.changeMyPassword));
AuthRouter.delete('/:id', [auth_1.default], (0, errorHandler_1.errorHandler)(AuthCtrl_1.default.deleteMyAccount));
exports.default = AuthRouter;
