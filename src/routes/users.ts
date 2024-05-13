import { Router } from "express";
import { errorHandler } from "../utils/errorHandler";
import authMiddleware from "../middlewares/auth";
import userCtrl from "../controllers/UserCtrl";

const UserRouter: Router = Router();

UserRouter.post('/address', errorHandler(userCtrl.addAddress))

export default UserRouter;