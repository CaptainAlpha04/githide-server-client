import express from 'express';

app = express();

app.use(express.json());


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});