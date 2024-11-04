import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { errorMiddleware } from './middlewares/error';
import { PORT } from './utils/secret';
import RootRouter from './routes';
import cors from 'cors';
import morgan from 'morgan'

const app: Express = express();
app.use(morgan('tiny'));

// Middleware 
app.use(express.json());
// app.use(cors())
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend URL
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true, // Enable cookies and credentials
}));

app.use(cookieParser());
app.use(errorMiddleware);
app.use('/api', RootRouter)

export const prismaClient = new PrismaClient({
    log: ['query']
}).$extends({
    result: {
        address: {
            formattedAddress: {
                needs: {
                    lineOne: true,
                    lineTwo: true,
                    city: true,
                    country: true,
                    pincode: true,
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