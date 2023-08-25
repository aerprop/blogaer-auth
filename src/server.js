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

app.use('/', require('./routes/root'));
app.use('/login', require('./routes/login'));

app.listen(PORT, () =>
  console.log(`Server running on port: ${PORT}`)
);
