import express from 'express';
import authMiddleware from '../middlewares/auth';
import reviewCtrl from '../controllers/ReviewCtrl';
import { errorHandler } from '../utils/errorHandler';
<<<<<<< HEAD
import createUploadImage from '../middlewares/upload';

const reviewImageUpload = createUploadImage('uploads/reviews/review');

const ReviewRouter = express.Router();

ReviewRouter.post('/:id', [authMiddleware], reviewImageUpload.single('reviewImage'), errorHandler(reviewCtrl.addReview));
ReviewRouter.delete('/:id', [authMiddleware], errorHandler(reviewCtrl.deleteReview));
ReviewRouter.patch('/:id', [authMiddleware], reviewImageUpload.single('reviewImage'), errorHandler(reviewCtrl.updateReview));
=======

const ReviewRouter = express.Router();

ReviewRouter.post('/:id', [authMiddleware],  errorHandler(reviewCtrl.addReview));
ReviewRouter.delete('/:id', [authMiddleware], errorHandler(reviewCtrl.deleteReview));
ReviewRouter.patch('/:id', [authMiddleware], errorHandler(reviewCtrl.updateReview));
>>>>>>> docker-setup

export default ReviewRouter;
