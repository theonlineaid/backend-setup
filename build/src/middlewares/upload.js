"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const createUploadImage = (destination) => {
    const UploadImage = (0, multer_1.default)({
        limits: {
            fileSize: 5 * 1024 * 1024, // 5 MB file size limit
        },
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Only image files are allowed'));
            }
            cb(null, true);
        },
        storage: multer_1.default.diskStorage({
            destination: function (req, file, cb) {
                // Create the directory if it doesn't exist
                fs_1.default.mkdirSync(destination, { recursive: true });
                cb(null, destination);
            },
            filename: function (req, file, cb) {
                cb(null, `${Date.now()}${path_1.default.extname(file.originalname)}`);
            },
        }),
    });
    return UploadImage;
};
exports.default = createUploadImage;
