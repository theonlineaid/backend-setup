import { Router } from "express";
import authCtrl from "../controllers/AuthCtrl";
import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../utils/errorHandler";

const AuthRouter: Router = Router();

AuthRouter.post('/login', errorHandler(authCtrl.login))
AuthRouter.post('/register', errorHandler(authCtrl.register))
AuthRouter.get('/me', [authMiddleware], errorHandler(authCtrl.me))

export default AuthRouter;

