import { Router } from "express";
import { errorHandler } from "../utils/errorHandler";
import authMiddleware from "../middlewares/auth";
import orderCtrl from "../controllers/OrderCtrl";
import adminMiddleware from "../middlewares/admin";

const OrderRouter: Router = Router();

// # User routes
OrderRouter.post('/', [authMiddleware], errorHandler(orderCtrl.createOrder));
OrderRouter.get('/', [authMiddleware], errorHandler(orderCtrl.listOrder));
OrderRouter.get('/:id',[authMiddleware], errorHandler(orderCtrl.getOrderById))
OrderRouter.put('/:id/cancel', [authMiddleware], errorHandler(orderCtrl.cancelOrder))

// # Admin routes
OrderRouter.get('/index',[authMiddleware, adminMiddleware], errorHandler(orderCtrl.listAllOrders))
OrderRouter.get('/users/:id',[authMiddleware, adminMiddleware], errorHandler(orderCtrl.listUserOrders))
OrderRouter.put('/:id/status',[authMiddleware, adminMiddleware], errorHandler(orderCtrl.changeStatus))

export default OrderRouter;