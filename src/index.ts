import express, {Express, Response, Request} from 'express';

const app: Express = express();

// Middlwear 
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
})

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})