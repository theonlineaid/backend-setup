"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const jwt = __importStar(require("jsonwebtoken"));
const unauthorized_1 = require("../exceptions/unauthorized");
const root_1 = require("../exceptions/root");
const secret_1 = require("../utils/secret");
const __1 = require("..");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new unauthorized_1.UnauthorizedException('Unauthorized', root_1.ErrorCode.UNAUTHORIZED));
        }
        // Extract the token from the Bearer token
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new unauthorized_1.UnauthorizedException('Unauthorized', root_1.ErrorCode.UNAUTHORIZED);
        }
        // Verify the token
        const payload = jwt.verify(token, secret_1.JWT_SECRET);
        // Find the user associated with the token
        const user = yield __1.prismaClient.user.findFirst({ where: { id: payload.userId } });
        if (!user) {
            throw new unauthorized_1.UnauthorizedException('Unauthorized', root_1.ErrorCode.UNAUTHORIZED);
        }
        // Attach user to the request object
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        next(new unauthorized_1.UnauthorizedException('Unauthorized', root_1.ErrorCode.UNAUTHORIZED));
    }
});
exports.default = authMiddleware;
