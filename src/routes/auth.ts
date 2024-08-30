import { Router } from 'express';
import authCtrl from '../controllers/AuthCtrl';
import authMiddleware from '../middlewares/auth';
import { errorHandler } from '../utils/errorHandler';

const AuthRouter: Router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
AuthRouter.post('/register', errorHandler(authCtrl.register));

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully logged in
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
AuthRouter.post('/login', errorHandler(authCtrl.login));

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out a user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User successfully logged out
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
AuthRouter.post('/logout', authCtrl.logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current user details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
AuthRouter.get('/me', [authMiddleware], errorHandler(authCtrl.me));

/**
 * @openapi
 * /api/auth/{id}:
 *   post:
 *     summary: Change password for a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password successfully changed
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
AuthRouter.post('/:id', [authMiddleware], errorHandler(authCtrl.changeMyPassword));

/**
 * @openapi
 * /api/auth/{id}:
 *   delete:
 *     summary: Delete a user account
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User account successfully deleted
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
AuthRouter.delete('/:id', [authMiddleware], errorHandler(authCtrl.deleteMyAccount));

export default AuthRouter;
