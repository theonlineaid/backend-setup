import {Router} from "express";
import authCtrl from "../controllers/AuthCtrl";

const AuthRouter: Router = Router();

AuthRouter.post('/login', authCtrl.login)
AuthRouter.post('/register', authCtrl.register)

export default AuthRouter;

