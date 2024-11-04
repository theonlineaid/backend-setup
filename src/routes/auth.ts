import { Router } from 'express';
import authCtrl from '../controllers/AuthCtrl';
import authMiddleware from '../middlewares/auth';
import upload from '../middlewares/uploadMiddleware';
import { errorHandler } from '../utils/errorHandler';

const AuthRouter: Router = Router();

AuthRouter.post('/register', upload.single('profileImage'), errorHandler(authCtrl.register));
AuthRouter.put('/:id', upload.single('profileImage'), [authMiddleware], errorHandler(authCtrl.updateUser));
AuthRouter.post('/login', errorHandler(authCtrl.login));
AuthRouter.post('/logout', authCtrl.logout);
AuthRouter.get('/me', [authMiddleware], errorHandler(authCtrl.me));
AuthRouter.post('/:id', [authMiddleware], errorHandler(authCtrl.changeMyPassword));
AuthRouter.delete('/:id', [authMiddleware], errorHandler(authCtrl.deleteMyAccount));

export default AuthRouter;
