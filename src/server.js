import express from 'express';
import cors from 'cors';
import corsOptions from './config/corsOptions.js';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { config } from 'dotenv';

config();
const app = express();
const PORT = process.env.PORT || 3939;

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const routePaths = Object.keys(routes);

routePaths.forEach(path => {
  app.use(routes[path]);
});

app.listen(PORT, () =>
  console.log(`Server running on port: ${PORT}`)
);
