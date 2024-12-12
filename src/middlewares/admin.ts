import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";

// const adminMiddleware = async (req: Request, res:Response, next:NextFunction) => {

//     try {
//         const user = req.user;

//         if (user && user.role === 'ADMIN') {
//             next();
//         } else {
//             throw new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED);
//         }
//     } catch (error) {
//         if (error instanceof UnauthorizedException) {
//             res.status(401).json({ error: error.message });
//         } else {
//             res.status(500).json({ error: "Internal Server Error" });
//         }
//     }
// }

// export default adminMiddleware

const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        if (!user) {
            console.error('No user found in request object');
            throw new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED);
        }

        if (user.role === 'ADMIN') {
            next();
        } else {
            console.error('User does not have ADMIN role:', user.role);
            throw new UnauthorizedException('Unauthorized: Admin role required', ErrorCode.UNAUTHORIZED);
        }
    } catch (error) {
        console.error('Admin middleware error:', error);
        if (error instanceof UnauthorizedException) {
            res.status(401).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};
export default adminMiddleware