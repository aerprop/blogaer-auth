import express from 'express';
import cors from 'cors';
import corsOptions from './config/corsOptions';
import cookieParser from 'cookie-parser';
import routes from './routes/index';
import verifyToken from './middlewares/verifyToken';
import { rabbitMQConnection } from './config/rabbitMQConfig';

const app = express();
const PORT = process.env.PORT || 3939;

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(routes.base);
app.use(routes.register);
app.use(routes.login);
app.use(routes.logout);
app.use(routes.refresh);

app.use(verifyToken);
rabbitMQConnection();
app.use(routes.blogPost);

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
