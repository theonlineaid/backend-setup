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

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        return next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
    }

    const token: string | undefined = req.headers.authorization;

    try {
        if (!token) {
            throw new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED);
        }

        const payload = jwt.verify(token, JWT_SECRET) as any;
        const user = await prismaClient.user.findFirst({ where: { id: payload.userId } });

        if (!user) {
            throw new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED);
        }

        req.user = user;
        next();
    } catch (error) {
        next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
    }
}

export default authMiddleware;