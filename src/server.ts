import express from 'express';
import cors from 'cors';
import corsOptions from './config/corsOptions';
import cookieParser from 'cookie-parser';
import routes from './routes/index';
import verifyToken from './middlewares/verifyToken';
import credentials from './middlewares/credentials';

const app = express();
const PORT = process.env.PORT || 3939;

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(routes.base);
app.use(routes.register);
app.use(routes.login);
app.use(routes.googleLogin);
app.use(routes.logout);
app.use(routes.refresh);

app.use(verifyToken);
app.use(routes.test);
app.use(routes.blogPost);

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
