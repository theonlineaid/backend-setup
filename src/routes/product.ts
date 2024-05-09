import { Router } from "express";
import { errorHandler } from "../utils/errorHandler";
import productCtrl from "../controllers/ProductCtrl";
import authMiddleware from "../middlewares/auth";
import adminMiddleware from "../middlewares/admin";

const ProductRouter: Router = Router();

ProductRouter.post('/', [authMiddleware, adminMiddleware], errorHandler(productCtrl.createProduct))

export default ProductRouter;

