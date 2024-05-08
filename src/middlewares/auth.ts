//@ts-nocheck
import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken'
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import { JWT_SECRET } from "../utils/secret";
import { prismaClient } from "..";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.headers.authorization) {
        return next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
    }
    // 1. extract the token from header
    const token: string | undefined = req.headers.authorization;
    // 2. if token is not present, throw an error of unauthorized
    if (!token) {
        next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED))
    }
    try {
        // 3. if the token is present, verify that token and extract the payload
        const payload = jwt.verify(token, JWT_SECRET) as any
        // 4. to get the user from the payload
        const user = await prismaClient.user.findFirst({ where: { id: payload.userId } })
        if (!user) {
            next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED))
        }
        // 5. to attach the user to the current request object
        req.user = user
        next()
    }
    catch (error) {
        next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED))
    }


}

export default authMiddleware