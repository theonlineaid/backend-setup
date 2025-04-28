import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import { JWT_SECRET } from "../utils/secret";
import { prismaClient } from "..";
import { User } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            // user?: User; // User may not always be present
        }
    }
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
        }

        // Extract the token from the Bearer token
        const token = authHeader.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED);
        }

        // Verify the token
        const payload = jwt.verify(token, JWT_SECRET) as any;

        // Find the user associated with the token
        const user = await prismaClient.user.findFirst({ where: { id: payload.userId } });

        if (!user) {
            throw new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED);
        }

        // Attach user to the request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
    }
}

export default authMiddleware;
