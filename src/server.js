import express from 'express';
import cors from 'cors';
import corsOptions from './config/corsOptions';
import cookieParser from 'cookie-parser';
require('dotenv').config();

const PORT = process.env.PORT || 3933;

const app = express();

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', require('./routes/rootRoute'));
app.use('/register', require('./routes/registerRoute'));
app.use('/login', require('./routes/loginRoute'));

app.listen(PORT, () =>
  console.log(`Server running on port: ${PORT}`)
);
