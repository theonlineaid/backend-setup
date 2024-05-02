import {Router} from "express";
import authCtrl from "../controllers/AuthCtrl";

const AuthRouter: Router = Router();

AuthRouter.get('/login', authCtrl.login)

export default AuthRouter;

