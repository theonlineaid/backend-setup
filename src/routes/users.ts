import { Router } from "express";
import { errorHandler } from "../utils/errorHandler";
import authMiddleware from "../middlewares/auth";
import userCtrl from "../controllers/UserCtrl";
import adminMiddleware from "../middlewares/admin";

const UserRouter: Router = Router();

UserRouter.post('/address', [authMiddleware], errorHandler(userCtrl.addAddress))
UserRouter.put('/address/:id', [authMiddleware], errorHandler(userCtrl.updateAddress))
UserRouter.delete('/address/:id', [authMiddleware], errorHandler(userCtrl.deleteAddress))
UserRouter.get('/address/:id', [authMiddleware], errorHandler(userCtrl.getAddressById))
UserRouter.get('/address', [authMiddleware], errorHandler(userCtrl.getAllAddress))


UserRouter.get('/', [authMiddleware, adminMiddleware], errorHandler(userCtrl.getAllUsersByAdmin))
UserRouter.get('/:id', [authMiddleware, adminMiddleware], errorHandler(userCtrl.getSingleUserByAdmin))
UserRouter.post('/', [authMiddleware, adminMiddleware], errorHandler(userCtrl.addUserByAdmin))
UserRouter.delete('/:id', [authMiddleware, adminMiddleware], errorHandler(userCtrl.deleteUserByAdmin))
UserRouter.patch('/:id', [authMiddleware, adminMiddleware], errorHandler(userCtrl.changeUserRoleByAdmin))


export default UserRouter;