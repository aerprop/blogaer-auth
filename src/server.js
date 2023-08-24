import express from 'express';
import cors from 'cors';
import corsOptions from './config/corsOptions';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors(corsOptions));
app.use(cookieParser());
