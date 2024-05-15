import { Request, Response } from "express";
import multer from 'multer';
import path from 'path'; // Import the 'path' module to work with file paths

const bannerUpload = multer({
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
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/banners/'); // Specify the destination directory
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname)); // Use original filename with timestamp
        }
    })
});

const uploadCtrl = {
    uploadBanner: async (req: Request, res: Response) => {
        bannerUpload.single('bannerImage')(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                // Multer error occurred (e.g., file size exceeded)
                return res.status(400).json({ error: err.message });
            } else if (err) {
                // Other error occurred
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Check if a file was uploaded
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Extract the extension name from the original file name
            const extensionName = path.extname(req.file.originalname);
          
            // Handle the uploaded file
            const bannerImagePath = req.file.path;

            // Save the banner image path and extension name to the database or perform other actions
            // Example: Banner.create({ imagePath: bannerImagePath, extension: extensionName });

            // Send a success response with the extension name
            return res.json({ message: 'Banner uploaded successfully', imagePath: bannerImagePath, extension: extensionName });
        })
    }, 

    updateBanner: async (req: Request, res: Response) => {
        bannerUpload.single('bannerImage')(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // Multer error occurred (e.g., file size exceeded)
                return res.status(400).json({ error: err.message });
            } else if (err) {
                // Other error occurred
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Check if a file was uploaded
            const uploadedFile = req.file;
            if (!uploadedFile) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Extract the extension name from the original file name
            const extensionName = path.extname(uploadedFile.originalname);
          
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
    }
        
}

export default uploadCtrl;
