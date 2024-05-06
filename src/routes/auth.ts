import {Router} from "express";
import authCtrl from "../controllers/AuthCtrl";
import authMiddleware from "../middlewares/auth";

const AuthRouter: Router = Router();

AuthRouter.post('/login', authCtrl.login)
AuthRouter.post('/register', authCtrl.register)
AuthRouter.post('/me', authMiddleware,  authCtrl.me)

export default AuthRouter;

