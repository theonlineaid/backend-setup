"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    destination: (req, file, cb) => __awaiter(void 0, void 0, void 0, function* () {
        const userName = req.body.userName;
        // Validate userName
        // if (!userName) {
        //     return cb(new Error('userName is required in the request body.'), '');
        // }
        const userFolder = path_1.default.join(__dirname, '../..', 'uploads', userName);
        // Create folder if it doesn't exist
        try {
            yield fs_1.default.promises.mkdir(userFolder, { recursive: true });
            cb(null, userFolder); // Set folder as the destination for the uploaded files
        }
        catch (error) {
            cb(new Error('Could not create upload folder.'), '');
        }
    }),
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
