"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Define the allowed file types
const allowedFileTypes = /jpeg|jpg|png/;
// Storage configuration for Multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const userFolder = path_1.default.join(__dirname, '../..', 'uploads', req.body.userName);
        // Create folder if it doesn't exist
        if (!fs_1.default.existsSync(userFolder)) {
            fs_1.default.mkdirSync(userFolder, { recursive: true });
        }
        cb(null, userFolder); // Set folder as the destination for the uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`); // File naming pattern
    }
});
// File filter to validate file type
const fileFilter = (req, file, cb) => {
    const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
    // Check if the file type is allowed
    if (allowedFileTypes.test(fileExtension)) {
        cb(null, true); // Accept the file
    }
    else {
        cb(new Error('Only .jpeg, .jpg, and .png files are allowed!')); // Reject the file
    }
};
// Initialize the upload middleware with size and file type limits
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // Limit file size to 1MB
    fileFilter
});
exports.default = upload;
