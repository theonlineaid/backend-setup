import { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import { ErrorCode, HttpException } from "../exceptions/root"
import { BadRequestsException } from "../exceptions/exceptions"
import { InternalException } from "../exceptions/internalException"

export const errorHandler = (method: Function) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await method(req, res, next)
        } catch(error: any) {
            let exception: HttpException;
            if( error instanceof HttpException) {
                exception = error;
            } else {
                if( error instanceof ZodError) {
                    exception = new BadRequestsException('Unprocessable entity.', ErrorCode.UNPROCESSABLE_ENTITY, error);
                    res.status(401).json({ error: error.message });
                } else {
                    exception = new InternalException('Something went wrong!', error, ErrorCode.INTERNAL_EXCEPTION)
                    res.status(500).json({ error: "Internal Server Error from errorHandler.ts" })
                }
            }
            next(exception)
        }

    }
}