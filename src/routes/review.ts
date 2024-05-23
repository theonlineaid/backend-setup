import express from 'express';
import authMiddleware from '../middlewares/auth';
import reviewCtrl from '../controllers/ReviewCtrl';
import { errorHandler } from '../utils/errorHandler';
import reviewImageUpload from '../middlewares/upload';

const ReviewRouter = express.Router();

ReviewRouter.post('/:id', [authMiddleware], reviewImageUpload.single('reviewImage'), errorHandler(reviewCtrl.addReview));
ReviewRouter.delete('/:id', [authMiddleware], errorHandler(reviewCtrl.deleteReview));
ReviewRouter.patch('/:id', [authMiddleware], errorHandler(reviewCtrl.updateReview));

export default ReviewRouter;
