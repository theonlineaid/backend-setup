import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { errorMiddleware } from './middlewares/error';
import { PORT } from './utils/secret';
import RootRouter from './routes';

const app: Express = express();

// Middleware 
app.use(express.json());
app.use(errorMiddleware);
app.use('/api', RootRouter)

export const prismaClient = new PrismaClient({
    log: ['query']
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})