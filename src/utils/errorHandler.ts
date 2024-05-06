import { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import { ErrorCode, HttpException } from "../execptions/root"
import { BadRequestsException } from "../execptions/badRequests"
import { InternalException } from "../execptions/internalException"

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
                    exception = new BadRequestsException('Unprocessable entity.', ErrorCode.UNPROCESSABLE_ENTITY, error)
                } else {
                    exception = new InternalException('Something went wrong!', error, ErrorCode.INTERNAL_EXCEPTION)
                }
            }
            next(exception)
        }

    }
}