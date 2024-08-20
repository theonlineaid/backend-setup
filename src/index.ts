import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { errorMiddleware } from './middlewares/error';
import { PORT } from './utils/secret';
import RootRouter from './routes';
import cors from 'cors'

const app: Express = express();

// Middleware 
app.use(express.json());
app.use(cors())
app.use(errorMiddleware);
app.use('/api', RootRouter)

export const prismaClient = new PrismaClient({
    log: ['query']
}).$extends({
    result:{
        address:{
            formattedAddress: {
                needs: {
                    lineOne: true,
                    lineTwo: true,
                    city: true,
                    country: true,
                    pincode: true
                },
                compute: (addr) => {
                    return `${addr.lineOne}, ${addr.lineTwo}, ${addr.city}, ${addr.country}-${addr.pincode}`
                }
            }
        }
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})