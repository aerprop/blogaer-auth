import { RequestHandler } from 'express';
import baseRoute from './baseRoute';
import registerRoute from './registerRoute';
import loginRoute from './loginRoute';
import logoutRoute from './logoutRoute';
import refreshTokenRoute from './refreshTokenRoute';
import postRoute from './postRoute';
import googleOauth2Route from './googleOauth2Route';
import testRoute from './testRoute';

type Routes = {
  base: RequestHandler;
  register: RequestHandler;
  login: RequestHandler;
  googleLogin: RequestHandler;
  logout: RequestHandler;
  refresh: RequestHandler;
  post: RequestHandler;
  test: RequestHandler;
};

const routes: Routes = {
  base: baseRoute,
  register: registerRoute,
  login: loginRoute,
  googleLogin: googleOauth2Route,
  logout: logoutRoute,
  refresh: refreshTokenRoute,
  post: postRoute,
  test: testRoute
};

export default routes;
