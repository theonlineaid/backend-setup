import express from 'express';
import authMiddleware from '../middlewares/auth';
import reviewCtrl from '../controllers/ReviewCtrl';
import { errorHandler } from '../utils/errorHandler';
const ReviewRouter = express.Router();

ReviewRouter.post('/:id', [authMiddleware], errorHandler(reviewCtrl.addReview));

export default ReviewRouter;
