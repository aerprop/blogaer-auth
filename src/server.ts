import express from 'express';
import cors from 'cors';
import corsOptions from './config/corsOptions';
import cookieParser from 'cookie-parser';
import routes from './routes';
import verifyToken from './middlewares/verifyToken';
import credentials from './middlewares/credentials';
import verifyCookie from './middlewares/verifyCookie';

const app = express();
const PORT = process.env.PORT || 3939;

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(routes.savedAccounts);
app.use(routes.register);
app.use(routes.login);
app.use(routes.googleLogin);
app.use(routes.logout);
app.use(routes.refresh);
app.use(routes.postPublic);

app.use(verifyCookie);
app.use(verifyToken);
app.use(routes.account);
app.use(routes.security);
app.use(routes.twoFA);
app.use(routes.socials);
app.use(routes.settings);
app.use(routes.webAuthn);
app.use(routes.authApp);
app.use(routes.post);
app.use(routes.draft);

app.listen(PORT, () =>
  console.log(`Blogaer auth service running on port: ${PORT}`)
);
