import { NextFunction, Request, Response } from "express";
import multer from "multer";

// Set up Multer for banner uploads
const bannerUpload = multer({ dest: 'uploads/banners/' });

// Middleware function for handling banner uploads
function handleBannerUpload(req: Request, res:Response, next:NextFunction) {
  bannerUpload.single('bannerImage')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Multer error occurred (e.g., file size exceeded)
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // Other error occurred
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // No errors, continue to the next middleware/route handler
    next();
  });
}

export default handleBannerUpload;

