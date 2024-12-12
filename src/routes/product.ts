import { Router } from "express";
import { errorHandler } from "../utils/errorHandler";
import productCtrl from "../controllers/ProductCtrl";
import authMiddleware from "../middlewares/auth";
import adminMiddleware from "../middlewares/admin";

const ProductRouter: Router = Router();

ProductRouter.post('/', [authMiddleware, adminMiddleware], errorHandler(productCtrl.createProduct))
ProductRouter.patch('/:id', [authMiddleware, adminMiddleware], errorHandler(productCtrl.updateProduct))
ProductRouter.delete('/:id', [authMiddleware, adminMiddleware], errorHandler(productCtrl.deleteProduct))
ProductRouter.get('/', authMiddleware, errorHandler(productCtrl.getAllProducts))
ProductRouter.get('/search', errorHandler(productCtrl.searchProducts)) // http://localhost:5000/api/products/search?q=apple&skip=0&take=5
ProductRouter.get('/:id', errorHandler(productCtrl.getSingleProduct))


export default ProductRouter;