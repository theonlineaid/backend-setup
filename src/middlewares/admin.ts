import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";

const adminMiddleware = async (req: Request, res:Response, next:NextFunction) => {

    try {
        const user = req.user;

        if (user && user.role === 'ADMIN') {
            next();
        } else {
            throw new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED);
        }
    } catch (error) {
        if (error instanceof UnauthorizedException) {
            res.status(401).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

export default adminMiddleware