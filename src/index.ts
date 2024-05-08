import express, { Express, NextFunction, Request, Response } from 'express';
import { PORT } from './utils/secret';
import RootRouter from './routes';
import { PrismaClient } from '@prisma/client';
import { errorMiddleware } from './middlewares/error';

const app: Express = express();

// Middleware 
app.use(express.json());
app.use('/api', RootRouter)


export const prismaClient = new PrismaClient({
    log: ['query']
})

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})