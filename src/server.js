import express from 'express';
import cors from 'cors';
import corsOptions from './config/corsOptions';

const app = express();

app.use(cors(corsOptions));
