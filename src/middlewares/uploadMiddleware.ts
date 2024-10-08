import multer, { StorageEngine, Multer } from 'multer';
import fs from 'fs';
import path from 'path';
import { Request } from 'express';

// Define the allowed file types
const allowedFileTypes = /jpeg|jpg|png/;

// Storage configuration for Multer
const storage: StorageEngine = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        const userFolder = path.join(__dirname, '../..', 'uploads', req.body.userName);

        // Create folder if it doesn't exist
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }

        cb(null, userFolder); // Set folder as the destination for the uploaded files
    },
    filename: (req: Request, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`); // File naming pattern
    }
});

// File filter to validate file type
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    // Check if the file type is allowed
    if (allowedFileTypes.test(fileExtension)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only .jpeg, .jpg, and .png files are allowed!')); // Reject the file
    }
};

// Initialize the upload middleware with size and file type limits
const upload: Multer = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // Limit file size to 1MB
    fileFilter
});

export default upload;