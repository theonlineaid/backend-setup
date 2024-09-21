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
const path_1 = __importDefault(require("path")); // Import the 'path' module to work with file paths
const secret_1 = require("../utils/secret");
const bannerUpload = (0, multer_1.default)({
    dest: 'uploads/banners/',
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB file size limit
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    },
    storage: multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/banners/'); // Specify the destination directory
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path_1.default.extname(file.originalname)); // Use original filename with timestamp
        }
    })
});
const uploadCtrl = {
    uploadBanner: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        bannerUpload.single('bannerImage')(req, res, function (err) {
            if (err instanceof multer_1.default.MulterError) {
                // Multer error occurred (e.g., file size exceeded)
                return res.status(400).json({ error: err.message });
            }
            else if (err) {
                // Other error occurred
                return res.status(500).json({ error: 'Internal server error' });
            }
            // Check if a file was uploaded
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            // Extract the extension name from the original file name
            const extensionName = path_1.default.extname(req.file.originalname);
            // Handle the uploaded file
            // const bannerImagePath = req.file.path;
            const rsPath = req.file.path.replace(`uploads\\banners\\`, `uploads/banners/`);
            // Get the hostname of the server
            const hostname = req.hostname;
            const imagePath = `http://${hostname}:${secret_1.PORT}/${rsPath}`;
            console.log(imagePath);
            // Save the banner image path and extension name to the database or perform other actions
            // Example: Banner.create({ imagePath: bannerImagePath, extension: extensionName });
            // Send a success response with the extension name
            return res.json({ message: 'Banner uploaded successfully', imagePath, extension: extensionName });
        });
    }),
    updateBanner: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        bannerUpload.single('bannerImage')(req, res, function (err) {
            return __awaiter(this, void 0, void 0, function* () {
                if (err instanceof multer_1.default.MulterError) {
                    // Multer error occurred (e.g., file size exceeded)
                    return res.status(400).json({ error: err.message });
                }
                else if (err) {
                    // Other error occurred
                    return res.status(500).json({ error: 'Internal server error' });
                }
                // Check if a file was uploaded
                const uploadedFile = req.file;
                if (!uploadedFile) {
                    return res.status(400).json({ error: 'No file uploaded' });
                }
                // Extract the extension name from the original file name
                const extensionName = path_1.default.extname(uploadedFile.originalname);
                // Handle the uploaded file (e.g., update database, rename file, etc.)
                // Replace this with your actual update logic
                // For example, if you're updating a banner in the database, you might do something like:
                // const bannerId = req.params.id;
                // const updatedBanner = await Banner.findByIdAndUpdate(bannerId, { imagePath: uploadedFile.path });
                // Send a success response with the updated banner information
                return res.json({
                    message: 'Banner updated successfully',
                    imagePath: uploadedFile.path,
                    extension: extensionName
                });
            });
        });
    })
};
exports.default = uploadCtrl;
