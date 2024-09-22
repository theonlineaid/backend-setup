"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_PASS = exports.EMAIL_USER = exports.EMAIL_PASS = exports.IPINFO_TOKEN = exports.JWT_SECRET = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env' });
exports.PORT = process.env.PORT || 5000;
exports.JWT_SECRET = process.env.JWT_SECRET || "20834f2347webhdw7825631tr2165231b231hb23g162rt6";
exports.IPINFO_TOKEN = process.env.IPINFO_TOKEN || '22621f6278535b';
exports.EMAIL_PASS = process.env.EMAIL_PASS || 'Post8220';
exports.EMAIL_USER = process.env.EMAIL_USER || 'omorfaruk.dev@gmail.com';
exports.APP_PASS = process.env.APP_PASS || 'oxio fcym upea ktcy';
