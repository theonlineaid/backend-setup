import express, { Express } from 'express';
import { PORT } from './secret';
import RootRouter from './routes';
import { PrismaClient } from '@prisma/client';

const app: Express = express();

// Middlwear 
app.use(express.json());
app.use('/api', RootRouter)

export const prismaClient = new PrismaClient({
    log: ['query']
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})