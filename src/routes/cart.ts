import { Router } from "express";
import { errorHandler } from "../utils/errorHandler";
import CartCtrl from "../controllers/CartCtrl";
import authMiddleware from "../middlewares/auth";

const CartRouter: Router = Router();

CartRouter.post('/', [authMiddleware], errorHandler(CartCtrl.addItemToCart));
CartRouter.delete('/:id', [authMiddleware], errorHandler(CartCtrl.deleteItemFromCart));

export default CartRouter;