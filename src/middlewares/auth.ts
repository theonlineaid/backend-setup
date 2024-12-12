import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken'
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import { JWT_SECRET } from "../utils/secret";
import { prismaClient } from "..";
import { User } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            user: User // Adjust the type according to your User model
        }
    }
}

// const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {


//     try {
//         const token = req.cookies.accessToken;

//         if (!token) {
//             console.error('No token found in cookies');
//             throw new UnauthorizedException('Token not provided', ErrorCode.UNAUTHORIZED);
//         }

//         // if (!token) {
//         //     throw new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED);
//         // }

//         const payload = jwt.verify(token, JWT_SECRET) as any;

//         const user = await prismaClient.user.findFirst({ where: { id: payload.userId } });

//         if (!user) {
//             throw new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED);
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         console.error('Authentication error:', error);
//         next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
//     }

// }

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.accessToken;

        if (!token) {
            console.error('No token found in cookies');
            throw new UnauthorizedException('Token not provided', ErrorCode.UNAUTHORIZED);
        }

        // Verify token
        const payload = jwt.verify(token, JWT_SECRET) as any;

        // Find user in the database
        const user = await prismaClient.user.findFirst({ where: { id: payload.userId } });

        if (!user) {
            console.error('No user found with provided ID:', payload.userId);
            throw new UnauthorizedException('User not found', ErrorCode.UNAUTHORIZED);
        }

        // Attach user to the request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
        } else {
            next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
        }
    }
};


export default authMiddleware;