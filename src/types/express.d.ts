import { User } from '@prisma/client';
import { Request } from 'express';

declare namespace Express {
    export interface Request {
        user: User
    }
}
