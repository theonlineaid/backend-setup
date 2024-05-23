import multer from 'multer';
import path from 'path';
import fs from 'fs';

const reviewImageUpload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const productId = req.params.id;
      const dir = `uploads/reviews/${productId}`;

      // Create the directory if it doesn't exist
      fs.mkdirSync(dir, { recursive: true });
      
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
  }),
});

export default reviewImageUpload;
