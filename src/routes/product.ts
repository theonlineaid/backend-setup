import { Router } from "express";
import { errorHandler } from "../utils/errorHandler";
import productCtrl from "../controllers/ProductCtrl";
import authMiddleware from "../middlewares/auth";
import adminMiddleware from "../middlewares/admin";

const ProductRouter: Router = Router();

ProductRouter.post('/', [authMiddleware, adminMiddleware], errorHandler(productCtrl.createProduct))
ProductRouter.get('/', errorHandler(productCtrl.getAllProducts))
ProductRouter.patch('/:id', [authMiddleware, adminMiddleware], errorHandler(productCtrl.updateProduct))
ProductRouter.delete('/:id', [authMiddleware, adminMiddleware], errorHandler(productCtrl.deleteProduct))
ProductRouter.get('/:id', errorHandler(productCtrl.getSingleProduct))
ProductRouter.get('/search', errorHandler(productCtrl.searchProducts))

export default ProductRouter;