import { Router } from "express";
import { errorHandler } from "../utils/errorHandler";
import CartCtrl from "../controllers/CartCtrl";
import authMiddleware from "../middlewares/auth";

const CartRouter: Router = Router();

CartRouter.post('/', [authMiddleware], errorHandler(CartCtrl.addItemToCart));
CartRouter.delete('/:id', [authMiddleware], errorHandler(CartCtrl.deleteItemFromCart));
CartRouter.put('/:id', [authMiddleware], errorHandler(CartCtrl.changeQuantity));
CartRouter.get('/', [authMiddleware], errorHandler(CartCtrl.getAllCart));
CartRouter.delete('/', [authMiddleware], errorHandler(CartCtrl.deleteAllCart));

export default CartRouter;