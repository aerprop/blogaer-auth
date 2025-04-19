import express from 'express';
import cors from 'cors';
import corsOptions from './config/corsOptions';
import cookieParser from 'cookie-parser';
import routes from './routes';
import verifyToken from './middlewares/verifyToken';
import credentials from './middlewares/credentials';
import verifyRefreshCookie from './middlewares/verifyRefreshCookie';
import verifyAccessCookie from './middlewares/verifyAccessCookie';

const app = express();
const PORT = process.env.PORT || 3939;

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

routes.public.forEach((route) => app.use(route));

app.use(verifyRefreshCookie);
routes.semi.forEach((route) => app.use(route));

app.use(verifyAccessCookie);
app.use(verifyToken);
routes.protected.forEach((route) => app.use(route));

app.listen(PORT, () =>
  console.log(`Blogaer auth service running on port: ${PORT}`)
);
