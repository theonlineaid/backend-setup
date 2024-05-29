import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createUploadImage = (destination: string) => {
  const UploadImage = multer({
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
        // Create the directory if it doesn't exist
        fs.mkdirSync(destination, { recursive: true });
        cb(null, destination);
      },
      filename: function (req, file, cb) {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
      },
    }),
  });

  return UploadImage;
};

export default createUploadImage;