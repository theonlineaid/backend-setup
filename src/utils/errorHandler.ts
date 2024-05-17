import { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import { ErrorCode, HttpException } from "../exceptions/root"
import { BadRequestsException } from "../exceptions/exceptions"
import { InternalException } from "../exceptions/internalException"

export const errorHandler = (method: Function) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await method(req, res, next)
        } catch (error: any) {
            let exception: HttpException;
            if (error instanceof HttpException) {
                exception = error;
            } else {
                if (error instanceof ZodError) {
                    exception = new BadRequestsException('Unprocessable entity.', ErrorCode.UNPROCESSABLE_ENTITY, error);
                    res.status(401).json({ message: "Unprocessable entity", error: exception });
                } else {
                    exception = new InternalException('Something went wrong!', error, ErrorCode.INTERNAL_EXCEPTION)
                    res.status(500).json({ message: "Something went wrong!", error: exception })
                }
            }
            next(exception)
        }

    }
}