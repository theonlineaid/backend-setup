import express, {Express, Response, Request} from 'express';
import { PORT } from './secret';
import RootRouter from './routes';

const app: Express = express();

// Middlwear 
app.use(express.json());

app.use('/api', RootRouter)

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})