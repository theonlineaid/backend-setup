import express, {Express, Response, Request} from 'express';
import { PORT } from './secret';

const app: Express = express();

// Middlwear 
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})