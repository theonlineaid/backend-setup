"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UploadCtrl_1 = __importDefault(require("../controllers/UploadCtrl"));
const UploadRouter = (0, express_1.Router)();
UploadRouter.post('/img', UploadCtrl_1.default.uploadBanner);
UploadRouter.put('/img', UploadCtrl_1.default.updateBanner);
exports.default = UploadRouter;
