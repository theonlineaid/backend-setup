import express from 'express';

const app = express();

// Middlwear 
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
})

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})